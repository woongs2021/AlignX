import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAppStore } from '@/store/useAppStore';
import { usePageMeta } from '@/layout/usePageMeta';
import { attemptScore } from '@/features/report/scoring';
import { HISTORY_UNLOCK_THRESHOLD } from '@/data/constants';
import { MyHeader } from './MyHeader';
import { EmptyState } from './EmptyState';
import { SingleAttemptView } from './SingleAttemptView';
import { AttemptGrid } from './AttemptGrid';
import styles from './MyPage.module.css';

/** MY — 회차 수(0/1/2/3+)에 따라 4가지 레이아웃으로 분기한다 (Plans/09-my.md §1). */
export function MyPage() {
  usePageMeta({ title: 'MY — AlignX' });
  const navigate = useNavigate();
  const attempts = useAppStore((s) => s.attempts); // 최신순
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('attempt');

  const name = attempts.find((a) => a.mentorRequest)?.mentorRequest?.name ?? '게스트';
  const bestScore = attempts.reduce<number | null>((best, a) => {
    const score = attemptScore(a);
    if (score === null) return best;
    return best === null || score > best ? score : best;
  }, null);
  const latestDate = attempts[0]?.createdAt ?? null;

  const selectedAttempt = selectedId ? (attempts.find((a) => a.id === selectedId) ?? null) : null;
  const remaining = Math.max(0, HISTORY_UNLOCK_THRESHOLD - attempts.length);

  return (
    <div className="container">
      <MyHeader name={name} totalCount={attempts.length} bestScore={bestScore} latestDate={latestDate} />

      {attempts.length === 0 && <EmptyState />}

      {attempts.length > 0 && selectedAttempt && (
        <div className={styles.detail}>
          <button type="button" className={styles.backLink} onClick={() => setSearchParams({})}>
            ← 목록으로
          </button>
          <SingleAttemptView attempt={selectedAttempt} isActive={selectedAttempt.id === attempts[0]?.id} />
        </div>
      )}

      {attempts.length === 1 && !selectedAttempt && <SingleAttemptView attempt={attempts[0]} isActive />}

      {attempts.length >= 2 && !selectedAttempt && <AttemptGrid attempts={attempts} />}

      {attempts.length > 0 && !selectedAttempt && (
        <div className={styles.historyNotice}>
          {remaining > 0 ? (
            <p className="meta">
              전체 이력 분석은 {HISTORY_UNLOCK_THRESHOLD}회부터 열립니다 · {remaining}회 더 하면 열립니다
            </p>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/my/history')}>
              전체 이력 분석 보기 →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
