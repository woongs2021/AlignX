# 색 대비 실측표

> 측정: `scripts/contrast-check.mjs` (WCAG 2.1 상대휘도 공식 + OKLab `color-mix` 재구현) 직접 실행.
> 브라우저 렌더링을 거치지 않고 tokens.css와 동일한 색 계산식을 순수 JS로 재현한 수치이므로,
> 실제 렌더 결과와 일치한다(같은 공식·같은 입력값).
> 실행: `node scripts/contrast-check.mjs`

## 결과 요약

**28건 전수 통과** (4톤 세트 × 2모드 조합 8건 포함).

| 조합 | 기준 | 결과 | 여유 |
|---|---|---|---|
| `--fg` on `--bg` (light) | ≥ 12:1 | 20.37:1 | PASS |
| `--fg` on `--bg` (dark) | ≥ 12:1 | 20.37:1 | PASS |
| `--fg-muted`(α0.6) on `--bg` (light) | ≥ 4.5:1 | 5.65:1 | PASS |
| `--fg-muted`(α0.6) on `--bg` (dark) | ≥ 4.5:1 | 7.21:1 | PASS |

### on-primary(#FCFCFF) on `--cta` — 4세트 × 2모드 (요구 8건)

| 톤 | cta 소스 | light | dark |
|---|---|---|---|
| cool | primary | 4.62:1 PASS | 4.62:1 PASS |
| mint | mid (강등) | 6.00:1 PASS | 6.00:1 PASS |
| warm | mid (강등) | 8.05:1 PASS | 8.05:1 PASS |
| violet | primary | 4.72:1 PASS | 4.72:1 PASS |

mint·warm은 `--primary` 위 흰 텍스트가 4.5:1 미달(각 2.24:1 / 4.38:1 실측, 02 §2.4)이라 버튼 배경을
`--mid`로 강등해서 쓴다 — `tokens.css`의 `--cta` 정의와 정확히 일치한다.

### `--fg` on `--soft` / `--tint` — 4세트 × 2모드

| 톤 | soft(light) | soft(dark) | tint(light) | tint(dark) |
|---|---|---|---|---|
| cool | 12.79:1 | 11.86:1 | 18.14:1 | 15.87:1 |
| mint | 14.79:1 | 11.16:1 | 18.20:1 | 15.88:1 |
| warm | 7.01:1 | 14.47:1 | 15.74:1 | 16.17:1 |
| violet | 8.52:1 | 13.74:1 | 16.01:1 | 16.13:1 |

전부 4.5:1 기준을 큰 여유로 통과.

## 실제 브라우저 렌더 확인 (미실행)

이 결과는 tokens.css의 색 계산식을 코드로 재현한 것이며, **실제 브라우저에서 렌더된 픽셀을
스포이드로 찍어 확인한 것은 아니다.** 특히 히어로 이미지 위에 올라가는 텍스트(§2.2 위험 지점 5)는
이미지 콘텐츠에 따라 대비가 달라질 수 있어 이 표로 커버되지 않는다 — Chrome DevTools의 Contrast
Checker로 실제 히어로 이미지 위에서 별도 확인이 필요하다(미실행, 실행 환경에 브라우저 없음).
