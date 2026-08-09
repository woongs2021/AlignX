# 강의용 Design System — v2

> 차분하고 학구적인 인상의 **프레젠테이션 · 콘텐츠 디자인 시스템**.
> 특정 서비스에 묶이지 않는 제너럴 토큰/규칙 모음이다. 강의 자료, 슬라이드 덱,
> 콘텐츠 페이지, 제품 UI 어디에나 적용할 수 있다.
> 토큰 원본은 `colors_and_type.css`를 참조한다.

---

## Overview

이 시스템은 **순백이 아닌 따뜻한 오프-화이트** (Canvas — `#FCFCFF`) 위에 짙은 잉크(Ink — `#010102`)를 얹는다. 시중의 차가운 그레이-슬레이트 톤과 의도적으로 거리를 두고, *학습지·강의 자료의 활자 호흡*을 디지털로 옮기는 것이 목표다.

디스플레이 헤드라인은 **Samsung Sharp Sans**를 weight 300으로 깔고, 본문/한국어는 **Pretendard** weight 400으로 받친다. 시각 표현은 **활자 · 색면 · 여백** 세 가지로만 — 이모지, 일러스트, 그림자, (코어 화면의) 그라디언트를 쓰지 않는다.

### 두 톤 가족, 두 맥락

브랜드의 전압은 두 갈래로 흐른다.

- **Cool tone** — *도구적 · 정보 · 데이터* 맥락. 차트, 대시보드, 진행 표시, 코드/결과 같은 *읽고 다루는* 화면.
- **Warm tone** — *대화적 · 감성 · 강조* 맥락. 메시지, 격려, 축하, 회고 같은 *말 걸고 다독이는* 화면.

두 팔레트는 한 페이지 안에서 섞이지 않는다. **"지금 이 화면이 도구인가, 대화인가"** 라는 질문이 곧 톤 결정의 기준이다.

각 가족은 다시 두 개의 **세트**를 갖는다 — 같은 맥락 안에서 결을 바꾸는 변주다.

| 가족 | 기존 세트 | 신규 세트 | `data-theme` |
|---|---|---|---|
| **Cool** | Blue | Mint | `cool` / `mint` |
| **Warm** | Orange | Violet (pink-leaning) | `warm` / `violet` |

한 페이지엔 한 세트만. 가족을 가로질러 섞지 않는다(Mint 카드 옆 Violet 카드 금지).

### 네 개의 표면 모드

1. **Canvas** (`#FCFCFF`) — 본문의 기본 바닥
2. **Soft surface** — 각 세트의 soft/tint 색 — 카드, 빈 상태, 섹션 분리
3. **Primary block** — 각 세트의 primary 색 — 풀블리드 CTA, 강조 모먼트
4. **Deep surface** — 각 세트의 deep 색 — 코드/결과/에디터 같은 도구 표면

Canvas ↔ Deep 대비와 톤 페어링이 페이지의 페이싱 리듬을 만든다.

### Key Characteristics

- 따뜻한 오프-화이트 캔버스(`#FCFCFF`) 위 짙은 잉크(`#010102`). 순백이 아닌 미세한 워시가 종이의 정서를 만든다.
- 두 톤 가족 × 두 세트. 한 페이지는 한 세트.
- 디스플레이는 Sharp Sans weight **300(Light)** 기본. 700은 *임팩트 모먼트*에만.
- 본문은 Pretendard weight 400. 700 bold는 한 문단에 한 문장(밑줄 친 핵심)만.
- **이모지·일러스트·그라디언트(코어)·그림자 없음.** 활자·색면·여백 셋으로만.
- 코너 라운드 단계적: tile 28px(시그니처) · frame 24px · lg 16px · md 12px · tag 5px · pill 999px.
- 섹션 간격 80px(챕터 호흡), 카드 내부 패딩 32px.

---

## Colors

### Cool 가족 — 도구 · 정보 · 데이터

**Blue 세트** (`data-theme="cool"`)
| Role | Name | Hex | Use |
|---|---|---|---|
| Primary | Kinetic Azure | `#4065F8` | 시그니처 액션, 메인 CTA, 차트 메인 바, 진행 표시 |
| Soft | Polar Dew | `#A1D0F6` | 부드러운 배경 카드, 빈 상태, 부가 정보 |
| Mid | Iron Navy | `#16427C` | 헤더 바, 강조 텍스트 (Primary↔Deep 중간) |
| Deep | Phantom Night | `#001C33` | 결과/코드/도구 표면, 다크 블록 |
| Tint | Luminous Ice | `#CAF7FF` | 인라인 형광펜 톤, 중요 문장 *밑줄* |
| Accent | Mystic Violet | `#9747FF` | 매우 절제된 보조색 (인사이트 뱃지 1곳) |
| Mute | Silver Moss | `#A8BFC1` | 비활성, 차분한 배경 (60% 투명 자주) |

**Mint 세트** (`data-theme="mint"`) — 같은 cool 맥락의 프레시한 변주
| Role | Name | Hex | 대응 |
|---|---|---|---|
| Primary | Kinetic Mint | `#10C19F` | Kinetic Azure |
| Soft | Polar Frost | `#A6E6D4` | Polar Dew |
| Mid | Pine Teal | `#156E5C` | Iron Navy |
| Deep | Phantom Pine | `#04221C` | Phantom Night |
| Tint | Luminous Jade | `#D4F7EC` | Luminous Ice |
| Accent | Electric Aqua | `#00E0BE` | Mystic Violet |
| Mute | Sage Moss | `#AEC4BB` | Silver Moss |

### Warm 가족 — 대화 · 감성 · 강조

**Orange 세트** (`data-theme="warm"`)
| Role | Name | Hex | Use |
|---|---|---|---|
| Primary | Terracotta Red | `#B85C4F` | 시그니처 액션, 강조 CTA, 축하 풀블리드 |
| Soft | Dusty Rose | `#C8847D` | 부드러운 강조, 카드 헤드라인 배경, '나' 말풍선 |
| Tint | Soft Nude Beige | `#EEDCD6` | 따뜻한 카드 표면, 응원/회고 노트 |
| Mute | Hard Nude Beige | `#A38E85` | 비활성·보조 텍스트 |
| Mid | Deep Cocoa Brown | `#754039` | 중간 무게 강조, 인용/격언 텍스트 |
| Accent | Auburn Flare | `#8C3124` | Primary의 active 상태 |
| Deep | Abyssal Red | `#771B0E` | 가장 진한 톤, 중대 알림 |

**Violet 세트** (`data-theme="violet"`, pink-leaning) — 부드럽고 다정한 변주
| Role | Name | Hex | 대응 |
|---|---|---|---|
| Primary | Orchid Magenta | `#B14D92` | Terracotta Red |
| Soft | Dusty Lilac | `#C896C0` | Dusty Rose |
| Tint | Soft Lilac Veil | `#EFDCEC` | Soft Nude Beige |
| Mute | Hazy Mauve | `#A38AA0` | Hard Nude Beige |
| Mid | Deep Plum | `#6A2A55` | Deep Cocoa Brown |
| Accent | Magenta Flare | `#9B2774` | Auburn Flare |
| Deep | Abyssal Plum | `#4C1039` | Abyssal Red |

### Surface & Text (공유, 모드-인지)

| Token | Light | Dark | Use |
|---|---|---|---|
| Canvas / `--bg` | `#FCFCFF` | `#010102` | 페이지 기본 바닥 |
| Ink / `--fg` | `#010102` | `#FCFCFF` | 헤드라인·본문 기본 색 |
| Muted ink | `rgba(1,1,2,0.6)` | `rgba(252,252,255,0.6)` | 캡션·메타·설명 |
| Stroke | `rgba(1,1,2,0.4)` | `rgba(252,252,255,0.4)` | 카드 외곽선·디바이더 |

테마는 `<html data-theme="cool" data-mode="light">` 형태로 지정한다. 컴포넌트 CSS는 `--bg`/`--fg`/`--primary`/`--soft`/`--deep` 등을 참조하고, 어느 팔레트가 활성인지는 신경 쓰지 않는다.

### Semantic

- **Warning** (`#FF105C`) — 시간 만료 임박, 마감 임박. 시스템에서 가장 *시끄러운* 색.
- **Success** — 일반 초록 대신 Warm primary(`#B85C4F`)로. 완료/성공도 브랜드 톤 안에서.
- **Info** — 별도 색 없이 Cool primary(`#4065F8`) 자체로.

---

## Gradient Palette

그라디언트는 코어 플랫 컬러 미감이 *아니다*. 표지/히어로/브랜드 모먼트/축하 카드에만 절제해서 쓴다. 모두 `-45°`, 같은 가족 내 톤-온-톤이 원칙.

- **Cool · Blue (C1–C5)** — Ice Azure · Polar Iron · Azure Night · Violet Azure · Moss Phantom
- **Warm · Orange (W1–W5)** — Beige Rose · Rose Terracotta · Terracotta Cocoa · Sand Auburn · Terracotta Abyssal
- **Cool · Mint (MT1–MT5)** — Jade Mint · Frost Pine · Mint Pine · Aqua Mint · Sage Pine
- **Warm · Violet (VT1–VT5)** — Veil Lilac · Lilac Orchid · Orchid Plum · Ash Magenta · Orchid Abyssal
- **교차 (가족 내)** — BM(Blue×Mint): Azure Mint·Ice Jade·Dew Frost·Night Pine / OV(Orange×Violet): Terracotta Orchid·Beige Lilac·Rose Lilac·Abyssal Twin
- **혼합 (Cool×Warm, 예외적)** — 직접 보색 충돌을 피한 채도/딥 페어(M1–M4)와 저채도 소프트 페어(S1–S4). 두 톤을 잇는 *전환 모먼트*에만.

---

## Typography

### Font Family

- **Samsung Sharp Sans** — 영문 디스플레이 헤드라인, 큰 숫자, 라벨. 기본 weight **300(Light)**, 500은 카드 타이틀, 700은 임팩트 모먼트에만.
- **Pretendard Variable** — 한국어 본문·헤드라인. 기본 weight **400**, 700은 한 문장 강조에만.
- **Inter** Medium — 12px UI 라벨 전용(페이지 번호, 태그, 마이크로 라벨).
- **JetBrains Mono** — 코드 블록·데이터 출력.

**폴백 스택**
- Display: `"Samsung Sharp Sans", "Pretendard Variable", system-ui, sans-serif`
- Body: `"Pretendard Variable", "Pretendard", "Samsung Sharp Sans", system-ui, sans-serif`
- Label: `"Inter", "Pretendard Variable", system-ui, sans-serif`
- Mono: `"JetBrains Mono", "SF Mono", Consolas, monospace`

### Hierarchy

**Display — English (Sharp Sans Light)**
| Token | Size | Weight | Line / Tracking | Use |
|---|---|---|---|---|
| en-h1 | 128px | 300 | 0.95 / -0.01em | 표지·1차 헤드라인 |
| en-h2 | 100px | 300 | 0.96 / -0.01em | 섹션 오프너 |
| en-h3 | 80px | 300 | 1.0 / -0.005em | 큰 숫자·결과 |
| en-h4 | 72px | 300 | 1.05 | 페이지 메인 제목 |
| en-h5 | 64px | 300 | 1.1 | 카드 헤드라인 |
| impact | 200px | 700 | 0.85 / -0.02em | 임팩트 모먼트 *전용*, 페이지당 1회 |

**Heading — Korean (Pretendard)**
| Token | Size | Weight | Use |
|---|---|---|---|
| kr-h1 | 110px | 400 | 표지 한국어 메인 |
| kr-h2 | 86px | 400 | 섹션 오프너 한국어 |
| kr-h3 | 78px | 400 | 페이지 한국어 제목 |
| kr-h4 | 68px | 400 | 카드 한국어 헤드 |
| kr-h5 | 58px | 500 | 모듈/콘텐츠 카드 제목 |
| kr-h6 | 44px | 500 | 부제목·섹션 라벨 |

**Body & Labels**
| Token | Size | Weight | Use |
|---|---|---|---|
| subtitle | 48px | 400 | 표지 한국어 부제 |
| lead | 32px | 400 | 챕터 도입부 리드 |
| body | 24px | 400 | 본문 기본 |
| body-sm | 20px | 400 | 카드 내부 본문 |
| meta | 18px | 400 | 보조 텍스트 |
| caption | 14px | 500 | 캡션·푸터 |
| label | 12px | 500 | UI 라벨 (Inter, 대문자 트래킹) |

### Principles

- **Light가 기본, Bold는 사건이다.** 디스플레이는 weight 300으로. 700은 페이지당 한 번 있는 모먼트에만.
- **영문 + 한국어 더블 라인이 시그니처.** 영문(Sharp Sans Light)으로 *명사*를, 한국어(Pretendard Regular)로 *문장*을 잇는다.
  ```
  OVERVIEW              ← Sharp Sans Light 128px
  한눈에 보는 핵심 정리   ← Pretendard Regular 48px
  ```
- **Negative tracking은 디스플레이의 호흡.** 80px+ 헤드라인은 -0.01em 이상 음수 트래킹 필수. 양수 트래킹은 12px 라벨에서만.
- **Bold body는 한 문장만.** 한 문단의 `<strong>`은 한 번.

### Note on Font Substitute

Samsung Sharp Sans는 400/500/700만 번들되어 있고 **Light(300) 파일이 없다.** 현재 weight 300은 Pretendard로 폴백한다. 이상적인 light 인상을 위해선 Sharp Sans Light `.otf` 추가가 필요하다(라이선스 확인 필요).

---

## Layout

### Spacing

- **Base unit:** 2px (활자 미세 정렬용 절반 단위 허용)
- **Tokens:** xs 8 · sm 10 · md 14 · lg 24 · xl 32 · 2xl 48 · section 80 · bleed 56(슬라이드 외곽 패딩)
- **섹션 간격:** 80px(챕터 호흡)
- **카드 내부 패딩:** 32px / 풀블리드 강조 블록: 48px

### Grid & Container

- **데스크톱 max-width:** 1280px(교과서 폭)
- **모바일 우선 단일 컬럼**, 데스크톱에서 12-column 그리드로 확장
- **카드 그리드:** 데스크톱 3-up, 태블릿 2-up, 모바일 1-up
- **분할 레이아웃:** 본문/콘텐츠가 항상 우선 폭을 갖고, 보조 사이드바는 종속

### Whitespace Philosophy

읽기 위한 여백을 남긴다. 카드 사이 24px, 카드-섹션 헤더 48px, 섹션-섹션 80px — 모든 간격이 활자의 줄간격과 비례한다. **한 화면에 한 가지 일** — 사이드바·툴바·플로팅 버튼을 동시에 띄우지 않는다.

### Slide Canvas

- 기본 캔버스 1920 × 1080, 외곽 패딩 56px, 타이틀바 높이 80px.
- 슬라이드 셸 클래스: `.slide` + `.slide--primary` / `.slide--soft` / `.slide--deep` / `.slide--muted`.
- deep/primary 배경에서는 헤드라인이 자동으로 흰색으로 반전된다.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | 그림자 없음, 외곽선 없음 | 본문 섹션, 풀블리드 헤더 |
| Hairline | 1px stroke | 카드, 입력, 디바이더 — 기본 깊이 |
| Soft surface | soft/tint 배경 | 콘텐츠 카드, 대화 카드 |
| Deep surface | deep 배경 | 결과/코드/도구 표면 |
| Drop shadow | **사용 안 함** | — |

**색면 우선, 그림자 없음.** 깊이는 Canvas → Soft surface → Card 의 *표면 색 단계*에서 나온다. 라이트 카드 위에 라이트 카드를 쌓지 않는다.

### Decorative Depth

- **밑줄 형광펜:** Cool은 Luminous Ice(`#CAF7FF`), Warm은 Dusty Rose(`#C8847D`)를 텍스트 뒤에 50% 알파로 — *학습지 형광펜* 표현.
- **번호 매김:** 챕터/항목 번호는 큰 숫자로 단독 배치(Sharp Sans Light 200px+). 아이콘이 아닌 *숫자 자체가 시각 요소*.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| xs | 4px | 인라인 태그, 인풋 내부 칩 |
| tag | 5px | 콘텐츠 그룹 컨테이너 |
| sm | 8px | 작은 버튼, 드롭다운 아이템 |
| md | 12px | 입력 필드, 일반 버튼 |
| lg | 16px | 콘텐츠 카드 |
| frame | 24px | 큰 컨테이너, 시트, 모달, 슬라이드 프레임 |
| **tile** | **28px** | 색상 스와치, 모듈 카드 — **시그니처** |
| pill | 999px | 상태 핀, 진행 단계 |
| full | 50% | 아바타 |

**28px tile radius**가 시각적 시그니처다 — 흔한 8/12px보다 눈에 띄게 둥글다.

### Photography & Illustrations

- **사진/일러스트 사용 안 함.** 인물 표현이 필요하면 *모노톤 처리된 40px 원형 아바타*만.
- 빈 상태·온보딩엔 일러스트 대신 **큰 활자와 색면**.
- **차트는 활자 미니멀** — 격자·그라디언트 없이 단색 면 + 큰 숫자 라벨.
- 실 자산 미정 시 `[Asset placeholder — TBD]` 텍스트 박스로 명시.

---

## Components

토큰 참조로만 기술한다(인라인 hex 금지). 변형은 `-cool`/`-warm`/`-deep`/`-active` 접미사로.

### Navigation & Title

- **`top-nav`** — 80px 상단 고정 네비. Canvas 배경, 1px hairline 하단 보더. 좌측 워드마크, 중앙 메뉴, 우측 액션. 메뉴는 12px Medium 대문자.
- **`top-nav-deep`** — 진행/집중 모드의 다크 버전. deep 배경 + 흰색 텍스트.
- **`page-title-bar`** — 80px 풀블리드 바. 좌측 라벨 + 우측 페이지 번호의 `space-between`. 배경별 변형: `.azure`(primary 위 흰색), `.peach`(tint 위 ink), `.deep`(deep 위 흰색).

### Buttons

- **`button-primary-cool` / `-warm`** — 톤별 시그니처 CTA. primary 배경 + 흰색, 12px Medium 대문자, 패딩 14×24, 높이 44, radius 12. active 시 mid/accent로 어두워짐.
- **`button-secondary`** — Canvas + 1px ink hairline. 톤과 무관한 *중성 액션*.
- **`button-ghost`** — 배경 없음, 텍스트만. 톤별 mid 컬러.
- **`button-text-link`** — 인라인 링크. 밑줄은 호버에서만.

### Cards & Containers

- **`module-card`** — Canvas + 1px hairline, radius 28, 패딩 32. 상단 큰 숫자 + 한국어 제목 + 설명/진행 핀.
- **`module-card-active`** — soft 배경으로 전환. 상태가 색으로 드러난다.
- **`coaching-card`** — 대화/메시지 카드. soft/tint 배경, radius 28, 외곽선 없음. 40px 원형 아바타 + 이름 + 한 줄 코멘트.
- **`result-card-deep`** — 결과/요약 카드. deep 배경 + 흰색, radius 24, 패딩 48. 큰 숫자 + 항목별 막대 + 다음 액션.
- **`celebration-card`** — 축하/임팩트 발표. primary 풀블리드, 흰색, radius 24, 패딩 64. 헤드라인 200px Bold(700이 등장하는 거의 유일한 자리).
- **`code-window`** — 코드/원고 표면. deep 배경, 라인 넘버, JetBrains Mono 14px. 글자 수 카운터는 우상단 라벨.
- **`spec-card`** — 첨삭/주석 카드. Canvas + 1px hairline, radius 16, 패딩 24. 좌 원문 / 우 코멘트. 키워드는 tint 50% 알파 형광펜.
- **`stat-tile`** — 큰 숫자 + 라벨. radius 28, 패딩 32. 숫자가 카드 면적 절반을 차지(Sharp Sans Light 100–128px).

### Inputs & Forms

- **`text-input`** — Canvas 배경, body-sm(20px), radius 12, 패딩 14×18, 높이 48, 1px hairline.
- **`text-input-focused`** — 외곽선이 톤별 primary로 + 3px primary-15% 글로우.
- **`textarea-essay`** — 큰 입력 영역. radius 16, 패딩 32, 우하단 글자 수 카운터(임계 시 Warning 전환).
- **`select`** — text-input + 우측 chevron.
- **`progress-bar`** — 높이 6px, radius pill. 진행 면은 톤별 primary. 위에 라벨.

### Tags / Badges

- **`badge-pill`** — Canvas + 1px hairline, 12px, radius pill, 패딩 6×14.
- **`badge-cool` / `-warm`** — 톤별 primary 배경 + 흰색.
- **`badge-warning`** — Warning 배경 + 흰색.
- **`badge-status-dot`** — 8px 원형 점 + 라벨(진행=primary, 완료=warm primary, 대기=mute).

### Tab / CTA / Footer

- **`tab-row`** — 비활성: 투명 + muted 텍스트 / 활성: soft 배경 + ink + 하단 2px primary 인디케이터. radius 8.
- **`cta-band-cool` / `-warm` / `-deep`** — 풀블리드 액션 호출. primary/deep 배경, 흰색, radius 24, 패딩 64. 헤드라인 + inverted 버튼.
- **`footer`** — deep 다크 푸터. 텍스트 흰색 70% 알파. 4컬럼 데스크톱 / 1컬럼 모바일. 절대 라이트로 인버트하지 않는다.

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | 햄버거 네비; 디스플레이 128→56px; 그리드 1-up |
| Tablet | 768–1024px | 네비 압축; 그리드 2-up; 분할 레이아웃 유지 |
| Desktop | 1024–1440px | 전체 메뉴; 그리드 3-up |
| Wide | > 1440px | 외곽 여백 증가; max-width 1280px 고정 |

### 규칙

- **Touch targets:** 버튼 최소 44×44, 입력 높이 48. 진행 바는 6px이지만 탭 영역 상하 16px 확장.
- **Collapsing:** 분할 레이아웃은 모바일에서 세로 스택 또는 탭 전환. 그리드는 컬럼 수만 줄이고 카드 크기는 유지(가독성 우선).
- **Type scaling:** 디스플레이 데스크톱 100% → 태블릿 75% → 모바일 50%. **본문 24px은 모바일에서도 유지**(16px로 줄이지 않음). 라벨 12px은 모바일에서 13px로 *오히려 키운다*.
- **Image:** 아바타는 항상 원형. 차트는 모바일에서 세로형으로. 코드 윈도우는 가로 스크롤(줄바꿈 금지).

---

## Do's and Don'ts

### Do
- 모든 페이지를 Canvas(`#FCFCFF`)로 시작한다.
- **컨텍스트로 톤을 결정한다** — 도구/정보/데이터는 Cool, 대화/감성/강조는 Warm.
- 헤드라인은 Sharp Sans Light + Pretendard Regular의 더블 라인.
- weight 700은 페이지당 한 번(임팩트 모먼트에만).
- 카드 라운드 기본 28px.
- 여백은 줄간격과 비례(24 / 48 / 80).

### Don't
- 이모지·일러스트·(코어)그라디언트를 쓰지 않는다.
- Cool과 Warm을, 또는 가족 내 두 세트를 한 페이지에 섞지 않는다.
- 디스플레이 헤드라인을 weight 500 이상으로 키우지 않는다.
- 그림자를 넣지 않는다 — 깊이는 표면 색 단계로.
- 순백(`#FFFFFF`)·순흑(`#000000`)을 쓰지 않는다.
- Bold 본문을 한 문단에 두 문장 이상 쓰지 않는다.
- 차트에 그라디언트를 쓰지 않는다.

---

## Iteration Guide

1. **컴포넌트 하나에 집중한다.** 변형(`-active`/`-deep`/`-cool`/`-warm`)은 별도 엔트리로.
2. **토큰 참조만 사용한다.** 인라인 hex 금지.
3. Hover는 문서화하지 않는다. Default와 Active/Pressed만.
4. **디스플레이는 Sharp Sans Light, 본문은 Pretendard Regular** — 이 분담은 깨지 않는다.
5. **두 톤 가족이 시스템의 척추다.** 세 번째 *가족*을 추가하지 않는다. 각 가족의 두 세트는 결 변주일 뿐, 한 페이지엔 한 세트만.
6. 강조 우선순위: *큰 활자* → *색면* → *bold* → *밑줄 형광펜*. 그림자·글로우는 절대 사용 안 함.
7. **컨텐츠 → 톤 매핑을 먼저 결정한다.** 새 화면을 그리기 전에 *이건 도구인가, 대화인가* 부터.

---

## Known Gaps

- **Samsung Sharp Sans Light(300) 파일 부재** — 현재 400/Pretendard로 폴백. Light `.otf` 추가 필요.
- **차트 컴포넌트 미정의** — *큰 숫자 + 단색 면* 원칙은 정해졌으나 실제 스타일링 미완.
- **알림/토스트 시스템 미정의** — 별도 컴포넌트 시트 필요.
- **외부 브랜드(SSO 등) 색 통합 규칙 미해결.**
- **인쇄용(PDF) 템플릿 미정의** — 활자 스케일·여백·페이지 번호 양식.
- **다국어 본문 가이드 미정의** — 영문 본문이 길어질 때의 디스플레이/본문 비율.
- **다크 모드 채도 보정 검증 필요** — 라이트 기준 수치가 다크에서 *너무 밝게* 보이는 케이스.

---

## 관련 파일

| 파일 | 내용 |
|---|---|
| `colors_and_type.css` | 전체 토큰 원본 (4세트 컬러 + 그라디언트 + 타이포 + 슬라이드 셸) |
| `ui_kits/presentation/index.html` | Presentation UI Kit |
| `preview/*.html` | Design System 탭 카드 소스 |
| `woongdesignv2.md` | (이 문서) 제너럴 디자인 시스템 가이드 |
