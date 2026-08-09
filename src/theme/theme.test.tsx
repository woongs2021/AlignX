import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { App } from '@/App';
import { useAppStore } from '@/store/useAppStore';
import { resolveRouteTheme } from './routeTheme';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.mode;
});

afterEach(() => {
  cleanup();
});

describe('useRouteTheme — 00 §6.1 매핑', () => {
  it.each([
    ['/', 'cool'],
    ['/portfolio', 'cool'],
    ['/portfolio/analyze', 'cool'],
    ['/alignx', 'mint'],
    ['/my', 'warm'],
    ['/about', 'violet'],
    ['/admin', 'cool'],
    ['/admin/submissions/sample_001', 'cool'],
  ] as const)('%s → data-theme=%s', async (path, theme) => {
    renderAt(path);
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe(theme));
    expect(resolveRouteTheme(path)).toBe(theme);
  });

  it('라우트 이동 시 톤이 다시 매핑된다', async () => {
    renderAt('/');
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('cool'));

    window.history.pushState({}, '', `${BASENAME}/alignx`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('mint'));
  });
});

describe('useSyncMode', () => {
  it('mode 토글 시 data-mode가 반영된다', async () => {
    useAppStore.getState().setMode('light');
    render(<App />);
    await waitFor(() => expect(document.documentElement.dataset.mode).toBe('light'));

    useAppStore.getState().toggleMode();
    await waitFor(() => expect(document.documentElement.dataset.mode).toBe('dark'));
  });
});
