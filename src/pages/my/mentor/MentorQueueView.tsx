import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatTile } from '@/components/StatTile';
import { useMyAttempts } from '@/features/auth/useSession';
import { deriveSubmissionStatus, type StatusKind } from '@/features/admin/status';
import { SubmissionsTable } from '@/pages/admin/SubmissionsTable';
import styles from './MentorQueueView.module.css';

/** 멘토 로그인 계정의 MY — "검증 요청 큐" (Plans/14 §7.1). ADMIN 대시보드와 같은 테이블
 * 컴포넌트를 공유하되, 본인에게 배정된 회차만 보여주고 클릭하면 /my/review/:id로 간다. */
export function MentorQueueView() {
  const navigate = useNavigate();
  const attempts = useMyAttempts();

  const rows = useMemo(
    () => attempts.map((attempt) => ({ attempt, isSample: false, status: deriveSubmissionStatus(attempt) })),
    [attempts],
  );

  const counts = useMemo(() => {
    const c: Record<StatusKind, number> = { analyzing: 0, submitted: 0, reviewing: 0, completed: 0 };
    rows.forEach((row) => {
      c[row.status.kind] += 1;
    });
    return c;
  }, [rows]);

  return (
    <div className={`container-narrow ${styles.page}`}>
      <div className={styles.header}>
        <span className="label">MY · 검증 요청</span>
        <h1 className={styles.title}>배정된 검증 요청</h1>
      </div>

      <div className={styles.summary}>
        <StatTile value={String(rows.length)} label="전체" />
        <StatTile value={String(counts.submitted)} label="대기" />
        <StatTile value={String(counts.reviewing)} label="검토 중" />
        <StatTile value={String(counts.completed)} label="완료" />
      </div>

      {rows.length === 0 ? (
        <p className={styles.emptyNote}>아직 배정된 검증 요청이 없습니다.</p>
      ) : (
        <SubmissionsTable
          rows={rows}
          actionLabel="검증하기"
          actionVariant="primary"
          onOpenFeedback={(id) => navigate(`/my/review/${id}`)}
        />
      )}
    </div>
  );
}
