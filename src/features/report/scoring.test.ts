import { describe, expect, it } from 'vitest';
import { computeFinalScore, scoreGapNote } from './scoring';

describe('computeFinalScore', () => {
  it('AI 50% + 멘토 50% 가중 평균을 반올림해 낸다', () => {
    expect(computeFinalScore(87, 82)).toBe(85); // (87+82)/2 = 84.5 → 반올림 85
    expect(computeFinalScore(100, 0)).toBe(50);
    expect(computeFinalScore(0, 0)).toBe(0);
  });
});

describe('scoreGapNote', () => {
  it('5점 미만 차이면 해석 문구가 없다', () => {
    expect(scoreGapNote(80, 76)).toBeNull();
    expect(scoreGapNote(80, 84)).toBeNull();
  });

  it('5점 이상 차이면 해석 문구를 반환한다', () => {
    expect(scoreGapNote(87, 82 - 3)).not.toBeNull();
    expect(scoreGapNote(90, 80)).not.toBeNull();
    expect(scoreGapNote(80, 90)).not.toBeNull();
  });
});
