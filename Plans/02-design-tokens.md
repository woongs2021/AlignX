# Phase 02 — 디자인 시스템 토큰화

> 선행: [01-setup-infra.md](01-setup-infra.md) · 후행: [03-layout-navigation.md](03-layout-navigation.md)
> 원본: [`woongdesignv2.md`](../woongdesignv2.md) — 슬라이드용 시스템을 **웹 스케일로 이식**한다.

---

## 1. 산출물

| 파일 | 내용 |
|---|---|
| `src/styles/reset.css` | 최소 리셋 (`box-sizing`, 마진 초기화, `dvh`) |
| `src/styles/tokens.css` | **컬러 4세트 · 라이트/다크 · 간격 · 라운드 · 모션** — 이 프로젝트에서 hex가 존재하는 유일한 파일 |
| `src/styles/typography.css` | `@font-face`, 타입 스케일 |
| `src/components/ThemeToggle.tsx` | 라이트/다크 토글 (배치는 Phase 03) |
| `src/theme/useRouteTheme.ts` | 라우트 → `data-theme` 자동 전환 |

---

## 2. 컬러 토큰

### 2.1 구조

```css
:root {
  /* 모드 인지 서피스 — data-mode 로 스왑 */
  --bg:        #FCFCFF;
  --fg:        #010102;
  --fg-muted:  rgba(1, 1, 2, 0.60);
  --stroke:    rgba(1, 1, 2, 0.16);   /* ※ 아래 §2.3 이탈 노트 */
  --stroke-strong: rgba(1, 1, 2, 0.40);

  /* 시맨틱 */
  --warning: #FF105C;
}

[data-mode='dark'] {
  --bg:        #010102;
  --fg:        #FCFCFF;
  --fg-muted:  rgba(252, 252, 255, 0.60);
  --stroke:    rgba(252, 252, 255, 0.16);
  --stroke-strong: rgba(252, 252, 255, 0.40);
}
```

### 2.2 4개 톤 세트

각 세트는 `--primary / --soft / --mid / --deep / --tint / --accent / --mute` 7개 역할을 채운다. 값은 `woongdesignv2.md` §Colors 표 그대로.

```css
[data-theme='cool']   { --primary:#4065F8; --soft:#A1D0F6; --mid:#16427C; --deep:#001C33; --tint:#CAF7FF; --accent:#9747FF; --mute:#A8BFC1; }
[data-theme='mint']   { --primary:#10C19F; --soft:#A6E6D4; --mid:#156E5C; --deep:#04221C; --tint:#D4F7EC; --accent:#00E0BE; --mute:#AEC4BB; }
[data-theme='warm']   { --primary:#B85C4F; --soft:#C8847D; --mid:#754039; --deep:#771B0E; --tint:#EEDCD6; --accent:#8C3124; --mute:#A38E85; }
[data-theme='violet'] { --primary:#B14D92; --soft:#C896C0; --mid:#6A2A55; --deep:#4C1039; --tint:#EFDCEC; --accent:#9B2774; --mute:#A38AA0; }
```

**컴포넌트는 세트 이름을 모른다.** `var(--primary)` 만 참조하면 라우트에 따라 자동으로 바뀐다.

### 2.3 다크 모드 채도 보정 ★

`woongdesignv2.md` §Known Gaps 가 미해결로 남긴 항목이다. 라이트 기준 hex를 다크에 그대로 쓰면 `--soft`·`--tint` 계열이 **눈부시게 뜬다.** 대응:

```css
[data-mode='dark'] [data-theme='cool'] {
  --soft: color-mix(in oklab, #A1D0F6 34%, var(--bg));
  --tint: color-mix(in oklab, #CAF7FF 20%, var(--bg));
  --deep: color-mix(in oklab, #001C33 60%, var(--bg));   /* 다크 배경과 붙지 않게 살짝 띄움 */
}
/* mint / warm / violet 동일 패턴 */
```

`--stroke` 도 원본 0.4 알파를 그대로 쓰면 웹 카드 테두리로는 과하다 → 기본 **0.16**, 강조 시 `--stroke-strong`(0.40). **의도적 이탈이며 [00 §6](00-overview.md) 이탈 목록에 준한다.**

### 2.4 대비 검증 (필수)

| 조합 | 요구 |
|---|---|
| `--fg` on `--bg` | ≥ 12:1 (양 모드) |
| `--fg-muted` on `--bg` | ≥ 4.5:1 |
| `#FCFCFF` on `--primary` (버튼) | ≥ 4.5:1 — **4세트 × 2모드 = 8건 전수 측정** |
| `--fg` on `--soft` / `--tint` | ≥ 4.5:1 |

미달 시 해당 조합에서 텍스트를 `--mid` 또는 `--deep` 로 강등한다. 결과는 `Plans/12-code-review.md` 체크리스트에 기록.

---

## 3. 타이포그래피

### 3.1 폰트 (프롬프트 7번 — 디자인 시스템 대비 의도적 교체)

| 역할 | 폰트 | Weight | 용도 |
|---|---|---|---|
| Display (영문) | **Montserrat** Variable | 300 기본 / 500 카드 / 700 임팩트 1회 | 헤드라인, 큰 숫자, 라벨 |
| Body (한글) | **Pretendard** Variable | 400 기본 / 700 강조 1문장 | 본문·한글 헤드라인 |
| Mono | JetBrains Mono (선택) | 400 | 점수 테이블·코드 표면 |

```css
--font-display: 'Montserrat', 'Pretendard', system-ui, sans-serif;
--font-body:    'Pretendard', 'Montserrat', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

### 3.1.1 원본 에셋 확인 결과 ✅

**P0 블로커 해제.** 두 폰트 모두 실제 바이너리가 확보되었다 (`Font/` 총 74MB).

| 폰트 | 확보된 것 | 라이선스 |
|---|---|---|
| **Montserrat** | `Font/Montserrat-font/Montserrat-VariableFont_wght.ttf` (688KB, wght 100–900) + Italic Variable + 정적 18종 | OFL (`OFL.txt` 동봉) |
| **Pretendard** | `Font/Pretendard-font/web/` — Variable woff2 1종(2.06MB) · 정적 woff2 9종(각 ~766KB) · **정적 woff2-subset 9종(각 ~267KB)** · woff 계열 · 공식 `@font-face` CSS 2종 | OFL (`LICENSE.txt` 동봉) |

**부수 확인 2건**

1. 🎉 **디자인 시스템의 Known Gap이 해소된다.** `woongdesignv2.md` 는 "Samsung Sharp Sans Light(300) 파일 부재 → Pretendard로 폴백" 을 미해결 과제로 남겼다. Montserrat Variable은 wght 축 100–900을 전부 커버하므로 **디스플레이 weight 300을 원래 의도대로 구현할 수 있다.** 폴백 불필요.
2. `Font/Montserrat`(406B 링크 스니펫)과 `Font/Pretendard`(0바이트)는 이제 남은 껍데기다. `Font/.DS_Store` 와 함께 삭제한다.

### 3.1.2 채택 전략 — 그대로 쓰면 안 되는 이유

| 후보 | 용량 | 판단 |
|---|---|---|
| Montserrat Variable **TTF** 직접 사용 | 688KB | ❌ TTF는 웹폰트 압축이 없다. woff2로 변환하면 1/10 이하 |
| Pretendard **Variable** woff2 | 2.06MB | ❌ 단일 폰트 2MB는 LCP 2.5s 목표([11 §3.1](11-responsive-a11y-perf.md))를 혼자서 깬다 |
| Pretendard **정적 풀셋** woff2 | 766KB × N | ❌ 3 weight면 2.3MB. Variable보다 나쁘다 |
| Pretendard **정적 subset** woff2 | **267KB × 3** | ✅ 채택 |

**최종 구성 — `public/fonts/` 에 4개 파일, 합계 약 856KB**

| 파일 | 출처 | 처리 | 크기(예상) |
|---|---|---|---|
| `Montserrat-latin.woff2` | `Montserrat-VariableFont_wght.ttf` | **라틴 서브셋 + woff2 변환** | ~50KB |
| `Pretendard-Regular.subset.woff2` | `web/static/woff2-subset/` | 그대로 복사 | 267KB |
| `Pretendard-Medium.subset.woff2` | 〃 | 그대로 복사 | 268KB |
| `Pretendard-Bold.subset.woff2` | 〃 | 그대로 복사 | 271KB |

- **Montserrat은 Variable 1개로 300/500/700을 전부 커버**한다 (`font-weight: 100 900` 선언). 정적 18종·Italic은 사용하지 않는다 — 디자인 시스템에 이탤릭이 없다
- **Pretendard는 400/500/700 3개만.** 타입 스케일([§3.2](#32-웹-타입-스케일))에서 실제로 쓰는 weight가 이 셋뿐이다. 100/200/300/600/800/900은 복사하지 않는다
- Pretendard의 "subset"은 공식 배포판이 제공하는 상용 한글 서브셋(희귀 한자·기호 제거)이다. 일반 한국어 본문에 부족함이 없다

### 3.1.3 `@font-face` 선언

```css
/* Montserrat — Variable 1개로 전 weight 커버 */
@font-face {
  font-family: 'Montserrat';
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Montserrat-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
                 U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
                 U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Pretendard — 400 / 500 / 700 */
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-display: swap;
  src: local('Pretendard Regular'),
       url('/fonts/Pretendard-Regular.subset.woff2') format('woff2');
}
/* 500, 700 동일 패턴 */
```

- `unicode-range` 를 Montserrat에 지정하는 것이 핵심이다. 이게 없으면 **한글 텍스트에도 Montserrat이 먼저 매칭돼 Pretendard가 로드되지 않는다** — 한글이 폴백 글꼴로 깨져 보이는 가장 흔한 원인
- `local()` 을 앞에 두면 Pretendard가 설치된 사용자는 다운로드를 건너뛴다
- 경로는 `/fonts/...` 가 아니라 **`import.meta.env.BASE_URL` 기준**이어야 한다 — GitHub Pages 하위 경로 배포 시 404가 난다 ([13 §1](13-deploy-docs.md))

### 3.1.4 로딩 우선순위

```html
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/Pretendard-Regular.subset.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/Montserrat-latin.woff2">
```

- **preload는 이 2개만.** Medium/Bold까지 preload하면 초기 대역폭을 800KB 잡아먹어 오히려 LCP가 나빠진다
- `crossorigin` 속성 필수 (누락 시 브라우저가 중복 다운로드한다)
- 전 폰트 `font-display: swap` — 폰트 때문에 텍스트가 안 보이는 구간을 만들지 않는다
- FOUT 시 레이아웃 흔들림을 줄이기 위해 폴백 스택에 `size-adjust` 를 검토한다 (Phase 11에서 CLS 측정 후 결정)

### 3.1.5 변환 스크립트

`scripts/prepare-fonts.mjs` — `npm run assets` 에 포함.

```
1. Montserrat-VariableFont_wght.ttf
     → subset-font (harfbuzz WASM, Node 전용)
     → 라틴 unicode-range 서브셋 + woff2 출력
     → public/fonts/Montserrat-latin.woff2
2. Pretendard woff2-subset 3종 (400/500/700) 복사
3. OFL.txt / LICENSE.txt → public/fonts/ 복사   ← OFL 재배포 조건
```

의존성: `subset-font` (npm, Node만으로 동작 — 파이썬 fonttools 불필요해 CI에서도 그대로 돌아간다).

### 3.1.6 저장소 정책 (이미지와 반대다)

| | 원본 | 산출물 |
|---|---|---|
| 이미지 | **커밋** (`Thumbnails/` 44MB) | gitignore — CI에서 재생성 |
| **폰트** | **gitignore** (`Font/` 74MB) | **커밋** (`public/fonts/` 856KB) |

폰트 변환 결과는 불변이고 856KB로 작다. 원본 74MB를 커밋해 clone을 무겁게 만들 이유가 없다.
단, **OFL 라이선스 원문은 `public/fonts/` 에 함께 커밋**해야 한다 (재배포 조건).

```gitignore
Font/                      # 74MB 원본 — 변환 후 불필요
!public/fonts/             # 산출물은 커밋
```

> ⚠️ `Font/` 를 gitignore하면 CI에서 `prepare-fonts` 가 실패한다. **폰트 스크립트는 로컬에서 1회만 돌리고, `npm run assets` 는 폰트 산출물이 이미 있으면 건너뛴다** (멱등 처리).

### 3.2 웹 타입 스케일

슬라이드 원본(128px body 24px)은 1920×1080 캔버스 기준이다. 웹 이식 시 `clamp()` 로 재정의한다.

| 토큰 | 폰트 | Weight | 크기 | 용도 |
|---|---|---|---|---|
| `--t-display-1` | display | 300 | `clamp(48px, 9vw, 120px)` | 히어로 영문 헤드 |
| `--t-display-2` | display | 300 | `clamp(38px, 6vw, 84px)` | 섹션 오프너 |
| `--t-display-3` | display | 300 | `clamp(30px, 4.5vw, 64px)` | 큰 숫자·결과 |
| `--t-impact` | display | 700 | `clamp(64px, 14vw, 200px)` | **페이지당 1회** |
| `--t-kr-1` | body | 400 | `clamp(30px, 5vw, 60px)` | 한글 메인 |
| `--t-kr-2` | body | 400 | `clamp(24px, 3.6vw, 44px)` | 섹션 한글 |
| `--t-kr-3` | body | 500 | `clamp(20px, 2.6vw, 32px)` | 카드 제목 |
| `--t-lead` | body | 400 | `clamp(18px, 2vw, 24px)` | 도입 리드 |
| `--t-body` | body | 400 | `17px → 18px (≥768px)` | **본문 기본** |
| `--t-body-sm` | body | 400 | `15px` | 카드 내부 |
| `--t-meta` | body | 400 | `14px` | 보조 |
| `--t-caption` | body | 500 | `13px` | 캡션 |
| `--t-label` | display | 500 | `12px / +0.08em / uppercase` | UI 라벨 |

**유지되는 원칙:** 음수 트래킹(`-0.01em`)은 48px 이상 디스플레이에만. 양수 트래킹은 12px 라벨에만. 영문 Display + 한글 Pretendard **더블 라인**이 시그니처 헤드라인 패턴.

```html
<!-- 시그니처 헤드라인 -->
<p class="display-1">PORTFOLIO</p>
<h1 class="kr-1">데이터로 검증하는 합격 포트폴리오</h1>
```

**한글 조판 필수 설정:** `word-break: keep-all;` `overflow-wrap: break-word;` — 없으면 한글이 음절 단위로 끊긴다. `line-height` 는 한글 본문 1.7, 디스플레이 0.95–1.05.

---

## 4. 간격 · 형태 · 모션

```css
--sp-xs:8px; --sp-sm:10px; --sp-md:14px; --sp-lg:24px;
--sp-xl:32px; --sp-2xl:48px;
--sp-section: clamp(56px, 8vw, 80px);   /* 챕터 호흡: 모바일 축소 허용 */
--sp-gutter:  clamp(20px, 5vw, 56px);   /* 페이지 좌우 여백 */

--r-xs:4px; --r-tag:5px; --r-sm:8px; --r-md:12px;
--r-lg:16px; --r-frame:24px; --r-tile:28px; --r-pill:999px;

--container: 1280px;

--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dur-fast: 160ms; --dur-base: 240ms; --dur-slow: 480ms;
```

**그림자 토큰은 정의하지 않는다.** 깊이는 `--bg → --tint/--soft → --deep` 표면 색 단계로만 만든다 (디자인 시스템 §Elevation).

---

## 5. 모드 전환 구현

### 5.1 FOUC 방지 부트 스크립트

`index.html` `<head>` 최상단 인라인 (React 마운트 전에 실행되어야 한다):

```html
<script>
  (function () {
    try {
      var s = JSON.parse(localStorage.getItem('alignx.v1') || '{}');
      var m = s?.state?.mode;
      if (m !== 'light' && m !== 'dark')
        m = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.mode = m;
    } catch (e) { document.documentElement.dataset.mode = 'light'; }
  })();
</script>
```

### 5.2 `ThemeToggle`

- 아이콘: 태양/달 SVG (인라인, `currentColor`) — 디자인 시스템 §이모지 금지 준수
- 44×44 히트 영역, `aria-label="다크 모드로 전환"` 동적 갱신, `aria-pressed`
- 전환 시 `<html>` 에 `.mode-transition` 을 200ms 부여 → `color`/`background-color`/`border-color` 만 트랜지션 (`transition: all` 금지 — 레이아웃 저크 발생)
- 사용자가 명시 선택하면 그 값이 시스템 설정보다 우선. 저장은 Zustand persist

### 5.3 라우트 → 톤 전환

`useRouteTheme()` 이 [00 §6.1](00-overview.md) 매핑 표를 참조해 `document.documentElement.dataset.theme` 을 갱신. 매핑 테이블은 `src/theme/routeTheme.ts` 한 곳에만 둔다.

### 5.4 모션 축소 대응

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Lenis 스무스 스크롤과 히어로 마퀴도 이 조건에서 **비활성화**한다 (Phase 03·04에서 각각 처리).

---

## 6. 기본 컴포넌트 (토큰 소비 검증용)

Phase 03 이후 전 화면이 쓰는 최소 세트. 각각 라이트/다크 × 4톤에서 확인한다.

| 컴포넌트 | 사양 |
|---|---|
| `Button` | `primary` / `secondary` / `ghost` / `link`. 높이 44, radius `--r-md`, 라벨 12px uppercase. active 시 `--mid` |
| `Card` | `--bg` + 1px `--stroke`, radius `--r-tile`(28), 패딩 `--sp-xl`. `soft`(=`--soft` 배경) / `deep`(=`--deep` 배경 + 반전 텍스트) 변형 |
| `Badge` | pill, `outline` / `tone` / `warning` / `status-dot` |
| `StatTile` | 큰 숫자(display-3) + 라벨. 숫자가 면적 절반 |
| `ProgressBar` | 높이 6px, pill, 진행면 `--primary`, 탭 영역 상하 16px 확장 |
| `Input` / `Textarea` | 높이 48 / radius `--r-md` / 포커스 시 `--primary` 아웃라인 + 3px 15% 글로우 |
| `SectionHeader` | 영문 라벨 + 한글 제목 더블 라인 |

---

## 7. 완료 기준

- [ ] `tokens.css` 외 어떤 CSS/TSX에도 hex 리터럴 없음 (grep 검증)
- [ ] 4개 톤 × 라이트/다크 = **8개 조합** 스타일 가이드 페이지(`/__styleguide`, dev 전용)에서 육안 확인
- [ ] §2.4 대비 요구 전 항목 통과, 미달 조합은 강등 규칙 적용 후 재측정

### 폰트 (§3.1.1–3.1.6)

- [ ] `public/fonts/` 에 woff2 4개 + OFL 라이선스 2개, 합계 **1MB 이하**
- [ ] TTF·OTF가 배포 산출물에 **하나도 포함되지 않음** (`dist/` 확인)
- [ ] 영문은 Montserrat, **한글은 Pretendard**로 렌더 — 개발자도구 Rendered Fonts로 실측 (`unicode-range` 검증)
- [ ] 디스플레이 헤드라인이 **weight 300**으로 실제 렌더 (Variable 축 동작 확인 — 400으로 폴백되면 실패)
- [ ] Pretendard 400 / 500 / 700 세 weight 모두 정상, 그 외 weight 요청 없음 (Network 탭)
- [ ] preload 2개만 존재, `crossorigin` 속성 있음, 중복 다운로드 없음
- [ ] GitHub Pages 하위 경로(`/AlignX-dev/`)에서 폰트 404 없음 ([13 §7](13-deploy-docs.md) 에서 재확인)
- [ ] `Font/Montserrat`(스니펫)·`Font/Pretendard`(0바이트)·`Font/.DS_Store` 삭제됨
- [ ] 새로고침 시 다크모드 깜빡임(FOUC) 없음
- [ ] 라우트 이동 시 톤이 매핑대로 전환, 한 페이지 내 세트 혼용 0건
- [ ] `prefers-reduced-motion: reduce` 에서 모든 애니메이션 정지
- [ ] 360px에서 `--t-display-1` 이 컨테이너를 넘치지 않음
- [ ] 한글 본문 `word-break: keep-all` 적용, 어색한 음절 분리 없음
