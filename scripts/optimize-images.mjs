#!/usr/bin/env node
// Thumbnails/*.png (원본, 커밋) → public/images/{hero,thumbs}/ (산출물, gitignore — CI가 재생성)
// 멱등: 산출물이 이미 있으면 건너뛴다.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = `${ROOT}Thumbnails`;
const HERO_DIR = `${ROOT}public/images/hero`;
const THUMBS_DIR = `${ROOT}public/images/thumbs`;

const HERO_WIDTHS = [800, 1600, 2400];
const HERO_QUALITY = 78;
const THUMB_WIDTH = 800;
const THUMB_QUALITY = 75;
const LQIP_WIDTH = 24;
const LQIP_QUALITY = 40;

async function writeWebp(srcPath, outPath, width, quality, label) {
  if (existsSync(outPath)) {
    console.log(`[optimize-images] skip ${label} — 이미 존재`);
    return;
  }
  await sharp(srcPath).resize({ width }).webp({ quality }).toFile(outPath);
  console.log(`[optimize-images] built ${label}`);
}

async function run() {
  if (!existsSync(SRC_DIR)) {
    console.log('[optimize-images] skip 전체 — Thumbnails/ 원본 없음');
    return;
  }
  mkdirSync(HERO_DIR, { recursive: true });
  mkdirSync(THUMBS_DIR, { recursive: true });

  const files = readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort();

  for (const file of files) {
    const n = file.replace(/\.png$/i, '');
    const srcPath = `${SRC_DIR}/${file}`;

    for (const width of HERO_WIDTHS) {
      await writeWebp(srcPath, `${HERO_DIR}/${n}-${width}.webp`, width, HERO_QUALITY, `hero/${n}-${width}.webp`);
    }
    await writeWebp(
      srcPath,
      `${THUMBS_DIR}/${n}-${THUMB_WIDTH}.webp`,
      THUMB_WIDTH,
      THUMB_QUALITY,
      `thumbs/${n}-${THUMB_WIDTH}.webp`,
    );
    await writeWebp(srcPath, `${HERO_DIR}/${n}-blur.webp`, LQIP_WIDTH, LQIP_QUALITY, `hero/${n}-blur.webp`);
    await writeWebp(srcPath, `${THUMBS_DIR}/${n}-blur.webp`, LQIP_WIDTH, LQIP_QUALITY, `thumbs/${n}-blur.webp`);
  }
}

await run();
