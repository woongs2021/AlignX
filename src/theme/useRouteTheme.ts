import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveRouteTheme } from './routeTheme';

const TRANSITION_MS = 200;

/** 라우트가 바뀔 때마다 <html data-theme>를 매핑표대로 갱신한다 (00 §6.1). */
export function useRouteTheme() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const theme = resolveRouteTheme(pathname);
    if (root.dataset.theme === theme) return;

    root.classList.add('mode-transition');
    root.dataset.theme = theme;
    const timer = window.setTimeout(() => root.classList.remove('mode-transition'), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);
}
