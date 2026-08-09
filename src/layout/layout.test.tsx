import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
});

afterEach(() => {
  cleanup();
});

describe('PageShell', () => {
  it('Skip to content 링크가 #content를 가리킨다', () => {
    renderAt('/');
    const skipLink = screen.getByText('본문 바로가기');
    expect(skipLink).toHaveAttribute('href', '#content');
  });

  it('main#content가 포커스 대상(tabIndex=-1)으로 존재한다', () => {
    renderAt('/');
    const main = document.getElementById('content');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('페이지별 document.title이 반영된다', async () => {
    renderAt('/about');
    await waitFor(() => expect(document.title).toBe('ABOUT — AlignX'));
  });
});

describe('TopNav', () => {
  it('현재 라우트에 해당하는 탭에 aria-current가 붙는다', () => {
    renderAt('/about');
    const aboutTab = screen.getAllByRole('link', { name: 'ABOUT' })[0];
    expect(aboutTab).toHaveAttribute('aria-current', 'page');
  });

  it('로고는 홈으로 연결된다', () => {
    renderAt('/about');
    const logoLink = screen.getByRole('link', { name: 'AlignX 홈' });
    expect(logoLink).toHaveAttribute('href', BASENAME);
  });
});

describe('MobileNav', () => {
  it('햄버거 클릭 시 열리고 aria-expanded가 true가 된다', async () => {
    renderAt('/');
    const hamburger = screen.getByRole('button', { name: '메뉴 열기' });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(hamburger);

    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('dialog', { name: '모바일 내비게이션' })).toBeInTheDocument();
  });

  it('Esc 키로 닫힌다', async () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    await screen.findByRole('dialog', { name: '모바일 내비게이션' });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveAttribute('aria-expanded', 'false'),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '모바일 내비게이션' })).not.toBeInTheDocument(),
    );
  });

  it('열려 있는 동안 body 스크롤이 잠긴다', async () => {
    renderAt('/');
    expect(document.body.style.overflow).not.toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    await screen.findByRole('dialog', { name: '모바일 내비게이션' });
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'));
  });

  it('메뉴 링크 클릭(라우트 변경) 시 자동으로 닫힌다', async () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    const dialog = await screen.findByRole('dialog', { name: '모바일 내비게이션' });

    fireEvent.click(within(dialog).getByRole('link', { name: 'ABOUT' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('Tab 포커스가 오버레이 안에서 순환한다', async () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    const dialog = await screen.findByRole('dialog', { name: '모바일 내비게이션' });

    const focusable = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    expect(focusable.length).toBeGreaterThan(1);

    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(focusable[0]);
  });
});
