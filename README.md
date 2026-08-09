# AlignX

**데이터로 검증하는 합격 포트폴리오**
AI 10대 원칙 분석과 현직 멘토 검증을 한 번에 — 디자인 포트폴리오를 3단계로 진단하는 웹 서비스.

> **현재 상태: 📋 계획 완료 · 코드 미착수**
> `Plans/` 에 Phase 00–13 구현 계획이 작성되어 있다. 구현은 [Phase 01](Plans/01-setup-infra.md) 부터 시작한다.
> 배포 후 이 문서에 라이브 링크와 스크린샷이 추가된다 ([Phase 13 §6](Plans/13-deploy-docs.md)).

---

## 무엇을 만드는가

포트폴리오 피드백은 대개 "느낌"에 의존한다. 같은 포트폴리오를 두 심사자가 정반대로 평가하는 일이 흔하다.
AlignX는 그 판단을 **10개 축으로 분해해 정량화**하고, 그 위에 **사람 멘토의 검증**을 덧대 한 장의 리포트로 묶는다.

```
포트폴리오 업로드
      ↓
① AI 분석        10대 비주얼·UX 원칙 채점 → 총점 0–100
      ↓
② 멘토 검증      현직 멘토 3인이 6단계로 리뷰 (실시간 진행 확인)
      ↓
③ 통합 리포트    AI + 사람 결과 대조 → HTML 다운로드
```

---

## 사이트 구성

| 탭 | 경로 | 내용 |
|---|---|---|
| **HOME** | `/` | Melius형 **무한 확산 이미지 히어로** · 서비스 소개 |
| **PORTFOLIO 분석** | `/portfolio` | 인트로 → 3단계 분석 마법사 |
| **AlignX AI** | `/alignx` | 분석 모델 소개 · 10대 원칙 상세 · 파이프라인 |
| **MY** | `/my` | 진행 상태 · 회차 카드 · 3회 이상 시 이력 분석 해금 |
| **ABOUT** | `/about` | 서비스 소개 · 멘토 · FAQ |
| *(히든)* ADMIN | `/admin` | 암호 인증 · 제출 현황 · 멘토 피드백 작성 |

**포트폴리오 분석 3단계**

| 단계 | 경로 | 핵심 |
|---|---|---|
| 1 · AI 분석 | `/portfolio/analyze` | 드래그앤드롭 / 파일 선택 · PDF·PNG·JPEG·GIF · 6단계 로딩 · 10원칙 점수 |
| 2 · 멘토 검증 | `/portfolio/mentor` | 문서 자동 첨부 · 이름/주제/요청사항 · 7점 척도 3항목 · 주관식 후기 → 실시간 검증 모니터 |
| 3 · 통합 리포트 | `/portfolio/report` | AI ↔ 멘토 원칙별 대조 · 종합 점수 · **단일 HTML 다운로드** |

---

## AI 10대 원칙

| # | 원칙 | English | 배점 |
|---|---|---|---|
| 1 | 시각적 위계 | Visual Hierarchy | 10 |
| 2 | 레이아웃 · 그리드 정합성 | Layout & Grid | 10 |
| 3 | 타이포그래피 | Typography | 10 |
| 4 | 컬러 · 대비 | Color & Contrast | 10 |
| 5 | 여백 · 리듬 | Whitespace & Rhythm | 10 |
| 6 | 일관성 | Consistency | 10 |
| 7 | 정보 구조 · 스토리텔링 | IA & Narrative | 10 |
| 8 | 문제 정의 · 리서치 근거 | Problem Framing & Research | 10 |
| 9 | 인터랙션 · 사용성 | Interaction & Usability | 10 |
| 10 | 결과 · 임팩트 증명 | Outcome & Impact | 10 |

총점 = 단순 합산(0–100) · 등급 `S 90+ / A 80–89 / B 70–79 / C 60–69 / D <60`

> ⚠️ **MVP의 점수는 실제 AI 추론이 아니라 결정론적 더미 생성기의 출력이다.** 파일 지문을 시드로 쓰므로 같은 파일은 항상 같은 점수가 나온다. 실제 AlignX 모델은 [`AnalysisProvider` 인터페이스](Plans/05-portfolio-step1.md) 한 줄 교체로 연결된다.

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 빌드 | Vite 6 |
| UI | React 19 · TypeScript |
| 라우팅 | React Router v7 (`BrowserRouter` + `basename`) |
| 상태 | Zustand + persist (localStorage) |
| 스타일 | **CSS Custom Properties + CSS Modules** — 디자인 시스템이 토큰 참조만 허용 |
| 모션 | motion · Lenis |
| PDF | pdfjs-dist |
| 테스트 | Vitest · Testing Library |
| 배포 | GitHub Pages + GitHub Actions |

**백엔드가 없다.** 모든 데이터는 브라우저 `localStorage` 에만 저장된다.

---

## 디자인 시스템

기준 문서: [`woongdesignv2.md`](woongdesignv2.md)

- **캔버스** 따뜻한 오프화이트 `#FCFCFF` ↔ 잉크 `#010102` (순백·순흑 미사용)
- **4개 톤 세트** — Cool(Blue/Mint) = 도구·데이터 / Warm(Orange/Violet) = 대화·감성. **한 페이지엔 한 세트만**
- **폰트** Montserrat(영문 디스플레이, weight 300) + Pretendard(한글 본문, weight 400) — 자체 호스팅
- **그림자 없음** — 깊이는 표면 색 단계(canvas → tint/soft → deep)로만
- **이모지 · 일러스트 · 코어 그라디언트 없음**
- 카드 라운드 **28px**(시그니처) · 여백 리듬 24 / 48 / 80
- weight 700은 **페이지당 한 번**, 임팩트 모먼트에만

### 라우트별 톤 매핑

| 라우트 | 톤 |
|---|---|
| `/`, `/portfolio`, `/portfolio/analyze`, `/portfolio/report`, `/admin` | Cool · Blue |
| `/portfolio/mentor` | Warm · Orange |
| `/alignx` | Cool · Mint |
| `/my` | Warm · Orange |
| `/about` | Warm · Violet |

### 라이트 / 다크 모드

상단바 **우측 고정** 아이콘으로 전환. 초기값은 `localStorage` → 없으면 시스템 설정. 인라인 부트 스크립트로 깜빡임(FOUC) 방지.

### 원본 대비 의도적 이탈 3건

| 항목 | woongdesignv2 | 이 프로젝트 | 사유 |
|---|---|---|---|
| 디스플레이 폰트 | Samsung Sharp Sans | **Montserrat** | 프로젝트 요구 |
| 사진 · 일러스트 | 사용 안 함 | **썸네일 적극 사용** | 히어로·콘텐츠 요구 |
| 본문 크기 | 24px | **웹 스케일 18px** | 슬라이드(1920×1080) 수치를 웹 본문에 그대로 쓰면 가독성 붕괴 |

### 폰트 구성

`public/fonts/` 에 woff2 4개, 약 856KB를 자체 호스팅한다. CDN 의존 없음.

| 파일 | 커버 | 크기 |
|---|---|---|
| `Montserrat-latin.woff2` | Variable(wght 100–900) · **라틴 전용** `unicode-range` | ~50KB |
| `Pretendard-{Regular,Medium,Bold}.subset.woff2` | 한글 400 / 500 / 700 | 각 ~267KB |

- Montserrat Variable 하나로 디스플레이 300 · 카드 500 · 임팩트 700을 모두 커버한다
- 덕분에 `woongdesignv2.md` 가 미해결로 남긴 **"디스플레이 Light(300) 파일 부재"** 문제가 해소된다
- Montserrat의 `unicode-range` 라틴 한정이 핵심이다 — 없으면 한글까지 Montserrat이 매칭돼 Pretendard가 로드되지 않는다
- preload는 Pretendard Regular + Montserrat 2개만. 초기 폰트 전송량 350KB 이하가 목표
- 두 폰트 모두 **OFL 1.1** — 라이선스 원문을 `public/fonts/` 에 함께 배포한다 (재배포 조건)

원본 `Font/` 74MB는 저장소에 커밋하지 않는다. 변환 산출물만 커밋한다.

---

## 로컬 실행

```bash
npm install
npm run assets     # Thumbnails / Portfolio-samples → 최적화 에셋 생성 (최초 1회)
npm run dev
```

| 스크립트 | 내용 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | Vitest |
| `npm run lint` | ESLint (`--max-warnings 0`) |
| `npm run assets` | 폰트 변환 + 이미지 최적화 + PDF 프리뷰 추출 |

> `npm run assets` 는 필수다. 원본 에셋이 **328MB**(썸네일 44MB + 샘플 PDF 210MB + 폰트 74MB)라 그대로는 배포할 수 없다. 스크립트가 폰트 서브셋·WebP 변환·PDF 1페이지 추출을 수행해 `public/` 을 8MB 이하로 만든다.
>
> 폰트 변환은 최초 1회만 필요하고 결과가 커밋되므로, 이후 실행에서는 자동으로 건너뛴다.

---

## 썸네일 교체 방법

콘텐츠 썸네일은 **코드를 건드리지 않고** 교체할 수 있다.

```
public/images/
├─ hero/          # HOME 히어로 이미지
├─ thumbs/        # 각 페이지 섹션 썸네일 ← 여기를 교체
├─ brand/         # 로고
├─ manifest.json  # 파일명 → 표시 위치 · alt 텍스트 매핑
└─ README.md      # 교체 규칙
```

1. `public/images/thumbs/` 의 파일을 **같은 이름으로 덮어쓴다**
2. `npm run assets` 실행
3. 끝 — 코드 수정 불필요

권장: 16:10 비율 · 원본 폭 2400px 이상 · 최적화 후 300KB 이하.
컴포넌트는 파일 경로를 하드코딩하지 않고 `manifest.json` 을 통해서만 이미지를 참조한다.

---

## ADMIN 접근

`/admin` → 암호 입력 (`portfolio2026`) · 눈 아이콘 토글로 입력값 표시/숨김

**할 수 있는 일**
- 전체 포트폴리오 제출 현황 조회 (상태 필터 · 검색 · 정렬)
- 멘토 요청 건에 대한 실제 피드백 작성 (원칙별 코멘트 · 종합 코멘트 · 멘토 점수)
- 검증 단계 수동 진행 / 즉시 완료 처리
- `Portfolio-samples/` 기반 샘플 10건으로 화면 확인

### ⚠️ 보안 고지

**이 암호는 실제 접근 통제가 아니다.** 프론트엔드 번들에 평문으로 포함되므로 브라우저 개발자도구에서 누구나 볼 수 있다. 데모용 화면 구분 장치로만 취급한다.

또한 ADMIN은 **같은 브라우저의 `localStorage` 데이터만** 조회한다. 다른 기기에서 제출된 내용은 원리적으로 볼 수 없다.

실제 운영에는 서버 측 인증이 필수다.

---

## 알려진 제약

| 제약 | 내용 |
|---|---|
| 백엔드 없음 | 모든 데이터가 브라우저에만 저장된다. 기기·브라우저를 바꾸면 사라진다 |
| AI 점수는 더미 | 결정론적 시뮬레이션. 실제 모델 추론이 아니다 |
| 멘토 검증은 시뮬레이션 | 타이머 기반 진행. ADMIN에서 수동 개입 가능 |
| 저장 용량 5MB | 업로드 원본은 저장하지 않고 640px 프리뷰만 보관. 회차 20개 초과 시 오래된 프리뷰부터 정리 |
| 실기기 데이터 공유 불가 | 학생 화면과 ADMIN이 같은 브라우저에 있어야 연동된다 |

---

## 배포 (GitHub Pages)

`main` 브랜치에 push하면 GitHub Actions가 lint → test → build → deploy를 수행한다.

```
https://{OWNER}.github.io/{REPO}/
```

**설정**
1. 저장소 Settings → Pages → Source = **GitHub Actions**
2. `vite.config.ts` 의 `base` 를 저장소명과 일치시킨다 (`/AlignX-dev/`)
3. `public/.nojekyll` 유지 — 없으면 Vite 산출물이 404가 난다
4. `public/404.html` SPA 리다이렉트 심으로 딥링크 지원

자세한 절차: [Phase 13](Plans/13-deploy-docs.md)

---

## 디렉터리 구조

```
AlignX-dev/
├─ Plans/                  # 구현 계획 (Phase 00–13)
├─ public/
│  ├─ fonts/  images/  samples/
│  ├─ 404.html  .nojekyll
├─ scripts/                # 에셋 최적화
├─ src/
│  ├─ styles/              # tokens.css — hex가 존재하는 유일한 파일
│  ├─ layout/  pages/  components/
│  ├─ features/            # analysis · mentor · report
│  ├─ store/  data/  lib/  types/
├─ Thumbnails/             # 원본 이미지 (소스, 커밋)
├─ Portfolio-samples/      # 원본 PDF (gitignore — 210MB)
├─ Font/                   # 원본 폰트 (gitignore — 74MB, 산출물만 커밋)
├─ AlignX/  References/
├─ CLAUDE.md               # 작업 원칙
├─ woongdesignv2.md        # 디자인 시스템
└─ README.md
```

---

## 구현 계획

| Phase | 문서 | 내용 |
|---|---|---|
| 00 | [개요 · 전제 · 의사결정](Plans/00-overview.md) | 미해결 질문 7건 · 데이터 모델 · 톤 매핑 · 에셋 인벤토리 |
| 01 | [프로젝트 셋업 · 인프라](Plans/01-setup-infra.md) | 스캐폴드 · 라우팅 · 스토어 · 에셋 파이프라인 |
| 02 | [디자인 시스템 토큰화](Plans/02-design-tokens.md) | 컬러 4세트 · 웹 타입 스케일 · 다크 모드 |
| 03 | [레이아웃 · 내비게이션](Plans/03-layout-navigation.md) | TopNav · 탭 호버 · 스크롤 시스템 · Footer |
| 04 | [HOME](Plans/04-home.md) | 무한 확산 히어로 · 성능 가드 |
| 05 | [분석 1단계](Plans/05-portfolio-step1.md) | 업로드 · 로딩 · 10원칙 스코어링 · 모델 교체 경계면 |
| 06 | [분석 2단계](Plans/06-portfolio-step2.md) | 멘토 제출 폼 · 7점 척도 · 실시간 검증 모니터 |
| 07 | [분석 3단계](Plans/07-portfolio-step3.md) | 통합 리포트 · HTML 다운로드 |
| 08 | [AlignX AI · ABOUT](Plans/08-alignx-about.md) | 모델 소개 · 서비스 소개 · FAQ |
| 09 | [MY](Plans/09-my.md) | 회차 분기 · 이력 분석 · 성장 차트 |
| 10 | [ADMIN](Plans/10-admin.md) | 암호 게이트 · 제출 현황 · 피드백 작성 |
| 11 | [반응형 · 접근성 · 성능](Plans/11-responsive-a11y-perf.md) | WCAG AA · Lighthouse 목표 |
| 12 | [**최종 코드 검수**](Plans/12-code-review.md) | 자동 검사 · 요구사항 대조 · E2E 시나리오 |
| 13 | [배포 · 문서화](Plans/13-deploy-docs.md) | GitHub Pages · Actions · README |

---

## 착수 전 확인이 필요한 사항

계획 단계에서 원문 요구가 갈리거나 에셋이 비어 있는 지점을 정리했다. 답변이 없으면 괄호 안 가정으로 진행한다.

| # | 쟁점 | 가정 |
|---|---|---|
| 1 | "4개 탭"이라 했으나 5개가 나열됨 | 로고(HOME) + 내비 탭 4개 |
| 2 | "Home은 기본적인" 문장이 끊김 | 홍보 화면으로 해석 |
| 3 | "무한으로 넓게 퍼지는" 히어로 해석 | 무한 가로 마퀴 + 스크롤 확산 (대안 B안 병기) |
| 4 | MY 이력 분석 해금 "n회" | **3회** |
| 5 | AlignX AI 영상 에셋 미제공 | 로고 SVG 모션으로 대체, `<video>` 슬롯 유지 |
| ~~6~~ | ~~폰트 바이너리 부재 (P0)~~ | ✅ **해결** — Montserrat Variable TTF · Pretendard woff2 전 세트 확보 |

**현재 P0 블로커 없음.** [Phase 01](Plans/01-setup-infra.md) 부터 착수 가능하다.

---

## 작업 원칙

이 저장소의 모든 작업은 [`CLAUDE.md`](CLAUDE.md) 를 따른다.

1. **Think Before Coding** — 가정을 명시하고, 해석이 갈리면 묻는다
2. **Simplicity First** — 요청 범위를 넘는 추상화·설정 가능성을 만들지 않는다
3. **Surgical Changes** — 변경된 모든 줄이 요구사항으로 추적되어야 한다
4. **Goal-Driven Execution** — 각 Phase는 검증 가능한 완료 기준을 가진다

---

## 크레딧 · 라이선스

- 디자인 시스템: [`woongdesignv2.md`](woongdesignv2.md)
- 레퍼런스: [melius.com](https://www.melius.com/) (히어로 인터랙션) · [seed-design.io](https://seed-design.io/) (내비게이션 · 콘텐츠 구조)
- 폰트: [Montserrat](https://github.com/JulietaUla/Montserrat) (OFL 1.1) · [Pretendard](https://github.com/orioncactus/pretendard) (OFL 1.1) — 라이선스 원문은 `public/fonts/` 에 동봉
- 샘플 포트폴리오: 교육 목적 · 저장소 미포함 · 화면의 학생 이름은 전부 가상

---

*AlignX는 현재 MVP 데모입니다. 분석 결과는 참고 지표이며 최종 판단은 사용자에게 있습니다.*
