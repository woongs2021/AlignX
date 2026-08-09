// 더미 스코어링 엔진 — 실제 AlignX 모델 연동 전까지 쓰는 결정론적 생성기 (05 §4.1).
// UI는 이 파일을 직접 import하지 않는다 — ../index.ts의 provider를 통해서만 접근한다.
import { PRINCIPLES, gradeFromScore } from '@/data/principles';
import { getPrincipleComment } from '@/data/principleComments';
import { hashString, mulberry32 } from '@/lib/seededRandom';
import type { AiAnalysis, PrincipleScore } from '@/types';

const MIN_PRINCIPLE_SCORE = 5;
const MAX_PRINCIPLE_SCORE = 10;
const MIN_TOTAL_SCORE = 68;
const MAX_TOTAL_SCORE = 92;

export type AnalysisFileInput = { name: string; size: number };

/** 같은 파일(이름+크기)이면 항상 같은 시드. */
export function seedFrom(file: AnalysisFileInput): number {
  return hashString(`${file.name}:${file.size}`);
}

export { mulberry32 };

function generatePrincipleScores(rand: () => number): number[] {
  const scores = PRINCIPLES.map(() => MIN_PRINCIPLE_SCORE + Math.floor(rand() * (MAX_PRINCIPLE_SCORE - MIN_PRINCIPLE_SCORE + 1)));
  let total = scores.reduce((sum, s) => sum + s, 0);

  // 총점을 68–92 대역으로 보정 — 무작위 원칙에 1점씩 분산 조정한다.
  let guard = 0;
  while ((total < MIN_TOTAL_SCORE || total > MAX_TOTAL_SCORE) && guard < 1000) {
    const i = Math.floor(rand() * scores.length);
    if (total < MIN_TOTAL_SCORE && scores[i] < MAX_PRINCIPLE_SCORE) {
      scores[i] += 1;
      total += 1;
    } else if (total > MAX_TOTAL_SCORE && scores[i] > MIN_PRINCIPLE_SCORE) {
      scores[i] -= 1;
      total -= 1;
    }
    guard += 1;
  }

  return scores;
}

export function generateAnalysis(file: AnalysisFileInput): AiAnalysis {
  const rand = mulberry32(seedFrom(file));
  const rawScores = generatePrincipleScores(rand);

  const principleScores: PrincipleScore[] = PRINCIPLES.map((principle, i) => ({
    id: principle.id,
    score: rawScores[i],
    comment: getPrincipleComment(principle.id, rawScores[i]),
  }));

  const totalScore = rawScores.reduce((sum, s) => sum + s, 0);
  const grade = gradeFromScore(totalScore);

  const byScoreDesc = [...principleScores].sort((a, b) => b.score - a.score);
  const nameOf = (id: string) => PRINCIPLES.find((p) => p.id === id)?.nameKr ?? id;

  const strengths = byScoreDesc.slice(0, 3).map((p) => p.comment);
  const improvements = byScoreDesc
    .slice(-3)
    .reverse()
    .map((p) => p.comment);

  const summary = `총 ${totalScore}점(Grade ${grade})입니다. ${nameOf(byScoreDesc[0].id)}에서 가장 강점을 보였고, ${nameOf(
    byScoreDesc[byScoreDesc.length - 1].id,
  )}은(는) 보완이 필요합니다.`;

  return {
    analyzedAt: new Date().toISOString(),
    principles: principleScores,
    totalScore,
    grade,
    summary,
    strengths,
    improvements,
  };
}
