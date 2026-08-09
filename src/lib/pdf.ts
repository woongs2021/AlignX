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
