// mentorRequest 제출 후 완료 전까지 절대 시각 기준으로 단계를 갱신한다 (06 §3.3).
// MonitoringScreen과 MY 단일 상세 뷰가 이 훅을 공유한다 — 두 화면 모두 "탭을 닫았다 열어도
// 정확히 복원"돼야 한다.
//
// Plans/14-accounts-notifications.md §6.1 — 예전에는 타이머가 끝나면 이 훅이 스스로 더미 멘토
// 피드백을 만들어 넣었다(사람 없이 자동 완료). 이제 완료는 오직 멘토가 실제로 확정 제출
// (setMentorFeedback)해야만 일어난다 — 이 훅은 더 이상 mentorFeedback을 생성하지 않는다.
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { resumeMentorProgress } from './simulator';
import type { Attempt, MentorStage } from '@/types';

export type LiveMentorProgress = {
  stages: MentorStage[];
  /** tick마다 갱신되는 현재 시각 — ETA 표시에 쓴다(렌더 중 Date.now() 직접 호출 금지, react-hooks/purity). */
  now: number;
};

export function useLiveMentorProgress(attempt: Attempt): LiveMentorProgress {
  const setMentorStages = useAppStore((s) => s.setMentorStages);
  const pushNotification = useAppStore((s) => s.pushNotification);

  const [stages, setStages] = useState<MentorStage[]>(() =>
    attempt.mentorRequest ? resumeMentorProgress(attempt) : [],
  );
  const [now, setNow] = useState(() => Date.now());
  const assignNotifiedRef = useRef(false);

  useEffect(() => {
    if (!attempt.mentorRequest || attempt.mentorFeedback) return;
    assignNotifiedRef.current = attempt.mentorStages?.find((s) => s.id === 'assign')?.status === 'done';

    function tick() {
      const nowMs = Date.now();
      setNow(nowMs);
      const computed = resumeMentorProgress(attempt, nowMs);
      setStages(computed);
      setMentorStages(attempt.id, computed);

      const assignDone = computed.find((s) => s.id === 'assign')?.status === 'done';
      if (assignDone && !assignNotifiedRef.current && attempt.ownerId) {
        assignNotifiedRef.current = true;
        pushNotification({
          recipientId: attempt.ownerId,
          kind: 'mentor_review_started',
          title: '멘토 검증이 시작되었습니다',
          body: '배정된 멘토가 포트폴리오를 검토하고 있습니다.',
          attemptId: attempt.id,
        });
      }
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    function handleVisibility() {
      if (document.visibilityState === 'visible') tick();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // attempt.id/mentorRequest/mentorFeedback 유무만으로 충분하다 — submittedAt은 제출 시 고정되고,
    // 이후 값은 매 tick 재계산한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt.id, attempt.mentorRequest, attempt.mentorFeedback]);

  return { stages, now };
}
