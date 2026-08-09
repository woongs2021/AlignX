import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { Button } from '@/components/Button';
import { StatTile } from '@/components/StatTile';
import { ToggleGroup } from '@/components/ToggleGroup';
import { useAppStore } from '@/store/useAppStore';
import { useAdminSampleStore } from '@/store/useAdminSampleStore';
import { useAdminAttempts } from '@/features/admin/adminAttempts';
import { deriveSubmissionStatus, type StatusKind } from '@/features/admin/status';
import { attemptScore } from '@/features/report/scoring';
import { SubmissionsTable } from './SubmissionsTable';
import styles from './AdminPage.module.css';

type StatusFilter = 'all' | StatusKind;
type SortMode = 'date' | 'score' | 'status';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'analyzing', label: '분석중' },
  { value: 'submitted', label: '제출완료' },
  { value: 'reviewing', label: '검증중' },
  { value: 'completed', label: '완료' },
];

const STATUS_ORDER: Record<StatusKind, number> = { analyzing: 0, submitted: 1, reviewing: 2, completed: 3 };

/** ADMIN 대시보드 — 요약 스트립 + 제출 현황 테이블(필터·검색·정렬) (Plans/10-admin.md §2). */
export function AdminPage() {
  usePageMeta({ title: 'ADMIN — AlignX' });
  const navigate = useNavigate();
  const lockAdmin = useAppStore((s) => s.lockAdmin);
  const realAttemptCount = useAppStore((s) => s.attempts.length);
  const resetSamples = useAdminSampleStore((s) => s.resetSamples);
  const rows = useAdminAttempts();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('date');

  const withStatus = useMemo(
    () => rows.map((row) => ({ ...row, status: deriveSubmissionStatus(row.attempt) })),
    [rows],
  );

  const counts = useMemo(() => {
    const c: Record<StatusKind, number> = { analyzing: 0, submitted: 0, reviewing: 0, completed: 0 };
    withStatus.forEach((row) => {
      c[row.status.kind] += 1;
    });
    return c;
  }, [withStatus]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = withStatus;
    if (statusFilter !== 'all') list = list.filter((row) => row.status.kind === statusFilter);
    if (query) {
      list = list.filter((row) => {
        const name = row.attempt.mentorRequest?.name ?? '';
        const topic = row.attempt.mentorRequest?.topic ?? row.attempt.file.name;
        return name.toLowerCase().includes(query) || topic.toLowerCase().includes(query);
      });
    }
    const sorted = [...list];
    if (sort === 'date') {
      sorted.sort(
        (a, b) =>
          new Date(b.attempt.mentorRequest?.submittedAt ?? b.attempt.createdAt).getTime() -
          new Date(a.attempt.mentorRequest?.submittedAt ?? a.attempt.createdAt).getTime(),
      );
    } else if (sort === 'score') {
      sorted.sort((a, b) => (attemptScore(b.attempt) ?? -1) - (attemptScore(a.attempt) ?? -1));
    } else {
      sorted.sort((a, b) => STATUS_ORDER[b.status.kind] - STATUS_ORDER[a.status.kind]);
    }
    return sorted;
  }, [withStatus, statusFilter, search, sort]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <span className="label">ADMIN</span>
          <h1 className={`kr-2 ${styles.title}`}>제출 현황 · 멘토 피드백</h1>
        </div>
        <Button variant="ghost" onClick={() => lockAdmin()}>
          로그아웃
        </Button>
      </div>

      <p className={styles.banner}>
        이 화면은 <strong>같은 브라우저의 localStorage 데이터만</strong> 보여줍니다. 다른 기기에서 제출된
        내용은 원리적으로 조회할 수 없습니다.
      </p>

      <div className={styles.summary}>
        <StatTile value={String(withStatus.length)} label="전체 제출" />
        <StatTile value={String(counts.submitted)} label="검증 대기" />
        <StatTile value={String(counts.reviewing)} label="검증 중" />
        <StatTile value={String(counts.completed)} label="완료" />
      </div>

      {realAttemptCount === 0 && (
        <p className={styles.emptyNote}>
          이 브라우저에서 제출된 포트폴리오가 없습니다. 샘플 데이터로 화면을 확인하세요.
        </p>
      )}

      <div className={styles.toolbar}>
        <ToggleGroup
          ariaLabel="상태 필터"
          options={STATUS_TABS}
          value={statusFilter}
          onChange={setStatusFilter}
          activeVariant="deep"
        />

        <input
          type="search"
          className={styles.search}
          placeholder="이름 또는 주제 검색"
          aria-label="이름 또는 주제 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label className={styles.sortLabel}>
          정렬
          <select className={styles.sortSelect} value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="date">제출일순</option>
            <option value="score">점수순</option>
            <option value="status">상태순</option>
          </select>
        </label>
      </div>

      <SubmissionsTable rows={filtered} onOpenFeedback={(id) => navigate(`/admin/submissions/${id}`)} />

      <div className={styles.footerActions}>
        <Button variant="ghost" onClick={() => resetSamples()}>
          샘플 데이터 초기화
        </Button>
      </div>
    </div>
  );
}
