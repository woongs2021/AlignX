# Phase 03 — 공통 레이아웃 · 내비게이션 · 스크롤 시스템

> 선행: [02-design-tokens.md](02-design-tokens.md) · 후행: [04-home.md](04-home.md), [05](05-portfolio-step1.md), [08](08-alignx-about.md)
> 레퍼런스: **seed-design.io** — 프롬프트 6번 "탭 호버 원칙, 내비게이션 원칙, 콘텐츠 원칙, 스크롤 방법"

---

## 1. 산출물

`TopNav` · `ThemeToggle` 배치 · `MobileNav` · `Footer` · `PageShell` · `TableOfContents` · `SectionAnchor` · 스무스 스크롤 프로바이더 · 페이지 전환 모션

---

## 2. TopNav

### 2.1 구조 (좌 → 우)

```
[AlignX 로고]        [PORTFOLIO 분석] [AlignX AI] [MY] [ABOUT]        [🌗 테마 토글]
   → /                          4개 탭 (00 §3 Q1)                      프롬프트 2번
```

- 높이 **64px** (모바일 56px) — 원본 시스템의 80px은 웹 상단바로는 과해 축소. 콘텐츠 영역 확보 우선
- 배경 `--bg`, 하단 1px `--stroke` hairline. **그림자 없음**
- 로고: `AlignX-logo.svg` 를 `fill="currentColor"` 로 치환 → 라이트/다크 자동 대응. 높이 20px
- 탭 라벨: `--t-label` (12px Medium uppercase, `+0.08em`)
- 컨테이너 `--container`(1280px) 중앙 정렬, 좌우 `--sp-gutter`

### 2.2 스크롤 거동 (seed-design 계열)

| 상태 | 처리 |
|---|---|
| scrollY = 0 | 완전 투명 배경 + 보더 없음 (HOME 히어로에서 특히) |
| scrollY > 8 | `--bg` 90% + `backdrop-filter: blur(12px)` + 하단 hairline 등장 |
| 아래로 스크롤 (>80px 이동) | 상단바 `translateY(-100%)` 로 숨김 |
| 위로 스크롤 | 즉시 복귀 |

`position: sticky; top: 0; z-index: 100`. `IntersectionObserver` 로 sentinel 감시 (scroll 이벤트 리스너보다 저렴).
`prefers-reduced-motion` 시 숨김/복귀 애니메이션 없이 항상 고정.

### 2.3 탭 호버 원칙 ★

seed-design.io 의 절제된 호버를 따른다. **밑줄이 자라나는 방식 하나로 통일:**

| 상태 | 표현 |
|---|---|
| 기본 | 텍스트 `--fg-muted`, 인디케이터 `scaleX(0)` |
| 호버 | 텍스트 `--fg` (160ms), 하단 2px `--primary` 인디케이터가 **좌→우 `scaleX(0→1)`** (`--ease-out`) |
| 활성 (현재 라우트) | 텍스트 `--fg`, 인디케이터 `scaleX(1)` 고정 |
| 포커스 (키보드) | 2px `--primary` 아웃라인 + 2px offset — 호버와 **다른 표현**이어야 한다 |

금지: 배경색 채우기, 크기 확대(`scale`), 그림자, 색상 다중 변화. **한 요소에 한 가지 호버 신호만.**

`transform-origin: left`, `will-change: transform`. 인디케이터는 `::after` 로 그려 레이아웃 시프트를 만들지 않는다.

### 2.4 모바일 (<768px)

- 탭 → 햄버거. 열면 **전체 화면 오버레이** (`--bg`, 100dvh)
- 메뉴 항목은 `--t-kr-2` 큰 활자로 세로 나열 (디자인 시스템 "큰 활자와 색면" 원칙)
- 항목 진입 stagger 40ms
- 테마 토글은 오버레이 안에서도 우상단 유지
- 열림 중 `body` 스크롤 잠금, `Esc` 닫기, 포커스 트랩, 라우트 변경 시 자동 닫힘

---

## 3. 스크롤 시스템

### 3.1 스무스 스크롤

Lenis, `lerp: 0.09`, `duration: 1.1`. 앱 루트 1회 초기화.
**해제 조건:** `prefers-reduced-motion`, 터치 디바이스(네이티브 관성이 더 자연스럽다), 모달/오버레이 열림 중.

### 3.2 섹션 진입 리빌

전 페이지 공용 `useReveal()` — `IntersectionObserver(threshold: 0.15)`, 1회 발화 후 unobserve.

```
초기: opacity 0, translateY(16px)
진입: opacity 1, translateY(0)  —  520ms --ease-out, 자식 stagger 60ms
```

`translateY` 는 **16px 이내**로 제한한다. 크게 주면 스크롤이 무거워지고 모바일에서 멀미가 난다.

### 3.3 앵커 & 목차

seed-design 문서형 페이지(ABOUT, AlignX AI)에 적용:

- `SectionAnchor` — `id` 부여 + `scroll-margin-top: 88px` (상단바 높이 + 여백)
- `TableOfContents` — 데스크톱(≥1024px) 우측 sticky 목차. `IntersectionObserver` 로 현재 섹션 하이라이트
- 목차 항목 호버는 §2.3과 동일한 밑줄 규칙
- 모바일에서는 목차 미노출 (한 화면에 한 가지 일 — 디자인 시스템 §Whitespace)

### 3.4 페이지 전환

라우트 변경 시 260ms 크로스페이드(`opacity` + 8px `translateY`). 동시에 `useRouteTheme()` 이 톤을 교체하므로 **색 전환이 페이드 뒤에 숨겨진다.**
전환 후 `window.scrollTo(0, 0)` + `main` 에 포커스 이동(스크린리더 대응).

---

## 4. PageShell

모든 페이지가 감싸는 셸. `<TopNav>` `<main>` `<Footer>` 구성.

props:
| prop | 용도 |
|---|---|
| `theme` | 톤 세트 강제 지정 (미지정 시 라우트 매핑) |
| `width` | `'default'`(1280) / `'narrow'`(720, 문서형) / `'full'`(히어로) |
| `title` / `description` | `document.title`, `<meta>` 갱신 |

`<main id="content" tabIndex={-1}>` + **Skip to content** 링크(포커스 시에만 노출).

---

## 5. Footer

- 배경 `--deep`, 텍스트 `#FCFCFF` 70% 알파 — **라이트 모드에서도 다크 유지** (디자인 시스템 §footer "절대 라이트로 인버트하지 않는다")
- 데스크톱 4컬럼 / 모바일 1컬럼
  1. 워드마크 + 한 줄 소개
  2. 서비스 — 포트폴리오 분석 / AlignX AI / MY
  3. 정보 — ABOUT / 이용약관(더미) / 개인정보(더미)
  4. 고지 — "MVP 데모. 데이터는 브라우저에만 저장됩니다."
- ADMIN 링크는 **노출하지 않는다** (히든 라우트). 필요 시 워드마크 5회 클릭 이스터에그로 진입 — 선택 사항

---

## 6. 콘텐츠 원칙 (전 페이지 공통)

seed-design.io 의 문서적 리듬을 따른다.

1. **섹션 = 영문 라벨 + 한글 제목 더블 라인**으로 시작 ([02 §3.2](02-design-tokens.md))
2. 섹션 간 `--sp-section`, 카드 간 `--sp-lg`(24), 섹션 헤더-본문 `--sp-2xl`(48)
3. 본문 최대 폭 **68ch** — 넓은 컨테이너 안에서도 읽기 줄 길이를 제한
4. 한 섹션에 **주장 하나 + 근거 하나 + 시각물 하나**
5. 카드 그리드 3-up(데스크톱) / 2-up(태블릿) / 1-up(모바일), **카드 크기는 유지하고 컬럼 수만 줄인다**
6. 이미지에는 항상 캡션(`--t-caption`, `--fg-muted`)
7. 강조 우선순위: 큰 활자 → 색면 → bold → 밑줄 형광펜. **그림자·글로우 금지**

---

## 7. 완료 기준

- [ ] 4개 탭 + 로고 + 테마 토글이 사양대로 배치, 활성 탭이 현재 라우트와 항상 일치
- [ ] 탭 호버 = 밑줄 성장 **한 가지 신호만**, 키보드 포커스는 별도 표현
- [ ] 스크롤 방향에 따른 상단바 숨김/복귀 부드럽게 동작
- [ ] 모바일 오버레이: 포커스 트랩 · Esc · 배경 스크롤 잠금 · 라우트 변경 시 자동 닫힘
- [ ] Tab 키만으로 전 내비 도달 가능, Skip link 동작
- [ ] 라우트 전환 시 스크롤 top 복귀 + 톤 전환 부드러움
- [ ] `prefers-reduced-motion` 에서 Lenis·리빌·상단바 애니메이션 전부 정지
- [ ] Footer가 라이트 모드에서도 deep 유지
- [ ] 스크롤 성능: Chrome Performance 패널에서 60fps 유지, 레이아웃 시프트(CLS) 0.02 이하
