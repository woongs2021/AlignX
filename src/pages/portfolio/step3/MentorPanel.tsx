import { SectionHeader } from '@/components/SectionHeader';
import type { ReportData } from '@/features/report/buildReportData';
import styles from './MentorPanel.module.css';

type MentorPanelProps = {
  report: ReportData;
};

/** 요청사항 인용 바로 아래 답변을 붙여 대화로 읽히게 한다 (07 §4). */
export function MentorPanel({ report }: MentorPanelProps) {
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="MENTOR COMMENTS" title="멘토 종합 코멘트" />

      <blockquote className={styles.quote}>
        <span className={styles.quoteLabel}>멘토에게 요청한 사항</span>
        {report.requestNote}
      </blockquote>

      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.avatar} aria-hidden="true">
            {report.mentorOverall.name[0]}
          </span>
          <div>
            <p className={styles.name}>{report.mentorOverall.name}</p>
            <p className="meta">{report.mentorOverall.role} · 종합 총평</p>
          </div>
        </div>
        <p className={styles.comment}>{report.mentorOverall.comment}</p>
      </div>
    </section>
  );
}
