import { describe, expect, it } from 'vitest';
import { hashString, mulberry32 } from './seededRandom';

describe('hashString', () => {
  it('같은 문자열이면 같은 해시를 낸다', () => {
    expect(hashString('a:1')).toBe(hashString('a:1'));
  });

  it('다른 문자열이면 다른 해시를 낸다', () => {
    expect(hashString('a:1')).not.toBe(hashString('a:2'));
  });
});

describe('mulberry32', () => {
  it('같은 시드면 같은 수열을 만든다', () => {
    const rand1 = mulberry32(42);
    const seq1 = Array.from({ length: 10 }, () => rand1());
    const rand2 = mulberry32(42);
    const seq2 = Array.from({ length: 10 }, () => rand2());
    expect(seq1).toEqual(seq2);
  });

  it('0 이상 1 미만의 값을 낸다', () => {
    const rand = mulberry32(123456789);
    for (let i = 0; i < 100; i += 1) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
