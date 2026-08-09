# 최종 코드 검수 로그 (Phase 12)

검수 기준: `CLAUDE.md` (Simplicity First · Surgical Changes · Goal-Driven) + `Plans/12-code-review.md`.

---

## 1. 자동 검사 게이트 (§2) — 전부 통과

```
npm run lint          → 0 warnings/errors
npx tsc --noEmit       → 0 errors
npm run test           → 199/199 통과 (30 파일)
npm run build          → 0 warnings, dist 정상 생성
npx depcheck           → No depcheck issue
```

### 커스텀 검사

| # | 검사 | 결과 |
|---|---|---|
| 1 | `tokens.css` 밖 hex 리터럴 | 0건 (예외: `buildHtml.ts`/`buildHistoryHtml.ts` — 독립 실행되는 정적 HTML 리포트 문자열 빌더라 `var()` 참조가 불가능해 처음부터 자체 팔레트를 인라인해왔음. Phase 07/09 설계 시점부터의 의도적 예외) |
| 2 | 이모지 금지 | 아래 "검토 후 유지" 참고 |
| 3 | `box-shadow` 금지(포커스 제외) | `Field.module.css`의 포커스 글로우 1건만 남음(허용 대상). `AttemptCard.module.css`의 드롭다운 메뉴 그림자는 **발견 즉시 제거**(§2 수정 항목 참고) |
| 4 | `console.log`/`debugger`/`TODO`/`FIXME`/`XXX` | 0건 |
| 5 | `images/` 경로 하드코딩 | 0건 (매니페스트 우회 없음. 매치된 2건은 `test/setup.ts`의 테스트 픽스처 로드와 `PlaceholderImage.tsx`의 JSDoc 주석으로, 둘 다 실제 우회가 아님) |

---

## 2. 발견 후 수정한 항목

| 이슈 | 파일 | 조치 |
|---|---|---|
| 드롭다운 메뉴에 `box-shadow` 사용 (그림자 금지 위반) | `src/pages/my/AttemptCard.module.css` | 제거. 테두리를 `--stroke` → `--stroke-strong`으로 올려 배경과의 구분은 유지 |
| 코드 주석에 이모지(⚠️) 사용 | `src/router.tsx`, `src/types/index.ts` | 평문("주의:")으로 치환 |
| 이미지 폴백 배경에 `rgba(0,0,0,0.06)` 하드코딩, 글자 크기 `1.25rem`/패딩 `1rem` 하드코딩, `font-weight: 700` | `src/components/PlaceholderImage.module.css` | `var(--soft)`/`var(--t-kr-3)`/`var(--sp-lg)`/`weight 500`로 토큰화 — 그림자 규칙과 별개로, 디자인 시스템이 하드코딩 색상을 하나 놓치고 있던 걸 발견 |
| ADMIN 화면 `100vh` (모바일 주소창 대응 안 됨) | `AdminGate.module.css`, `AdminFeedbackPage.module.css` | `100dvh` 폴백 추가(구형 브라우저용 `100vh`는 유지) |
| `AttemptCard`의 ⋯ 메뉴 버튼이 32×32(44×44 미달) | `AttemptCard.module.css` | 44×44로 확대 |
| 정렬/필터 pill 버튼 4곳이 36~40px(44×44 미달) | `AdminPage`/`AttemptGrid`/`PrincipleChangeTable`/`PrincipleComparisonTable` | 44px로 통일 |
| `--t-label`이 모바일에서도 데스크톱과 동일한 12px | `typography.css` | 모바일(`max-width:767px`)에서 13px로 상향 |
| 라우트 전체가 하나의 JS 청크로 번들링(코드 분할 없음) | `router.tsx` | `/alignx`·`/about`·`/admin`·`/admin/submissions/:id`·`/my/history`를 `React.lazy()`로 분리. 메인 청크 177KB→146KB(gzip) |
| **에러 바운더리 부재** — 렌더 중 예외가 나면 화면 전체가 빈 화면이 됨 | 신규 `src/layout/ErrorBoundary.tsx` | `PageShell`의 `<Outlet>`을 감싸도록 추가. TopNav/Footer는 살아있어 다른 페이지로 탈출 가능. 라우트 전환 시 `motion.div`의 `key={pathname}`을 상속해 자동으로 에러 상태가 리셋됨 |
| 미사용 export 2건(`getHero`, `activeStageIndex`)과 그로 인해 고아가 된 `HERO_WIDTHS` 상수 | `src/lib/images.ts`, `src/features/mentor/simulator.ts` | 삭제 (`ts-prune`으로 발견, 프로덕션·테스트 코드 어디서도 참조 없음 확인 후 제거) |
| 정렬/필터 pill 토글이 `AdminPage`·`AttemptGrid`·`PrincipleChangeTable`·`PrincipleComparisonTable` 4곳에서 각자 구현(상태·마크업·CSS 중복) | 신규 `src/components/ToggleGroup.tsx` | 공용 컴포넌트로 추출(`activeVariant`로 톤별 강조색 차이는 유지). 4개 CSS 블록 삭제, 각 페이지는 옵션 배열만 넘김 |
| `AdminFeedbackPage.tsx` 388줄 (200줄 기준 초과) | 신규 `src/pages/admin/feedback/*.tsx` 5개 | `SubmissionPreview`/`StageControl`/`PrincipleCommentList`/`FeedbackComposer`/`ConfirmedFeedbackCard`로 분리. 388→250줄 |
| `lib/download.ts` 테스트 커버리지 0% | `src/lib/download.test.ts` 신규 | `URL.createObjectURL` 모킹 테스트 추가 |
| **실제 버그**: localStorage에 깨진 JSON이 들어있으면 zustand `persist` 하이드레이션이 끝나지 않고 무한정 멈춤(§4.3 시나리오 D-13을 실제로 재현해보다 발견) | `src/store/useAppStore.ts` | `resilientStorage.getItem`이 반환 전에 `JSON.parse`로 직접 검증 — 깨졌으면 해당 키를 지우고 `null`을 돌려줘 persist가 정상적으로 초기 상태를 쓰게 만든다. 재현 테스트로 수정 전 실패(5초 타임아웃)→수정 후 통과 확인 |
| 저장 공간 경고(`useStorageWarningStore`)가 Phase 02부터 정의만 되고 어떤 화면에도 표시되지 않음 | 신규 `src/layout/StorageWarningBanner.tsx` | `PageShell`에 배선해 전 페이지 공통 배너로 노출. 위 JSON 손상 복구 메시지도 이 배너로 보인다 |

---

## 3. 검토했지만 수정하지 않은 항목 (사유 명시)

이 섹션은 숨기지 않는다 — Phase 12 §5 지침에 따라 미수정 항목을 사유와 함께 남긴다.

| 이슈 | 검토 내용 | 미수정 사유 |
|---|---|---|
| 체크마크(✓)·원형(●○) 문자가 이모지 금지 grep에 잡힘 | `StepIndicator.tsx`, `MonitoringScreen.tsx`, `AnalyzingScreen.tsx`, `SingleAttemptView.tsx` 4곳 | 이 문자들은 U+2700–27BF(Dingbats)/기하학 도형 블록에 속해 계획서의 grep 정규식(`\x{2600}-\x{27BF}`)과 우연히 겹칠 뿐, 실제로는 `currentColor`를 상속하는 단색 타이포그래피 기호이지 플랫폼마다 다르게 렌더되는 컬러 픽토그램(이모지)이 아니다. 디자인 시스템이 실제로 금지하는 대상(👁️ 같은 이모지)과는 다르며, 이미 4개 화면에서 "완료" 상태를 나타내는 일관된 시각 언어로 자리잡아 있어 지금 SVG로 교체하면 이득 없이 회귀 위험만 커진다. |
| HOME 히어로의 `radial-gradient(ellipse at center, var(--bg) 0%, transparent 70%)` | `HeroSection.module.css` | 문법상 `gradient` 함수를 쓰지만 색상 전환이 아니라 **단일 색(`--bg`) → 투명**으로 빠지는 비네트(그러데이션 아닌 스포트라이트 효과)다. 여러 색을 섞는 "코어 그라디언트"(디자인 시스템이 금지하는, 흔한 SaaS풍 배경)와는 다른 기법이며, 코드 주석에 이미 "그림자는 쓰지 않는다"는 의도가 남아있어 이전 Phase에서 검토된 결정으로 판단해 유지했다. |
| `MentorRequestForm.tsx` 310줄, `SingleAttemptView.tsx` 212줄 — 200줄 기준 초과 | 분리 가능성 검토 | `MentorRequestForm`은 5개 필수 필드가 하나의 `draft` 상태·검증·자동저장을 공유하는 단일 폼이라, 필드별로 쪼개면 각 조각에 6개 안팎의 prop을 다시 꽂아야 해서 복잡도가 줄지 않고 이동만 한다(CLAUDE.md §2: 요청하지 않은 추상화 금지). `SingleAttemptView`는 기준을 12줄 초과할 뿐이고, 이미 3개의 명확한 하위 컴포넌트(AiCard/MentorCard/ReportCard)로 내부 구조가 나뉘어 있어 파일 분리가 가독성에 주는 이득이 적다고 판단했다. `AdminFeedbackPage`(원래 388줄)만 실제로 분리해 250줄로 줄였다. |
| `AdminFeedbackPage.tsx` 250줄 — 분리 후에도 200줄 초과 | 추가 분리 검토 | 5개 하위 컴포넌트로 뺀 뒤 남은 것은 라우팅·실제/샘플 회차 분기·초안 자동저장·5개 핸들러·2개 모달 배선이라는 페이지 orchestration 자체다. 더 쪼개면 상태를 여러 파일에 걸쳐 prop으로 전달해야 해서 오히려 추적하기 어려워진다고 판단했다. |
| `lib/pdf.ts`(9.5%)·`lib/preview.ts`(8.3%) 낮은 테스트 커버리지 | 단위 테스트 작성 가능성 검토 | pdfjs-dist 실제 파싱, `createImageBitmap`, `HTMLCanvasElement.getContext('2d')`/`toDataURL`을 요구하는데 jsdom은 이 중 어느 것도 구현하지 않는다. 의미 있게 테스트하려면 네이티브 canvas 폴리필을 테스트 환경에 새로 배선해야 해서, 이번 Phase 범위를 벗어난다고 판단해 보류했다. `features/`+`lib/` 전체 라인 커버리지는 이미 85.11%로 70% 목표를 넘겨 게이트 자체는 통과한다. |
| Zustand persist 쓰기 500ms 디바운스 (Phase 11 항목, 재확인) | Phase 11에서 사용자와 함께 검토 | 스토어는 키 입력마다 쓰지 않고(폼 초안은 이미 별도 localStorage+300ms 디바운스) 드문 이벤트에만 쓰므로 디바운스의 실익이 없고, 오히려 탭을 닫는 타이밍에 따라 최근 500ms 변경이 유실될 위험과 "생성 직후 즉시 반영" 테스트 계약 파괴만 남는다. 사용자와 상의해 적용하지 않기로 확정. |

---

## 4. 코드 품질 체크리스트 (§4.4)

| 항목 | 결과 |
|---|---|
| 200줄 초과 컴포넌트 없음 | `MentorRequestForm.tsx`(310)·`AdminFeedbackPage.tsx`(250)·`SingleAttemptView.tsx`(212) 3건 — 위 §3에 사유 명시 |
| 중복 로직 3회 이상 반복 0건 | 정렬/필터 pill 토글 4곳 중복 발견 → `ToggleGroup`으로 통합(§2) |
| `any` 타입 0건 | `grep '\bany\b'` 결과 0건 |
| 매직 넘버가 config/tokens로 추출 | `HISTORY_UNLOCK_THRESHOLD`·`ADMIN_PASSWORD`·`ADMIN_SESSION_DURATION_MS`(`data/constants.ts`), 가중치(`report/scoring.ts`), 단계 소요시간(`STAGE_CONFIG`, `mentor/simulator.ts`) — 전부 단일 소스, 중복 하드코딩 0건 확인 |
| `dummyEngine`이 UI에서 직접 import되지 않음 | `grep dummyEngine` — `.test.ts` 외 매치 0건. `AnalysisProvider` 경계(`features/analysis/index.ts`) 유지 확인 |
| 미사용 export·죽은 코드 없음 | `ts-prune`으로 전수 스캔 → 진짜 죽은 코드 2건(`getHero`, `activeStageIndex`) 발견해 제거. 나머지 리포트 항목(`AppState`, `STAGE_LABELS`, `STAGE_COPY`, `provider`, config 파일 default export)은 전부 실사용 확인된 false positive |
| `useEffect` 정리 함수 누락 없음 | `setInterval`/`addEventListener` 전체 사용처(14곳) 확인 — 전부 cleanup 함수 존재 |
| 에러 바운더리로 화면 전체 크래시 방지 | 부재 발견 → `ErrorBoundary` 신규 작성·배선(§2) |

---

## 5. 단위 테스트 커버리지 (§3)

```
npx vitest run --coverage --coverage.include='src/features/**' --coverage.include='src/lib/**'
```

| 범위 | Lines | 목표 |
|---|---|---|
| `features/` + `lib/` 전체 | **85.11%** | ≥ 70% — 통과 |
| `features/admin` | 100% | |
| `features/analysis` | 95% | |
| `features/history` | 97.14% | |
| `features/mentor` | 98.61% | |
| `features/report` | 97.82% | |
| `lib/` | 63.26% | pdf.ts·preview.ts가 낮춤(사유는 §3 참고) |

계획서 §3에 명시된 7개 대상(`generateAnalysis`/`scoring`/`resumeMentorProgress`/`buildHtml`/`store`/
`my/history` 계산/`lib/file`) 전부 전용 테스트 존재 확인.

---

## 6. 요구사항 대조표 (§4.1)

| # | 요구 | 확인 |
|---|---|---|
| 1 | CLAUDE.md 원칙 준수 | 이 문서 전체가 그 검수 결과 |
| 2 | 라이트/다크 토글 상단바 우측 | `TopNav.tsx` — `.actions`(우측 정렬) 안에 `ThemeToggle` 배치 확인 |
| 3 | 탭 = HOME + 4개, RESUME·VALIDATION 없음 | `layout/navItems.ts` — `NAV_ITEMS` 4개(PORTFOLIO 분석/AlignX AI/MY/ABOUT) + 로고=HOME. RESUME/VALIDATION 검색 결과 0건 |
| 5 | HOME 히어로 이미지 무한 확산 | `HeroMarquee.tsx` — CSS 애니메이션 기반 3행(모바일 2행) 무한 스크롤, Thumbnails 활용(`public/images/hero/`) |
| 6 | 나머지 페이지 seed-design 구성, 교체 가능한 썸네일 폴더 | `public/images/manifest.json` 경유 참조 체계(§9.1) 확인 |
| 7 | Montserrat+Pretendard 전 페이지 동일, 실측 확인 | 폰트 스택은 코드로 확인(§7). **렌더 폰트 실측(DevTools)은 브라우저 필요 — 미실행** |
| 9 | 1단계 전체 요구 | Phase 05 구현 확인, `Step1Page`/`UploadZone`/`AnalyzingScreen`/`ResultScreen` 전부 존재 |
| 9-2 | 2단계 전체 요구 | Phase 06 구현 확인, `MentorRequestForm`/`MonitoringScreen` 존재, 실시간 모니터링 |
| 9-3 | AI+사람 통합, HTML 다운로드 | Phase 07 구현 확인, `buildReportHtml` + 다운로드 버튼 |
| 9-4 | 전 단계 문구+썸네일 | 각 Phase에서 `PlaceholderImage`/카피 확인 |
| 10 | AlignX AI 페이지 · 로고 SVG · 더미 설명 | Phase 08 구현 확인 |
| 11 | MY 화면 요구 | Phase 09 구현 확인, 0/1/2/3회 4단계 분기 |
| 12 | Admin 암호·눈 토글·제출 현황·피드백·샘플 | Phase 10 구현 확인, `portfolio2026` 확인 |
| 13 | 비주얼 완성도 | **주관적 판단 필요 — 브라우저에서 직접 확인 권장** |
| 14 | 최종 코드 검수 단계 | 이 문서(Phase 12) |
| 15 | GitHub Pages 배포 + README | Phase 13 대상, 아직 미착수 |

---

## 7. 폰트 최종 확인

| 항목 | 결과 |
|---|---|
| `dist/`에 TTF·OTF 0개 | `find dist -iname '*.ttf' -o -iname '*.otf'` → 결과 없음 |
| OFL 라이선스 동봉 | `dist/fonts/Montserrat-OFL.txt`, `dist/fonts/Pretendard-LICENSE.txt` 확인 |
| 초기 프리로드 2개만 | `index.html` — Pretendard-Regular(267KB) + Montserrat-latin(50KB) = 317KB, 목표(<350KB) 이내 |
| 디스플레이 weight 300 실제 적용 | `.display-1/2/3`·`.impact`(base) 클래스가 `font-weight: 300` 지정 확인(코드 레벨) |
| 한글=Pretendard/영문=Montserrat 실측 | Montserrat `@font-face`에 라틴 전용 `unicode-range` 지정 → 한글 문자는 CSS 캐스케이드 규칙상 자동으로 다음 폰트(Pretendard)로 폴백됨을 코드로 확인. **DevTools "Rendered Fonts" 패널 실측은 브라우저 필요 — 미실행** |

---

## 8. E2E 시나리오 (§4.3) — 자동화 테스트로 커버된 범위

브라우저 없이 수행 가능한 범위는 Vitest + Testing Library로 실제 사용자 흐름을 흉내 낸
통합 테스트로 커버했다(store 상태를 실제로 갱신하고 화면 텍스트를 검증). 다만 **실제 브라우저
클릭·스크롤·파일 드래그는 대체하지 못한다.**

| 시나리오 | 자동화 커버 | 비고 |
|---|---|---|
| A-2~5 (분석→제출→모니터→새로고침→완료→리포트) | `step2-3.test.tsx` | 실제 PDF 업로드 UI는 미검증(더미 파일 객체 사용) |
| A-6 (MY 1회 상세 뷰) | `my.test.tsx` | |
| B (2·3회차, 이력 분석) | `my.test.tsx`, `history.test.tsx` | |
| C (Admin 인증→피드백→학생 화면 반영) | `AdminGate.test.tsx`, `AdminFeedbackPage.test.tsx` | 오답→눈토글→정답, 피드백 확정→`/portfolio/mentor` 완료 반영까지 실제 검증 |
| D-12 (`<script>` 입력) | `buildHtml.test.ts`, `buildHistoryHtml.test.ts` | XSS 이스케이프 확인 |
| D-13 (localStorage 훼손) | `useAppStore.test.ts` | **재현해서 실제 버그를 발견·수정했다** — 위 §2 참고. 수정 전에는 하이드레이션이 무한정 멈췄다 |
| D-11 (100MB/`.exe` 위장/0바이트) | `file.test.ts` | 용량 초과·MIME 불일치는 커버, 실제 위장 파일 시나리오는 부분적 |
| D-14 (미완료 상태로 직접 진입) | `router.test.tsx` | 가드 리다이렉트 전수 테스트 존재 |
| D-15 (뒤로/앞으로 연타) | 미검증 | 브라우저 히스토리 연타는 자동화 어려움 — **수동 확인 권장** |

**결론: D-13은 실제로 재현해 크래시급 버그(하이드레이션 무한 대기)를 찾아 고쳤다.** D-15만 이
환경에서 재현하지 못한 채 남아있다 — 배포 전 수동으로 한 번 확인할 것을 권장한다.
