# Lighthouse 측정 — 미실행

이 문서를 작성한 환경은 CLI 전용이라 **실제 Chrome을 띄워 Lighthouse를 실행할 수 없다.** 목표치
(§11 §3.1)와, 대신 코드 레벨에서 확인 가능한 대리 지표만 정리한다. 페이지별 4개 지표(LCP·CLS·
INP·Performance/A11y/Best Practices 점수)는 **사용자가 직접 측정해 이 표를 채워야 한다.**

## 목표치

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| LCP | < 2.5s | Lighthouse Mobile, Slow 4G |
| CLS | < 0.05 | 〃 |
| INP | < 200ms | 〃 |
| Performance | ≥ 85 (Mobile) | 〃 |
| Accessibility | ≥ 95 | 〃 |
| Best Practices | ≥ 95 | 〃 |

## 페이지별 결과 (직접 채워주세요)

| 페이지 | LCP | CLS | INP | Perf | A11y | Best Practices |
|---|---|---|---|---|---|---|
| `/` (HOME) | | | | | | |
| `/portfolio` | | | | | | |
| `/portfolio/analyze` | | | | | | |
| `/alignx` | | | | | | |
| `/my` | | | | | | |
| `/about` | | | | | | |
| `/admin` | | | | | | |

측정 방법: `npm run build && npm run preview` 로 프로덕션 빌드를 띄운 뒤, Chrome DevTools →
Lighthouse 탭 → Mobile · Slow 4G 프리셋으로 각 경로를 개별 실행. (`npm run dev`의 미압축·미청크
번들로 측정하면 실제보다 나쁘게 나온다 — 반드시 `build`/`preview` 조합으로 측정할 것.)

## 코드 레벨 대리 지표 (실측 완료)

Lighthouse 자체는 못 돌렸지만, Performance 점수에 가장 크게 기여하는 두 요인(초기 JS 전송량,
불필요한 코드 로드)은 `vite build` 산출물로 직접 확인했다.

### 번들 크기 (`npm run build`, gzip 기준)

| 청크 | gzip | 비고 |
|---|---|---|
| `index-*.js` (메인) | 146.19 KB | 목표 < 220KB — **통과** |
| `pdf-*.js` | 127.40 KB | 1단계 진입 시에만 동적 로드, 초기 번들 밖 |
| `Badge-*.js` (공용 청크) | 16.81 KB | lazy 라우트들이 공유하는 컴포넌트 묶음 |
| `AlignxPage-*.js` | 4.92 KB | `/alignx` 진입 시에만 로드 |
| `AboutPage-*.js` | 3.03 KB | `/about` 진입 시에만 로드 |
| `AdminPage-*.js` | 2.46 KB | `/admin` 진입 시에만 로드 |
| `AdminFeedbackPage-*.js` | 3.45 KB | `/admin/submissions/:id` 진입 시에만 로드 |
| `MyHistoryPage-*.js` | 5.80 KB | `/my/history` 진입 시에만 로드 |

Phase 11에서 `/alignx`·`/about`·`/admin`·`/admin/submissions/:id`·`/my/history`를 `React.lazy()`로
분리한 뒤 메인 청크가 177KB → 146KB(gzip)로 줄었다. pdf.js(127KB)는 애초에 `src/lib/pdf.ts`가
`import('pdfjs-dist')`로 동적 로드해 초기 번들에 없었다(자산 파이프라인 설계 단계부터 반영).

### 폰트 전송량

프리로드 대상은 `Pretendard-Regular.subset.woff2`(267KB) + `Montserrat-latin.woff2`(50KB) 2개뿐 —
합 317KB, 목표(< 350KB) 이내. (`index.html`의 `<link rel="preload">` 2개로 확인, §7 참고.)

### CLS 위험 요소 코드 점검

- 히어로 이미지: `HeroCard.tsx`가 `aspect-ratio`를 지정해 렌더링 — 레이아웃 시프트 방지 코드는
  있으나, 실제 CLS 수치는 브라우저 측정이 필요하다.
- 폰트 FOUT: 전 `@font-face`가 `font-display: swap` — 전환 시 흔들림이 발생할 수 있는 지점이나,
  실측(Slow 4G에서 CLS 수치)은 못 했다.
