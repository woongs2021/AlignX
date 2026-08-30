import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
});

afterEach(() => {
  cleanup();
});

describe('2단계 → 3단계 통합 흐름', () => {
  it(
    '폼 제출(?fast=1) → 모니터링 완료 → 리포트에 AI/멘토/최종 점수와 10개 원칙이 표시된다',
    async () => {
      // 1단계는 건너뛰고 AI 분석이 완료된 상태로 시작한다 (더미 엔진은 결정론적이라 실제 그대로 쓴다).
      const id = useAppStore.getState().createAttempt({
        name: 'portfolio.pdf',
        mime: 'application/pdf',
        size: 1_000_000,
        previewDataUrl: '',
      });
      useAppStore.getState().setAiAnalysis(id, generateAnalysis({ name: 'portfolio.pdf', size: 1_000_000 }));

      renderAt('/portfolio/mentor?fast=1');

      fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } });
      fireEvent.change(screen.getByLabelText('주제'), { target: { value: '커머스 앱 리디자인' } });
      fireEvent.change(screen.getByLabelText('멘토에게 요청하는 사항'), {
        target: { value: '레이아웃과 그리드 위주로 봐주세요. 10자 이상입니다.' },
      });

      fireEvent.click(screen.getByRole('button', { name: '멘토 검증 요청하기' }));
      const dialog = await screen.findByRole('dialog', { name: '멘토 검증을 요청할까요?' });
      fireEvent.click(within(dialog).getByRole('button', { name: '요청' }));

      // monitoring 화면으로 전환
      await screen.findByText(/홍길동님의 포트폴리오를 멘토들이 검증하고 있습니다/);

      // fast 모드(10배속)라 전체 약 15초 안에 완료된다
      expect(
        await screen.findByRole('button', { name: '3단계 · 통합 리포트 보기 →' }, { timeout: 20_000 }),
      ).toBeInTheDocument();

      const attempt = useAppStore.getState().attempts[0];
      expect(attempt.mentorFeedback).not.toBeNull();
      expect(attempt.status).toBe('completed');

      fireEvent.click(screen.getByRole('button', { name: '3단계 · 통합 리포트 보기 →' }));

      await waitFor(() =>
        expect(window.location.pathname).toBe(`${BASENAME}/portfolio/report`),
      );

      expect(await screen.findByText('AI SCORE — 10대 원칙 자동 채점')).toBeInTheDocument();
      expect(screen.getByText('MENTOR SCORE — 현직 멘토 3인 검증')).toBeInTheDocument();
      expect(screen.getByText('FINAL — 가중 평균 (AI 50% + 멘토 50%)')).toBeInTheDocument();

      // 10개 원칙 전부 표시
      expect(screen.getAllByText('Information Hierarchy').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Outcome & Impact').length).toBeGreaterThan(0);

      // 요청사항이 리포트에 인용된다
      expect(
        screen.getByText(/레이아웃과 그리드 위주로 봐주세요/),
      ).toBeInTheDocument();
    },
    25_000,
  );
});
