import { useMemo, useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ToggleGroup } from '@/components/ToggleGroup';
import type { ReportData } from '@/features/report/buildReportData';
import styles from './PrincipleComparisonTable.module.css';

type SortMode = 'order' | 'score';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'order', label: '원칙 순서' },
  { value: 'score', label: '점수 낮은 순' },
];

function toneOf(score: number): 'primary' | 'soft' | 'mute' {
  if (score >= 8) return 'primary';
  if (score >= 5) return 'soft';
  return 'mute';
}

type PrincipleComparisonTableProps = {
  report: ReportData;
};

/** 이 리포트의 핵심 — AI 점수와 멘토 코멘트를 나란히 놓는다 (07 §3). */
export function PrincipleComparisonTable({ report }: PrincipleComparisonTableProps) {
  const [sort, setSort] = useState<SortMode>('order');

  const rows = useMemo(() => {
    const copy = [...report.principles];
    copy.sort((a, b) => (sort === 'score' ? a.aiScore - b.aiScore : a.order - b.order));
    return copy;
  }, [report.principles, sort]);

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <SectionHeader eyebrow="PRINCIPLE COMPARISON" title="원칙별 대조표" />
        <ToggleGroup ariaLabel="정렬 기준" options={SORT_OPTIONS} value={sort} onChange={setSort} activeVariant="soft" />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>원칙</th>
            <th>AI 점수</th>
            <th>멘토 코멘트</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className={styles.orderCell}>{String(row.order).padStart(2, '0')}</td>
              <td>
                <p>{row.nameKr}</p>
                <p className={styles.nameEn}>{row.nameEn}</p>
              </td>
              <td>
                <div className={styles.barCell}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      data-tone={toneOf(row.aiScore)}
                      style={{ width: `${row.aiScore * 10}%` }}
                    />
                  </div>
                  <span className={styles.barScore}>{row.aiScore}</span>
                </div>
              </td>
              <td className={styles.mentorCell}>
                {row.isGap && (
                  <Badge variant="tone" className={styles.gapBadge}>
                    관점 차이
                  </Badge>
                )}
                <p className={styles.mentorLabel}>MENTOR</p>
                <p>{row.mentorComment}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.cards}>
        {rows.map((row) => (
          <Card key={row.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHead}>
              <span className={styles.orderCell}>{String(row.order).padStart(2, '0')}</span>
              <div className={styles.barCell}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    data-tone={toneOf(row.aiScore)}
                    style={{ width: `${row.aiScore * 10}%` }}
                  />
                </div>
                <span className={styles.barScore}>{row.aiScore}</span>
              </div>
            </div>
            <p>{row.nameKr}</p>
            <p className={styles.nameEn}>{row.nameEn}</p>
            {row.isGap && (
              <Badge variant="tone" className={styles.gapBadge}>
                관점 차이
              </Badge>
            )}
            <p className={styles.mentorLabel}>MENTOR</p>
            <p>{row.mentorComment}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
