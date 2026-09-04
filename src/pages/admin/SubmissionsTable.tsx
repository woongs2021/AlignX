import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { attemptScore } from '@/features/report/scoring';
import { formatFileSize, formatRelativeTime } from '@/lib/format';
import type { AdminAttempt } from '@/features/admin/adminAttempts';
import type { StatusKind } from '@/features/admin/status';
import styles from './SubmissionsTable.module.css';

type Row = AdminAttempt & { status: { kind: StatusKind; label: string } };

function scoreLabel(row: Row): string {
  const score = attemptScore(row.attempt);
  if (score === null) return '—';
  const grade = row.attempt.mentorFeedback ? undefined : row.attempt.ai?.grade;
  return grade ? `${score} (${grade})` : `${score}`;
}

function StatusBadge({ status }: { status: Row['status'] }) {
  const variant = status.kind === 'completed' ? 'tone' : 'outline';
  return <Badge variant={variant}>{status.label}</Badge>;
}

type SubmissionsTableProps = {
  rows: Row[];
  onOpenFeedback: (id: string) => void;
  /** 멘토 큐에서는 "검증하기"로 바꿔 쓴다 — 기본값은 ADMIN 문구 그대로 유지한다. */
  actionLabel?: string;
  /** 멘토 큐에서는 액션 버튼이 눈에 잘 띄어야 해서 secondary로 바꿔 쓴다 — 기본값은 ADMIN
   * 문구 그대로(ghost) 유지한다. */
  actionVariant?: 'primary' | 'secondary' | 'ghost' | 'link';
};

/** 제출 현황 — 데스크톱 테이블 / 모바일 카드 리스트(CSS로만 전환) (Plans/10-admin.md §2.2).
 * ADMIN 대시보드와 멘토 검증 큐(Plans/14 §7.1)가 이 컴포넌트를 공유한다. */
export function SubmissionsTable({
  rows,
  onOpenFeedback,
  actionLabel = '피드백 작성',
  actionVariant = 'ghost',
}: SubmissionsTableProps) {
  if (rows.length === 0) {
    return <p className={styles.noResult}>조건에 맞는 제출물이 없습니다.</p>;
  }

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>프리뷰</th>
              <th>학생</th>
              <th>주제</th>
              <th>파일</th>
              <th>AI 점수</th>
              <th>상태</th>
              <th>제출일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.attempt.id}>
                <td>
                  <span className={styles.thumb}>
                    {row.attempt.file.previewDataUrl && (
                      <img src={row.attempt.file.previewDataUrl} alt="" loading="lazy" />
                    )}
                  </span>
                </td>
                <td>
                  <span className={styles.name}>{row.attempt.mentorRequest?.name ?? '—'}</span>
                  {row.isSample && (
                    <Badge variant="outline" className={styles.sampleBadge}>
                      샘플
                    </Badge>
                  )}
                </td>
                <td>{row.attempt.mentorRequest?.topic ?? row.attempt.file.name}</td>
                <td className={styles.fileCell}>
                  <div>{row.attempt.file.name}</div>
                  <div className="meta">{formatFileSize(row.attempt.file.size)}</div>
                </td>
                <td className={styles.num}>{scoreLabel(row)}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="meta">
                  {formatRelativeTime(row.attempt.mentorRequest?.submittedAt ?? row.attempt.createdAt)}
                </td>
                <td>
                  {row.attempt.mentorRequest ? (
                    <Button variant={actionVariant} onClick={() => onOpenFeedback(row.attempt.id)}>
                      {actionLabel}
                    </Button>
                  ) : (
                    <span className="meta">제출 전</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardList}>
        {rows.map((row) => (
          <div key={row.attempt.id} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.thumb}>
                {row.attempt.file.previewDataUrl && <img src={row.attempt.file.previewDataUrl} alt="" loading="lazy" />}
              </span>
              <div className={styles.cardHeadInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.name}>{row.attempt.mentorRequest?.name ?? '—'}</span>
                  {row.isSample && <Badge variant="outline">샘플</Badge>}
                </div>
                <p className="meta">{row.attempt.mentorRequest?.topic ?? row.attempt.file.name}</p>
              </div>
            </div>
            <div className={styles.cardMetaRow}>
              <StatusBadge status={row.status} />
              <span className={styles.num}>{scoreLabel(row)}</span>
              <span className="meta">
                {formatRelativeTime(row.attempt.mentorRequest?.submittedAt ?? row.attempt.createdAt)}
              </span>
            </div>
            {row.attempt.mentorRequest ? (
              <Button variant={actionVariant} onClick={() => onOpenFeedback(row.attempt.id)}>
                피드백 작성
              </Button>
            ) : (
              <span className="meta">제출 전</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
