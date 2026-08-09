import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdminGate } from './AdminGate';
import { useAppStore } from '@/store/useAppStore';
import { ADMIN_LOCKOUT_MS } from '@/data/constants';

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('AdminGate — 눈 토글 (10 §1.2)', () => {
  it('기본값은 가려짐이고, 토글을 누르면 평문으로 전환되며 aria-label·aria-pressed가 바뀐다', () => {
    render(<AdminGate />);
    const input = screen.getByLabelText('암호') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggle = screen.getByRole('button', { name: '비밀번호 표시' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('type', 'button');

    fireEvent.click(toggle);

    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: '비밀번호 숨기기' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('토글 버튼은 type=button이라 폼을 제출하지 않는다', () => {
    render(<AdminGate />);
    fireEvent.click(screen.getByRole('button', { name: '비밀번호 표시' }));
    // 제출됐다면 unlockAdmin이 호출돼 admin.unlockedAt이 채워졌을 것이다 — 여전히 null이어야 한다.
    expect(useAppStore.getState().admin.unlockedAt).toBeNull();
  });

  it('전환 후에도 커서 위치(선택 범위)를 유지한다', () => {
    render(<AdminGate />);
    const input = screen.getByLabelText('암호') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'portfolio2026' } });
    input.setSelectionRange(3, 3);

    fireEvent.click(screen.getByRole('button', { name: '비밀번호 표시' }));

    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);
  });
});

describe('AdminGate — 인증 동작 (10 §1.3)', () => {
  it('오답 시 에러 문구가 aria-live 영역에 표시된다', () => {
    render(<AdminGate />);
    fireEvent.change(screen.getByLabelText('암호'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('비밀번호가 올바르지 않습니다.');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('정답을 입력하면 unlockAdmin이 호출된다', () => {
    render(<AdminGate />);
    fireEvent.change(screen.getByLabelText('암호'), { target: { value: 'portfolio2026' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(useAppStore.getState().admin.unlockedAt).not.toBeNull();
  });

  it('Enter로도 제출된다', () => {
    render(<AdminGate />);
    const input = screen.getByLabelText('암호');
    fireEvent.change(input, { target: { value: 'portfolio2026' } });
    fireEvent.submit(input.closest('form')!);

    expect(useAppStore.getState().admin.unlockedAt).not.toBeNull();
  });

  it('5회 연속 오답이면 30초 입력 잠금이 걸리고 안내가 표시된다', () => {
    vi.useFakeTimers();
    render(<AdminGate />);
    const input = screen.getByLabelText('암호');
    const submit = () => fireEvent.click(screen.getByRole('button', { name: '확인' }));

    for (let i = 0; i < 5; i += 1) {
      fireEvent.change(input, { target: { value: 'wrong' } });
      submit();
    }

    expect(screen.getByRole('alert')).toHaveTextContent(/다시 시도해주세요/);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();

    fireEvent.change(input, { target: { value: 'portfolio2026' } });
    submit();
    expect(useAppStore.getState().admin.unlockedAt).toBeNull(); // 잠금 중엔 정답이어도 통과 안 됨

    act(() => {
      vi.advanceTimersByTime(ADMIN_LOCKOUT_MS + 100);
    });

    expect(input).not.toBeDisabled();
  });
});
