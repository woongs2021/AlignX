import { StatTile } from '@/components/StatTile';
import { Card } from '@/components/Card';
import type { ReportData } from '@/features/report/buildReportData';
import styles from './ScoreSummary.module.css';

type ScoreSummaryProps = {
  report: ReportData;
};

/** AI · 멘토 · 종합 3개 점수 — FINAL만 weight 700(--t-impact), 이 페이지 유일한 700 (07 §2). */
export function ScoreSummary({ report }: ScoreSummaryProps) {
  return (
    <section className={styles.section}>
      <div className={styles.tiles}>
        <StatTile value={String(report.aiScore)} label="AI SCORE — 10대 원칙 자동 채점" />
        <StatTile value={String(report.mentorScore)} label="MENTOR SCORE — 현직 멘토 3인 검증" />
        <Card>
          <span className={`impact ${styles.finalValue}`}>{report.finalScore}</span>
          <p className="meta">FINAL — 가중 평균 (AI 50% + 멘토 50%)</p>
        </Card>
      </div>
      {report.gapNote && <p className={styles.gapNote}>{report.gapNote}</p>}
    </section>
  );
}
