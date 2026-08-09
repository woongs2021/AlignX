#!/usr/bin/env node
// Font/ (원본, gitignore) → public/fonts/ (산출물, 커밋 대상)
// 멱등: 산출물이 이미 있으면 건너뛴다. 원본이 없으면(CI) 에러 없이 건너뛴다.
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FONT_SRC = `${ROOT}Font`;
const OUT_DIR = `${ROOT}public/fonts`;

// 라틴 스크립트 커버리지: 기본 라틴 + 라틴-1 서플리먼트(악센트) + 자주 쓰는 기호/구두점.
const LATIN_TEXT =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ' +
  '€£¥©®™•…–—‘’“”°%‰±×÷≈≠≤≥→←↑↓';

function skip(label, reason) {
  console.log(`[prepare-fonts] skip ${label} — ${reason}`);
}

function copyIfMissing(srcPath, outPath, label) {
  if (existsSync(outPath)) {
    skip(label, '이미 존재');
    return;
  }
  if (!existsSync(srcPath)) {
    skip(label, 'Font/ 원본 없음 (CI 환경)');
    return;
  }
  copyFileSync(srcPath, outPath);
  console.log(`[prepare-fonts] copied ${label}`);
}

async function buildMontserrat() {
  const outPath = `${OUT_DIR}/Montserrat-latin.woff2`;
  const label = 'Montserrat-latin.woff2';
  if (existsSync(outPath)) {
    skip(label, '이미 존재');
    return;
  }
  const srcPath = `${FONT_SRC}/Montserrat-font/Montserrat-VariableFont_wght.ttf`;
  if (!existsSync(srcPath)) {
    skip(label, 'Font/ 원본 없음 (CI 환경)');
    return;
  }
  const buffer = readFileSync(srcPath);
  const subset = await subsetFont(buffer, LATIN_TEXT, { targetFormat: 'woff2' });
  writeFileSync(outPath, subset);
  console.log(`[prepare-fonts] built ${label} (${(subset.length / 1024).toFixed(1)}KB)`);
}

function buildPretendard() {
  for (const weight of ['Regular', 'Medium', 'Bold']) {
    const label = `Pretendard-${weight}.subset.woff2`;
    copyIfMissing(
      `${FONT_SRC}/Pretendard-font/web/static/woff2-subset/${label}`,
      `${OUT_DIR}/${label}`,
      label,
    );
  }
}

function copyLicenses() {
  copyIfMissing(`${FONT_SRC}/Montserrat-font/OFL.txt`, `${OUT_DIR}/Montserrat-OFL.txt`, 'Montserrat-OFL.txt');
  copyIfMissing(
    `${FONT_SRC}/Pretendard-font/LICENSE.txt`,
    `${OUT_DIR}/Pretendard-LICENSE.txt`,
    'Pretendard-LICENSE.txt',
  );
}

mkdirSync(OUT_DIR, { recursive: true });
await buildMontserrat();
buildPretendard();
copyLicenses();
