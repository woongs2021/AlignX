import type { HistoryData } from '@/features/history/historyData';
import styles from './GrowthSummary.module.css';

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}점`;
  if (delta < 0) return `${delta}점`;
  return '변화 없음';
}

/** FIRST → LATEST, +N점을 --t-impact(700)로 강조한다 — 이 페이지에서 굵기 700은 여기 하나뿐 (09 §6.1①). */
export function GrowthSummary({ data }: { data: HistoryData }) {
  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <span className={styles.fromTo}>
          FIRST {data.firstScore} → LATEST {data.latestScore}
        </span>
        <span className={styles.delta} data-negative={data.delta < 0}>
          {deltaLabel(data.delta)}
        </span>
      </div>
      {data.completedCount > 1 && (
        <p className="meta">
          평균 {data.avgDeltaPerAttempt >= 0 ? '상승' : '하락'} {Math.abs(data.avgDeltaPerAttempt).toFixed(1)}점 /
          회차
        </p>
      )}
    </div>
  );
}
