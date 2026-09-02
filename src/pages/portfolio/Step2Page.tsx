import { usePageMeta } from '@/layout/usePageMeta';
import { useAppStore } from '@/store/useAppStore';
import { MentorRequestForm } from './step2/MentorRequestForm';
import { MonitoringScreen } from './step2/MonitoringScreen';

/**
 * 2단계 — mentorRequest 유무로 form/monitoring을 자동 판별한다 (Plans/06-portfolio-step2.md §1).
 * 톤은 라우트 매핑(00 §6.1)에 따라 warm으로 자동 전환되므로 이 페이지는 톤을 직접 다루지 않는다 —
 * 컴포넌트가 var(--primary) 등 토큰만 참조하면 자동으로 웜톤이 된다.
 */
export function Step2Page() {
  usePageMeta({ title: '2단계 · 멘토 검증 — AlignX', width: 'full' });
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);

  if (!activeAttempt || !activeAttempt.ai) return null;

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
