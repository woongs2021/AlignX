import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { useAdminSampleStore } from '@/store/useAdminSampleStore';
import { generateAnalysis } from '@/features/analysis/dummyEngine';
import type { MentorRequest } from '@/types';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

/** /admin/submissions/:id는 lazy(), 청크가 로드될 때까지 기다린 뒤 반환한다. */
async function renderFeedbackPage(id: string) {
  renderAt(`/admin/submissions/${id}`);
  await screen.findByRole('button', { name: '← 목록으로' });
}

function unlock() {
  useAppStore.setState({ admin: { unlockedAt: new Date().toISOString() } });
}

function makeMentorRequest(overrides: Partial<MentorRequest> = {}): MentorRequest {
  return {
    name: '홍길동',
    topic: '커머스 앱 리디자인',
    requestNote: '레이아웃과 그리드 위주로 봐주세요. 10자 이상입니다.',
    submittedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** AI 분석 + 멘토 요청까지만 끝낸 "검증 대기" 상태의 실제 회차를 만든다(시뮬레이터 완료 전). */
function createSubmittedAttempt(): string {
  const id = useAppStore.getState().createAttempt({
    name: 'portfolio.pdf',
    mime: 'application/pdf',
    size: 1_000_000,
    previewDataUrl: '',
  });
  useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'portfolio.pdf', size: 1_000_000 }));
  useAppStore.getState().setMentorRequest(id, makeMentorRequest());
  return id;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
  useAdminSampleStore.getState().resetSamples();
  unlock();
});

afterEach(() => {
  cleanup();
});

describe('AdminFeedbackPage — 실제 회차 피드백 확정 E2E (10 §3.2, 완료 기준)', () => {
  it('확정 제출하면 해당 회차가 즉시 completed로 바뀌고, 학생의 2단계 화면도 완료로 전환된다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);

    fireEvent.change(screen.getByLabelText('멘토 점수'), { target: { value: '88' } });

    const overallBox = document.querySelector('textarea')!;
    fireEvent.change(overallBox, { target: { value: '전체적으로 구조가 탄탄합니다. 색 대비만 조금 더 보완해보세요.' } });

    fireEvent.click(screen.getByRole('button', { name: '피드백 확정 제출' }));
    const dialog = await screen.findByRole('dialog', { name: '피드백을 확정 제출할까요?' });
    fireEvent.click(within(dialog).getByRole('button', { name: '확정 제출' }));

    await waitFor(() => expect(window.location.pathname).toBe(`${BASENAME}/admin`));

    const attempt = useAppStore.getState().attempts.find((a) => a.id === id)!;
    expect(attempt.status).toBe('completed');
    expect(attempt.mentorFeedback?.overall).toContain('색 대비');
    expect(attempt.mentorFeedback?.mentorScore).toBe(88);

    cleanup();
    renderAt('/portfolio/mentor');
    expect(await screen.findByText('멘토 검증이 완료되었습니다.')).toBeInTheDocument();

    cleanup();
    renderAt('/portfolio/report');
    expect(await screen.findByText(/색 대비/)).toBeInTheDocument();
  });

  it('종합 코멘트를 비운 채 제출하면 에러가 뜨고 확정되지 않는다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);

    fireEvent.click(screen.getByRole('button', { name: '피드백 확정 제출' }));

    expect(screen.getByRole('alert')).toHaveTextContent('멘토 종합 코멘트를 입력해주세요.');
    expect(useAppStore.getState().attempts.find((a) => a.id === id)?.mentorFeedback).toBeNull();
  });

  it('이미 확정된 회차는 읽기 전용으로 보이고 단계 제어 버튼이 비활성화된다', async () => {
    const id = createSubmittedAttempt();
    useAppStore.getState().setMentorFeedback(id, {
      mentorName: '이지우',
      mentorRole: 'Design Director',
      overall: '이미 제출된 코멘트',
      perPrinciple: [],
      mentorScore: 80,
      completedAt: new Date().toISOString(),
    });

    await renderFeedbackPage(id);

    expect(screen.getByText('이미 확정 제출되어 수정할 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('이미 제출된 코멘트')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 단계로' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '즉시 완료 처리' })).toBeDisabled();
  });
});

describe('AdminFeedbackPage — 검증 단계 수동 제어 (10 §3.3)', () => {
  it('"다음 단계로"를 누르면 완료 단계 수가 하나씩 늘어난다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);

    // 제출 직후에도 절대시각 계산상 1번째 단계가 이미 active라 "검증중 0/3"으로 시작한다.
    // (Plans/14 §6.1 — review1/review2/synthesis 3단계가 mentor_review 1단계로 통합됐다.)
    expect(screen.getByText(/현재 검증중 0\/3/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다음 단계로' }));
    expect(screen.getByText(/현재 검증중 1\/3/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다음 단계로' }));
    expect(screen.getByText(/현재 검증중 2\/3/)).toBeInTheDocument();
  });

  it('"즉시 완료 처리"를 누르면 3단계가 한 번에 끝난다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);

    fireEvent.click(screen.getByRole('button', { name: '즉시 완료 처리' }));

    expect(screen.getByText(/현재 검증중 3\/3/)).toBeInTheDocument();
  });

  it('샘플 학생도 동일하게 단계 제어와 피드백 확정이 가능하다', async () => {
    renderAt('/admin');
    await screen.findByRole('heading', { name: /제출 현황/ });
    // 002 이도윤은 검증중 상태의 샘플이다.
    const card = screen.getAllByText('이도윤')[0].closest('tr') ?? screen.getAllByText('이도윤')[0].closest('div');
    const feedbackButtons = within(card as HTMLElement).queryAllByRole('button', { name: '피드백 작성' });
    fireEvent.click(feedbackButtons[0]);

    await screen.findByText(/검증 단계 제어/);
    fireEvent.click(screen.getByRole('button', { name: '즉시 완료 처리' }));
    expect(screen.getByText(/현재 검증중 3\/3/)).toBeInTheDocument();

    const overallBox = document.querySelector('textarea')!;
    fireEvent.change(overallBox, { target: { value: '샘플 학생 피드백입니다.' } });
    fireEvent.click(screen.getByRole('button', { name: '피드백 확정 제출' }));
    const dialog = await screen.findByRole('dialog', { name: '피드백을 확정 제출할까요?' });
    fireEvent.click(within(dialog).getByRole('button', { name: '확정 제출' }));

    await waitFor(() => expect(useAdminSampleStore.getState().feedback['002']).toBeDefined());
    expect(useAdminSampleStore.getState().feedback['002'].overall).toBe('샘플 학생 피드백입니다.');
  });
});

describe('AdminFeedbackPage — 임시저장 (10 §3.2)', () => {
  it('입력 300ms 후 로컬에 초안이 저장되고, 다시 열면 복구된다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);

    const overallBox = document.querySelector('textarea')!;
    fireEvent.change(overallBox, { target: { value: '작성 중인 코멘트' } });

    await waitFor(() => expect(localStorage.getItem(`alignx.admindraft.${id}`)).not.toBeNull());
    expect(JSON.parse(localStorage.getItem(`alignx.admindraft.${id}`)!).overall).toBe('작성 중인 코멘트');

    cleanup();
    await renderFeedbackPage(id);
    expect((document.querySelector('textarea') as HTMLTextAreaElement).value).toBe('작성 중인 코멘트');
  });

  it('명시적으로 [임시저장]을 눌러도 저장 확인 문구가 뜬다', async () => {
    const id = createSubmittedAttempt();
    await renderFeedbackPage(id);
    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));
    expect(screen.getByText('초안이 저장되었습니다.')).toBeInTheDocument();
  });
});
