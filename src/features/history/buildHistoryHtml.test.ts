import { describe, expect, it } from 'vitest';
import { buildHistoryHtml, historyFileName } from './buildHistoryHtml';
import { PRINCIPLES } from '@/data/principles';
import type { HistoryData } from './historyData';

function makeHistoryData(overrides: Partial<HistoryData> = {}): HistoryData {
  return {
    totalAttempts: 3,
    completedCount: 3,
    isPartial: false,
    firstScore: 65,
    latestScore: 89,
    delta: 24,
    avgDeltaPerAttempt: 12,
    chartPoints: [
      { attemptId: 'a1', index: 1, date: '2026-01-01T00:00:00.000Z', score: 65 },
      { attemptId: 'a2', index: 2, date: '2026-02-01T00:00:00.000Z', score: 79 },
      { attemptId: 'a3', index: 3, date: '2026-03-01T00:00:00.000Z', score: 89 },
    ],
    principleRows: PRINCIPLES.map((p) => ({
      id: p.id,
      order: p.order,
      nameKr: p.nameKr,
      nameEn: p.nameEn,
      scores: [5, 6, 7],
      delta: 2,
    })),
    topImproved: [],
    stagnantPrinciples: [],
    insights: ['가장 크게 오른 항목은 정보 위계(+2)입니다.'],
    mentorArchive: [
      {
        attemptId: 'a3',
        date: '2026-03-01T00:00:00.000Z',
        mentorName: '이지우',
        mentorRole: 'Design Director',
        comment: '종합 코멘트입니다.',
        repeatedPrincipleNames: [],
      },
    ],
    ...overrides,
  };
}

describe('buildHistoryHtml', () => {
  it('이름·코멘트에 들어간 마크업을 이스케이프한다', () => {
    const data = makeHistoryData({
      mentorArchive: [
        {
          attemptId: 'a1',
          date: '2026-01-01T00:00:00.000Z',
          mentorName: '<script>alert(1)</script>',
          mentorRole: 'Design Director',
          comment: '<img src=x onerror=alert(1)>',
          repeatedPrincipleNames: [],
        },
      ],
    });
    const html = buildHistoryHtml(data, '<b>홍길동</b>');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<b>홍길동</b>');
    expect(html).toContain('&lt;b&gt;홍길동&lt;/b&gt;');
  });

  it('외부 리소스를 참조하지 않는다', () => {
    const html = buildHistoryHtml(makeHistoryData(), '홍길동');
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<link[^>]+href/);
    expect(html).not.toMatch(/<script/);
  });

  it('완료 회차 수와 부분 집계 여부를 헤더에 명시한다', () => {
    const partial = buildHistoryHtml(makeHistoryData({ completedCount: 2, isPartial: true }), '홍길동');
    expect(partial).toContain('완료 2회 기준');
    expect(partial).toContain('진행 중인 회차는 제외');

    const full = buildHistoryHtml(makeHistoryData(), '홍길동');
    expect(full).not.toContain('진행 중인 회차는 제외');
  });

  it('반복 지적 배지가 원칙 이름과 함께 표시된다', () => {
    const data = makeHistoryData({
      mentorArchive: [
        {
          attemptId: 'a2',
          date: '2026-02-01T00:00:00.000Z',
          mentorName: '이지우',
          mentorRole: 'Design Director',
          comment: '코멘트',
          repeatedPrincipleNames: ['정보 위계'],
        },
      ],
    });
    const html = buildHistoryHtml(data, '홍길동');
    expect(html).toContain('반복 지적');
    expect(html).toContain('정보 위계');
  });

  it('10개 원칙 전부를 표에 담는다', () => {
    const html = buildHistoryHtml(makeHistoryData(), '홍길동');
    for (const p of PRINCIPLES) {
      expect(html).toContain(p.nameKr);
    }
  });
});

describe('historyFileName', () => {
  it('AlignX_이력리포트_{이름}_{YYYYMMDD}.html 형식을 만든다', () => {
    const date = new Date('2026-08-09T00:00:00');
    expect(historyFileName('홍길동', date)).toBe('AlignX_이력리포트_홍길동_20260809.html');
  });

  it('파일시스템 금지 문자를 밑줄로 치환한다', () => {
    const date = new Date('2026-01-01T00:00:00');
    expect(historyFileName('a/b:c*d', date)).not.toMatch(/[/:*]/);
  });
});
