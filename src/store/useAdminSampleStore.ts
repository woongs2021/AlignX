// 샘플 학생(가상 10명)에 대한 ADMIN의 피드백·단계 진행 오버라이드 — 실제 attempts와는 별도
// localStorage 키에 둔다. 메인 스토어(alignx.v1) 스키마는 Phase00에서 고정했으므로 건드리지
// 않고, ADMIN의 데모 조작만 이 스토어에 쌓는다 (Plans/10-admin.md §2.3, §3.3).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { advanceStages, STAGE_CONFIG } from '@/features/mentor/simulator';
import type { MentorFeedback, MentorStage } from '@/types';

type AdminSampleState = {
  /** sampleId(접두사 제외) → 관리자가 확정 제출한 피드백. */
  feedback: Record<string, MentorFeedback>;
  /** sampleId(접두사 제외) → 관리자가 수동으로 진행시킨 단계 스냅샷. */
  stages: Record<string, MentorStage[]>;
};

type AdminSampleActions = {
  setSampleFeedback: (sampleId: string, feedback: MentorFeedback) => void;
  advanceSampleStage: (sampleId: string, currentStages: MentorStage[]) => void;
  completeSampleStages: (sampleId: string, currentStages: MentorStage[]) => void;
  resetSamples: () => void;
};

const initialState: AdminSampleState = { feedback: {}, stages: {} };

export const useAdminSampleStore = create<AdminSampleState & AdminSampleActions>()(
  persist(
    (set) => ({
      ...initialState,

      setSampleFeedback: (sampleId, feedback) => {
        set((state) => ({ feedback: { ...state.feedback, [sampleId]: feedback } }));
      },

      advanceSampleStage: (sampleId, currentStages) => {
        set((state) => ({
          stages: { ...state.stages, [sampleId]: advanceStages(currentStages) },
        }));
      },

      completeSampleStages: (sampleId, currentStages) => {
        set((state) => {
          let stages = currentStages;
          for (let i = 0; i < STAGE_CONFIG.length; i += 1) {
            stages = advanceStages(stages);
          }
          return { stages: { ...state.stages, [sampleId]: stages } };
        });
      },

      resetSamples: () => set(initialState),
    }),
    { name: 'alignx.admin-samples.v1' },
  ),
);
