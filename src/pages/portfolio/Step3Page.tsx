import { usePageMeta } from '@/layout/usePageMeta';
import { useAppStore } from '@/store/useAppStore';
import { buildReportData } from '@/features/report/buildReportData';
import { buildReportHtml, reportFileName } from '@/features/report/buildHtml';
import { downloadHtmlFile } from '@/lib/download';
import { ReportHeader } from './step3/ReportHeader';
import { ScoreSummary } from './step3/ScoreSummary';
import { PrincipleComparisonTable } from './step3/PrincipleComparisonTable';
import { MentorPanel } from './step3/MentorPanel';
import { SatisfactionSummary } from './step3/SatisfactionSummary';
import { NextActions } from './step3/NextActions';

/** 3단계 — AI+사람 통합 리포트, HTML 다운로드 (Plans/07-portfolio-step3.md). */
export function Step3Page() {
  usePageMeta({ title: '3단계 · 통합 리포트 — AlignX' });
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);
  const report = activeAttempt ? buildReportData(activeAttempt) : null;

  if (!report) return null;

  function handleDownload() {
    if (!report) return;
    const html = buildReportHtml(report);
    downloadHtmlFile(html, reportFileName(report.name));
  }

  return (
    <div className="container">
      <ReportHeader report={report} onDownload={handleDownload} />
      <ScoreSummary report={report} />
      <PrincipleComparisonTable report={report} />
      <MentorPanel report={report} />
      <SatisfactionSummary report={report} />
      <NextActions />
    </div>
  );
}
