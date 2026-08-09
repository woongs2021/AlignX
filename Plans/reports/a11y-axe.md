# 접근성 스캔 — axe DevTools 미실행

이 환경엔 실제 브라우저가 없어 axe DevTools 확장으로 페이지를 스캔할 수 없다. **Critical/Serious
0건 확인은 사용자가 직접 실행해야 한다.** 아래는 그 대신 수행한 코드 레벨 접근성 점검이다 —
axe가 잡아내는 항목의 상당수(랜드마크, 라벨-입력 연결, 대비, aria 속성 유효성)는 코드만 봐도
판단 가능하지만, 실제 DOM 렌더 결과·포커스 순서 육안 확인은 대체하지 못한다.

## 직접 실행 방법 (권장)

```bash
npm run build && npm run preview
# 다른 터미널에서
npx @axe-core/cli http://localhost:4173/AlignX-dev/ \
  http://localhost:4173/AlignX-dev/portfolio \
  http://localhost:4173/AlignX-dev/portfolio/analyze \
  http://localhost:4173/AlignX-dev/alignx \
  http://localhost:4173/AlignX-dev/my \
  http://localhost:4173/AlignX-dev/about \
  http://localhost:4173/AlignX-dev/admin
```

또는 Chrome에 axe DevTools 확장을 설치하고 각 페이지에서 수동 스캔.

## 코드 레벨 점검 결과

| 항목 | 확인 방법 | 결과 |
|---|---|---|
| `<html lang="ko">` | `index.html` 확인 | PASS |
| 랜드마크(header/nav/main/footer) | `PageShell.tsx`/`TopNav.tsx`/`Footer.tsx` 확인 | PASS |
| Skip link | `PageShell.tsx` — `<a href="#content">본문 바로가기</a>` + `main#content tabIndex=-1` | PASS |
| 페이지당 `h1` 1개 | 각 페이지 컴포넌트 확인 | PASS (라우트별 1개) |
| 양수 `tabIndex` 금지 | `grep tabIndex={[1-9]` | 0건 |
| 모달 포커스 트랩·Esc·복귀 | `Modal.tsx`, `MobileNav.tsx` 코드 확인 | PASS — 포커스 트랩 + Esc + 닫힌 뒤 이전 포커스 복귀 구현 |
| 폼 label 연결 | 전 `<input>`/`<textarea>` `<label htmlFor>` 또는 `aria-label` 확인 | PASS |
| 폼 오류 `aria-describedby`+`aria-invalid` | `MentorRequestForm.tsx`, `AdminGate.tsx` 확인 | PASS |
| 동적 상태 `role="status"`/`aria-live` | `AnalyzingScreen`(분석 진행), `MonitoringScreen`(검증 단계), `AdminGate`(인증 실패) 확인 | PASS |
| 7점 척도 네이티브 radio | `ScaleField.tsx` — `role="radiogroup"` + 실제 `<input type="radio">` | PASS |
| 눈 토글 `aria-pressed`+동적 라벨 | `AdminGate.tsx` 확인 | PASS |
| 드래그앤드롭 키보드 대체 경로 | `UploadZone.tsx` — `<label><input type="file"></label>` 완전 대체 | PASS |
| 바 차트 숫자 라벨 병기 | `ResultScreen`, `PrincipleComparisonTable`, `ScoreTrendChart` 확인 | PASS — 색만으로 정보 전달하지 않음 |
| 이미지 `alt` | `PlaceholderImage.tsx`(장식은 `alt=""`, 의미 있는 이미지는 manifest의 alt) | PASS |
| `prefers-reduced-motion` | `reset.css` 전역 규칙 + Framer Motion `MotionConfig reducedMotion="user"` | PASS |
| 터치 타깃 44×44 | Phase 11에서 감사·수정 (`Plans/11` 참고) | PASS (주요 인터랙션 전수) |

## 코드로 확인 불가능한 항목 (브라우저 필요)

- 실제 포커스 순서가 시각 순서와 일치하는지 (Tab 연타 육안 확인)
- 색 대비가 실제 렌더 픽셀에서도 유지되는지 (특히 히어로 이미지 위 텍스트)
- 스크린리더가 실제로 라이브 리전 변경을 낭독하는지 (VoiceOver 실기 확인 필요 — 아래 참고)
- 200% 확대 시 레이아웃 유지

## VoiceOver 낭독 확인 — 미실행

macOS 실기 + VoiceOver가 필요해 이 환경에서 수행할 수 없다. 1단계(분석 진행 상태)와 2단계(검증
모니터)의 `aria-live="polite"` 리전이 실제로 낭독되는지는 사용자가 직접 확인해야 한다.
