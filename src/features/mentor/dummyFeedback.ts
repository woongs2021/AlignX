// 더미 멘토 피드백 생성기 — 검증 타임라인이 끝나면 호출된다 (06 §3.6).
// ADMIN이 실제 코멘트를 작성하면 그걸 우선한다 — 이 함수는 ADMIN 개입이 없을 때의 폴백이다.
import { PRINCIPLES } from '@/data/principles';
import { getMentorComment, type MentorSentiment } from '@/data/mentorComments';
import { MENTORS } from '@/data/mentors';
import { hashString, mulberry32 } from '@/lib/seededRandom';
import type { Attempt, MentorFeedback } from '@/types';

const SCORE_SPREAD = 8; // 멘토 총점 = AI 총점 ± 8

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateMentorFeedback(attempt: Attempt): MentorFeedback {
  const ai = attempt.ai;
  if (!ai) {
    throw new Error('AI 분석이 없는 회차는 멘토 피드백을 생성할 수 없습니다.');
  }

  const rand = mulberry32(hashString(`mentor:${attempt.id}`));

  const perPrinciple = PRINCIPLES.map((principle) => {
    const aiScore = ai.principles.find((p) => p.id === principle.id)?.score ?? 5;
    // AI 점수가 높을수록 긍정 코멘트 확률이 높지만, 종종 어긋나게 해 "관점 차이"를 만든다.
    const positiveProbability = clamp((aiScore - 4) / 6, 0.15, 0.85);
    const sentiment: MentorSentiment = rand() < positiveProbability ? 'positive' : 'critical';
    return { principleId: principle.id, comment: getMentorComment(principle.id, sentiment) };
  });

  const delta = Math.round((rand() * 2 - 1) * SCORE_SPREAD);
  const mentorScore = clamp(ai.totalScore + delta, 0, 100);

  const lead = MENTORS.find((m) => m.id === 'jiwoo') ?? MENTORS[0];
  const topic = attempt.mentorRequest?.topic ?? '이번 작업';
  const overall = `AI 분석과 대체로 결이 비슷합니다. 종합 ${mentorScore}점으로 평가했고, 세부 코멘트는 원칙별로 남겨두었습니다. ${topic}의 방향은 좋으니 지적된 부분 위주로 다듬어보세요.`;

  return {
    mentorName: lead.name,
    mentorRole: lead.role,
    overall,
    perPrinciple,
    mentorScore,
    completedAt: new Date().toISOString(),
  };
}
