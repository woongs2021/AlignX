import { useState } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { formatDate } from '@/lib/format';
import type { HistoryChartPoint } from '@/features/history/historyData';
import styles from './ScoreTrendChart.module.css';

const PAD = 28;
const H_PLOT_WIDTH = 640 - PAD * 2;
const H_PLOT_HEIGHT = 200 - PAD * 2;
const V_PLOT_WIDTH = 280 - PAD * 2;
const V_ROW_HEIGHT = 56;

function scoreToOffset(score: number, length: number): number {
  return (1 - score / 100) * length;
}

type Point = { cx: number; cy: number; point: HistoryChartPoint };

function horizontalLayout(points: HistoryChartPoint[]): { points: Point[]; viewW: number; viewH: number } {
  const n = points.length;
  const laid = points.map((point, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5;
    return { cx: PAD + t * H_PLOT_WIDTH, cy: PAD + scoreToOffset(point.score, H_PLOT_HEIGHT), point };
  });
  return { points: laid, viewW: 640, viewH: 200 };
}

function verticalLayout(points: HistoryChartPoint[]): { points: Point[]; viewW: number; viewH: number } {
  const n = points.length;
  const laid = points.map((point, i) => ({
    cx: PAD + (point.score / 100) * V_PLOT_WIDTH,
    cy: PAD + i * V_ROW_HEIGHT,
    point,
  }));
  const viewH = PAD * 2 + Math.max(0, n - 1) * V_ROW_HEIGHT;
  return { points: laid, viewW: 280, viewH };
}

/** 총점 추이 — 순수 SVG, y축 0–100 고정, 격자·그라디언트 없음, 모바일은 세로형(09 §6.1②). */
export function ScoreTrendChart({ points }: { points: HistoryChartPoint[] }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [selected, setSelected] = useState(points.length - 1);

  const { points: laid, viewW, viewH } = isMobile ? verticalLayout(points) : horizontalLayout(points);
  const polylinePoints = laid.map((p) => `${p.cx},${p.cy}`).join(' ');
  const activePoint = points[selected] ?? points[points.length - 1];

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${viewW} ${viewH}`}
        role="img"
        aria-label={`총점 추이: ${points.map((p) => `${p.index}회차 ${p.score}점`).join(', ')}`}
        data-orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {!isMobile && (
          <>
            <text x={0} y={PAD + 4} className={styles.axisLabel}>
              100
            </text>
            <text x={0} y={PAD + H_PLOT_HEIGHT + 4} className={styles.axisLabel}>
              0
            </text>
          </>
        )}
        <polyline points={polylinePoints} className={styles.line} />
        {laid.map((p, i) => (
          <g key={p.point.attemptId}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={12}
              className={styles.hitArea}
              tabIndex={0}
              role="button"
              aria-label={`${p.point.index}회차 · ${formatDate(p.point.date)} · ${p.point.score}점`}
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onClick={() => setSelected(i)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelected(i);
              }}
            />
            <circle cx={p.cx} cy={p.cy} r={i === selected ? 6 : 4} className={styles.node} data-selected={i === selected} />
          </g>
        ))}
      </svg>
      {activePoint && (
        <p className={`meta ${styles.readout}`}>
          {activePoint.index}회차 · {formatDate(activePoint.date)} · {activePoint.score}점
        </p>
      )}
    </div>
  );
}
