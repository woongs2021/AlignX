import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { advanceStages, completeAllStages, resumeMentorProgress } from '@/features/mentor/simulator';
import { ADMIN_ACCOUNT, MENTOR_ACCOUNT, accountById } from '@/data/accounts';
import { buildSeedNotifications } from '@/data/seedNotifications';
import type {
  AiAnalysis,
  AppNotification,
  AppState,
  Attempt,
  FinalReview,
  MentorFeedback,
  MentorRequest,
  MentorStage,
  Mode,
  NotificationKind,
} from '@/types';

const STORAGE_KEY = 'alignx.v1';
const PREVIEW_DROP_THRESHOLD = 20;
const PERSISTED_VERSION = 2;
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

/** 쿼터 초과 시 단계적으로 용량을 비운다(Plans/14 §7.3) — 검증 대기 중인 회차의 전 페이지가
 * 가장 먼저 사라지면 멘토 화면이 비어버리므로, 이미 완료된 회차부터 정리한다.
 * 1단계: 완료된(mentorFeedback 있음) 회차의 pages만 비움
 * 2단계: 모든 회차의 pages를 비움
 * 3단계: previewDataUrl까지 비움(기존 동작과 동일한 최후 수단) */
function evictForQuota(raw: string, tier: 1 | 2 | 3): string {
  const parsed = JSON.parse(raw) as { state?: AppState; version?: number };
  if (!parsed.state?.attempts) return raw;
  const attempts = parsed.state.attempts.map((a) => {
    if (tier === 1) {
      if (a.mentorFeedback && a.file.pages?.length) {
        return { ...a, file: { ...a.file, pages: [] } };
      }
      return a;
    }
    if (tier === 2) {
      return a.file.pages?.length ? { ...a, file: { ...a.file, pages: [] } } : a;
    }
    return { ...a, file: { ...a.file, pages: [], previewDataUrl: '' } };
  });
  return JSON.stringify({ ...parsed, state: { ...parsed.state, attempts } });
}

// 저장 공간 경고는 별도의 (persist 없는) 스토어에 둔다. useAppStore 자체의 상태로 두면
// 경고를 setState할 때마다 persist 미들웨어가 다시 storage.setItem을 호출해 무한 재귀에 빠진다.
export const useStorageWarningStore = create<{ message: string | null }>(() => ({
  message: null,
}));

function setStorageWarning(message: string | null) {
  useStorageWarningStore.setState({ message });
}

/** localStorage 래퍼 — QuotaExceededError 시 단계적으로 용량을 비우며 재시도. 저장된 값이
 * 깨진 JSON이거나 스키마 버전이 낡았으면(v1→v2, 마이그레이션 없이 초기화 — Plans/00 §7)
 * persist 미들웨어에 넘기기 전에 걸러내 초기 상태로 되돌린다. */
const resilientStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as { version?: number };
      if (parsed?.version !== PERSISTED_VERSION) {
        localStorage.removeItem(name);
        return null;
      }
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
      for (const tier of [1, 2, 3] as const) {
        try {
          localStorage.setItem(name, evictForQuota(value, tier));
          setStorageWarning(null);
          return;
        } catch (retryErr) {
          if (!isQuotaExceededError(retryErr)) throw retryErr;
        }
      }
      setStorageWarning(STORAGE_FULL_MESSAGE);
    }
  },
};

type PushNotificationInput = {
  recipientId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  attemptId: string | null;
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
  resetAll: () => void; // 전체 초기화(테스트·완전 리셋용)
  clearOwnAttempts: () => void; // MY "초기화" 버튼 — 로그인 계정(또는 게스트) 소유 회차만 지운다
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  login: (accountId: string) => void; // 최초 로그인·계정 전환 겸용
  logout: () => void;
  pushNotification: (input: PushNotificationInput) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (recipientId: string) => void;
  seedNotificationsIfNeeded: (accountId: string) => void;
};

type Store = AppState & Actions;

const initialState: AppState = {
  version: 2,
  session: { accountId: null },
  attempts: [],
  notifications: [],
  admin: { unlockedAt: null },
  mode: getSystemPreferredMode(),
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      createAttempt: (file) => {
        const id = 'atmp_' + crypto.randomUUID();
        set((state) => {
          const newAttempt: Attempt = {
            id,
            createdAt: new Date().toISOString(),
            currentStep: 1,
            status: 'analyzing',
            ownerId: state.session.accountId,
            assignedMentorId: null,
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

      // 멘토 1인 고정 구성이라(Plans/14 Q5) 배정은 즉시 확정된다 — 화면상의 "멘토 배정" 단계는
      // STAGE_CONFIG의 연출용 타이머일 뿐, 실제 배정은 요청 시점에 끝나 있어야 알림을 보낼 수 있다.
      // ownerId가 아직 없으면(1단계를 게스트로 시작한 경우) 이 시점의 로그인 계정으로 채운다 —
      // 라우트 가드(RequireLogin)가 이미 로그인을 강제하므로 이 시점엔 항상 계정이 있다.
      setMentorRequest: (id, req) => {
        set((state) => ({
          attempts: state.attempts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  mentorRequest: req,
                  status: 'submitted',
                  currentStep: 2,
                  ownerId: a.ownerId ?? state.session.accountId,
                  assignedMentorId: MENTOR_ACCOUNT.id,
                }
              : a,
          ),
        }));
        get().pushNotification({
          recipientId: MENTOR_ACCOUNT.id,
          kind: 'mentor_request_arrived',
          title: '새 검증 요청이 도착했습니다',
          body: `${req.name}님이 "${req.topic}" 검증을 요청했습니다.`,
          attemptId: id,
        });
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

      // 멘토(로그인 계정 또는 ADMIN 대행)가 실제로 확정 제출해야만 호출된다 — 더 이상 타이머
      // 자동완료로는 호출되지 않는다(Plans/14 §6.1). 확정 시점에 화면상 단계도 전부 done으로
      // 맞춰 모니터링 화면의 진행률이 "검증 완료"와 어긋나지 않게 한다.
      setMentorFeedback: (id, fb) => {
        const target = get().attempts.find((a) => a.id === id);
        set((state) => ({
          attempts: state.attempts.map((a) => {
            if (a.id !== id) return a;
            const baseStages = a.mentorStages ?? (a.mentorRequest ? resumeMentorProgress(a) : []);
            return {
              ...a,
              mentorFeedback: fb,
              mentorStages: baseStages.length ? completeAllStages(baseStages) : baseStages,
              status: 'completed',
              currentStep: 3,
            };
          }),
        }));
        const ownerId = target?.ownerId ?? null;
        if (ownerId) {
          get().pushNotification({
            recipientId: ownerId,
            kind: 'mentor_feedback_ready',
            title: '멘토 검증이 완료되었습니다',
            body: '3단계 통합 리포트에서 멘토의 점수와 코멘트를 확인해보세요.',
            attemptId: id,
          });
        }
      },

      setFinalReview: (id, review) => {
        set((state) => ({
          attempts: state.attempts.map((a) => (a.id === id ? { ...a, finalReview: review } : a)),
        }));
        get().pushNotification({
          recipientId: MENTOR_ACCOUNT.id,
          kind: 'final_submitted',
          title: '멘티가 최종 포트폴리오를 제출했습니다',
          body: '만족도 응답과 후기를 리포트에서 확인할 수 있습니다.',
          attemptId: id,
        });
        get().pushNotification({
          recipientId: ADMIN_ACCOUNT.id,
          kind: 'final_submitted',
          title: '최종 제출이 접수되었습니다',
          body: 'ADMIN 대시보드에서 전체 현황을 확인하세요.',
          attemptId: id,
        });
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

      clearOwnAttempts: () => {
        set((state) => ({
          attempts: state.attempts.filter((a) => (a.ownerId ?? null) !== state.session.accountId),
        }));
      },

      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),

      // 최초 로그인과 "계정 전환"을 하나의 액션으로 다룬다 — 결과가 같다(로그인 상태 교체).
      // 계정이 바뀌면 ADMIN 잠금도 함께 풀린다 — 다른 사람으로 전환됐으므로 재인증을 요구한다.
      login: (accountId) => {
        set({ session: { accountId }, admin: { unlockedAt: null } });
        get().seedNotificationsIfNeeded(accountId);
      },

      logout: () => {
        set({ session: { accountId: null }, admin: { unlockedAt: null } });
      },

      pushNotification: (input) => {
        const notification: AppNotification = {
          id: 'ntf_' + crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          readAt: null,
          ...input,
        };
        set((state) => ({ notifications: [notification, ...state.notifications] }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        }));
      },

      markAllNotificationsRead: (recipientId) => {
        const now = new Date().toISOString();
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.recipientId === recipientId && !n.readAt ? { ...n, readAt: now } : n,
          ),
        }));
      },

      // 계정당 1회만 심는다 — 이미 그 계정 앞으로 알림이 하나라도 있으면(시드든 실제 이벤트든)
      // 다시 심지 않는다.
      seedNotificationsIfNeeded: (accountId) => {
        const account = accountById(accountId);
        if (!account) return;
        set((state) => {
          if (state.notifications.some((n) => n.recipientId === accountId)) return state;
          const now = new Date().toISOString();
          const seeded: AppNotification[] = buildSeedNotifications(accountId, account.role).map((n, i) => ({
            ...n,
            id: `ntf_seed_${accountId}_${i}`,
            createdAt: now,
            readAt: null,
          }));
          return { notifications: [...seeded, ...state.notifications] };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: PERSISTED_VERSION,
      storage: createJSONStorage(() => resilientStorage),
      partialize: (state): AppState => ({
        version: state.version,
        session: state.session,
        attempts: state.attempts,
        notifications: state.notifications,
        admin: state.admin,
        mode: state.mode,
      }),
    },
  ),
);
