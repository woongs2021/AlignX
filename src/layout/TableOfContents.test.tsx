import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import styles from './TableOfContents.module.css';

type ObserverCallback = (entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>>) => void;

let capturedCallback: ObserverCallback | null = null;

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    capturedCallback = callback;
  }
  observe() {}
  disconnect() {}
}

// TableOfContents는 모듈 최상단에서 `typeof IntersectionObserver !== 'undefined'`를 한 번만 평가한다.
// 정적 import는 파일 내 다른 코드보다 먼저 실행되므로, import 전에 전역을 스텁해야 그 평가에 반영된다.
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
const { TableOfContents } = await import('./TableOfContents');

const ITEMS = [
  { id: 'why', label: 'WHY' },
  { id: 'principles', label: 'PRINCIPLES' },
];

function mountSections() {
  ITEMS.forEach((item) => {
    const section = document.createElement('section');
    section.id = item.id;
    document.body.appendChild(section);
  });
}

beforeEach(() => {
  capturedCallback = null;
  mountSections();
});

afterEach(() => {
  cleanup();
  document.querySelectorAll('section[id]').forEach((el) => el.remove());
});

describe('TableOfContents — 앵커 딥링크 · 현재 섹션 하이라이트 (03 §3.3, 08 §완료 기준)', () => {
  it('각 링크가 해당 섹션 id로 앵커된다', () => {
    render(<TableOfContents items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'WHY' })).toHaveAttribute('href', '#why');
    expect(screen.getByRole('link', { name: 'PRINCIPLES' })).toHaveAttribute('href', '#principles');
  });

  it('교차 관찰이 알려온 섹션의 링크만 활성 표시된다', () => {
    render(<TableOfContents items={ITEMS} />);
    expect(capturedCallback).not.toBeNull();

    act(() => {
      capturedCallback!([
        { isIntersecting: true, target: document.getElementById('principles')! },
      ]);
    });

    expect(screen.getByRole('link', { name: 'PRINCIPLES' })).toHaveClass(styles.active);
    expect(screen.getByRole('link', { name: 'WHY' })).not.toHaveClass(styles.active);
  });
});
