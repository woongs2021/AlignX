// 업로드 파일 → 640px JPEG q0.7 프리뷰 dataURL. 원본은 저장하지 않는다 (00 §7 저장 규칙).
// PDF는 pdf.js 1페이지 렌더, 이미지(PNG/JPEG/GIF)는 createImageBitmap으로 디코드한다 —
// 둘 다 실패하면 예외를 던지므로 "실제 열림" 검증(05 §3.2)을 겸한다. GIF는 첫 프레임만 캡처된다.
import type { AcceptedMimeType } from './file';
import { renderPdfFirstPageToCanvas, renderPdfPagesToCanvases } from './pdf';

const PREVIEW_MAX_WIDTH = 640;
const PREVIEW_QUALITY = 0.7;
const RENDER_TIMEOUT_MS = 3000;
// 전 페이지 렌더는 1페이지보다 훨씬 오래 걸릴 수 있어 별도 상한을 둔다 (Plans/14 §7.3).
const PAGES_RENDER_TIMEOUT_MS = 15_000;
const MAX_PREVIEW_PAGES = 10;
const PAGE_JPEG_QUALITY = 0.6;

async function renderImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context를 생성할 수 없습니다.');
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  } finally {
    bitmap.close();
  }
}

function downscaleToJpegDataUrl(canvas: HTMLCanvasElement): string {
  const scale = Math.min(1, PREVIEW_MAX_WIDTH / canvas.width);
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));

  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context를 생성할 수 없습니다.');
  ctx.drawImage(canvas, 0, 0, width, height);
  return out.toDataURL('image/jpeg', PREVIEW_QUALITY);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('preview render timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export type PreviewResult =
  | { ok: true; previewDataUrl: string; pages: string[]; pageCount: number }
  | { ok: false; reason: 'corrupted' }
  | { ok: false; reason: 'timeout' };

/**
 * 프리뷰 생성 — 실패(파싱 불가)는 { ok:false, reason:'corrupted' }, 3초 초과 시
 * { ok:false, reason:'timeout' }으로 프리뷰 없이 넘어간다(분석 자체는 계속 진행, 05 §5).
 *
 * PDF는 1페이지 프리뷰(previewDataUrl, 카드/리포트용)와 별개로 전 페이지(pages, 멘토 검증
 * 화면의 뷰어용, 상한 10장)를 함께 만든다(Plans/14 §7.3). 전 페이지 렌더가 실패하거나 시간
 * 초과해도 업로드 자체는 계속 진행한다 — 뷰어만 1장(프리뷰)으로 대체된다.
 */
export async function generatePreview(file: File, mime: AcceptedMimeType): Promise<PreviewResult> {
  try {
    const canvas = await withTimeout(
      mime === 'application/pdf' ? renderPdfFirstPageToCanvas(file) : renderImageToCanvas(file),
      RENDER_TIMEOUT_MS,
    );
    const previewDataUrl = downscaleToJpegDataUrl(canvas);

    if (mime !== 'application/pdf') {
      return { ok: true, previewDataUrl, pages: [previewDataUrl], pageCount: 1 };
    }

    try {
      const { canvases, pageCount } = await withTimeout(
        renderPdfPagesToCanvases(file, MAX_PREVIEW_PAGES),
        PAGES_RENDER_TIMEOUT_MS,
      );
      const pages = canvases.map((c) => c.toDataURL('image/jpeg', PAGE_JPEG_QUALITY));
      return { ok: true, previewDataUrl, pages, pageCount };
    } catch {
      return { ok: true, previewDataUrl, pages: [previewDataUrl], pageCount: 1 };
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'preview render timeout') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'corrupted' };
  }
}
