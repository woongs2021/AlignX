import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

afterEach(() => {
  cleanup();
});

describe('ErrorBoundary — 화면 전체 크래시 방지 (12 §4.4)', () => {
  it('정상 자식은 그대로 렌더한다', () => {
    render(
      <ErrorBoundary>
        <p>정상 콘텐츠</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
  });

  it('자식이 렌더 중 던지면 전체가 죽는 대신 폴백 화면을 보여준다', () => {
    // React가 콘솔에 에러를 두 번 찍는 걸 막는다 — 여기선 그 로그 자체가 테스트 대상이 아니다.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: '문제가 발생했습니다' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
