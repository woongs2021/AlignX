import { Badge } from '@/components/Badge';
import { formatDate } from '@/lib/format';
import type { MentorArchiveEntry } from '@/features/history/historyData';
import styles from './MentorArchive.module.css';

/** 회차별 멘토 종합 코멘트 타임라인(최신순) — 같은 원칙이 critical로 반복되면 배지로 알린다 (09 §6.1⑤). */
export function MentorArchive({ entries }: { entries: MentorArchiveEntry[] }) {
  return (
    <ol className={styles.timeline}>
      {entries.map((entry) => (
        <li key={entry.attemptId} className={styles.item}>
          <div className={styles.head}>
            <span className={styles.avatar} aria-hidden="true">
              {entry.mentorName[0]}
            </span>
            <div>
              <p className={styles.name}>{entry.mentorName}</p>
              <p className="meta">
                {entry.mentorRole} · {formatDate(entry.date)}
              </p>
            </div>
          </div>
          {entry.repeatedPrincipleNames.length > 0 && (
            <Badge variant="warning" className={styles.badge}>
              반복 지적 · {entry.repeatedPrincipleNames.join(', ')}
            </Badge>
          )}
          <p className={styles.comment}>{entry.comment}</p>
        </li>
      ))}
    </ol>
  );
}
