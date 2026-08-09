import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

const TRANSITION_MS = 200;

/** 스토어의 mode를 <html data-mode>에 반영한다. 초기값은 index.html 부트 스크립트가 이미 맞춰둔다. */
export function useSyncMode() {
  const mode = useAppStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.mode === mode) return;

    root.classList.add('mode-transition');
    root.dataset.mode = mode;
    const timer = window.setTimeout(() => root.classList.remove('mode-transition'), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);
}
