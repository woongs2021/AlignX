import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { advanceStages } from '@/features/mentor/simulator';
import type {
  AiAnalysis,
  AppState,
  Attempt,
  FinalReview,
  MentorFeedback,
  MentorRequest,
  MentorStage,
  Mode,
} from '@/types';

const STORAGE_KEY = 'alignx.v1';
const PREVIEW_DROP_THRESHOLD = 20;
export const STORAGE_FULL_MESSAGE = '저장 공간이 가득 찼습니다 — 이전 회차를 정리해 주세요';
export const STORAGE_CORRUPTED_MESSAGE = '저장된 데이터를 읽을 수 없어 초기화했습니다';

/** index.html 부트 스크립트와 동일한 폴백 규칙 — 첫 방문(미저장) 시에만 쓰인다. */
function getSystemPreferredMode(): Mode {
  if (typeof matchMedia === 'undefined') return 'light';
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22)
  );
}

function stripAllPreviews(raw: string): string {
  const parsed = JSON.parse(raw) as { state?: AppState; version?: number };
  if (!parsed.state?.attempts) return raw;
  return JSON.stringify({
    ...parsed,
    state: {
      ...parsed.state,
      attempts: parsed.state.attempts.map((a) => ({
        ...a,
        file: { ...a.file, previewDataUrl: '' },
      })),
    },
  });
}

// 저장 공간 경고는 별도의 (persist 없는) 스토어에 둔다. useAppStore 자체의 상태로 두면
// 경고를 setState할 때마다 persist 미들웨어가 다시 storage.setItem을 호출해 무한 재귀에 빠진다.
export const useStorageWarningStore = create<{ message: string | null }>(() => ({
  message: null,
}));

function setStorageWarning(message: string | null) {
  useStorageWarningStore.setState({ message });
}

/** localStorage 래퍼 — QuotaExceededError 시 프리뷰를 모두 비우고 1회 재시도. 저장된 값이
 * 깨진 JSON이면(수동 훼손 등) persist 미들웨어에 넘기기 전에 걸러내 초기 상태로 되돌린다 —
 * 그대로 넘기면 미들웨어의 내부 JSON.parse가 던지면서 하이드레이션이 끝나지 않고 멈춘다. */
const resilientStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (raw === null) return null;
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      localStorage.removeItem(name);
      setStorageWarning(STORAGE_CORRUPTED_MESSAGE);
      return null;
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
      setStorageWarning(null);
    } catch (err) {
      if (!isQuotaExceededError(err)) throw err;
      try {
        localStorage.setItem(name, stripAllPreviews(value));
        setStorageWarning(null);
      } catch (retryErr) {
        if (!isQuotaExceededError(retryErr)) throw retryErr;
        setStorageWarning(STORAGE_FULL_MESSAGE);
      }
    }
  },
};

type Actions = {
  createAttempt: (file: Attempt['file']) => string; // → attemptId
  setAiAnalysis: (id: string, ai: AiAnalysis) => void;
  setMentorRequest: (id: string, req: MentorRequest) => void;
  advanceMentorStage: (id: string) => void;
  setMentorStages: (id: string, stages: MentorStage[]) => void;
  setMentorFeedback: (id: string, fb: MentorFeedback) => void;
  setFinalReview: (id: string, review: FinalReview) => void;
  deleteAttempt: (id: string) => void;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  resetAll: () => void; // 데모 초기화용
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
};

type Store = AppState & Actions;

const initialState: AppState = {
  version: 1,
  user: { name: null },
  attempts: [],
  admin: { unlockedAt: null },
  mode: getSystemPreferredMode(),
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      ...initialState,

      createAttempt: (file) => {
        const id = 'atmp_' + crypto.randomUUID();
        set((state) => {
          const newAttempt: Attempt = {
            id,
            createdAt: new Date().toISOString(),
            currentStep: 1,
            status: 'analyzing',
            file,
            ai: null,
            mentorRequest: null,
            mentorStages: null,
            mentorFeedback: null,
            finalReview: null,
          };
          let attempts = [newAttempt, ...state.attempts];
          if (attempts.length > PREVIEW_DROP_THRESHOLD) {
            const oldestIdx = attempts.length - 1;
            const oldest = attempts[oldestIdx];
            if (oldest.file.previewDataUrl !== '') {
              attempts = attempts.map((a, i) =>
                i === oldestIdx ? { ...a, file: { ...a.file, previewDataUrl: '' } } : a,
              );
            }
          }
          return { attempts };
        });
        return id;
      },

      setAiAnalysis: (id, ai) => {
        set((state) => ({
          attempts: state.attempts.map((a) =>
            a.id === id ? { ...a, ai, status: 'analyzed' } : a,
          ),
        }));
      },

      setMentorRequest: (id, req) => {
        set((state) => ({
          attempts: state.attempts.map((a) =>
            a.id === id
              ? { ...a, mentorRequest: req, status: 'submitted', currentStep: 2 }
              : a,
          ),
        }));
      },

      advanceMentorStage: (id) => {
        set((state) => ({
          attempts: state.attempts.map((a) => {
            if (a.id !== id || !a.mentorStages) return a;
            return { ...a, status: 'reviewing', mentorStages: advanceStages(a.mentorStages) };
          }),
        }));
      },

      // resumeMentorProgress(절대시각 기반)가 계산한 스냅샷을 그대로 덮어쓴다 — MY/ADMIN도 이
      // 필드를 읽으므로 모니터링 화면을 보는 동안 주기적으로 동기화해둔다 (06 §3.3–3.4).
      setMentorStages: (id, stages) => {
        set((state) => ({
          attempts: state.attempts.map((a) =>
            a.id === id
              ? { ...a, mentorStages: stages, status: a.status === 'completed' ? a.status : 'reviewing' }
              : a,
          ),
        }));
      },

      setMentorFeedback: (id, fb) => {
        set((state) => ({
          attempts: state.attempts.map((a) =>
            a.id === id
              ? { ...a, mentorFeedback: fb, status: 'completed', currentStep: 3 }
              : a,
          ),
        }));
      },

      setFinalReview: (id, review) => {
        set((state) => ({
          attempts: state.attempts.map((a) => (a.id === id ? { ...a, finalReview: review } : a)),
        }));
      },

      deleteAttempt: (id) => {
        set((state) => ({
          attempts: state.attempts.filter((a) => a.id !== id),
        }));
      },

      unlockAdmin: () => {
        set({ admin: { unlockedAt: new Date().toISOString() } });
      },

      lockAdmin: () => {
        set({ admin: { unlockedAt: null } });
      },

      resetAll: () => {
        set(initialState);
      },

      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => resilientStorage),
      partialize: (state): AppState => ({
        version: state.version,
        user: state.user,
        attempts: state.attempts,
        admin: state.admin,
        mode: state.mode,
      }),
    },
  ),
);
