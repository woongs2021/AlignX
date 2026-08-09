import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AppRouter, BASENAME } from '@/router';
import { useAppStore } from '@/store/useAppStore';

// jsdom엔 canvas 2D 렌더링이 없다 — 프리뷰 생성(캔버스 필요)만 모킹하고,
// 검증(validateFile)과 더미 채점 엔진(provider.analyze)은 실제 로직을 그대로 태운다.
vi.mock('@/lib/preview', () => ({
  generatePreview: vi.fn(async () => ({ ok: true, previewDataUrl: 'data:image/jpeg;base64,AAAA' })),
}));

function renderAt(path: string) {
  window.history.pushState({}, '', BASENAME + path);
  return render(<AppRouter />);
}

function makePdfFile(name = 'portfolio.pdf'): File {
  return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], name, {
    type: 'application/pdf',
  });
}

function getFileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!input) throw new Error('file input을 찾을 수 없습니다');
  return input as HTMLInputElement;
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().resetAll();
});

afterEach(() => {
  cleanup();
});

describe('Step1Page 업로드 흐름', () => {
  it(
    '파일 선택 → 분석 → 결과 전이 후, 새로고침(리마운트)해도 결과가 유지된다',
    async () => {
      renderAt('/portfolio/analyze');

      fireEvent.change(getFileInput(), { target: { files: [makePdfFile()] } });

      await screen.findByRole('status');
      expect(await screen.findByText('TOTAL SCORE', {}, { timeout: 15000 })).toBeInTheDocument();

      const totalScoreText = useAppStore.getState().attempts[0]?.ai?.totalScore;
      expect(totalScoreText).toBeGreaterThanOrEqual(68);

      cleanup();
      renderAt('/portfolio/analyze');
      expect(await screen.findByText('TOTAL SCORE')).toBeInTheDocument();
    },
    20000,
  );

  it('파일 2개를 동시에 선택하면 에러 메시지를 보여준다', async () => {
    renderAt('/portfolio/analyze');
    fireEvent.change(getFileInput(), {
      target: { files: [makePdfFile('a.pdf'), makePdfFile('b.pdf')] },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('한 번에 한 개');
  });

  it('매직넘버가 일치하지 않는 파일은 에러 메시지를 보여준다', async () => {
    renderAt('/portfolio/analyze');
    const badFile = new File([new Uint8Array([0, 0, 0, 0])], 'bad.pdf', { type: 'application/pdf' });
    fireEvent.change(getFileInput(), { target: { files: [badFile] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('PDF, PNG, JPEG, GIF');
  });
});
