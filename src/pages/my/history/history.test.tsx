import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { generateAnalysis } from '@/features/analysis/dummyEngine';
import { PRINCIPLES } from '@/data/principles';
import type { Attempt, MentorFeedback, MentorRequest } from '@/types';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

function makeMentorRequest(overrides: Partial<MentorRequest> = {}): MentorRequest {
  return {
    name: '홍길동',
    topic: '커머스 앱 리디자인',
    requestNote: '요청사항입니다 10자 이상 작성합니다',
    submittedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** 더 이상 타이머 자동완료가 없으므로(Plans/14 §6.1) 테스트에서는 고정 피드백을 직접 만든다. */
function makeMentorFeedback(attempt: Attempt): MentorFeedback {
  return {
    mentorName: '이지우',
    mentorRole: 'Design Director',
    overall: '전체적으로 준수한 완성도입니다.',
    perPrinciple: PRINCIPLES.map((p) => ({ principleId: p.id, comment: `${p.nameKr} 코멘트` })),
    mentorScore: attempt.ai?.totalScore ?? 80,
    completedAt: new Date().toISOString(),
  };
}

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
  useAppStore.getState().setMentorFeedback(id, makeMentorFeedback(attempt));
  return id;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
});

afterEach(() => {
  cleanup();
});

describe('MyHistoryPage — 완료 회차 3개', () => {
  beforeEach(() => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    createCompletedAttempt('c.pdf');
  });

  it('성장 요약·총점 추이·원칙별 변화·해석·멘토 아카이브·다운로드 버튼이 모두 렌더된다', async () => {
    renderAt('/my/history');

    expect(await screen.findByText(/완료 3회 기준/)).toBeInTheDocument();
    expect(screen.queryByText(/진행 중인 회차는 제외/)).not.toBeInTheDocument();
    expect(screen.getByText('총점 추이')).toBeInTheDocument();
    expect(screen.getByText('원칙별 변화')).toBeInTheDocument();
    expect(screen.getByText('해석')).toBeInTheDocument();
    expect(screen.getByText('멘토 코멘트 아카이브')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 이력 리포트 HTML 다운로드' })).toBeInTheDocument();
  });

  it('10개 원칙이 전부 변화표에 표시된다', async () => {
    // 데스크톱 표 + 모바일 카드 스택이 CSS로만 전환되고 둘 다 DOM엔 존재하므로 getAllByText를 쓴다.
    renderAt('/my/history');
    expect(await screen.findAllByText('정보 위계')).not.toHaveLength(0);
    expect(screen.getAllByText('결과 · 임팩트 증명').length).toBeGreaterThan(0);
  });

  it('← MY로 돌아가기를 누르면 /my로 이동한다', async () => {
    renderAt('/my/history');
    fireEvent.click(await screen.findByText('← MY로 돌아가기'));
    await waitFor(() => expect(window.location.pathname).toBe(`${BASENAME}/my`));
  });
});

describe('MyHistoryPage — 일부 회차 미완료', () => {
  it('완료 회차만 집계하고 "완료 N회 기준 (진행 중인 회차는 제외)"를 명시한다', async () => {
    createCompletedAttempt('a.pdf');
    createCompletedAttempt('b.pdf');
    // 3번째는 AI 분석만 끝나고 멘토 검증은 진행 중
    const id = useAppStore.getState().createAttempt({
      name: 'c.pdf',
      mime: 'application/pdf',
      size: 1_000_000,
      previewDataUrl: '',
    });
    useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'c.pdf', size: 1_000_000 }));
    useAppStore.getState().setMentorRequest(id, makeMentorRequest());

    renderAt('/my/history');

    expect(await screen.findByText(/완료 2회 기준/)).toBeInTheDocument();
    expect(screen.getByText(/진행 중인 회차는 제외했습니다/)).toBeInTheDocument();
  });
});
