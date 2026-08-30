import { describe, expect, it } from 'vitest';
import { generateMentorFeedback } from './dummyFeedback';
import { PRINCIPLES } from '@/data/principles';
import type { AiAnalysis, Attempt } from '@/types';

function makeAi(totalScore: number): AiAnalysis {
  const per = Math.floor(totalScore / PRINCIPLES.length);
  return {
    analyzedAt: new Date().toISOString(),
    principles: PRINCIPLES.map((p) => ({ id: p.id, score: per, comment: '' })),
    totalScore,
    grade: 'B',
    summary: '',
    strengths: [],
    improvements: [],
  };
}

function makeAttempt(id: string, totalScore: number): Attempt {
  return {
    id,
    createdAt: new Date().toISOString(),
    currentStep: 2,
    status: 'submitted',
    file: { name: 'a.pdf', mime: 'application/pdf', size: 1, previewDataUrl: '' },
    ai: makeAi(totalScore),
    mentorRequest: {
      name: '홍길동',
      topic: '커머스 앱 리디자인',
      requestNote: '요청사항입니다 10자 이상',
      submittedAt: new Date().toISOString(),
    },
    mentorStages: null,
    mentorFeedback: null,
    finalReview: null,
  };
}

describe('generateMentorFeedback', () => {
  it('같은 회차(id)면 항상 같은 피드백을 낸다', () => {
    // completedAt은 의도적으로 호출 시각(new Date())을 쓴다 — 시드로 재현되는 값이 아니므로
    // 비교에서 고정값으로 맞춰 제외한다. 두 호출이 다른 밀리초에 걸치면 이 필드만 달라질 수
    // 있다(실제로 드물게 관측됨: 무거운 스위트를 통째로 돌릴 때만 재현되고 단독 실행 시엔
    // 재현되지 않았다).
    const attempt = makeAttempt('atmp_fixed', 80);
    const a = generateMentorFeedback(attempt);
    const b = generateMentorFeedback(attempt);
    expect({ ...a, completedAt: '' }).toEqual({ ...b, completedAt: '' });
  });

  it('멘토 점수는 AI 총점 ±8 범위 안에서 0~100으로 클램프된다', () => {
    for (let i = 0; i < 100; i += 1) {
      const attempt = makeAttempt(`atmp_${i}`, 70 + (i % 20));
      const feedback = generateMentorFeedback(attempt);
      expect(feedback.mentorScore).toBeGreaterThanOrEqual(Math.max(0, attempt.ai!.totalScore - 8));
      expect(feedback.mentorScore).toBeLessThanOrEqual(Math.min(100, attempt.ai!.totalScore + 8));
    }
  });

  it('원칙 10개 전부에 코멘트를 채운다', () => {
    const attempt = makeAttempt('atmp_x', 85);
    const feedback = generateMentorFeedback(attempt);
    expect(feedback.perPrinciple).toHaveLength(PRINCIPLES.length);
    for (const entry of feedback.perPrinciple) {
      expect(entry.comment.length).toBeGreaterThan(0);
    }
  });

  it('AI 분석이 없는 회차는 에러를 던진다', () => {
    const attempt = makeAttempt('atmp_y', 80);
    attempt.ai = null;
    expect(() => generateMentorFeedback(attempt)).toThrow();
  });
});
