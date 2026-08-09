// 대시보드·피드백 화면이 공유하는 "실제 회차 + 샘플 회차" 병합 뷰 (Plans/10-admin.md §2.3).
import { useAppStore } from '@/store/useAppStore';
import { useAdminSampleStore } from '@/store/useAdminSampleStore';
import { SAMPLE_ATTEMPTS, SAMPLE_ID_PREFIX } from '@/data/sampleStudents';
import type { Attempt, MentorFeedback, MentorStage } from '@/types';

export type AdminAttempt = { attempt: Attempt; isSample: boolean };

function applySampleOverrides(base: Attempt, feedback?: MentorFeedback, stages?: MentorStage[]): Attempt {
  if (!feedback && !stages) return base;
  return {
    ...base,
    mentorStages: stages ?? base.mentorStages,
    mentorFeedback: feedback ?? base.mentorFeedback,
    status: feedback ? 'completed' : stages ? 'reviewing' : base.status,
  };
}

/** 표시 목록 = 실제 로컬 제출분 + 샘플 시드 10건. 샘플은 ADMIN이 남긴 오버라이드를 얹어 보여준다. */
export function useAdminAttempts(): AdminAttempt[] {
  const realAttempts = useAppStore((s) => s.attempts);
  const sampleFeedback = useAdminSampleStore((s) => s.feedback);
  const sampleStages = useAdminSampleStore((s) => s.stages);

  const realRows: AdminAttempt[] = realAttempts.map((attempt) => ({ attempt, isSample: false }));

  const sampleRows: AdminAttempt[] = SAMPLE_ATTEMPTS.map((base) => {
    const sampleId = base.id.slice(SAMPLE_ID_PREFIX.length);
    return {
      attempt: applySampleOverrides(base, sampleFeedback[sampleId], sampleStages[sampleId]),
      isSample: true,
    };
  });

  return [...realRows, ...sampleRows];
}

export function useAdminAttemptById(id: string): AdminAttempt | null {
  const rows = useAdminAttempts();
  return rows.find((row) => row.attempt.id === id) ?? null;
}
