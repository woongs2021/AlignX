# Phase 00 — 프로젝트 개요 · 전제 · 의사결정

> AlignX — 포트폴리오 분석 웹사이트 구현 계획의 **인덱스이자 계약서**.
> 이후 모든 Phase는 이 문서의 전제·토큰·데이터 모델을 따른다.
> 작성일 2026-08-09 · 코드 구현 착수 전 단계

---

## 1. 한 줄 정의

**AlignX** 는 디자인 포트폴리오를 *AI 10대 원칙 스코어링* → *사람 멘토 검증* → *통합 리포트* 3단계로 검증해주는 서비스이며,
이 저장소는 그 서비스의 **정적 프론트엔드 MVP**(백엔드 없음, GitHub Pages 배포)를 만든다.

---

## 2. Phase 인덱스

| Phase | 문서 | 산출물 | 선행 |
|---|---|---|---|
| 00 | [00-overview.md](00-overview.md) | 전제·토큰 계약·데이터 모델 | — |
| 01 | [01-setup-infra.md](01-setup-infra.md) | Vite+React 스캐폴드, 라우팅, 스토어, 에셋 파이프라인 | 00 |
| 02 | [02-design-tokens.md](02-design-tokens.md) | `tokens.css`, 폰트, 라이트/다크 모드 | 01 |
| 03 | [03-layout-navigation.md](03-layout-navigation.md) | TopNav(테마 토글), Footer, 스크롤·호버 시스템 | 02 |
| 04 | [04-home.md](04-home.md) | HOME — Melius형 무한 확산 히어로 | 03 |
| 05 | [05-portfolio-step1.md](05-portfolio-step1.md) | 분석 인트로 + 1단계(업로드·AI 스코어링) | 03 |
| 06 | [06-portfolio-step2.md](06-portfolio-step2.md) | 2단계(멘토 제출 폼 + 실시간 검증 모니터) | 05 |
| 07 | [07-portfolio-step3.md](07-portfolio-step3.md) | 3단계(AI+사람 통합 리포트, HTML 다운로드) | 06 |
| 08 | [08-alignx-about.md](08-alignx-about.md) | AlignX AI 페이지 + ABOUT 페이지 | 03 |
| 09 | [09-my.md](09-my.md) | MY — 진행 상태·회차 카드·전체 이력 분석 | 07 |
| 10 | [10-admin.md](10-admin.md) | ADMIN — 암호 게이트·제출 현황·멘토 피드백 | 06 |
| 11 | [11-responsive-a11y-perf.md](11-responsive-a11y-perf.md) | 반응형·접근성·성능 통과 기준 | 04–10 |
| 12 | [12-code-review.md](12-code-review.md) | **최종 코드 검수** 체크리스트·게이트 | 11 |
| 13 | [13-deploy-docs.md](13-deploy-docs.md) | GitHub Pages 배포 + README | 12 |
| 14 | [14-accounts-notifications.md](14-accounts-notifications.md) | 계정(멘티·멘토·관리자) · 알림 · 멘티↔멘토 실연동 | 13 |

권장 진행 순서: `01 → 02 → 03 → 04 → 05 → 06 → 07 → 09 → 08 → 10 → 11 → 12 → 13`
(08 AlignX/ABOUT은 03 이후 언제든 병행 가능한 독립 트랙)

---

## 3. 확인이 필요한 사항 (구현 착수 전 답변 요망)

> CLAUDE.md §1 "Don't assume. Don't hide confusion." 에 따라, 원문 프롬프트에서 **해석이 갈리는 지점**을 먼저 드러낸다.
> 답이 없으면 아래 **가정값**으로 진행한다.

| # | 쟁점 | 원문 | 채택한 가정 |
|---|---|---|---|
| Q1 | **탭 개수 불일치** | "HOME, PORTFOLIO 분석, AlignX AI, MY, ABOUT, 이렇게 4개 탭" — 나열은 5개 | 로고(=HOME) + **내비 탭 4개**(PORTFOLIO 분석 / AlignX AI / MY / ABOUT). ADMIN은 내비에 노출하지 않는 히든 라우트 |
| Q2 | **문장 미완** | "Home은 기본적인" (3번 끝) | 7번("이 서비스를 멋있게 홍보하는 화면")으로 대체 해석 |
| Q3 | **원본 URL** | `https://ygtj.vercel.app/resume` 인데 RESUME 탭은 제외 | 사이트 루트를 기준 콘텐츠로 보고, RESUME/VALIDATION 라우트는 미이식 |
| Q4 | **"무한으로 넓게 퍼지는"** | melius.com 히어로 | **무한 가로 마퀴 + 스크롤 확산** 으로 해석 ([04-home.md §3](04-home.md) 에 A/B안 병기) |
| Q5 | **"n회 이상"** | MY 페이지 전체 이력 분석 해금 조건 | **N = 3회**. `HISTORY_UNLOCK_THRESHOLD` 상수로 1곳에서 관리 |
| Q6 | **멘토 검증 "실시간"** | 백엔드 없음 | 클라이언트 타이머 기반 **시뮬레이션**(단계별 진행). ADMIN에서 수동 진행도 가능 |
| Q7 | **AlignX AI 영상** | "영상으로 보여줄 예정" | 영상 파일 미제공 → **로고 SVG 기반 모션 히어로**로 대체, `<video>` 슬롯만 비워둠 |

---

## 4. 확정된 스코프

### 4.1 사이트맵

```
/                      HOME            홍보 히어로 (Melius형)
/portfolio             분석 인트로      설명 + [분석 시작]
  /portfolio/analyze     1단계          업로드 → AI 분석 로딩 → 10원칙 점수
  /portfolio/mentor      2단계          멘토 제출 폼 → 실시간 검증 모니터
  /portfolio/report      3단계          AI+사람 통합 리포트 → HTML 다운로드
/alignx                AlignX AI       모델 소개
/my                    MY              진행 상태 · 회차 카드
  /my/history            이력 분석      N회 이상일 때 해금
/about                 ABOUT           서비스 소개
/admin                 ADMIN (히든)     암호 게이트 → 제출 현황 → 멘토 피드백
```

### 4.2 명시적 비스코프 (MVP에서 만들지 않는다)

- 실제 AI 추론 — 1단계 점수는 **결정론적 더미 생성기**. 나중에 AlignX 모델 API로 교체 (경계면은 [05](05-portfolio-step1.md) §6에 고정)
- 실제 인증·서버·DB — 모든 상태는 브라우저 `localStorage`
- RESUME / VALIDATION 탭
- 결제, 이메일 발송, 알림
- 다국어(i18n) — 한국어 단일. 영문은 디스플레이 타이포 용도로만

---

## 5. 기술 스택 결정

| 항목 | 선택 | 이유 |
|---|---|---|
| 번들러 | **Vite 6** | 정적 산출물이 GitHub Pages와 바로 맞음 |
| UI | **React 19 + TypeScript** | 3단계 마법사·상태 전이가 많아 컴포넌트 모델이 유리 |
| 라우팅 | **React Router v7** (`BrowserRouter` + `basename`) | 딥링크 유지. GH Pages는 `404.html` 리다이렉트 심으로 해결 ([13](13-deploy-docs.md) §3) |
| 상태 | **Zustand + persist** | 3KB. localStorage 동기화가 미들웨어 한 줄 |
| 스타일 | **CSS Custom Properties + CSS Modules** | 디자인 시스템이 "토큰 참조만, 인라인 hex 금지"를 요구 → 유틸리티 프레임워크(Tailwind) 미채택 |
| 모션 | **motion** (구 framer-motion) | `useScroll`/`useTransform` 으로 스크롤 연동 히어로 구현 |
| 스무스 스크롤 | **Lenis** | seed-design.io 류의 스크롤 감성 |
| PDF 처리 | **pdfjs-dist** | 업로드 PDF 1페이지 → 캔버스 썸네일, ADMIN 샘플 미리보기 공용 |
| 테스트 | **Vitest + Testing Library** | 스코어링·스토리지 등 순수 로직 중심 ([12](12-code-review.md)) |

> **채택하지 않은 것:** Next.js(서버 기능이 필요 없고 정적 export 설정이 추가 복잡도), Tailwind(토큰 원칙 충돌), 상태관리 대형 라이브러리.

---

## 6. 디자인 시스템 계약

기준: [`woongdesignv2.md`](../woongdesignv2.md). **아래 3건은 원문 프롬프트가 디자인 시스템을 덮어쓴다** — 의도적 이탈이므로 명시한다.

| 항목 | woongdesignv2 | 이 프로젝트 | 근거 |
|---|---|---|---|
| 디스플레이 폰트 | Samsung Sharp Sans | **Montserrat** | 프롬프트 7번 (Font 폴더) |
| 사진/일러스트 | "사용 안 함" | **썸네일 이미지 적극 사용** | 프롬프트 5·6·12번 |
| 본문 크기 | 24px 고정 | **웹 스케일 18px** (`body-lg` 20–24px 별도) | 슬라이드(1920×1080) 기준 수치를 웹 본문에 그대로 쓰면 가독성 붕괴 |

그 외 — 오프화이트 캔버스(`#FCFCFF`)/잉크(`#010102`), 그림자 금지, 28px tile radius, 한 페이지 한 세트, 80/48/24 여백 리듬은 **그대로 준수**.

### 6.1 페이지별 톤 매핑 (한 페이지 = 한 세트)

| 라우트 | 톤 세트 | `data-theme` | 성격 |
|---|---|---|---|
| `/` HOME | Cool · Blue | `cool` | 브랜드 기본 |
| `/portfolio`, `/portfolio/analyze` | Cool · Blue | `cool` | 도구·데이터 |
| `/portfolio/mentor` | Warm · Orange | `warm` | 대화·사람 |
| `/portfolio/report` | Cool · Blue | `cool` | 결과·리포트 (멘토 코멘트는 cool soft 카드로 수용) |
| `/alignx` | Cool · Mint | `mint` | 모델·기술 |
| `/my`, `/my/history` | Warm · Orange | `warm` | 회고·격려 |
| `/about` | Warm · Violet | `violet` | 서비스 서사 |
| `/admin` | Cool · Blue (deep 비중↑) | `cool` | 운영 도구 |

전환 규칙: 라우트 변경 시 `<html data-theme>` 를 교체하고 200ms `color` / `background-color` 트랜지션. 한 페이지 내 세트 혼용 금지.

### 6.2 라이트/다크 모드

- `<html data-mode="light|dark">`, 토글 아이콘은 **TopNav 우측 고정** (프롬프트 2번)
- 초기값: `localStorage` → 없으면 `prefers-color-scheme`
- FOUC 방지: `index.html` `<head>` 에 인라인 부트 스크립트 (Phase 02)

---

## 7. 데이터 모델 (전 Phase 공통 계약)

`localStorage` 키: **`alignx.v1`** — 스키마 변경 시 키 버전을 올리고 마이그레이션 없이 초기화.

```ts
type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

type PrincipleScore = {
  id: string;        // 'hierarchy' | 'grid' | ...
  score: number;     // 0–10
  comment: string;
};

type AiAnalysis = {
  analyzedAt: string;              // ISO
  principles: PrincipleScore[];    // 길이 10
  totalScore: number;              // 0–100 (10개 합산)
  grade: Grade;
  summary: string;
  strengths: string[];
  improvements: string[];
};

type MentorRequest = {
  name: string;
  topic: string;
  requestNote: string;                                   // 멘토에게 요청하는 사항
  survey: { satisfaction: number; motivation: number; outcome: number };  // 각 1–7
  review: string;                                        // 주관식 교육 후기
  submittedAt: string;
};

type MentorStage = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
  mentorName?: string;
  startedAt?: string;
  completedAt?: string;
};

type MentorFeedback = {
  mentorName: string;
  mentorRole: string;
  overall: string;
  perPrinciple: { principleId: string; comment: string }[];
  mentorScore: number;             // 0–100 (사람 점수)
  completedAt: string;
};

type Attempt = {
  id: string;                      // 'atmp_' + ulid
  createdAt: string;
  currentStep: 1 | 2 | 3;
  status: 'analyzing' | 'analyzed' | 'submitted' | 'reviewing' | 'completed';
  file: {
    name: string;
    mime: 'application/pdf' | 'image/gif' | 'image/png' | 'image/jpeg';
    size: number;
    previewDataUrl: string;        // ⚠️ 원본 아님. 640px JPEG q0.7 축소본만 저장
  };
  ai: AiAnalysis | null;
  mentorRequest: MentorRequest | null;
  mentorStages: MentorStage[] | null;
  mentorFeedback: MentorFeedback | null;
};

type AppState = {
  version: 1;
  user: { name: string | null };
  attempts: Attempt[];             // 최신순
  admin: { unlockedAt: string | null };
};
```

**저장 규칙 (중요):** `localStorage` 는 도메인당 약 5MB. 업로드 원본 파일은 **절대 저장하지 않는다.** 세션 메모리에만 두고, 영속화 대상은 640px 프리뷰(JPEG, 목표 <200KB)와 메타데이터뿐. 회차 20개 초과 시 오래된 프리뷰부터 드롭.

---

## 8. AI 10대 원칙 (1단계 스코어링 기준 · 전 Phase 공통)

| # | id | 원칙 (KR) | 원칙 (EN) | 배점 |
|---|---|---|---|---|
| 1 | `hierarchy` | 시각적 위계 | Visual Hierarchy | 10 |
| 2 | `grid` | 레이아웃 · 그리드 정합성 | Layout & Grid | 10 |
| 3 | `typography` | 타이포그래피 | Typography | 10 |
| 4 | `color` | 컬러 · 대비 | Color & Contrast | 10 |
| 5 | `whitespace` | 여백 · 리듬 | Whitespace & Rhythm | 10 |
| 6 | `consistency` | 일관성 | Consistency | 10 |
| 7 | `narrative` | 정보 구조 · 스토리텔링 | IA & Narrative | 10 |
| 8 | `research` | 문제 정의 · 리서치 근거 | Problem Framing & Research | 10 |
| 9 | `interaction` | 인터랙션 · 사용성 | Interaction & Usability | 10 |
| 10 | `impact` | 결과 · 임팩트 증명 | Outcome & Impact | 10 |

**총점 = 단순 합산 (0–100).** 등급: `S ≥ 90` / `A 80–89` / `B 70–79` / `C 60–69` / `D < 60`.
정의 원본은 `src/data/principles.ts` 한 곳에만 두고 1·3단계·리포트·ADMIN이 모두 이를 참조한다.

---

## 9. 에셋 인벤토리 & 선결 과제

| 폴더 | 현황 | 조치 |
|---|---|---|
| `Thumbnails/` | PNG 10장, **총 44MB** (장당 1.5–6.9MB) | Phase 01에서 WebP 변환 + 3종 사이즈 리사이즈 → 장당 목표 <300KB |
| `Portfolio-samples/` | PDF 10개, **총 210MB** | ⚠️ 원본을 배포 번들에 넣지 않는다. 1페이지 프리뷰 JPEG만 추출 → `public/samples/` . 원본은 `.gitignore` |
| `AlignX/AlignX-logo.svg` | 2KB, viewBox 512×180, 단색 path | `currentColor` 로 치환해 다크모드 대응 |
| `Font/Montserrat-font/` | ✅ **Variable TTF**(688KB, wght 100–900) + Italic + 정적 18종 + OFL | 라틴 서브셋 + woff2 변환 → 1개 파일 ~50KB |
| `Font/Pretendard-font/` | ✅ **Variable woff2**(2.06MB) + 정적 woff2 9종 + **woff2-subset 9종**(각 ~267KB) + OFL | subset 400/500/700 **3개만** 복사 (~806KB) |
| ~~`Font/Montserrat`, `Font/Pretendard`~~ | 스니펫 406B / 0바이트 — 실제 폰트 도입 후 남은 껍데기 | `.DS_Store` 와 함께 삭제 |

> ✅ **P0 해제.** 폰트 바이너리 2종 모두 확보되었다. 상세 채택 전략은 [02 §3.1.1–3.1.6](02-design-tokens.md) 참조.
> **부수 효과:** Montserrat Variable이 wght 300을 커버하므로, `woongdesignv2.md` 가 미해결로 남긴 "디스플레이 Light(300) 파일 부재 → Pretendard 폴백" 문제가 해소된다.
> **주의:** `Font/` 원본 74MB는 커밋하지 않는다. 변환 산출물(`public/fonts/` ~856KB)만 커밋한다 — 이미지와 반대 정책이다.

### 9.1 교체 가능한 이미지 폴더 (프롬프트 6번)

```
public/images/
├─ hero/          # HOME 히어로 (Thumbnails 원본 최적화본)
├─ thumbs/        # 각 페이지 섹션용 더미 썸네일 ← 언제든 교체
├─ brand/         # AlignX 로고
├─ manifest.json  # 파일명 → 표시 위치·alt 텍스트 매핑
└─ README.md      # 교체 규칙(권장 비율·최대 용량·네이밍)
```

코드는 파일명을 하드코딩하지 않고 **`manifest.json` 을 통해서만** 이미지를 참조한다 → 같은 이름으로 덮어쓰기만 하면 교체 완료.

---

## 10. 보안 고지 (숨기지 않고 명시)

ADMIN 암호 `portfolio2026` 은 **프론트엔드 번들에 그대로 포함**된다. 브라우저 개발자도구로 누구나 열람할 수 있으므로 **실제 접근 통제가 아니다.** 데모용 화면 전환 장치로만 취급하며, 이 사실을 README와 ADMIN 화면 하단에 함께 표기한다. 실제 운영이 필요해지면 서버 측 인증이 필수다.

동일하게, 모든 학생 데이터는 브라우저 로컬에만 존재하므로 기기를 바꾸면 사라진다.

---

## 11. 전 Phase 공통 완료 기준 (Definition of Done)

각 Phase는 아래를 모두 만족해야 다음으로 넘어간다.

1. `npm run build` 무경고 통과, `tsc --noEmit` 에러 0
2. 라이트/다크 **양쪽 모드** 스크린샷 확인
3. 360px / 768px / 1440px **3개 뷰포트** 레이아웃 깨짐 없음
4. 인라인 hex 0건 (토큰 변수만 사용) — `grep -rE '#[0-9a-fA-F]{3,6}' src/ --include=*.css` 로 검증, `tokens.css` 만 예외
5. 해당 Phase 문서의 "완료 기준" 절 체크박스 전부 충족
