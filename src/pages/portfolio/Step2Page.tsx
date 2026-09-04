import { Navigate } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentAccount } from '@/features/auth/useSession';
import { MentorRequestForm } from './step2/MentorRequestForm';
import { MonitoringScreen } from './step2/MonitoringScreen';

/**
 * 2단계 — mentorRequest 유무로 form/monitoring을 자동 판별한다 (Plans/06-portfolio-step2.md §1).
 * 톤은 라우트 매핑(00 §6.1)에 따라 warm으로 자동 전환되므로 이 페이지는 톤을 직접 다루지 않는다 —
 * 컴포넌트가 var(--primary) 등 토큰만 참조하면 자동으로 웜톤이 된다.
 *
 * Plans/14 §3.4 Q3 — 멘토 요청(제출 폼)부터는 계정이 있어야 한다: 소유자가 없으면 완료 알림을
 * 돌려줄 대상이 없다. 단, 이미 제출된 요청의 모니터링 화면은 로그인 여부와 무관하게 계속
 * 보여야 하므로 폼만 게이트한다 — 로그인 요구를 라우트 전체가 아니라 여기서 판단한다.
 */
export function Step2Page() {
  usePageMeta({ title: '2단계 · 멘토 검증 — AlignX', width: 'full' });
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);
  const account = useCurrentAccount();

  if (!activeAttempt || !activeAttempt.ai) return null;

  if (!activeAttempt.mentorRequest && !account) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <div className="container-narrow">
      {activeAttempt.mentorRequest ? (
        <MonitoringScreen attempt={activeAttempt} />
      ) : (
        <MentorRequestForm attempt={activeAttempt} />
      )}
    </div>
  );
}
