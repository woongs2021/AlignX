import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { usePageMeta } from '@/layout/usePageMeta';
import { useCurrentAccount, useMyAttempts, useRole } from '@/features/auth/useSession';
import { attemptScore } from '@/features/report/scoring';
import { HISTORY_UNLOCK_THRESHOLD } from '@/data/constants';
import { MonitoringScreen } from '@/pages/portfolio/step2/MonitoringScreen';
import type { Attempt } from '@/types';
import { MentorQueueView } from './mentor/MentorQueueView';
import { MyHeader } from './MyHeader';
import { EmptyState } from './EmptyState';
import { SingleAttemptView } from './SingleAttemptView';
import { AttemptGrid } from './AttemptGrid';
import styles from './MyPage.module.css';

/** 멘토 검증 요청 후 최종(3단계) 제출 전까지는 상세에서도 위저드의 실시간 현황판을 그대로 보여준다 —
 * 정적 카드 요약(SingleAttemptView)보다 진행 상태가 직관적이다. 위저드 라우트(/portfolio/*)가
 * attempts[0] 고정이므로 최신 회차(isActive)일 때만 적용한다. */
function showsMonitoring(attempt: Attempt, isActive: boolean): boolean {
  return isActive && attempt.mentorRequest !== null && attempt.finalReview === null;
}

/** MY — 역할에 따라 완전히 다른 화면이 된다(Plans/14 §3.3): 관리자는 MY가 없어 ADMIN으로
 * 돌려보내고, 멘토는 검증 요청 큐(MentorQueueView)를, 멘티/게스트는 기존 회차 수(0/1/2/3+)
 * 4가지 레이아웃(Plans/09-my.md §1)을 그대로 본다. */
export function MyPage() {
  usePageMeta({ title: 'MY — AlignX', width: 'full' });
  const navigate = useNavigate();
  const role = useRole();
  const account = useCurrentAccount();
  const attempts = useMyAttempts(); // 최신순(역할에 따라 필터링됨)
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('attempt');

  const name = account?.name ?? attempts.find((a) => a.mentorRequest)?.mentorRequest?.name ?? '게스트';
  const bestScore = attempts.reduce<number | null>((best, a) => {
    const score = attemptScore(a);
    if (score === null) return best;
    return best === null || score > best ? score : best;
  }, null);
  const latestDate = attempts[0]?.createdAt ?? null;

  const selectedAttempt = selectedId ? (attempts.find((a) => a.id === selectedId) ?? null) : null;
  const remaining = Math.max(0, HISTORY_UNLOCK_THRESHOLD - attempts.length);

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'mentor') return <MentorQueueView />;

  return (
    <div className={`container-narrow ${styles.page}`}>
      <MyHeader name={name} totalCount={attempts.length} bestScore={bestScore} latestDate={latestDate} />

      {attempts.length === 0 && <EmptyState />}

      {attempts.length > 0 && selectedAttempt && (
        <div className={styles.detail}>
          <button type="button" className={styles.backLink} onClick={() => setSearchParams({})}>
            ← 목록으로
          </button>
          {showsMonitoring(selectedAttempt, selectedAttempt.id === attempts[0]?.id) ? (
            <MonitoringScreen attempt={selectedAttempt} />
          ) : (
            <SingleAttemptView attempt={selectedAttempt} isActive={selectedAttempt.id === attempts[0]?.id} />
          )}
        </div>
      )}

      {attempts.length >= 1 && !selectedAttempt && <AttemptGrid attempts={attempts} />}

      {attempts.length > 0 && !selectedAttempt && remaining === 0 && (
        <div className={styles.historyNotice}>
          <Button variant="secondary" onClick={() => navigate('/my/history')}>
            전체 이력 분석 보기 →
          </Button>
        </div>
      )}
    </div>
  );
}
