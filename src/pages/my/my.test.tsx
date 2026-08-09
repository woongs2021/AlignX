import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { generateAnalysis } from '@/features/analysis/dummyEngine';
import { generateMentorFeedback } from '@/features/mentor/dummyFeedback';
import type { MentorRequest } from '@/types';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

function makeMentorRequest(overrides: Partial<MentorRequest> = {}): MentorRequest {
  return {
    name: '홍길동',
    topic: '커머스 앱 리디자인',
    requestNote: '요청사항입니다 10자 이상 작성합니다',
    survey: { satisfaction: 5, motivation: 5, outcome: 5 },
    review: '후기입니다 10자 이상 작성합니다',
    submittedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** AI 분석 + 멘토 검증까지 즉시 끝낸 회차를 만든다(라이브 시뮬레이터는 거치지 않는다). */
function createCompletedAttempt(fileName: string): string {
  const id = useAppStore.getState().createAttempt({
    name: fileName,
    mime: 'application/pdf',
    size: 1_000_000,
    previewDataUrl: '',
  });
  useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: fileName, size: 1_000_000 }));
  useAppStore.getState().setMentorRequest(id, makeMentorRequest());
  const attempt = useAppStore.getState().attempts.find((a) => a.id === id)!;
  useAppStore.getState().setMentorFeedback(id, generateMentorFeedback(attempt));
  return id;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
});

afterEach(() => {
  cleanup();
});

describe('MyPage — 회차 수에 따른 4가지 상태 분기 (09 §1)', () => {
  it('0회 — 빈 상태', () => {
    renderAt('/my');
    expect(screen.getByText('아직 분석한 포트폴리오가 없습니다')).toBeInTheDocument();
    expect(screen.queryByText(/전체 이력 분석/)).not.toBeInTheDocument();
  });

  it('1회 — 단일 상세 뷰(1·2·3단계가 한 화면에 보인다), 이력 안내는 "2회 더"', () => {
    const id = useAppStore.getState().createAttempt({
      name: 'a.pdf',
      mime: 'application/pdf',
      size: 1_000_000,
      previewDataUrl: '',
    });
    useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'a.pdf', size: 1_000_000 }));
    renderAt('/my');

    expect(screen.getByText('① AI 분석')).toBeInTheDocument();
    expect(screen.getByText('② 멘토 검증')).toBeInTheDocument();
    expect(screen.getByText('③ 통합 리포트')).toBeInTheDocument();
    expect(screen.queryByText('AI 분석 완료 후 열립니다.')).not.toBeInTheDocument(); // ① AI 분석은 이미 완료
    expect(screen.getByText('멘토 검증 완료 후 열립니다.')).toBeInTheDocument(); // ③은 아직 잠김
    expect(screen.getByText(/2회 더 하면 열립니다/)).toBeInTheDocument();
  });

  it('2회 — 카드 그리드, 이력 안내는 "1회 더"이고 버튼은 없다', () => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    renderAt('/my');

    expect(screen.getByText('#01')).toBeInTheDocument();
    expect(screen.getByText('#02')).toBeInTheDocument();
    expect(screen.getByText(/1회 더 하면 열립니다/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '전체 이력 분석 보기 →' })).not.toBeInTheDocument();
  });

  it('3회 이상 — 카드 그리드 + 활성화된 이력 분석 버튼 → /my/history로 이동', async () => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    createCompletedAttempt('c.pdf');
    renderAt('/my');

    expect(screen.getByText('#01')).toBeInTheDocument();
    expect(screen.getByText('#03')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: '전체 이력 분석 보기 →' });
    fireEvent.click(button);

    await waitFor(() => expect(window.location.pathname).toBe(`${BASENAME}/my/history`));
  });
});

describe('MyPage — 카드 그리드 상세 진입/삭제 (09 §5)', () => {
  it('카드 클릭 → ?attempt={id} 단일 상세 뷰로 전환되고, 뒤로가기로 목록에 복귀한다', () => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    renderAt('/my');

    fireEvent.click(screen.getByText('#01').closest('button')!);

    expect(window.location.search).toBe('?attempt=' + useAppStore.getState().attempts[1].id);
    expect(screen.getByText('① AI 분석')).toBeInTheDocument();

    fireEvent.click(screen.getByText('← 목록으로'));
    expect(screen.getByText('#01')).toBeInTheDocument();
    expect(screen.getByText('#02')).toBeInTheDocument();
  });

  it('⋯ 메뉴 → 삭제 → 확인 모달 → 확인하면 회차가 사라진다', async () => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    renderAt('/my');

    const menuButtons = screen.getAllByRole('button', { name: '더 보기' });
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog', { name: '이 회차를 삭제할까요?' });
    expect(within(dialog).getByText(/되돌릴 수 없습니다/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

    await waitFor(() => expect(useAppStore.getState().attempts).toHaveLength(1));
    // 1회로 줄었으니 단일 상세 뷰로 전환된다
    expect(await screen.findByText('① AI 분석')).toBeInTheDocument();
  });
});

describe('MyPage — 2단계 진행 중 회차의 실시간 갱신 (09 §4)', () => {
  it(
    '멘토 검증 진행 중인 회차를 열어두면 완료까지 자동으로 갱신된다(?fast=1)',
    async () => {
      const id = useAppStore.getState().createAttempt({
        name: 'live.pdf',
        mime: 'application/pdf',
        size: 1_000_000,
        previewDataUrl: '',
      });
      useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'live.pdf', size: 1_000_000 }));
      useAppStore.getState().setMentorRequest(id, makeMentorRequest());

      renderAt('/my?fast=1');

      expect(screen.getByText(/단계 진행 중/)).toBeInTheDocument();

      await waitFor(
        () => expect(useAppStore.getState().attempts.find((a) => a.id === id)?.mentorFeedback).not.toBeNull(),
        { timeout: 20_000 },
      );
    },
    25_000,
  );
});
