import { SectionHeader } from '@/components/SectionHeader';
import type { ReportData } from '@/features/report/buildReportData';
import styles from './SatisfactionSummary.module.css';

const POINTS = [1, 2, 3, 4, 5, 6, 7];

const ITEMS: { key: keyof ReportData['survey']; label: string }[] = [
  { key: 'satisfaction', label: '교육 만족도' },
  { key: 'motivation', label: '동기부여' },
  { key: 'outcome', label: '학습성과' },
];

type SatisfactionSummaryProps = {
  report: ReportData;
};

/** 2단계 7점 척도 3항목 시각화 — 평가 결과가 아니라 본인 응답임을 명시 (07 §5). */
export function SatisfactionSummary({ report }: SatisfactionSummaryProps) {
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="SELF-REPORTED" title="만족도 응답 요약" />
      <p className={`meta ${styles.note}`}>
        아래는 평가 결과가 아니라, 2단계 제출 시 본인이 직접 남긴 응답입니다.
      </p>

      <div className={styles.gauges}>
        {ITEMS.map((item) => {
          const score = report.survey[item.key];
          return (
            <div key={item.key} className={styles.gaugeRow}>
              <div className={styles.gaugeLabel}>
                <span>{item.label}</span>
                <span className={styles.gaugeScore}>{score} / 7</span>
              </div>
              <div className={styles.gaugeCells} aria-hidden="true">
                {POINTS.map((point) => (
                  <div key={point} className={styles.cell} data-filled={point <= score} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.review}>
        <p className={styles.reviewLabel}>주관식 후기</p>
        <p className={styles.reviewText}>{report.review}</p>
      </div>
    </section>
  );
}
