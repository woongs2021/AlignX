import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StorageWarningBanner } from './StorageWarningBanner';
import { useStorageWarningStore } from '@/store/useAppStore';

beforeEach(() => {
  useStorageWarningStore.setState({ message: null });
});

afterEach(() => {
  cleanup();
});

describe('StorageWarningBanner', () => {
  it('메시지가 없으면 아무것도 렌더하지 않는다', () => {
    const { container } = render(<StorageWarningBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('메시지가 있으면 aria-live 영역에 표시한다', () => {
    useStorageWarningStore.setState({ message: '저장된 데이터를 읽을 수 없어 초기화했습니다' });
    render(<StorageWarningBanner />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('저장된 데이터를 읽을 수 없어 초기화했습니다');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
