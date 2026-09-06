import { create } from 'zustand';

const TOAST_DURATION_MS = 3000;

type ToastState = {
  message: string | null;
};

// useStorageWarningStore와 같은 이유로 persist 없는 별도 스토어에 둔다 — useAppStore 자체에
// 두면 토스트 메시지가 바뀔 때마다 이를 구독하지 않는 화면까지 persist 미들웨어를 거치게 된다.
export const useToastStore = create<ToastState>(() => ({
  message: null,
}));

let hideTimer: number | null = null;

/** durationMs(기본 3초) 후 자동으로 사라지는 토스트 메시지를 띄운다. */
export function showToast(message: string, durationMs: number = TOAST_DURATION_MS) {
  if (hideTimer) window.clearTimeout(hideTimer);
  useToastStore.setState({ message });
  hideTimer = window.setTimeout(() => useToastStore.setState({ message: null }), durationMs);
}
