// mentorRequest 제출 후 완료 전까지 절대 시각 기준으로 단계를 갱신한다 (06 §3.3).
// MonitoringScreen과 MY 단일 상세 뷰가 이 훅을 공유한다 — 두 화면 모두 "탭을 닫았다 열어도
// 정확히 복원"돼야 하고, 완료 판정과 멘토 피드백 생성 로직이 서로 어긋나면 안 되기 때문이다 (09 §4).
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateMentorFeedback } from './dummyFeedback';
import { isAllDone, resumeMentorProgress } from './simulator';
import type { Attempt, MentorStage } from '@/types';

export type LiveMentorProgress = {
  stages: MentorStage[];
  /** tick마다 갱신되는 현재 시각 — ETA 표시에 쓴다(렌더 중 Date.now() 직접 호출 금지, react-hooks/purity). */
  now: number;
};

export function useLiveMentorProgress(attempt: Attempt): LiveMentorProgress {
  const setMentorStages = useAppStore((s) => s.setMentorStages);
  const setMentorFeedback = useAppStore((s) => s.setMentorFeedback);

  const [stages, setStages] = useState<MentorStage[]>(() =>
    attempt.mentorRequest ? resumeMentorProgress(attempt) : [],
  );
  const [now, setNow] = useState(() => Date.now());
  const feedbackGeneratedRef = useRef(attempt.mentorFeedback != null);

  useEffect(() => {
    if (!attempt.mentorRequest || attempt.mentorFeedback) return;
    feedbackGeneratedRef.current = false;

    function tick() {
      const nowMs = Date.now();
      setNow(nowMs);
      const computed = resumeMentorProgress(attempt, nowMs);
      setStages(computed);
      setMentorStages(attempt.id, computed);

      if (isAllDone(computed) && !feedbackGeneratedRef.current) {
        feedbackGeneratedRef.current = true;
        setMentorFeedback(attempt.id, generateMentorFeedback(attempt));
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
