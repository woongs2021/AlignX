import { useState } from 'react';
import { ToggleGroup } from '@/components/ToggleGroup';
import type { PrincipleChangeRow } from '@/features/history/historyData';
import styles from './PrincipleChangeTable.module.css';

type SortMode = 'order' | 'delta';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'order', label: '원칙 순서' },
  { value: 'delta', label: '변화 큰 순' },
];

function deltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '변화 없음';
}

function Sparkline({ scores }: { scores: number[] }) {
  const width = 64;
  const height = 20;
  const n = scores.length;
  const points = scores
    .map((score, i) => {
      const x = n > 1 ? (i / (n - 1)) * width : width / 2;
      const y = height - (score / 10) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} className={styles.sparklineLine} />
    </svg>
  );
}

type PrincipleChangeTableProps = {
  rows: PrincipleChangeRow[];
  topImproved: PrincipleChangeRow[];
  stagnantPrinciples: PrincipleChangeRow[];
  attemptCount: number;
};

/** 원칙별 변화표 — 데스크톱은 매트릭스 표, 모바일은 카드 스택 + 스파크라인 (09 §6.1③). */
export function PrincipleChangeTable({ rows, topImproved, stagnantPrinciples, attemptCount }: PrincipleChangeTableProps) {
  const [sort, setSort] = useState<SortMode>('order');
  const sorted = sort === 'delta' ? [...rows].sort((a, b) => b.delta - a.delta) : rows;

  return (
    <div className={styles.section}>
      {(topImproved.length > 0 || stagnantPrinciples.length > 0) && (
        <div className={styles.highlights}>
          {topImproved.length > 0 && (
            <p className="meta">
              가장 많이 오른 원칙 · {topImproved.map((r) => `${r.nameKr}(+${r.delta})`).join(', ')}
            </p>
          )}
          {stagnantPrinciples.length > 0 && (
            <p className="meta">정체된 원칙 · {stagnantPrinciples.map((r) => r.nameKr).join(', ')}</p>
          )}
        </div>
      )}

      <ToggleGroup ariaLabel="정렬 기준" options={SORT_OPTIONS} value={sort} onChange={setSort} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>원칙</th>
              {Array.from({ length: attemptCount }, (_, i) => (
                <th key={i}>{i + 1}회</th>
              ))}
              <th>변화</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className={styles.nameKr}>{row.nameKr}</div>
                  <div className={styles.nameEn}>{row.nameEn}</div>
                </td>
                {row.scores.map((score, i) => (
                  <td key={i} className={styles.num}>
                    {score}
                  </td>
                ))}
                <td className={row.delta > 0 ? styles.up : row.delta < 0 ? styles.down : undefined}>
                  {deltaLabel(row.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardStack}>
        {sorted.map((row) => (
          <div key={row.id} className={styles.card}>
            <div>
              <p className={styles.nameKr}>{row.nameKr}</p>
              <p className={row.delta > 0 ? styles.up : row.delta < 0 ? styles.down : 'meta'}>{deltaLabel(row.delta)}</p>
            </div>
            <Sparkline scores={row.scores} />
          </div>
        ))}
      </div>
    </div>
  );
}
