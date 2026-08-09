#!/usr/bin/env node
// 개발용 감사 스크립트 — Plans/02-design-tokens.md §2.4 대비 요구사항을 실제로 계산해 검증한다.
// tokens.css를 렌더링하지 않고, 같은 팔레트/색-믹스 공식을 순수 JS로 재구현해 수치를 낸다.
// src/ 밖(scripts/)에 두어 "hex는 tokens.css에만" 규칙과 분리한다.

const LIGHT = {
  bg: '#FCFCFF',
  fg: '#010102',
  fgMutedAlpha: 0.6,
  onPrimary: '#FCFCFF',
};
const DARK = {
  bg: '#010102',
  fg: '#FCFCFF',
  fgMutedAlpha: 0.6,
};

const THEMES = {
  cool: { primary: '#4065F8', soft: '#A1D0F6', mid: '#16427C', deep: '#001C33', tint: '#CAF7FF' },
  mint: { primary: '#10C19F', soft: '#A6E6D4', mid: '#156E5C', deep: '#04221C', tint: '#D4F7EC' },
  warm: { primary: '#B85C4F', soft: '#C8847D', mid: '#754039', deep: '#771B0E', tint: '#EEDCD6' },
  violet: { primary: '#B14D92', soft: '#C896C0', mid: '#6A2A55', deep: '#4C1039', tint: '#EFDCEC' },
};

// tokens.css --cta 와 동일 — mint/warm 은 primary 위 흰 텍스트가 미달이라 mid로 강등했다.
const CTA = { cool: 'primary', mint: 'mid', warm: 'mid', violet: 'primary' };

// ── 색 변환 ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v) {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

// OKLab 변환 — Björn Ottosson 표준 행렬 (https://bottosson.github.io/posts/oklab/)
function linearRgbToOklab([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToLinearRgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** CSS color-mix(in oklab, hexA P%, hexB) 를 그대로 재현한다. */
function colorMixOklab(hexA, percentA, hexB) {
  const labA = linearRgbToOklab(hexToRgb(hexA).map(srgbToLinear));
  const labB = linearRgbToOklab(hexToRgb(hexB).map(srgbToLinear));
  const p = percentA / 100;
  const mixed = labA.map((v, i) => v * p + labB[i] * (1 - p));
  return oklabToLinearRgb(mixed).map(linearToSrgb);
}

function rgbFromHex(hex) {
  return hexToRgb(hex);
}

/** rgba(fgHex, alpha) 를 bgHex 위에 알파 합성한다 (--fg-muted 용). */
function compositeOverBg(fgHex, alpha, bgHex) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
}

function relativeLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map(srgbToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(rgbA, rgbB) {
  const l1 = relativeLuminance(rgbA);
  const l2 = relativeLuminance(rgbB);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

// ── 톤별 다크 모드 보정값 계산 (§2.3 color-mix 재현) ──────────────────
function darkAdjusted(theme) {
  const t = THEMES[theme];
  return {
    soft: colorMixOklab(t.soft, 34, DARK.bg),
    tint: colorMixOklab(t.tint, 20, DARK.bg),
    deep: colorMixOklab(t.deep, 60, DARK.bg),
  };
}

// ── 검증 실행 ──────────────────────────────────────────────────────────
const results = [];
function check(label, need, rgbFg, rgbBg) {
  const ratio = contrastRatio(rgbFg, rgbBg);
  results.push({ label, need, ratio, pass: ratio >= need });
}

// 1) --fg on --bg, 양 모드, ≥ 12:1
check('fg on bg (light)', 12, rgbFromHex(LIGHT.fg), rgbFromHex(LIGHT.bg));
check('fg on bg (dark)', 12, rgbFromHex(DARK.fg), rgbFromHex(DARK.bg));

// 2) --fg-muted on --bg, 양 모드, ≥ 4.5:1
check(
  'fg-muted on bg (light)',
  4.5,
  compositeOverBg(LIGHT.fg, LIGHT.fgMutedAlpha, LIGHT.bg),
  rgbFromHex(LIGHT.bg),
);
check(
  'fg-muted on bg (dark)',
  4.5,
  compositeOverBg(DARK.fg, DARK.fgMutedAlpha, DARK.bg),
  rgbFromHex(DARK.bg),
);

// 3) #FCFCFF(on-primary) on --cta(버튼 배경 — primary 또는 강등된 mid), 4세트 × 2모드 = 8건
for (const theme of Object.keys(THEMES)) {
  const ctaHex = THEMES[theme][CTA[theme]];
  const cta = rgbFromHex(ctaHex);
  check(`on-primary on ${theme}.cta=${CTA[theme]} (light)`, 4.5, rgbFromHex(LIGHT.onPrimary), cta);
  check(`on-primary on ${theme}.cta=${CTA[theme]} (dark)`, 4.5, rgbFromHex(LIGHT.onPrimary), cta);
}

// 4) --fg on --soft / --tint, 4세트 × 2모드
for (const theme of Object.keys(THEMES)) {
  const t = THEMES[theme];
  const adj = darkAdjusted(theme);
  check(`fg on ${theme}.soft (light)`, 4.5, rgbFromHex(LIGHT.fg), rgbFromHex(t.soft));
  check(`fg on ${theme}.soft (dark)`, 4.5, rgbFromHex(DARK.fg), adj.soft);
  check(`fg on ${theme}.tint (light)`, 4.5, rgbFromHex(LIGHT.fg), rgbFromHex(t.tint));
  check(`fg on ${theme}.tint (dark)`, 4.5, rgbFromHex(DARK.fg), adj.tint);
}

let anyFail = false;
for (const r of results) {
  const status = r.pass ? 'PASS' : 'FAIL';
  if (!r.pass) anyFail = true;
  console.log(`[${status}] ${r.label}: ${r.ratio.toFixed(2)}:1 (need ≥ ${r.need}:1)`);
}

if (anyFail) {
  console.error('\n일부 조합이 §2.4 대비 요구를 충족하지 못했습니다.');
  process.exit(1);
} else {
  console.log(`\n전체 ${results.length}건 통과.`);
}
