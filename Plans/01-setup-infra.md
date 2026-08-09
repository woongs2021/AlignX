# Phase 01 — 프로젝트 셋업 · 인프라

> 선행: [00-overview.md](00-overview.md) · 후행: [02-design-tokens.md](02-design-tokens.md)
> 목표: **화면 하나 없이도 빌드·배포·상태저장·에셋 파이프라인이 전부 돌아가는 뼈대**를 세운다.

---

## 1. 산출물

- Vite + React 19 + TS 프로젝트 스캐폴드
- 라우터 골격 (모든 라우트가 빈 페이지로라도 응답)
- Zustand 스토어 + localStorage persist
- 에셋 최적화 스크립트 (썸네일 44MB → 3MB대, PDF 프리뷰 추출)
- `public/images/manifest.json` 기반 이미지 참조 레이어
- Lint / format / typecheck 스크립트

---

## 2. 디렉터리 구조

```
AlignX-dev/
├─ Plans/                    # 이 계획 문서들 (배포 제외)
├─ References/  Thumbnails/  Portfolio-samples/  Font/  AlignX/   # 원본 소스 (배포 제외)
├─ public/
│  ├─ fonts/                 # Montserrat / Pretendard woff2
│  ├─ images/
│  │  ├─ hero/ thumbs/ brand/
│  │  ├─ manifest.json
│  │  └─ README.md
│  ├─ samples/               # PDF 1p 프리뷰 JPEG + samples.json
│  ├─ 404.html               # GH Pages SPA 심 (Phase 13)
│  └─ .nojekyll
├─ scripts/
│  ├─ optimize-images.mjs    # Thumbnails → public/images
│  └─ extract-samples.mjs    # Portfolio-samples PDF → 프리뷰
├─ src/
│  ├─ main.tsx  App.tsx  router.tsx
│  ├─ styles/                # tokens.css, reset.css, typography.css  (Phase 02)
│  ├─ layout/                # TopNav, Footer, PageShell            (Phase 03)
│  ├─ pages/
│  │  ├─ home/  portfolio/  alignx/  my/  about/  admin/
│  ├─ components/            # 디자인 시스템 컴포넌트 (Button, Card, Badge…)
│  ├─ features/
│  │  ├─ analysis/           # 더미 스코어링 엔진        (Phase 05)
│  │  ├─ mentor/             # 검증 단계 시뮬레이터      (Phase 06)
│  │  └─ report/             # HTML 리포트 빌더          (Phase 07)
│  ├─ store/                 # useAppStore.ts (Zustand)
│  ├─ data/                  # principles.ts, mentors.ts, copy.ts
│  ├─ lib/                   # file.ts, pdf.ts, format.ts, images.ts
│  └─ types/                 # index.ts (00 §7 스키마)
├─ index.html
├─ vite.config.ts  tsconfig.json  package.json
├─ .github/workflows/deploy.yml   # Phase 13
└─ README.md                      # Phase 13
```

**규칙:** `pages/` 는 조립만 한다. 로직은 `features/`, 표현은 `components/`, 순수 함수는 `lib/`. 페이지 파일이 200줄을 넘으면 섹션 컴포넌트로 분리한다.

---

## 3. 작업 단계

### 3.1 스캐폴드

```bash
npm create vite@latest . -- --template react-ts
npm i react-router-dom zustand motion lenis pdfjs-dist
npm i -D typescript @types/react @types/react-dom vitest @testing-library/react \
        @testing-library/jest-dom jsdom eslint prettier sharp subset-font
```

> `subset-font` 는 Montserrat Variable TTF → 라틴 서브셋 woff2 변환용이다 (harfbuzz WASM, Node 전용 — 파이썬 fonttools 불필요).

`package.json` 스크립트:

| 스크립트 | 내용 |
|---|---|
| `dev` | `vite` |
| `build` | `tsc --noEmit && vite build` |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `lint` | `eslint src --max-warnings 0` |
| `assets` | `node scripts/prepare-fonts.mjs && node scripts/optimize-images.mjs && node scripts/extract-samples.mjs` |

→ **검증:** `npm run dev` 로 빈 페이지 렌더, `npm run build` 성공.

### 3.2 `vite.config.ts`

```ts
export default defineConfig({
  base: '/AlignX-dev/',            // ⚠️ GitHub 저장소명과 반드시 일치 (Phase 13에서 최종 확정)
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  build: { target: 'es2022', cssCodeSplit: true },
});
```

> `base` 는 배포 주소를 결정한다. 저장소명이 `AlignX-dev` 가 아니면 여기와 `router.tsx` 의 `basename` 을 함께 바꿔야 한다.

### 3.3 라우터 골격

`src/router.tsx` — [00 §4.1](00-overview.md) 사이트맵 그대로. 이 Phase에서는 각 라우트가 페이지 이름만 출력하는 스텁이면 충분하다.

```
/                     → HomePage
/portfolio            → PortfolioIntroPage
/portfolio/analyze    → Step1Page       ┐
/portfolio/mentor     → Step2Page       ├ <PortfolioLayout> (진행 인디케이터 공유)
/portfolio/report     → Step3Page       ┘
/alignx               → AlignxPage
/my                   → MyPage
/my/history           → MyHistoryPage
/about                → AboutPage
/admin                → AdminPage
*                     → NotFoundPage
```

가드:
- `/portfolio/mentor` — 활성 회차의 `ai !== null` 아니면 `/portfolio/analyze` 로 리다이렉트
- `/portfolio/report` — `mentorFeedback !== null` 아니면 `/portfolio/mentor`
- `/my/history` — `attempts.length >= 3` 아니면 `/my`
- `/admin` — `admin.unlockedAt === null` 이면 게이트 화면 렌더 (리다이렉트 아님)

→ **검증:** 각 URL 직접 진입 시 올바른 스텁/리다이렉트. 잘못된 URL은 NotFound.

### 3.4 타입 & 스토어

1. `src/types/index.ts` 에 [00 §7](00-overview.md) 스키마를 그대로 옮긴다.
2. `src/store/useAppStore.ts`:

```ts
type Actions = {
  createAttempt(file: Attempt['file']): string;      // → attemptId
  setAiAnalysis(id: string, ai: AiAnalysis): void;
  setMentorRequest(id: string, req: MentorRequest): void;
  advanceMentorStage(id: string): void;
  setMentorFeedback(id: string, fb: MentorFeedback): void;
  unlockAdmin(): void;
  resetAll(): void;                                  // 데모 초기화용
};
```

`persist` 미들웨어 — `name: 'alignx.v1'`, `version: 1`, `partialize` 로 휘발 상태 제외.

**용량 가드:** `createAttempt` 는 저장 전 `attempts.length > 20` 이면 가장 오래된 회차의 `previewDataUrl` 을 `''` 로 비운다. `setItem` 이 `QuotaExceededError` 를 던지면 프리뷰를 모두 비우고 1회 재시도, 그래도 실패하면 사용자에게 "저장 공간이 가득 찼습니다 — 이전 회차를 정리해 주세요" 안내.

→ **검증(Vitest):** 회차 생성 → 새로고침 → 복원. 21번째 회차 생성 시 가장 오래된 프리뷰 제거.

### 3.5 에셋 파이프라인 ★

원본 총 **328MB**(썸네일 44 + PDF 210 + 폰트 74)를 그대로 배포하면 GitHub Pages에서 사실상 열리지 않는다. **이 단계는 선택이 아니다.**

**`scripts/prepare-fonts.mjs`** (subset-font) — 상세는 [02 §3.1.5](02-design-tokens.md)

| 입력 | 출력 | 처리 |
|---|---|---|
| `Font/Montserrat-font/Montserrat-VariableFont_wght.ttf` | `public/fonts/Montserrat-latin.woff2` | 라틴 unicode-range 서브셋 + woff2 (~50KB) |
| `Font/Pretendard-font/web/static/woff2-subset/Pretendard-{Regular,Medium,Bold}.subset.woff2` | `public/fonts/` | 복사만 (~806KB) |
| 양쪽 `OFL.txt` / `LICENSE.txt` | `public/fonts/` | 복사 — **OFL 재배포 조건** |

**멱등 처리 필수:** 산출물이 이미 있으면 건너뛴다. `Font/` 원본은 gitignore되므로 CI에는 존재하지 않는다 — 스크립트가 원본 부재 시 **에러 없이 스킵**해야 CI가 통과한다.

**`scripts/optimize-images.mjs`** (sharp)

| 입력 | 출력 | 사양 |
|---|---|---|
| `Thumbnails/*.png` | `public/images/hero/{n}-{w}.webp` | 폭 800 / 1600 / 2400, WebP q78 |
| 〃 | `public/images/thumbs/{n}-800.webp` | 폭 800, WebP q75 |
| 〃 | `public/images/*/{n}-blur.webp` | 폭 24 (LQIP 플레이스홀더) |

목표: 히어로 세트 전체 3MB 이하, 개별 파일 300KB 이하.

**`scripts/extract-samples.mjs`** (pdfjs-dist)

`Portfolio-samples/*.pdf` → 1페이지를 폭 900px JPEG q72 로 렌더 → `public/samples/{seq}.jpg` + `public/samples/samples.json`:

```json
[{ "id": "001", "company": "카카오", "field": "UX디자인",
   "preview": "001.jpg", "pageCount": 42, "sourceFile": "001_카카오_UX디자인.pdf" }]
```

**`.gitignore`** — `Portfolio-samples/*.pdf`(210MB)와 `Font/`(74MB) 제외. 커밋하면 clone이 사실상 불가능해진다. 원본은 로컬 보관.

**에셋별 커밋 정책 (서로 다르다 — 혼동 주의)**

| 에셋 | 원본 | 산출물 | 이유 |
|---|---|---|---|
| 이미지 | **커밋** (44MB) | gitignore | CI가 매번 재생성. sharp는 CI에서 잘 돈다 |
| PDF 샘플 | gitignore (210MB) | **커밋** (프리뷰 ~1.5MB) | 원본이 CI에 없어도 빌드가 성공해야 함 |
| **폰트** | gitignore (74MB) | **커밋** (~856KB) | 변환 결과가 불변. 원본 74MB를 옮길 이유가 없음 |

→ **검증:** `du -sh public/` < 8MB. `npm run assets` 재실행이 멱등.

### 3.6 이미지 참조 레이어

`public/images/manifest.json`:

```json
{
  "hero": [{ "src": "hero/01", "alt": "포트폴리오 분석 화면", "ratio": "16:10" }],
  "thumbs": {
    "portfolio-intro": { "src": "thumbs/03", "alt": "포트폴리오 업로드 안내" },
    "step1-loading":   { "src": "thumbs/04", "alt": "AI 분석 진행" },
    "step2-mentor":    { "src": "thumbs/05", "alt": "멘토 검증" },
    "step3-report":    { "src": "thumbs/06", "alt": "통합 리포트" },
    "alignx-model":    { "src": "thumbs/07", "alt": "AlignX 모델 구조" },
    "about-team":      { "src": "thumbs/08", "alt": "팀 소개" }
  }
}
```

`src/lib/images.ts` — `getThumb(key)` 가 manifest를 읽어 `srcSet`·`alt`·LQIP를 반환. **컴포넌트는 파일 경로를 직접 쓰지 않는다.**

`public/images/README.md` 에 교체 규칙 명시: 같은 파일명·같은 비율로 덮어쓰기 → `npm run assets` → 끝. 권장 비율 16:10, 원본 폭 2400px 이상, 사후 300KB 이하.

→ **검증:** `thumbs/03-800.webp` 를 다른 그림으로 바꾸고 새로고침 → 코드 변경 없이 반영.

### 3.7 공용 `PlaceholderImage` 컴포넌트

썸네일이 없거나 로드 실패 시 — 디자인 시스템 원칙대로 **일러스트 대신 큰 활자 + 색면** 폴백을 그린다 (`[Asset placeholder — TBD]` 대신 실제 라벨 표시). `loading="lazy"`, `decoding="async"`, LQIP → 원본 크로스페이드.

---

## 4. 리스크

| 리스크 | 대응 |
|---|---|
| `Font/` gitignore 후 CI에서 `prepare-fonts` 실패 | 산출물이 이미 커밋돼 있으므로 원본 부재 시 **스킵**. 스크립트에 존재 여부 가드 필수 |
| `base` 경로와 실제 저장소명 불일치 → 배포 시 전 에셋 404 | Phase 13 첫 작업으로 저장소명 확정 후 1곳(`vite.config.ts`)만 수정 |
| localStorage 5MB 초과 | 3.4 용량 가드 + 원본 파일 미저장 원칙 |
| pdfjs 워커 경로 설정 누락 (Vite 흔한 함정) | `?url` import 로 워커 명시 지정, Phase 05 착수 시 실제 PDF로 1회 검증 |

---

## 5. 완료 기준

- [ ] `npm run build` · `npm run lint` · `npm run test` 3개 모두 통과
- [ ] 10개 라우트 전부 직접 URL 진입 시 스텁 렌더 (가드 포함 동작)
- [ ] 회차 생성 → 새로고침 → 상태 복원
- [ ] `npm run assets` 실행 후 `public/` 총량 8MB 이하 (폰트 856KB 포함)
- [ ] `Font/` 원본을 지운 상태에서도 `npm run assets` → `npm run build` 성공 (CI 재현)
- [ ] `public/fonts/` 에 woff2 4개 + OFL 라이선스 2개 존재
- [ ] `manifest.json` 의 이미지만 교체해도 코드 수정 없이 화면 반영
- [ ] `.gitignore` 에 대용량 원본 제외 반영
