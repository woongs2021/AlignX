import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppRouter, BASENAME } from './router';
import { useAppStore } from '@/store/useAppStore';
import type { Attempt } from '@/types';

const sampleFile: Attempt['file'] = {
  name: 'sample.pdf',
  mime: 'application/pdf',
  size: 1024,
  previewDataUrl: '',
};

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

describe('AppRouter — 라우트 스텁 렌더', () => {
  it('/ → HOME', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: /PORTFOLIO/ })).toBeInTheDocument();
  });

  it('/portfolio → 포트폴리오 분석 인트로', () => {
    renderAt('/portfolio');
    expect(screen.getByRole('heading', { name: /3단계로 검증하는/ })).toBeInTheDocument();
  });

  it('/portfolio/analyze → 업로드 존 + 진행 인디케이터', () => {
    renderAt('/portfolio/analyze');
    expect(screen.getByText('포트폴리오를 여기에 놓으세요')).toBeInTheDocument();
    expect(screen.getAllByText('AI 분석').length).toBeGreaterThan(0);
  });

  it('/alignx → AlignX AI', async () => {
    renderAt('/alignx');
    expect(
      await screen.findByRole('heading', { level: 1, name: '모든 직무를 읽는 10개의 눈' }),
    ).toBeInTheDocument();
  });

  it('/my → MY', () => {
    renderAt('/my');
    expect(screen.getByRole('heading', { name: /포트폴리오 기록/ })).toBeInTheDocument();
  });

  it('/about → ABOUT', async () => {
    renderAt('/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: '데이터로 만드는, 모두의 합격 포트폴리오' }),
    ).toBeInTheDocument();
  });

  it('/admin → 잠금 상태면 게이트 화면(대시보드 아님)', () => {
    renderAt('/admin');
    expect(screen.getByRole('heading', { name: '관리자 인증' })).toBeInTheDocument();
    expect(screen.getByLabelText('암호')).toBeInTheDocument();
  });

  it('/admin → 올바른 암호 입력 시 대시보드로 전환', async () => {
    renderAt('/admin');
    fireEvent.change(screen.getByLabelText('암호'), { target: { value: 'portfolio2026' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(
      await screen.findByRole('heading', { name: /제출 현황/ }),
    ).toBeInTheDocument();
  });

  it('/nonexistent-route → 404', () => {
    renderAt('/nonexistent-route');
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument();
  });
});

describe('AppRouter — 가드', () => {
  it('/portfolio/mentor → AI 분석 없으면 /portfolio/analyze로 리다이렉트', async () => {
    renderAt('/portfolio/mentor');
    await waitFor(() =>
      expect(window.location.pathname).toBe(`${BASENAME}/portfolio/analyze`),
    );
    expect(screen.getByText('포트폴리오를 여기에 놓으세요')).toBeInTheDocument();
  });

  it('/portfolio/report → 활성 회차가 없으면 연쇄적으로 /portfolio/analyze까지 리다이렉트', async () => {
    renderAt('/portfolio/report');
    await waitFor(() =>
      expect(window.location.pathname).toBe(`${BASENAME}/portfolio/analyze`),
    );
  });

  it('/my/history → 3회 미만이면 /my로 리다이렉트', async () => {
    renderAt('/my/history');
    await waitFor(() => expect(window.location.pathname).toBe(`${BASENAME}/my`));
  });

  it('/my/history → 3회 이상이면 이력 페이지가 렌더된다', async () => {
    useAppStore.getState().createAttempt(sampleFile);
    useAppStore.getState().createAttempt(sampleFile);
    useAppStore.getState().createAttempt(sampleFile);
    renderAt('/my/history');
    expect(await screen.findByRole('heading', { name: /전체 이력 분석/ })).toBeInTheDocument();
  });
});
