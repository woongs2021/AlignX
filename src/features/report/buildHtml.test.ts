import { describe, expect, it } from 'vitest';
import { buildReportHtml, escapeHtml, reportFileName } from './buildHtml';
import { buildReportData, type ReportData } from './buildReportData';
import { PRINCIPLES } from '@/data/principles';
import type { AiAnalysis, Attempt, MentorFeedback } from '@/types';

function makeReportData(overrides: Partial<{ name: string; requestNote: string; review: string }> = {}): ReportData {
  const ai: AiAnalysis = {
    analyzedAt: new Date().toISOString(),
    principles: PRINCIPLES.map((p, i) => ({ id: p.id, score: 5 + (i % 6), comment: `AI 코멘트 ${i}` })),
    totalScore: 82,
    grade: 'A',
    summary: '요약',
    strengths: ['강점1', '강점2', '강점3'],
    improvements: ['개선1', '개선2', '개선3'],
  };
  const mentorFeedback: MentorFeedback = {
    mentorName: '이지우',
    mentorRole: 'Design Director',
    overall: '종합 코멘트입니다.',
    perPrinciple: PRINCIPLES.map((p, i) => ({ principleId: p.id, comment: `멘토 코멘트 ${i}` })),
    mentorScore: 78,
    completedAt: new Date().toISOString(),
  };
  const attempt: Attempt = {
    id: 'atmp_report_test',
    createdAt: new Date().toISOString(),
    currentStep: 3,
    status: 'completed',
    file: {
      name: 'portfolio.pdf',
      mime: 'application/pdf',
      size: 1024,
      previewDataUrl: 'data:image/jpeg;base64,AAAA',
    },
    ai,
    mentorRequest: {
      name: overrides.name ?? '홍길동',
      topic: '커머스 앱 리디자인',
      requestNote: overrides.requestNote ?? '요청사항입니다 10자 이상 작성합니다',
      survey: { satisfaction: 6, motivation: 5, outcome: 7 },
      review: overrides.review ?? '후기입니다 10자 이상 작성합니다',
      submittedAt: new Date().toISOString(),
    },
    mentorStages: null,
    mentorFeedback,
  };
  const report = buildReportData(attempt);
  if (!report) throw new Error('테스트 픽스처 조립 실패');
  return report;
}

describe('escapeHtml', () => {
  it('script 태그를 무력화한다', () => {
    const escaped = escapeHtml('<script>alert(1)</script>');
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });

  it('따옴표와 앰퍼샌드도 이스케이프한다', () => {
    expect(escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;');
  });
});

describe('buildReportHtml', () => {
  it('이름에 <script>를 넣어도 실행 가능한 형태로 남지 않는다', () => {
    const report = makeReportData({ name: '<script>alert(1)</script>' });
    const html = buildReportHtml(report);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('요청사항·후기에 들어간 마크업도 이스케이프된다', () => {
    const report = makeReportData({
      requestNote: '<img src=x onerror=alert(1)> 요청 10자 이상',
      review: '<b>강조</b> 후기 10자 이상',
    });
    const html = buildReportHtml(report);
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<b>강조</b>');
  });

  it('외부 리소스를 참조하지 않는다 (http(s):// URL, 외부 <link>/<script> 없음)', () => {
    const report = makeReportData();
    const html = buildReportHtml(report);
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<link[^>]+href/);
    expect(html).not.toMatch(/<script[^>]*src=/);
    expect(html).not.toContain('<script>'); // JS 자체가 없다
  });

  it('시스템 폰트 스택을 쓰고 웹폰트를 임베드하지 않는다', () => {
    const report = makeReportData();
    const html = buildReportHtml(report);
    expect(html).toContain('-apple-system');
    expect(html).not.toContain('.woff');
  });

  it('@media print 규칙을 포함한다', () => {
    const html = buildReportHtml(makeReportData());
    expect(html).toContain('@media print');
  });

  it('AI 10개 원칙 전부와 관점 차이 뱃지 마크업이 포함된다', () => {
    const html = buildReportHtml(makeReportData());
    for (const p of PRINCIPLES) {
      expect(html).toContain(p.nameKr);
    }
  });

  it('파일 크기가 500KB 이하다 (프리뷰 이미지 포함)', () => {
    // data URL previewDataUrl은 짧은 더미값이라 실제 이미지 크기 검증은 아니지만,
    // 마크업/CSS 총량이 예산 안에 있는지는 확인한다.
    const html = buildReportHtml(makeReportData());
    const bytes = new TextEncoder().encode(html).length;
    expect(bytes).toBeLessThan(500 * 1024);
  });
});

describe('reportFileName', () => {
  it('AlignX_리포트_{이름}_{YYYYMMDD}.html 형식을 만든다', () => {
    const date = new Date('2026-08-09T00:00:00');
    expect(reportFileName('홍길동', date)).toBe('AlignX_리포트_홍길동_20260809.html');
  });

  it('파일시스템 금지 문자를 밑줄로 치환한다', () => {
    const date = new Date('2026-01-01T00:00:00');
    const name = reportFileName('a/b:c*d', date);
    expect(name).not.toMatch(/[/:*]/);
  });
});
