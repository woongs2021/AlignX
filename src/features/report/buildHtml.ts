// 단일 파일로 완결되는 HTML 리포트 — 인터넷 없이 더블클릭해도 화면과 동일해야 한다 (Plans/07-portfolio-step3.md §6).
// 순수 함수: 문자열만 만들고 Blob/다운로드는 호출부(Step3Page)가 담당한다 — 테스트하기 위해서다.
import type { ReportData } from './buildReportData';

// AlignXLogo.tsx(JSX)와 별개로 순수 문자열이 필요해 경로 데이터를 그대로 옮겨왔다 — 로고 자체가
// 거의 바뀌지 않는 정적 자산이라 중복의 실익보다 렌더링 컨텍스트 분리가 더 크다고 판단했다.
const LOGO_PATHS = [
  'M155.57,126.28V32.07h19.8v94.21h-19.8Z',
  'M191.24,126.28V61.85h19.81v64.43h-19.81Z',
  'M191.24,49.63v-17.56h19.81v17.56h-19.81Z',
  'M278.6,57.97v8.77c-2.04-2.64-4.44-4.77-7.3-6.3-4.36-2.33-9.51-3.49-15.43-3.49s-11.85,1.36-17.01,4.06c-5.17,2.71-9.27,6.54-12.31,11.49-3.05,4.95-4.57,10.77-4.57,17.46s1.52,12.38,4.57,17.33c3.04,4.95,7.15,8.8,12.31,11.55,5.16,2.75,10.83,4.13,17.01,4.13s11.06-1.19,15.43-3.56c2.45-1.33,4.56-3.1,6.41-5.22v3.19c0,6.18-1.61,10.83-4.82,13.96-3.22,3.13-8.3,4.7-15.24,4.7-4.49,0-8.91-.7-13.26-2.1-4.36-1.4-8.02-3.32-10.99-5.77l-7.87,14.34c3.98,3.13,8.95,5.48,14.92,7.05,5.97,1.57,12.17,2.35,18.6,2.35,12.36,0,21.84-3.03,28.44-9.08,6.6-6.05,9.9-15.38,9.9-27.99v-56.88h-18.79ZM275.55,98.73c-1.52,2.54-3.64,4.53-6.35,5.97-2.71,1.44-5.8,2.16-9.27,2.16s-6.46-.72-9.21-2.16c-2.75-1.44-4.91-3.43-6.48-5.97-1.57-2.54-2.35-5.46-2.35-8.76s.78-6.32,2.35-8.82c1.56-2.5,3.72-4.42,6.48-5.77,2.75-1.36,5.82-2.03,9.21-2.03s6.56.68,9.27,2.03c2.71,1.35,4.82,3.28,6.35,5.77,1.52,2.5,2.29,5.44,2.29,8.82s-.77,6.22-2.29,8.76Z',
  'M378.4,70.1c-2.46-4.44-5.82-7.74-10.1-9.9s-9.12-3.24-14.54-3.24c-5.84,0-11.05,1.23-15.62,3.68-2.72,1.46-5.01,3.34-6.98,5.55v-8.21h-18.92v68.31h19.8v-33.77c0-4.32.7-7.78,2.1-10.41,1.39-2.62,3.34-4.62,5.84-5.97,2.5-1.36,5.31-2.03,8.44-2.03,4.4,0,7.81,1.31,10.22,3.94s3.62,6.69,3.62,12.18v36.06h19.81v-39.1c0-6.94-1.23-12.63-3.68-17.08Z',
];
const LOGO_POLYGONS = [
  '413.05 73.07 436.31 73.07 410.41 32.09 387.14 32.09 413.05 73.07',
  '462.22 32.09 485.49 32.09 459.58 73.07 436.31 73.07 462.22 32.09',
  '64.25 37.4 87.52 37.4 49.78 126.28 26.51 126.28 64.25 37.4',
  '125.26 126.28 148.53 126.28 110.79 37.4 87.52 37.4 125.26 126.28',
  '413.05 85.29 436.31 85.29 410.41 126.28 387.14 126.28 413.05 85.29',
  '462.22 126.28 485.49 126.28 459.58 85.29 436.31 85.29 462.22 126.28',
];

const LOGO_SVG = `<svg viewBox="0 0 512 180" fill="#010102" width="120" height="42" role="img" aria-label="AlignX">${LOGO_PATHS.map((d) => `<path d="${d}"/>`).join('')}${LOGO_POLYGONS.map((p) => `<polygon points="${p}"/>`).join('')}</svg>`;

/** 파일명: AlignX_리포트_{이름}_{YYYYMMDD}.html — 파일시스템 금지 문자는 밑줄로 치환한다. */
export function reportFileName(name: string, date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const safeName = name.replace(/[\\/:*?"<>|]/g, '_').trim() || '회차';
  return `AlignX_리포트_${safeName}_${yyyy}${mm}${dd}.html`;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toneOf(score: number): string {
  if (score >= 8) return '#4065F8';
  if (score >= 5) return '#16427C';
  return '#A8BFC1';
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

function principleRows(report: ReportData): string {
  return report.principles
    .map(
      (p) => `
      <tr>
        <td class="num">${String(p.order).padStart(2, '0')}</td>
        <td>
          <div class="kr">${escapeHtml(p.nameKr)}</div>
          <div class="en">${escapeHtml(p.nameEn)}</div>
        </td>
        <td>
          <div class="bar-track"><div class="bar-fill" style="width:${p.aiScore * 10}%;background:${toneOf(p.aiScore)}"></div></div>
          <span class="score">${p.aiScore}</span>
        </td>
        <td>
          ${p.isGap ? '<span class="badge">관점 차이</span>' : ''}
          <div class="mentor-label">MENTOR</div>
          <div>${escapeHtml(p.mentorComment)}</div>
        </td>
      </tr>`,
    )
    .join('');
}

function mentorCards(report: ReportData): string {
  return report.mentorPanel
    .map(
      (m) => `
      <div class="mentor-card">
        <div class="mentor-head">
          <span class="avatar">${escapeHtml(m.initial)}</span>
          <div><div class="mentor-name">${escapeHtml(m.name)}</div><div class="meta">${escapeHtml(m.role)}</div></div>
        </div>
        <p>${escapeHtml(m.comment)}</p>
      </div>`,
    )
    .join('');
}

function satisfactionGauge(label: string, score: number): string {
  const cells = Array.from({ length: 7 }, (_, i) => i + 1)
    .map((n) => `<div class="cell" style="background:${n <= score ? '#4065F8' : '#E5E5EA'}"></div>`)
    .join('');
  return `
    <div class="gauge-row">
      <div class="gauge-label"><span>${escapeHtml(label)}</span><span class="meta">${score} / 7</span></div>
      <div class="gauge-cells">${cells}</div>
    </div>`;
}

/** 순수 함수 — Attempt가 아니라 조립된 ReportData를 받는다(HTML/화면이 같은 데이터를 쓰게 하기 위함). */
export function buildReportHtml(report: ReportData): string {
  const generatedAt = formatDate(new Date().toISOString());

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AlignX 리포트 - ${escapeHtml(report.name)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px 24px;
    background: #FCFCFF;
    color: #010102;
    font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif;
    line-height: 1.6;
  }
  .container { max-width: 840px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }
  h1 { font-size: 28px; font-weight: 500; margin: 12px 0 4px; }
  h2 { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #16427C; margin: 40px 0 16px; }
  .meta { color: rgba(1,1,2,0.6); font-size: 14px; margin: 0; }
  .preview { width: 96px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(1,1,2,0.16); }
  .scores { display: flex; gap: 16px; flex-wrap: wrap; }
  .score-tile { flex: 1; min-width: 160px; border: 1px solid rgba(1,1,2,0.16); border-radius: 16px; padding: 20px; }
  .score-tile .value { font-size: 40px; font-weight: 300; line-height: 1; }
  .score-tile.final .value { font-weight: 700; }
  .gap-note { margin-top: 12px; color: rgba(1,1,2,0.6); font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(1,1,2,0.16); vertical-align: top; font-size: 14px; }
  th { font-size: 12px; color: rgba(1,1,2,0.6); font-weight: 600; }
  .num { font-family: ui-monospace, Consolas, monospace; color: rgba(1,1,2,0.6); }
  .en { color: rgba(1,1,2,0.6); font-size: 12px; }
  .bar-track { width: 120px; height: 6px; border-radius: 999px; background: rgba(1,1,2,0.16); overflow: hidden; display: inline-block; vertical-align: middle; }
  .bar-fill { height: 100%; }
  .score { font-family: ui-monospace, Consolas, monospace; font-size: 12px; margin-left: 8px; }
  .badge { display: inline-block; background: #4065F8; color: #FCFCFF; border-radius: 999px; padding: 2px 10px; font-size: 11px; margin-bottom: 4px; }
  .mentor-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #16427C; margin-bottom: 2px; }
  blockquote { margin: 0 0 20px; padding: 16px; border-left: 2px solid rgba(1,1,2,0.4); color: rgba(1,1,2,0.6); font-size: 14px; }
  .quote-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #16427C; margin-bottom: 6px; }
  .mentor-cards { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
  .mentor-card { flex: 1; min-width: 220px; background: #A1D0F6; border-radius: 28px; padding: 20px; }
  .mentor-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .avatar { width: 36px; height: 36px; border-radius: 999px; background: #A8BFC1; color: #FCFCFF; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
  .mentor-name { font-weight: 600; font-size: 14px; }
  .gauge-row { margin-bottom: 16px; max-width: 420px; }
  .gauge-label { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
  .gauge-cells { display: flex; gap: 4px; }
  .cell { flex: 1; height: 8px; border-radius: 4px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid rgba(1,1,2,0.16); font-size: 12px; color: rgba(1,1,2,0.6); }
  @media print {
    body { padding: 0; }
    .mentor-card { background: #f0f0f0 !important; }
  }
</style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        ${LOGO_SVG}
        <h1>${escapeHtml(report.name)}님의 통합 리포트</h1>
        <p class="meta">${escapeHtml(report.topic)} · 제출 ${formatDate(report.submittedAt)}</p>
      </div>
      ${report.previewDataUrl ? `<img class="preview" src="${report.previewDataUrl}" alt="포트폴리오 프리뷰">` : ''}
    </header>

    <section class="scores">
      <div class="score-tile"><div class="value">${report.aiScore}</div><div class="meta">AI SCORE</div></div>
      <div class="score-tile"><div class="value">${report.mentorScore}</div><div class="meta">MENTOR SCORE</div></div>
      <div class="score-tile final"><div class="value">${report.finalScore}</div><div class="meta">FINAL</div></div>
    </section>
    ${report.gapNote ? `<p class="gap-note">${escapeHtml(report.gapNote)}</p>` : ''}

    <h2>원칙별 대조표</h2>
    <table>
      <thead><tr><th>#</th><th>원칙</th><th>AI 점수</th><th>멘토 코멘트</th></tr></thead>
      <tbody>${principleRows(report)}</tbody>
    </table>

    <h2>멘토 종합 코멘트</h2>
    <blockquote><span class="quote-label">멘토에게 요청한 사항</span>${escapeHtml(report.requestNote)}</blockquote>
    <div class="mentor-cards">${mentorCards(report)}</div>
    <div class="mentor-card">
      <div class="mentor-head">
        <span class="avatar">${escapeHtml(report.mentorOverall.name[0] ?? '')}</span>
        <div><div class="mentor-name">${escapeHtml(report.mentorOverall.name)}</div><div class="meta">${escapeHtml(report.mentorOverall.role)} · 종합 총평</div></div>
      </div>
      <p>${escapeHtml(report.mentorOverall.comment)}</p>
    </div>

    <h2>만족도 응답 요약</h2>
    <p class="meta">아래는 평가 결과가 아니라, 2단계 제출 시 본인이 직접 남긴 응답입니다.</p>
    ${satisfactionGauge('교육 만족도', report.survey.satisfaction)}
    ${satisfactionGauge('동기부여', report.survey.motivation)}
    ${satisfactionGauge('학습성과', report.survey.outcome)}
    <p>${escapeHtml(report.review)}</p>

    <footer>
      AlignX 포트폴리오 분석 리포트 · 생성 ${generatedAt} · AI 분석 결과는 참고 지표이며 최종 판단은 사용자에게 있습니다.
    </footer>
  </div>
</body>
</html>`;
}
