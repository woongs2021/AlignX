import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { MENTEE_ACCOUNT, MENTOR_ACCOUNT } from '@/data/accounts';
import { generateAnalysis } from '@/features/analysis/dummyEngine';

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

describe('2단계 → 3단계 통합 흐름 — 멘티↔멘토 실연동 (Plans/14)', () => {
  it(
    '멘티가 요청 제출 → 멘토가 로그인해 실제로 채점·확정 → 멘티 리포트에 반영된다',
    async () => {
      useAppStore.getState().login(MENTEE_ACCOUNT.id);
      const id = useAppStore.getState().createAttempt({
        name: 'portfolio.pdf',
        mime: 'application/pdf',
        size: 1_000_000,
        previewDataUrl: '',
      });
      useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'portfolio.pdf', size: 1_000_000 }));

      renderAt('/portfolio/mentor');

      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } });
      fireEvent.change(screen.getByLabelText('주제'), { target: { value: '커머스 앱 리디자인' } });
      fireEvent.change(screen.getByLabelText('멘토에게 요청하는 사항'), {
        target: { value: '레이아웃과 그리드 위주로 봐주세요. 10자 이상입니다.' },
      });

      fireEvent.click(screen.getByRole('button', { name: '멘토 검증 요청하기' }));
      const dialog = await screen.findByRole('dialog', { name: '멘토 검증을 요청할까요?' });
      fireEvent.click(within(dialog).getByRole('button', { name: '요청' }));

      // monitoring 화면으로 전환 — 멘토 검토 단계는 무기한 대기라 시간이 지나도 저절로 끝나지
      // 않는다(Plans/14 §6.1). 실제 멘토가 확정 제출하기 전까지는 리포트 버튼이 없어야 한다.
      await screen.findByText(/홍길동님의 포트폴리오를 멘토들이 검증하고 있습니다/);
      expect(screen.queryByRole('button', { name: '3단계 · 통합 리포트 보기 →' })).not.toBeInTheDocument();
      expect(useAppStore.getState().attempts[0].assignedMentorId).toBe(MENTOR_ACCOUNT.id);

      // 멘토 계정으로 전환해 실제 검증 화면에서 확정 제출한다.
      cleanup();
      useAppStore.getState().login(MENTOR_ACCOUNT.id);
      renderAt(`/my/review/${id}`);
      await screen.findByText('학생 정보');

      const overallBox = document.querySelector('textarea')!;
      fireEvent.change(overallBox, {
        target: { value: '전체적으로 구조가 탄탄합니다. 색 대비만 조금 더 보완해보세요.' },
      });
      fireEvent.click(screen.getByRole('button', { name: '피드백 확정 제출' }));
      const confirmDialog = await screen.findByRole('dialog', { name: '피드백을 확정 제출할까요?' });
      fireEvent.click(within(confirmDialog).getByRole('button', { name: '확정 제출' }));

      await waitFor(() => expect(window.location.pathname).toBe(`${BASENAME}/my`));

      const attempt = useAppStore.getState().attempts.find((a) => a.id === id)!;
      expect(attempt.mentorFeedback).not.toBeNull();
      expect(attempt.mentorFeedback?.mentorId).toBe(MENTOR_ACCOUNT.id);
      expect(attempt.status).toBe('completed');

      // 멘티로 돌아오면 3단계가 실제로 열려 있고, 멘토가 남긴 내용이 그대로 보인다.
      cleanup();
      useAppStore.getState().login(MENTEE_ACCOUNT.id);
      renderAt('/portfolio/mentor');
      expect(await screen.findByText('멘토 검증이 완료되었습니다.')).toBeInTheDocument();

      cleanup();
      renderAt('/portfolio/report');

      expect(await screen.findByText('AI SCORE — 10대 원칙 자동 채점')).toBeInTheDocument();
      expect(screen.getByText('MENTOR SCORE — 현직 멘토 3인 검증')).toBeInTheDocument();
      expect(screen.getByText('FINAL — 가중 평균 (AI 50% + 멘토 50%)')).toBeInTheDocument();

      // 10개 원칙 전부 표시
      expect(screen.getAllByText('Information Hierarchy').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Outcome & Impact').length).toBeGreaterThan(0);

      // 요청사항 · 멘토가 실제로 남긴 종합 코멘트가 리포트에 반영된다
      expect(screen.getByText(/레이아웃과 그리드 위주로 봐주세요/)).toBeInTheDocument();
      expect(screen.getByText(/색 대비만 조금 더 보완해보세요/)).toBeInTheDocument();
    },
    20_000,
  );
});
