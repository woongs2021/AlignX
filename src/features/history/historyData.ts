// 전체 이력 분석(/my/history) 화면과 buildHistoryHtml.ts가 공유하는 데이터 조립 —
// buildReportData.ts와 같은 이유로 로직을 한 곳에 둔다 (Plans/09-my.md §6).
import { PRINCIPLES } from '@/data/principles';
import { sentimentOfComment } from '@/data/mentorComments';
import { computeFinalScore } from '@/features/report/scoring';
import type { Attempt } from '@/types';

/** 라인 차트는 최근 N회만 표시한다 — 20회 넘게 쌓여도 점이 뭉개지지 않게 (09 §6.2). */
const CHART_MAX_POINTS = 12;
/** "정체" 판정 기준 — 전 완료 회차에서 이 점수 이하에 머문 원칙. */
const STAGNANT_THRESHOLD = 6;

export type HistoryChartPoint = {
  attemptId: string;
  /** 전체 완료 회차 중 몇 번째인지(1부터) — 화면엔 잘려도 실제 순번을 보여주기 위함. */
  index: number;
  date: string;
  score: number;
};

export type PrincipleChangeRow = {
  id: string;
  order: number;
  nameKr: string;
  nameEn: string;
  /** 완료 회차 순서대로(오래된 → 최신) 점수. */
  scores: number[];
  /** 최신 - 최초. 동일하면 0. */
  delta: number;
};

export type MentorArchiveEntry = {
  attemptId: string;
  date: string;
  mentorName: string;
  mentorRole: string;
  comment: string;
  /** 이 회차에서 critical로 재등장한(직전에도 critical이었던) 원칙 이름들. */
  repeatedPrincipleNames: string[];
};

export type HistoryData = {
  totalAttempts: number;
  completedCount: number;
  /** 완료 회차가 3회 미만인 경우에도(가드는 총 회차 기준) 참고용으로 명시. */
  isPartial: boolean;
  firstScore: number;
  latestScore: number;
  delta: number;
  avgDeltaPerAttempt: number;
  chartPoints: HistoryChartPoint[];
  principleRows: PrincipleChangeRow[];
  topImproved: PrincipleChangeRow[];
  stagnantPrinciples: PrincipleChangeRow[];
  insights: string[];
  mentorArchive: MentorArchiveEntry[];
};

function isCompleted(attempt: Attempt): boolean {
  return attempt.ai !== null && attempt.mentorFeedback !== null;
}

function scoreOf(attempt: Attempt): number {
  return computeFinalScore(attempt.ai!.totalScore, attempt.mentorFeedback!.mentorScore);
}

function buildInsights(
  completed: Attempt[],
  topImproved: PrincipleChangeRow[],
  stagnantPrinciples: PrincipleChangeRow[],
): string[] {
  if (completed.length < 2) {
    return ['완료된 회차가 아직 1개뿐이라 변화를 비교할 수 없습니다. 다음 분석부터 성장 추이를 보여드릴게요.'];
  }

  const messages: string[] = [];

  if (topImproved.length > 0) {
    const top = topImproved[0];
    messages.push(`가장 크게 오른 항목은 ${top.nameKr}(+${top.delta})입니다.`);
  }

  if (stagnantPrinciples.length > 0) {
    const names = stagnantPrinciples.map((p) => p.nameKr).join(', ');
    messages.push(
      `${completed.length}회 내내 ${STAGNANT_THRESHOLD}점 이하에 머문 항목은 ${names}입니다. 다음 회차의 최우선 개선 대상입니다.`,
    );
  }

  const firstGap = Math.abs(completed[0].ai!.totalScore - completed[0].mentorFeedback!.mentorScore);
  const latestGap = Math.abs(
    completed[completed.length - 1].ai!.totalScore - completed[completed.length - 1].mentorFeedback!.mentorScore,
  );
  if (firstGap !== latestGap) {
    const verb = latestGap < firstGap ? '좁혀졌습니다' : '벌어졌습니다';
    messages.push(`멘토 점수와 AI 점수의 격차가 ${firstGap}점 → ${latestGap}점으로 ${verb}.`);
  }

  if (messages.length === 0) {
    messages.push('원칙별 점수에 뚜렷한 변화가 없습니다.');
  }
  return messages;
}

function buildMentorArchive(completed: Attempt[]): MentorArchiveEntry[] {
  const criticalSeenCount = new Map<string, number>();

  const entries = completed.map((attempt): MentorArchiveEntry => {
    const fb = attempt.mentorFeedback!;
    const repeatedPrincipleNames: string[] = [];

    fb.perPrinciple.forEach(({ principleId, comment }) => {
      const sentiment = sentimentOfComment(principleId, comment);
      if (sentiment !== 'critical') return;
      const prevCount = criticalSeenCount.get(principleId) ?? 0;
      criticalSeenCount.set(principleId, prevCount + 1);
      if (prevCount > 0) {
        const name = PRINCIPLES.find((p) => p.id === principleId)?.nameKr ?? principleId;
        repeatedPrincipleNames.push(name);
      }
    });

    return {
      attemptId: attempt.id,
      date: fb.completedAt,
      mentorName: fb.mentorName,
      mentorRole: fb.mentorRole,
      comment: fb.overall,
      repeatedPrincipleNames,
    };
  });

  return entries.reverse(); // 최신순으로 보여준다
}

/** 완료 회차가 하나도 없으면 null — 호출부가 "분석 결과가 아직 없습니다" 류의 빈 상태를 그린다. */
export function buildHistoryData(attempts: Attempt[]): HistoryData | null {
  // attempts는 최신순으로 저장돼 있다 → 오래된 순으로 뒤집는다.
  const completed = [...attempts].filter(isCompleted).reverse();
  if (completed.length === 0) return null;

  const firstScore = scoreOf(completed[0]);
  const latestScore = scoreOf(completed[completed.length - 1]);
  const delta = latestScore - firstScore;
  const avgDeltaPerAttempt = completed.length > 1 ? delta / (completed.length - 1) : 0;

  const chartSource = completed.slice(-CHART_MAX_POINTS);
  const chartPoints: HistoryChartPoint[] = chartSource.map((attempt) => ({
    attemptId: attempt.id,
    index: completed.indexOf(attempt) + 1,
    date: attempt.createdAt,
    score: scoreOf(attempt),
  }));

  const principleRows: PrincipleChangeRow[] = PRINCIPLES.map((principle) => {
    const scores = completed.map((a) => a.ai!.principles.find((s) => s.id === principle.id)?.score ?? 0);
    return {
      id: principle.id,
      order: principle.order,
      nameKr: principle.nameKr,
      nameEn: principle.nameEn,
      scores,
      delta: scores[scores.length - 1] - scores[0],
    };
  });

  const topImproved = principleRows
    .filter((row) => row.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);

  const stagnantPrinciples = principleRows
    .filter((row) => row.scores.every((score) => score <= STAGNANT_THRESHOLD))
    .slice(0, 3);

  return {
    totalAttempts: attempts.length,
    completedCount: completed.length,
    isPartial: completed.length < attempts.length,
    firstScore,
    latestScore,
    delta,
    avgDeltaPerAttempt,
    chartPoints,
    principleRows,
    topImproved,
    stagnantPrinciples,
    insights: buildInsights(completed, topImproved, stagnantPrinciples),
    mentorArchive: buildMentorArchive(completed),
  };
}
