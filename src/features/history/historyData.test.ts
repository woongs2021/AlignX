import { describe, expect, it } from 'vitest';
import { buildHistoryData } from './historyData';
import { PRINCIPLES, gradeFromScore } from '@/data/principles';
import { getMentorComment, type MentorSentiment } from '@/data/mentorComments';
import type { AiAnalysis, Attempt, MentorFeedback } from '@/types';

function makeAi(scores: Record<string, number>, total: number): AiAnalysis {
  return {
    analyzedAt: new Date().toISOString(),
    principles: PRINCIPLES.map((p) => ({ id: p.id, score: scores[p.id] ?? 7, comment: '' })),
    totalScore: total,
    grade: gradeFromScore(total),
    summary: '',
    strengths: [],
    improvements: [],
  };
}

function makeMentorFeedback(mentorScore: number, sentiments: Partial<Record<string, MentorSentiment>>): MentorFeedback {
  return {
    mentorName: '이지우',
    mentorRole: 'Design Director',
    overall: '종합 코멘트',
    perPrinciple: PRINCIPLES.map((p) => ({
      principleId: p.id,
      comment: getMentorComment(p.id, sentiments[p.id] ?? 'positive'),
    })),
    mentorScore,
    completedAt: new Date().toISOString(),
  };
}

function makeAttempt(opts: {
  id: string;
  createdAt: string;
  aiScores?: Record<string, number>;
  aiTotal: number;
  mentorScore?: number;
  sentiments?: Partial<Record<string, MentorSentiment>>;
  completed?: boolean;
}): Attempt {
  const ai = makeAi(opts.aiScores ?? {}, opts.aiTotal);
  const mentorFeedback =
    opts.completed === false ? null : makeMentorFeedback(opts.mentorScore ?? opts.aiTotal, opts.sentiments ?? {});
  return {
    id: opts.id,
    createdAt: opts.createdAt,
    currentStep: mentorFeedback ? 3 : 1,
    status: mentorFeedback ? 'completed' : 'analyzed',
    file: { name: 'a.pdf', mime: 'application/pdf', size: 1, previewDataUrl: '' },
    ai,
    mentorRequest: null,
    mentorStages: null,
    mentorFeedback,
    finalReview: null,
  };
}

describe('buildHistoryData — 빈 상태', () => {
  it('회차가 없으면 null', () => {
    expect(buildHistoryData([])).toBeNull();
  });

  it('완료된(ai+mentorFeedback) 회차가 하나도 없으면 null', () => {
    const attempts = [makeAttempt({ id: 'a1', createdAt: '2026-01-01', aiTotal: 70, completed: false })];
    expect(buildHistoryData(attempts)).toBeNull();
  });
});

describe('buildHistoryData — 성장 요약 · 원칙별 변화 · 해석 코멘트', () => {
  // attempts는 스토어와 동일하게 "최신순"으로 넘긴다 — 함수 내부에서 오래된 순으로 뒤집는다.
  const attempt1 = makeAttempt({
    id: 'a1',
    createdAt: '2026-01-01T00:00:00.000Z',
    aiScores: { hierarchy: 5, grid: 5 },
    aiTotal: 70,
    mentorScore: 60,
    sentiments: { hierarchy: 'critical' },
  });
  const attempt2 = makeAttempt({
    id: 'a2',
    createdAt: '2026-02-01T00:00:00.000Z',
    aiScores: { hierarchy: 5, grid: 8 },
    aiTotal: 80,
    mentorScore: 78,
    sentiments: { hierarchy: 'critical' },
  });
  const attempt3 = makeAttempt({
    id: 'a3',
    createdAt: '2026-03-01T00:00:00.000Z',
    aiScores: { hierarchy: 6, grid: 9 },
    aiTotal: 90,
    mentorScore: 88,
    sentiments: { hierarchy: 'critical' },
  });
  const attempts = [attempt3, attempt2, attempt1]; // 최신순

  it('첫 회차 → 최신 회차 점수 변화와 회차당 평균 상승을 계산한다', () => {
    const data = buildHistoryData(attempts)!;
    // finalScore = round(ai*0.5 + mentor*0.5)
    expect(data.firstScore).toBe(65); // round((70+60)/2)
    expect(data.latestScore).toBe(89); // round((90+88)/2)
    expect(data.delta).toBe(24);
    expect(data.avgDeltaPerAttempt).toBe(12); // 24 / (3-1)
    expect(data.completedCount).toBe(3);
    expect(data.totalAttempts).toBe(3);
    expect(data.isPartial).toBe(false);
  });

  it('원칙별 증감을 최초 대비 최신으로 계산한다', () => {
    const data = buildHistoryData(attempts)!;
    const grid = data.principleRows.find((r) => r.id === 'grid')!;
    const hierarchy = data.principleRows.find((r) => r.id === 'hierarchy')!;
    expect(grid.scores).toEqual([5, 8, 9]);
    expect(grid.delta).toBe(4);
    expect(hierarchy.scores).toEqual([5, 5, 6]);
    expect(hierarchy.delta).toBe(1);
  });

  it('가장 많이 오른 원칙과, 전 회차 6점 이하에 머문 원칙을 각각 골라낸다', () => {
    const data = buildHistoryData(attempts)!;
    expect(data.topImproved[0].id).toBe('grid');
    expect(data.topImproved[0].delta).toBe(4);
    expect(data.stagnantPrinciples.map((r) => r.id)).toEqual(['hierarchy']);
  });

  it('해석 코멘트가 실제 데이터와 일치하는 3문장을 만든다', () => {
    const data = buildHistoryData(attempts)!;
    expect(data.insights).toEqual([
      '가장 크게 오른 항목은 구조적 정합성(+4)입니다.',
      '3회 내내 6점 이하에 머문 항목은 정보 위계입니다. 다음 회차의 최우선 개선 대상입니다.',
      '멘토 점수와 AI 점수의 격차가 10점 → 2점으로 좁혀졌습니다.',
    ]);
  });

  it('멘토 코멘트 아카이브는 최신순이며, 같은 원칙이 critical로 반복되면 2번째 등장부터 표시한다', () => {
    const data = buildHistoryData(attempts)!;
    expect(data.mentorArchive.map((e) => e.attemptId)).toEqual(['a3', 'a2', 'a1']);
    expect(data.mentorArchive[0].repeatedPrincipleNames).toEqual(['정보 위계']); // a3 — 3번째 반복
    expect(data.mentorArchive[1].repeatedPrincipleNames).toEqual(['정보 위계']); // a2 — 2번째 반복
    expect(data.mentorArchive[2].repeatedPrincipleNames).toEqual([]); // a1 — 최초 등장은 반복 아님
  });
});

describe('buildHistoryData — 엣지 케이스', () => {
  it('완료 회차가 1개뿐이면 비교 없이 안내 문구만 낸다', () => {
    const attempts = [makeAttempt({ id: 'only', createdAt: '2026-01-01', aiTotal: 80, mentorScore: 80 })];
    const data = buildHistoryData(attempts)!;
    expect(data.delta).toBe(0);
    expect(data.insights).toEqual([
      '완료된 회차가 아직 1개뿐이라 변화를 비교할 수 없습니다. 다음 분석부터 성장 추이를 보여드릴게요.',
    ]);
  });

  it('점수와 원칙별 변화가 전부 동일하면 "변화 없음" 취지의 중립 문구를 낸다', () => {
    const a = makeAttempt({ id: 'x1', createdAt: '2026-01-01', aiTotal: 80, mentorScore: 80 });
    const b = makeAttempt({ id: 'x2', createdAt: '2026-02-01', aiTotal: 80, mentorScore: 80 });
    const data = buildHistoryData([b, a])!;
    expect(data.delta).toBe(0);
    expect(data.topImproved).toHaveLength(0);
    expect(data.insights).toEqual(['원칙별 점수에 뚜렷한 변화가 없습니다.']);
  });

  it('일부 회차가 미완료면 완료 회차만 집계하고 isPartial을 표시한다', () => {
    const done = makeAttempt({ id: 'done', createdAt: '2026-01-01', aiTotal: 80, mentorScore: 80 });
    const inProgress = makeAttempt({ id: 'wip', createdAt: '2026-02-01', aiTotal: 85, completed: false });
    const data = buildHistoryData([inProgress, done])!;
    expect(data.completedCount).toBe(1);
    expect(data.totalAttempts).toBe(2);
    expect(data.isPartial).toBe(true);
  });

  it('완료 회차가 12개를 넘으면 차트는 최근 12개만 담되, 순번(index)은 전체 기준으로 유지한다', () => {
    const attempts: Attempt[] = Array.from({ length: 15 }, (_, i) =>
      makeAttempt({
        id: `a${i + 1}`,
        createdAt: new Date(2026, 0, i + 1).toISOString(),
        aiTotal: 60 + i,
        mentorScore: 60 + i,
      }),
    ).reverse(); // 최신순으로

    const data = buildHistoryData(attempts)!;
    expect(data.chartPoints).toHaveLength(12);
    expect(data.chartPoints[0].attemptId).toBe('a4'); // 15개 중 마지막 12개 = 4번째~15번째
    expect(data.chartPoints[0].index).toBe(4);
    expect(data.chartPoints[11].attemptId).toBe('a15');
    expect(data.chartPoints[11].index).toBe(15);
  });
});
