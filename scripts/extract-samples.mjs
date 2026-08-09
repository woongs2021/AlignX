#!/usr/bin/env node
// Portfolio-samples/*.pdf (원본, gitignore) → public/samples/ (산출물, 커밋 대상)
// 멱등: 산출물이 이미 있으면 렌더링을 건너뛴다. 원본이 없으면(CI) 기존 산출물을 그대로 두고 스킵.
//
// PDF 1페이지 → 캔버스 렌더 → JPEG. pdfjs-dist는 Node 환경에서 래스터화할 캔버스 구현체가
// 필요하다(Plans/01-setup-infra.md에는 명시되지 않은 부분) — 네이티브 빌드 툴체인 없이 CI에서
// 안정적으로 동작하는 @napi-rs/canvas(프리빌트 바이너리)를 채택했다.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, DOMMatrix } from '@napi-rs/canvas';

globalThis.DOMMatrix ??= DOMMatrix;

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = `${ROOT}Portfolio-samples`;
const OUT_DIR = `${ROOT}public/samples`;
const PREVIEW_WIDTH = 900;
const JPEG_QUALITY = 72;
// 한글 등 CID 폰트가 사전정의 CMap(Adobe-Korea1 등)을 참조하는 PDF가 있어 필요하다.
// 없으면 해당 글립이 렌더링되지 않고 조용히 누락된다.
const CMAP_URL = fileURLToPath(new URL('../node_modules/pdfjs-dist/cmaps/', import.meta.url));

function parseFileName(fileName) {
  const base = fileName.replace(/\.pdf$/i, '');
  const [seq, company, ...rest] = base.split('_');
  return { seq, company, field: rest.join('_') };
}

async function loadDocument(srcPath) {
  const data = new Uint8Array(readFileSync(srcPath));
  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
  });
  const doc = await loadingTask.promise;
  return { doc, loadingTask };
}

async function renderFirstPage(doc) {
  const page = await doc.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: PREVIEW_WIDTH / baseViewport.width });
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.encode('jpeg', JPEG_QUALITY);
}

async function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifestPath = `${OUT_DIR}/samples.json`;

  if (!existsSync(SRC_DIR)) {
    console.log(
      `[extract-samples] skip 전체 — Portfolio-samples/ 원본 없음 (${existsSync(manifestPath) ? '기존 산출물 유지' : '산출물도 없음'})`,
    );
    return;
  }

  const files = readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();

  const entries = [];
  for (const file of files) {
    const { seq, company, field } = parseFileName(file);
    const previewName = `${seq}.jpg`;
    const outPath = `${OUT_DIR}/${previewName}`;
    const { doc, loadingTask } = await loadDocument(`${SRC_DIR}/${file}`);

    if (existsSync(outPath)) {
      console.log(`[extract-samples] skip ${previewName} — 이미 존재`);
    } else {
      const buffer = await renderFirstPage(doc);
      writeFileSync(outPath, buffer);
      console.log(`[extract-samples] built ${previewName} (${(buffer.length / 1024).toFixed(1)}KB)`);
    }

    entries.push({
      id: seq,
      company,
      field,
      preview: previewName,
      pageCount: doc.numPages,
      sourceFile: file,
    });
    await loadingTask.destroy();
  }

  writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n');
  console.log(`[extract-samples] wrote samples.json (${entries.length} entries)`);
}

await run();
