# Phase 11 — 반응형 · 접근성 · 성능

> 선행: Phase 04–10 전부 · 후행: [12-code-review.md](12-code-review.md)
> 목표: 개별 화면이 아니라 **사이트 전체를 하나의 기준으로** 통과시킨다.

이 Phase는 새 기능을 만들지 않는다. 이미 만든 것을 기준에 맞춰 **고치는** 단계다.

---

## 1. 반응형

### 1.1 브레이크포인트

| 이름 | 폭 | 주요 변화 |
|---|---|---|
| Mobile | < 768px | 햄버거 내비 · 그리드 1-up · 히어로 2행 · 테이블→카드 |
| Tablet | 768–1024px | 내비 압축 · 그리드 2-up · 목차 미노출 |
| Desktop | 1024–1440px | 전체 메뉴 · 그리드 3-up · sticky 목차 |
| Wide | > 1440px | 좌우 여백 증가 · `max-width: 1280px` 고정 |

### 1.2 페이지별 점검표

| 페이지 | 모바일 핵심 |
|---|---|
| HOME | 히어로 3행→2행, 카드 220px, 헤드라인 컨테이너 초과 없음 |
| 1단계 | 업로드 존 최소 240px, 로딩 좌우 2단→세로 스택, 바 차트 유지 |
| 2단계 | **7점 척도가 가로로 들어가는지** — 안 되면 숫자만 + 앵커 상하 분리 |
| 3단계 | 대조표 → 원칙별 카드 스택 |
| MY | 카드 1-up, 라인 차트 세로형 |
| ADMIN | 테이블 → 카드 리스트, 피드백 2단 → 탭 전환 |

### 1.3 규칙

- 터치 타깃 최소 **44×44** (7점 척도 노드·눈 토글·탭·카드 액션 전부)
- **가로 스크롤 0** — `html { overflow-x: hidden }` 로 덮지 말고 원인을 찾아 고친다
- 100vh 대신 **`100dvh`** (모바일 주소창 대응)
- 본문 `--t-body` 는 모바일에서도 17px 이하로 줄이지 않는다
- 라벨 12px은 모바일에서 13px로 **키운다** (디자인 시스템 §Responsive)
- 실기기 확인: iOS Safari 1종, Android Chrome 1종 최소

---

## 2. 접근성 (WCAG 2.1 AA 목표)

### 2.1 필수 항목

| 영역 | 기준 |
|---|---|
| 색 대비 | 본문 4.5:1 · 대형 텍스트 3:1 — **4톤 × 2모드 전수** ([02 §2.4](02-design-tokens.md)) |
| 키보드 | 모든 인터랙션 Tab 도달 · Enter/Space 실행 · **포커스 링 항상 보임** |
| 포커스 순서 | DOM 순서 = 시각 순서. `tabIndex` 양수 금지 |
| 모달/오버레이 | 포커스 트랩 · Esc 닫기 · 닫은 뒤 원래 요소로 포커스 복귀 |
| 폼 | 모든 입력에 `<label>` · 오류는 `aria-describedby` + `aria-invalid` |
| 동적 상태 | 분석 진행·검증 단계·인증 실패 = `role="status"` / `aria-live="polite"` |
| 이미지 | 의미 있는 이미지에 `alt`, 장식 이미지는 `alt=""` |
| 랜드마크 | `header` / `nav` / `main` / `footer` + Skip link |
| 제목 구조 | 페이지당 `h1` 1개, 레벨 건너뛰기 없음 |
| 모션 | `prefers-reduced-motion` 전면 대응 |
| 언어 | `<html lang="ko">` |

### 2.2 이 프로젝트의 위험 지점 (집중 점검)

1. **히어로 마퀴** — 무한 애니메이션. 정지 수단 또는 reduced-motion 대체 필수
2. **7점 척도** — 커스텀 컴포넌트로 만들면 접근성이 무너진다. 네이티브 radio 그룹 유지
3. **드래그앤드롭** — 마우스 전용이 되지 않도록 파일 선택 버튼이 **키보드로 완전 동작**해야 함
4. **눈 토글** — `aria-pressed` + 동적 라벨
5. **이미지 위 텍스트** (히어로) — 대비 측정을 실제 이미지 위에서 수행
6. **바 차트** — 색만으로 정보를 전달하지 않는다. 숫자 라벨 병기 필수
7. **`--fg-muted` 0.6 알파** — 캡션·메타에서 4.5:1 미달 가능. 실측 후 필요시 0.66으로 상향

### 2.3 검증 방법

- axe DevTools 전 페이지 스캔 — **Critical/Serious 0건**
- 키보드만으로 전 플로우 완주: HOME → 분석 → 제출 → 리포트 다운로드
- macOS VoiceOver 로 1단계·2단계 낭독 확인
- 브라우저 200% 확대에서 레이아웃 유지

---

## 3. 성능

### 3.1 목표

| 지표 | 목표 | 측정 |
|---|---|---|
| LCP | < 2.5s | Lighthouse Mobile, Slow 4G |
| CLS | < 0.05 | 〃 |
| INP | < 200ms | 〃 |
| Lighthouse Performance | ≥ 85 (Mobile) | 〃 |
| Lighthouse A11y | ≥ 95 | 〃 |
| 초기 JS (gzip) | < 220KB | `vite build` 출력 |
| 초기 폰트 전송량 | < 350KB | Network 패널 (preload 2개 = Montserrat ~50KB + Pretendard Regular ~267KB) |
| HOME 총 전송량 | < 3MB | Network 패널 |

### 3.2 조치

**이미지** ([01 §3.5](01-setup-infra.md))
- WebP + `srcSet`/`sizes`, LQIP 크로스페이드
- 모든 `<img>` 에 `width`/`height` 또는 `aspect-ratio` — **CLS의 최대 원인**
- 히어로 첫 6장 `fetchpriority="high"`, 나머지 lazy

**코드 분할**
```
route-level lazy():  /alignx  /about  /admin  /my/history
공용 청크:            React · Router · Zustand
무거운 의존성 지연:    pdfjs-dist → 1단계 진입 시 동적 import (~350KB, 초기 번들에서 제외)
                    lenis, motion → 필요 라우트에서만
```

**폰트** ([02 §3.1.2–3.1.4](02-design-tokens.md))
- 총 4개 woff2, 약 856KB. Montserrat Variable 1개(~50KB) + Pretendard subset 3개(각 ~267KB)
- Montserrat에 **`unicode-range` 라틴 한정** — 없으면 한글까지 Montserrat이 매칭돼 Pretendard가 로드되지 않는다
- preload는 Pretendard Regular + Montserrat **2개만**, `crossorigin` 필수 (과다 preload는 오히려 LCP를 악화시킨다)
- 전 폰트 `font-display: swap`
- FOUT 레이아웃 흔들림이 CLS 0.05를 넘으면 폴백 스택에 `size-adjust` / `ascent-override` 적용 검토

**런타임**
- 마퀴/스캔선은 `transform`·`opacity` 만 (레이아웃 프로퍼티 애니메이션 금지)
- 탭 비활성 시 애니메이션 정지
- `IntersectionObserver` 사용, scroll 리스너 최소화. 불가피하면 `passive: true`
- Zustand `persist` 쓰기 디바운스 500ms — 매 키 입력마다 localStorage 쓰기는 비싸다
- 리스트는 `key` 안정화, `React.memo` 는 **측정 후에만** 적용

### 3.3 번들 점검

`rollup-plugin-visualizer` 로 1회 분석 → 예상 밖 대형 의존성 색출.

---

## 4. 브라우저 지원

Chrome / Edge / Safari / Firefox **최신 2개 버전** + iOS Safari 16+.
IE·레거시 미지원. `color-mix()`, `dvh`, `:has()` 사용 가능 (Safari 16.4+ 기준 충족).

---

## 5. 완료 기준

- [ ] 360 / 768 / 1024 / 1440 / 1920 **5개 폭** 전 페이지 스크린샷 확인
- [ ] 가로 스크롤 발생 0건
- [ ] 실기기(iOS·Android) 각 1종 확인
- [ ] axe Critical/Serious 0건
- [ ] 키보드만으로 전체 플로우 완주 성공
- [ ] VoiceOver 로 분석·검증 진행 상태가 낭독됨
- [ ] 색 대비 8개 조합 전수 통과 (결과표 [12](12-code-review.md) 에 첨부)
- [ ] Lighthouse Mobile: Performance ≥ 85, A11y ≥ 95, Best Practices ≥ 95
- [ ] 초기 JS gzip < 220KB, pdfjs가 초기 번들에 없음
- [ ] 초기 폰트 전송량 < 350KB, 한글이 Pretendard로 렌더 (Rendered Fonts 실측)
- [ ] `prefers-reduced-motion` 에서 전 애니메이션 정지
- [ ] 200% 확대에서 레이아웃 유지
