// 전체 이력 리포트 HTML — buildReportHtml(features/report/buildHtml.ts)과 같은 원칙:
// 순수 함수로 문자열만 만들고, 인라인 스타일 + escapeHtml로 인터넷 없이 열어도 동일하게 보이게 한다
// (Plans/09-my.md §6.1⑥).
import { escapeHtml } from '@/features/report/buildHtml';
import type { HistoryData } from './historyData';

/** 파일명: AlignX_이력리포트_{이름}_{YYYYMMDD}.html */
export function historyFileName(name: string, date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const safeName = name.replace(/[\\/:*?"<>|]/g, '_').trim() || '회차';
  return `AlignX_이력리포트_${safeName}_${yyyy}${mm}${dd}.html`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(
    new Date(iso),
  );
}

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '변화 없음';
}

function scoreTrendRows(data: HistoryData): string {
  return data.chartPoints
    .map(
      (point) => `
      <tr>
        <td class="num">#${point.index}</td>
        <td class="meta">${escapeHtml(formatDate(point.date))}</td>
        <td>
          <div class="bar-track"><div class="bar-fill" style="width:${point.score}%"></div></div>
          <span class="score">${point.score}</span>
        </td>
      </tr>`,
    )
    .join('');
}

function principleRows(data: HistoryData): string {
  return data.principleRows
    .map(
      (row) => `
      <tr>
        <td class="num">${String(row.order).padStart(2, '0')}</td>
        <td>
          <div class="kr">${escapeHtml(row.nameKr)}</div>
          <div class="en">${escapeHtml(row.nameEn)}</div>
        </td>
        <td>${row.scores.join(' → ')}</td>
        <td class="${row.delta > 0 ? 'up' : row.delta < 0 ? 'down' : ''}">${deltaLabel(row.delta)}</td>
      </tr>`,
    )
    .join('');
}

function mentorArchiveItems(data: HistoryData): string {
  return data.mentorArchive
    .map(
      (entry) => `
      <div class="archive-item">
        <div class="archive-head">
          <span class="avatar">${escapeHtml(entry.mentorName[0] ?? '')}</span>
          <div>
            <div class="mentor-name">${escapeHtml(entry.mentorName)}</div>
            <div class="meta">${escapeHtml(entry.mentorRole)} · ${escapeHtml(formatDate(entry.date))}</div>
          </div>
        </div>
        ${entry.repeatedPrincipleNames.length > 0 ? `<span class="badge">반복 지적 · ${escapeHtml(entry.repeatedPrincipleNames.join(', '))}</span>` : ''}
        <p>${escapeHtml(entry.comment)}</p>
      </div>`,
    )
    .join('');
}

/** 순수 함수 — MyHistoryPage와 같은 HistoryData를 받아 동일한 내용을 그린다. */
export function buildHistoryHtml(data: HistoryData, name: string): string {
  const generatedAt = formatDate(new Date().toISOString());

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AlignX 전체 이력 리포트 - ${escapeHtml(name)}</title>
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
  .wordmark { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: #B85C4F; }
  h1 { font-size: 28px; font-weight: 500; margin: 12px 0 4px; }
  h2 { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #754039; margin: 40px 0 16px; }
  .meta { color: rgba(1,1,2,0.6); font-size: 14px; margin: 0; }
  .growth { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
  .growth .from-to { font-size: 20px; }
  .growth .delta { font-size: 32px; font-weight: 700; color: #B85C4F; }
  .avg { margin-top: 4px; color: rgba(1,1,2,0.6); font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(1,1,2,0.16); vertical-align: top; font-size: 14px; }
  th { font-size: 12px; color: rgba(1,1,2,0.6); font-weight: 600; }
  .num { font-family: ui-monospace, Consolas, monospace; color: rgba(1,1,2,0.6); }
  .en { color: rgba(1,1,2,0.6); font-size: 12px; }
  .bar-track { width: 160px; height: 6px; border-radius: 999px; background: rgba(1,1,2,0.16); overflow: hidden; display: inline-block; vertical-align: middle; }
  .bar-fill { height: 100%; background: #B85C4F; }
  .score { font-family: ui-monospace, Consolas, monospace; font-size: 12px; margin-left: 8px; }
  .up { color: #16427C; }
  .down { color: rgba(1,1,2,0.6); }
  .insights { padding-left: 20px; }
  .insights li { margin-bottom: 8px; }
  .archive-item { border-left: 2px solid rgba(1,1,2,0.16); padding: 4px 0 16px 16px; margin-bottom: 8px; }
  .archive-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .avatar { width: 32px; height: 32px; border-radius: 999px; background: #A38E85; color: #FCFCFF; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
  .mentor-name { font-weight: 600; font-size: 14px; }
  .badge { display: inline-block; background: #B85C4F; color: #FCFCFF; border-radius: 999px; padding: 2px 10px; font-size: 11px; margin-bottom: 6px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid rgba(1,1,2,0.16); font-size: 12px; color: rgba(1,1,2,0.6); }
</style>
</head>
<body>
  <div class="container">
    <span class="wordmark">ALIGNX</span>
    <h1>${escapeHtml(name)}님의 전체 이력 리포트</h1>
    <p class="meta">완료 ${data.completedCount}회 기준${data.isPartial ? ' (진행 중인 회차는 제외)' : ''} · 생성 ${generatedAt}</p>

    <h2>성장 요약</h2>
    <div class="growth">
      <span class="from-to">FIRST ${data.firstScore} → LATEST ${data.latestScore}</span>
      <span class="delta">${deltaLabel(data.delta)}</span>
    </div>
    <p class="avg">평균 ${data.avgDeltaPerAttempt >= 0 ? '상승' : '하락'} ${Math.abs(data.avgDeltaPerAttempt).toFixed(1)}점 / 회차</p>

    <h2>총점 추이</h2>
    <table>
      <thead><tr><th>회차</th><th>일자</th><th>최종 점수</th></tr></thead>
      <tbody>${scoreTrendRows(data)}</tbody>
    </table>

    <h2>원칙별 변화</h2>
    <table>
      <thead><tr><th>#</th><th>원칙</th><th>회차별 점수</th><th>변화</th></tr></thead>
      <tbody>${principleRows(data)}</tbody>
    </table>

    <h2>해석</h2>
    <ul class="insights">${data.insights.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>

    <h2>멘토 코멘트 아카이브</h2>
    ${mentorArchiveItems(data)}

    <footer>
      AlignX 포트폴리오 분석 이력 리포트 · 생성 ${generatedAt} · AI 분석 결과는 참고 지표이며 최종 판단은 사용자에게 있습니다.
    </footer>
  </div>
</body>
</html>`;
}
