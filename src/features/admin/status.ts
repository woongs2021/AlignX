// 제출 현황 상태 계산 — 대시보드 테이블/필터/요약과 피드백 화면이 공유한다 (Plans/10-admin.md §2.2).
import { resumeMentorProgress } from '@/features/mentor/simulator';
import type { Attempt, MentorStage } from '@/types';

export type StatusKind = 'analyzing' | 'submitted' | 'reviewing' | 'completed';

export type SubmissionStatus = {
  kind: StatusKind;
  label: string;
  doneCount: number;
  total: number;
};

/** 저장된 mentorStages가 없으면(모니터를 아직 한 번도 안 연 실제 회차) 실시간으로 역산한다.
 * 샘플 회차는 항상 정적 스냅샷을 갖고 있어 이 폴백을 타지 않는다. */
export function effectiveMentorStages(attempt: Attempt): MentorStage[] | null {
  if (attempt.mentorStages) return attempt.mentorStages;
  if (attempt.mentorRequest) return resumeMentorProgress(attempt);
  return null;
}

export function deriveSubmissionStatus(attempt: Attempt): SubmissionStatus {
  if (attempt.mentorFeedback) return { kind: 'completed', label: '완료', doneCount: 0, total: 0 };

  const stages = effectiveMentorStages(attempt);
  if (stages) {
    const reviewStages = stages.filter((s) => s.id !== 'complete');
    const doneCount = reviewStages.filter((s) => s.status === 'done').length;
    const inProgress = doneCount > 0 || reviewStages.some((s) => s.status === 'active');
    if (inProgress) {
      return {
        kind: 'reviewing',
        label: `검증중 ${doneCount}/${reviewStages.length}`,
        doneCount,
        total: reviewStages.length,
      };
    }
  }

  if (attempt.mentorRequest) return { kind: 'submitted', label: '제출완료', doneCount: 0, total: 0 };
  return { kind: 'analyzing', label: '분석중', doneCount: 0, total: 0 };
}
