import { SectionHeader } from '@/components/SectionHeader';
import styles from './SatisfactionSummary.module.css';

const POINTS = [1, 2, 3, 4, 5, 6, 7];

type Survey = { satisfaction: number; motivation: number; outcome: number };

const ITEMS: { key: keyof Survey; label: string }[] = [
  { key: 'satisfaction', label: '교육 만족도' },
  { key: 'motivation', label: '동기부여' },
  { key: 'outcome', label: '학습성과' },
];

type SatisfactionSummaryProps = {
  survey: Survey;
  review: string;
};

/** 최종 포트폴리오 제출 시 남긴 7점 척도 3항목 + 후기 표시 — 평가가 아니라 본인 응답임을 명시. */
export function SatisfactionSummary({ survey, review }: SatisfactionSummaryProps) {
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="SELF-REPORTED" title="만족도 응답 요약" />
      <p className={`meta ${styles.note}`}>
        아래는 평가 결과가 아니라, 최종 포트폴리오 제출 시 본인이 직접 남긴 응답입니다.
      </p>

      <div className={styles.gauges}>
        {ITEMS.map((item) => {
          const score = survey[item.key];
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
        <p className={styles.reviewText}>{review}</p>
      </div>
    </section>
  );
}
