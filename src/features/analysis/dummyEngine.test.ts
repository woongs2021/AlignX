import { describe, expect, it } from 'vitest';
import { PRINCIPLES } from '@/data/principles';
import { generateAnalysis, mulberry32, seedFrom } from './dummyEngine';

describe('seedFrom', () => {
  it('같은 파일(이름+크기)이면 같은 시드를 만든다', () => {
    const a = seedFrom({ name: 'test.pdf', size: 1000 });
    const b = seedFrom({ name: 'test.pdf', size: 1000 });
    expect(a).toBe(b);
  });

  it('이름 또는 크기가 다르면 시드가 달라진다', () => {
    const a = seedFrom({ name: 'a.pdf', size: 1000 });
    const b = seedFrom({ name: 'b.pdf', size: 1000 });
    const c = seedFrom({ name: 'a.pdf', size: 2000 });
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
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

describe('generateAnalysis', () => {
  it('같은 파일이면 항상 같은 결과를 낸다', () => {
    const file = { name: 'portfolio.pdf', size: 2_500_000 };
    const a = generateAnalysis(file);
    const b = generateAnalysis(file);
    expect(a.totalScore).toBe(b.totalScore);
    expect(a.grade).toBe(b.grade);
    expect(a.principles).toEqual(b.principles);
  });

  it('원칙 10개를 전부 5~10점으로 채점하고 코멘트를 채운다', () => {
    const result = generateAnalysis({ name: 'x.png', size: 1 });
    expect(result.principles).toHaveLength(PRINCIPLES.length);
    for (const p of result.principles) {
      expect(p.score).toBeGreaterThanOrEqual(5);
      expect(p.score).toBeLessThanOrEqual(10);
      expect(p.comment.length).toBeGreaterThan(0);
    }
  });

  it('총점은 68~92 범위를 벗어나지 않는다 (다수 샘플)', () => {
    for (let i = 0; i < 200; i += 1) {
      const result = generateAnalysis({ name: `file-${i}.pdf`, size: i * 977 });
      expect(result.totalScore).toBeGreaterThanOrEqual(68);
      expect(result.totalScore).toBeLessThanOrEqual(92);
    }
  });

  it('강점 3개·개선점 3개를 제공한다', () => {
    const result = generateAnalysis({ name: 'y.jpg', size: 12345 });
    expect(result.strengths).toHaveLength(3);
    expect(result.improvements).toHaveLength(3);
  });
});
