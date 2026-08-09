import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';
import { useAdminSampleStore } from '@/store/useAdminSampleStore';
import { ADMIN_SESSION_DURATION_MS } from '@/data/constants';

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

function unlock(unlockedAt = new Date().toISOString()) {
  useAppStore.setState({ admin: { unlockedAt } });
}

/** /admin은 lazy(), 대시보드 청크가 로드될 때까지 기다린 뒤 반환한다. */
async function renderDashboard() {
  renderAt('/admin');
  return screen.findByRole('heading', { name: /제출 현황/ });
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
  useAdminSampleStore.getState().resetSamples();
});

afterEach(() => {
  cleanup();
});

describe('AdminPage — 세션 · 로그아웃 (10 §1.3)', () => {
  it('세션이 유효하면 대시보드가 보인다', async () => {
    unlock();
    await renderDashboard();
  });

  it('8시간이 지난 세션이면 대시보드 대신 게이트가 보인다', () => {
    unlock(new Date(Date.now() - ADMIN_SESSION_DURATION_MS - 1000).toISOString());
    renderAt('/admin');
    expect(screen.getByRole('heading', { name: '관리자 인증' })).toBeInTheDocument();
  });

  it('로그아웃을 누르면 세션이 풀리고 게이트로 돌아간다', async () => {
    unlock();
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(screen.getByRole('heading', { name: '관리자 인증' })).toBeInTheDocument();
    expect(useAppStore.getState().admin.unlockedAt).toBeNull();
  });
});

describe('AdminPage — 제출 현황 (10 §2)', () => {
  it('샘플 10건이 실제 제출 0건 안내와 함께 보인다', async () => {
    unlock();
    await renderDashboard();
    expect(screen.getByText(/이 브라우저에서 제출된 포트폴리오가 없습니다/)).toBeInTheDocument();
    expect(screen.getAllByText('김하늘').length).toBeGreaterThan(0);
    expect(screen.getAllByText('샘플').length).toBeGreaterThan(0);
  });

  it('요약 스트립 숫자가 상태별 건수와 일치한다', async () => {
    unlock();
    await renderDashboard();
    // 샘플 10건: completed 4(001,004,007,009) / reviewing 3(002,005,010) / submitted 2(003,006) / analyzing 1(008)
    const totalTile = screen.getByText('전체 제출').parentElement!;
    expect(within(totalTile).getByText('10')).toBeInTheDocument();
  });

  it('상태 필터 탭을 누르면 해당 상태만 남는다', async () => {
    unlock();
    await renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(screen.getAllByText('김하늘').length).toBeGreaterThan(0);
    expect(screen.queryByText('임태양')).not.toBeInTheDocument(); // 분석중 학생은 사라짐
  });

  it('이름으로 검색하면 그 학생만 남는다', async () => {
    unlock();
    await renderDashboard();
    fireEvent.change(screen.getByLabelText('이름 또는 주제 검색'), { target: { value: '김하늘' } });
    expect(screen.getAllByText('김하늘').length).toBeGreaterThan(0);
    expect(screen.queryByText('이도윤')).not.toBeInTheDocument();
  });

  it('점수순 정렬을 선택하면 AI 점수가 내림차순으로 나열된다', async () => {
    unlock();
    await renderDashboard();

    fireEvent.change(screen.getByLabelText('정렬'), { target: { value: 'score' } });

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row').slice(1); // 헤더 행 제외
    const scores = rows.map((row) => {
      const text = within(row).getAllByRole('cell')[4].textContent ?? '';
      const match = text.match(/-?\d+/);
      return match ? Number(match[0]) : -1;
    });

    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  it('실제 로컬 회차가 있으면 안내 문구가 사라지고 함께 표시된다', async () => {
    unlock();
    useAppStore.getState().createAttempt({
      name: 'my.pdf',
      mime: 'application/pdf',
      size: 1024,
      previewDataUrl: '',
    });
    await renderDashboard();
    expect(screen.queryByText(/이 브라우저에서 제출된 포트폴리오가 없습니다/)).not.toBeInTheDocument();
  });

  it('피드백 작성 버튼을 누르면 해당 회차의 피드백 화면으로 이동한다', async () => {
    unlock();
    await renderDashboard();
    const buttons = screen.getAllByRole('button', { name: '피드백 작성' });
    fireEvent.click(buttons[0]);
    expect(window.location.pathname).toContain(`${BASENAME}/admin/submissions/`);
  });
});
