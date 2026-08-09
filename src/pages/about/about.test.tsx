import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FaqSection } from './FaqSection';

afterEach(() => {
  cleanup();
});

describe('FaqSection — <details> 아코디언, JS 없이 열리고 키보드 접근 가능 (08 §B2, §완료 기준)', () => {
  it('6개 문항이 모두 <details>로 렌더되고 기본값은 닫힘이다', () => {
    const { container } = render(<FaqSection />);
    const items = container.querySelectorAll('details');
    expect(items).toHaveLength(6);
    items.forEach((item) => expect(item.open).toBe(false));
  });

  it('summary 클릭 시 해당 문항만 열리고 답변이 보인다', () => {
    const { container } = render(<FaqSection />);
    const items = container.querySelectorAll('details');

    fireEvent.click(screen.getByText('제 포트폴리오는 어디에 저장되나요?'));

    expect(items[2].open).toBe(true);
    expect(screen.getByText(/브라우저 로컬 저장소에만 저장됩니다/)).toBeVisible();
    items.forEach((item, i) => {
      if (i !== 2) expect(item.open).toBe(false);
    });
  });

  it('summary는 네이티브 포커스 대상이라 키보드로 접근할 수 있다', () => {
    render(<FaqSection />);
    const summary = screen.getByText('여러 번 분석할 수 있나요?');
    summary.focus();
    expect(document.activeElement).toBe(summary);
  });
});
