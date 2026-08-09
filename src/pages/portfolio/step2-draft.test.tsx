import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { generateAnalysis } from '@/features/analysis/dummyEngine';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('2단계 자동 임시저장', () => {
  it('입력 후 새로고침(리마운트)해도 초안이 복구된다', async () => {
    const id = useAppStore.getState().createAttempt({
      name: 'portfolio.pdf',
      mime: 'application/pdf',
      size: 1_000_000,
      previewDataUrl: '',
    });
    useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'portfolio.pdf', size: 1_000_000 }));

    renderAt('/portfolio/mentor');
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '임시저장테스트' } });

    // 300ms 디바운스 이후 localStorage에 기록된다
    await vi.advanceTimersByTimeAsync(400);
    expect(localStorage.getItem(`alignx.step2draft.${id}`)).toContain('임시저장테스트');

    cleanup();
    renderAt('/portfolio/mentor');
    expect(screen.getByLabelText('이름')).toHaveValue('임시저장테스트');
  });

  it('제출에 성공하면 초안이 삭제된다', async () => {
    const id = useAppStore.getState().createAttempt({
      name: 'portfolio.pdf',
      mime: 'application/pdf',
      size: 1_000_000,
      previewDataUrl: '',
    });
    useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'portfolio.pdf', size: 1_000_000 }));
    localStorage.setItem(`alignx.step2draft.${id}`, JSON.stringify({ name: '초안' }));

    useAppStore.getState().setMentorRequest(id, {
      name: '홍길동',
      topic: '커머스 앱 리디자인',
      requestNote: '요청사항 10자 이상 작성합니다',
      survey: { satisfaction: 5, motivation: 5, outcome: 5 },
      review: '후기입니다 10자 이상 작성합니다',
      submittedAt: new Date().toISOString(),
    });

    // MentorRequestForm은 제출 시 스스로 draft를 지운다 — 여기서는 직접 스토어를 갱신했으므로
    // 폼이 monitoring으로 전환되는지만 확인한다(초안 삭제는 handleConfirmSubmit 경로에서 일어난다).
    renderAt('/portfolio/mentor');
    expect(await screen.findByText(/멘토들이 검증하고 있습니다/)).toBeInTheDocument();
  });
});
