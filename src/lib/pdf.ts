// PDF 1페이지 → <canvas> 렌더. 워커 경로는 ?url 임포트로 고정한다 — Vite에서 pdf.js 워커 로드
// 실패는 흔한 함정이다 (Plans/05-portfolio-step1.md §5).
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let pdfjsModulePromise: Promise<typeof import('pdfjs-dist')> | null = null;

function loadPdfjs() {
  pdfjsModulePromise ??= import('pdfjs-dist').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    return pdfjs;
  });
  return pdfjsModulePromise;
}

// 렌더 해상도 상한 — 대형 PDF가 메인 스레드를 블로킹하지 않도록 scale을 제한한다 (05 §5).
const MAX_RENDER_WIDTH = 1600;
// 뷰어용 페이지 썸네일은 640px 프리뷰보다 작게 — 10장까지 렌더해야 해서 원가가 더 크다 (14 §7.3).
const PAGE_RENDER_MAX_WIDTH = 480;

export async function renderPdfFirstPageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  try {
    const doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2, MAX_RENDER_WIDTH / baseViewport.width);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    await page.render({ canvas, viewport }).promise;
    return canvas;
  } finally {
    // PDFDocumentProxy가 아니라 loadingTask 쪽에서 destroy한다 (PDFDocumentProxy.destroy는 없음).
    await loadingTask.destroy();
  }
}

/** 전 페이지(상한 maxPages) → <canvas>[] — 멘토 검증 화면의 페이지 뷰어용 (Plans/14 §7.3).
 * 원본이 상한보다 많으면 나머지는 렌더하지 않는다 — pageCount로 실제 총 페이지 수를 알려준다. */
export async function renderPdfPagesToCanvases(
  file: File,
  maxPages: number,
): Promise<{ canvases: HTMLCanvasElement[]; pageCount: number }> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  try {
    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    const renderCount = Math.min(pageCount, maxPages);
    const canvases: HTMLCanvasElement[] = [];

    for (let i = 1; i <= renderCount; i += 1) {
      const page = await doc.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(1, PAGE_RENDER_MAX_WIDTH / baseViewport.width);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));

      await page.render({ canvas, viewport }).promise;
      canvases.push(canvas);
    }

    return { canvases, pageCount };
  } finally {
    await loadingTask.destroy();
  }
}
