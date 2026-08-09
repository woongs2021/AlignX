# Phase 13 — GitHub Pages 배포 · 문서화

> 선행: [12-code-review.md](12-code-review.md) 게이트 통과
> 프롬프트 15번 — *"깃허브에 pages를 붙이면 볼 수 있도록 구성하고, README.md에도 추가."*

---

## 1. 선결 확인

| 항목 | 결정 필요 |
|---|---|
| GitHub 계정/조직명 | `{OWNER}` |
| 저장소명 | `{REPO}` — 기본 가정 `AlignX-dev` |
| 배포 URL | `https://{OWNER}.github.io/{REPO}/` |
| 공개 범위 | Public (무료 계정은 Public에서만 Pages 사용 가능) |

**저장소명이 확정되면 `vite.config.ts` 의 `base` 와 라우터 `basename` 을 함께 맞춘다.** 이 둘이 어긋나면 배포 후 흰 화면 또는 전 에셋 404가 난다 — 이 Phase에서 가장 흔한 실패다.

```ts
// vite.config.ts
base: '/AlignX-dev/',
// router.tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

`import.meta.env.BASE_URL` 을 쓰면 한 곳(`base`)만 고치면 된다.

---

## 2. 저장소 정리

### 2.1 `.gitignore`

```gitignore
node_modules/
dist/
.DS_Store
*.local

# ── 대용량 원본 (커밋하면 clone이 사실상 불가능) ──
Portfolio-samples/*.pdf     # 210MB
Font/                       # 74MB — 변환 산출물만 커밋한다

# ── 이미지 산출물: CI에서 재생성 ──
public/images/hero/
public/images/thumbs/

# ── 원본이 CI에 없는 것들의 산출물: 커밋한다 ──
!public/samples/*.jpg       # PDF 프리뷰 ~1.5MB
!public/fonts/              # woff2 4개 + OFL ~856KB
```

> **판단 기준:** CI에서 `npm run assets` 가 돌려면 **원본이 저장소에 있거나, 산출물이 이미 커밋돼 있어야** 한다. 둘 중 가벼운 쪽을 택한다.
>
> | 에셋 | 원본 | 산출물 | 근거 |
> |---|---|---|---|
> | 이미지 | 커밋 (44MB) | 무시 | sharp는 CI에서 잘 돌고, 원본이 교체 대상이다 |
> | PDF 샘플 | 무시 (210MB) | 커밋 (1.5MB) | 저작권·개인정보 이유로도 원본을 올리지 않는다 |
> | **폰트** | 무시 (74MB) | 커밋 (856KB) | 변환 결과가 불변. 74MB를 옮길 이유가 없다 |
>
> ⚠️ `prepare-fonts.mjs` 는 `Font/` 부재 시 **에러 없이 스킵**해야 한다. 아니면 CI가 깨진다 ([01 §3.5](01-setup-infra.md)).

### 2.2 `public/.nojekyll`

빈 파일. 없으면 Jekyll이 `_` 로 시작하는 Vite 산출물을 무시해 404가 난다. **필수.**

### 2.3 라이선스

**폰트 재배포 조건 (OFL 1.1)** — 두 폰트 모두 SIL Open Font License다. 자체 호스팅·재배포 모두 허용되지만 **라이선스 원문 동봉이 의무**다.

```
public/fonts/
├─ OFL-Montserrat.txt      ← Font/Montserrat-font/OFL.txt
└─ LICENSE-Pretendard.txt  ← Font/Pretendard-font/LICENSE.txt
```

`prepare-fonts.mjs` 가 자동 복사한다 ([02 §3.1.5](02-design-tokens.md)). OFL은 폰트 파일 판매를 금지하고 예약 폰트명(Reserved Font Name) 사용을 제한하므로, 파일명을 바꾸더라도 `Montserrat` / `Pretendard` 라는 패밀리명은 그대로 유지한다.

학생 포트폴리오 원본은 **저장소에 올리지 않는다** (§2.1로 이미 제외 — 저작권·개인정보 양쪽 이유).

---

## 3. SPA 라우팅 해결 ★

GitHub Pages는 정적 서버라 `/AlignX-dev/portfolio/analyze` 를 직접 열면 404다.

**`public/404.html`** — 404 응답 시 GH Pages가 이 파일을 주므로, 여기서 경로를 쿼리로 인코딩해 `index.html` 로 넘긴다.

```html
<script>
  var seg = 1; // 저장소 경로 세그먼트 수 (project site = 1)
  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + seg).join('/') + '/?/' +
    l.pathname.slice(1).split('/').slice(seg).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1) : '') + l.hash
  );
</script>
```

**`index.html`** `<head>` — 쿼리를 원래 경로로 복원 (React 마운트 전).

```html
<script>
  (function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function (s) {
        return s.replace(/~and~/g, '&');
      }).join('?');
      window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
    }
  })(window.location);
</script>
```

> **폴백:** 이 방식이 문제를 일으키면 `BrowserRouter` → `HashRouter` 로 한 줄 교체한다. URL이 `/#/portfolio` 형태가 되지만 404가 원천적으로 없다.

**검증:** 배포 후 `/portfolio/analyze`, `/my/history`, `/admin` 을 **주소창에 직접 입력**해 확인. 새로고침도 확인.

---

## 4. GitHub Actions 워크플로

`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build          # tsc --noEmit 포함
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**lint·test를 빌드 앞에 두는 이유:** 검수를 통과하지 못한 코드가 배포되지 않게 파이프라인 자체로 막는다 ([12](12-code-review.md) 게이트의 자동화).

**저장소 설정:** Settings → Pages → Source = **GitHub Actions** (Deploy from branch 아님).

---

## 5. 메타데이터

`index.html`:

```html
<html lang="ko">
<title>AlignX — 데이터로 검증하는 합격 포트폴리오</title>
<meta name="description" content="AI 10대 원칙 분석과 현직 멘토 검증을 한 번에. 포트폴리오를 3단계로 진단합니다.">
<meta property="og:title" content="AlignX — 데이터로 검증하는 합격 포트폴리오">
<meta property="og:image" content="https://{OWNER}.github.io/{REPO}/og.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/{REPO}/favicon.svg" type="image/svg+xml">
```

- OG 이미지 1200×630 — Thumbnails 1장 + 로고 + 타이틀로 제작해 `public/og.png`
- 파비콘: AlignX 로고 SVG 축약형
- **OG `og:image` 는 절대 URL이어야 한다** (상대 경로는 SNS 크롤러가 못 읽는다)
- `robots.txt` — 데모 사이트이므로 색인 차단 여부를 결정. 기본은 허용

---

## 6. README.md

**Phase 13의 최종 산출물.** 루트에 작성한다. 포함할 내용:

1. 프로젝트 한 줄 소개 + 배포 링크
2. 스크린샷 (HOME 히어로 / 분석 결과 / 리포트)
3. 주요 기능 — 4개 탭 + 3단계 분석 + ADMIN
4. 기술 스택
5. 로컬 실행 (`npm i` → `npm run assets` → `npm run dev`)
6. 디렉터리 구조
7. **썸네일 교체 방법** (프롬프트 6번 요구)
8. **ADMIN 접근 + 보안 고지** (프롬프트 12번 / [10 §0](10-admin.md))
9. 디자인 시스템 요약 + 원본 문서 링크
10. GitHub Pages 배포 방법 (프롬프트 15번)
11. 알려진 제약 — 백엔드 없음 · 더미 점수 · 로컬 저장 한계
12. Plans 인덱스 링크
13. 라이선스 / 크레딧

---

## 7. 배포 후 검증

- [ ] `https://{OWNER}.github.io/{REPO}/` 정상 로드
- [ ] **딥링크 5개** 직접 입력 확인: `/portfolio`, `/portfolio/analyze`, `/my`, `/about`, `/admin`
- [ ] 각 페이지 새로고침 시 404 없음
- [ ] 이미지 · 폰트 · 로고 전부 로드 (Network 404 = 0)
- [ ] **폰트 경로가 하위 경로 배포에서 정상** — `/{REPO}/fonts/*.woff2` 로 요청되는지 확인. `@font-face` 에 `/fonts/` 를 절대경로로 박으면 여기서 404가 난다
- [ ] 라이트/다크 토글 동작, 새로고침 후 유지
- [ ] 실제 PDF 업로드 → 분석 → 제출 → 리포트 다운로드 완주
- [ ] 모바일 실기기에서 동일 확인
- [ ] OG 태그 미리보기 확인 (Slack/카카오톡 링크 붙여넣기)
- [ ] Lighthouse **배포본 기준** 재측정 (로컬과 다를 수 있다)
- [ ] `git clone` 소요 시간 1분 이내 (저장소 비대화 확인)

---

## 8. 릴리스 이후

| 항목 | 내용 |
|---|---|
| 버전 태그 | `v0.1.0-mvp` |
| 이슈 템플릿 | 버그 / 개선 제안 2종 (선택) |
| 다음 마일스톤 | 실제 AlignX 모델 연동 ([05 §4.2](05-portfolio-step1.md) `AnalysisProvider` 교체) · 서버 백엔드 도입 · 실제 인증 |
