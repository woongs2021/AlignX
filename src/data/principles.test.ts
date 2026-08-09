import { describe, expect, it } from 'vitest';
import { gradeFromScore, PRINCIPLES } from './principles';

describe('PRINCIPLES — AlignX AI 원칙 카드 데이터 완결성 (08 §A2)', () => {
  it('10개 원칙이 1~10 순번으로 중복 없이 존재한다', () => {
    expect(PRINCIPLES).toHaveLength(10);
    const orders = PRINCIPLES.map((p) => p.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(PRINCIPLES.map((p) => p.id)).size).toBe(10);
  });

  it.each(PRINCIPLES.map((p) => [p.id, p] as const))(
    '%s 원칙은 measurement/fullScoreCondition/commonFailure를 모두 채워 둔다',
    (_id, principle) => {
      expect(principle.measurement.length).toBeGreaterThan(0);
      expect(principle.fullScoreCondition.length).toBeGreaterThan(0);
      expect(principle.commonFailure.length).toBeGreaterThan(0);
    },
  );
});

describe('gradeFromScore', () => {
  it.each([
    [100, 'S'],
    [90, 'S'],
    [89, 'A'],
    [80, 'A'],
    [79, 'B'],
    [70, 'B'],
    [69, 'C'],
    [60, 'C'],
    [59, 'D'],
    [0, 'D'],
  ] as const)('%i점 → %s', (score, grade) => {
    expect(gradeFromScore(score)).toBe(grade);
  });
});
