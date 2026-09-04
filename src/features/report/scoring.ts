// 최종 점수 계산 — 가중치는 이 파일 한 곳에서만 관리한다 (Plans/07-portfolio-step3.md §2).
import type { Attempt } from '@/types';

export const AI_WEIGHT = 0.5;
export const MENTOR_WEIGHT = 0.5;

export function computeFinalScore(aiScore: number, mentorScore: number): number {
  return Math.round(aiScore * AI_WEIGHT + mentorScore * MENTOR_WEIGHT);
}

/** 두 점수가 3점 이상 벌어지면 해석 문구를 붙인다 (07 §2). */
const GAP_THRESHOLD = 3;

export function scoreGapNote(aiScore: number, mentorScore: number): string | null {
  if (Math.abs(aiScore - mentorScore) < GAP_THRESHOLD) return null;
  return `AI-멘토 점수차가 ${GAP_THRESHOLD}점 이상이면 관점 차이로 해석합니다 — AI는 시각 완성도를, 멘토는 문제 정의의 깊이를 더 중요하게 봤습니다.`;
}

/** 회차 하나의 대표 점수 — 멘토 검증까지 끝났으면 최종 점수, AI만 있으면 AI 점수, 그마저 없으면 null.
 * MY 페이지의 최고 기록·정렬·헤더 요약이 모두 이 기준을 공유한다 (Plans/09-my.md §2, §5). */
export function attemptScore(attempt: Attempt): number | null {
  if (attempt.ai && attempt.mentorFeedback) {
    return computeFinalScore(attempt.ai.totalScore, attempt.mentorFeedback.mentorScore);
  }
  if (attempt.ai) return attempt.ai.totalScore;
  return null;
}
