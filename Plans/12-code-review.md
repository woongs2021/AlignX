# Phase 12 — 최종 코드 검수

> 선행: [11-responsive-a11y-perf.md](11-responsive-a11y-perf.md) · 후행: [13-deploy-docs.md](13-deploy-docs.md)
> 프롬프트 14번 — *"계획에는 최종 코드 검수를 할 수 있는 단계도 추가해줘."*
> **이 Phase를 통과하지 못하면 배포하지 않는다.**

---

## 1. 검수 원칙

`CLAUDE.md` 를 검수 기준으로 그대로 사용한다.

| CLAUDE.md 조항 | 검수 질문 |
|---|---|
| §2 Simplicity First | 200줄로 쓴 것을 50줄로 줄일 수 있나? 요청하지 않은 추상화·설정 가능성이 있나? |
| §3 Surgical Changes | 요청 범위를 벗어난 변경이 있나? |
| §4 Goal-Driven | 각 기능의 성공 기준이 검증 가능한가? |

---

## 2. 자동 검사 게이트

전부 통과해야 수동 검수로 넘어간다.

```bash
npm run lint          # ESLint --max-warnings 0
npx tsc --noEmit      # 타입 에러 0
npm run test          # Vitest 전체 통과
npm run build         # 빌드 경고 0
npx depcheck          # 미사용 의존성 0
```

**커스텀 검사**

```bash
# 1. tokens.css 외 hex 리터럴 금지
grep -rEn '#[0-9a-fA-F]{3,8}\b' src/ --include='*.css' --include='*.tsx' \
  | grep -v 'src/styles/tokens.css'          # → 결과 없어야 함

# 2. 이모지 금지 (디자인 시스템 §Don't)
grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/   # → 결과 없어야 함

# 3. 그림자 금지
grep -rn 'box-shadow' src/ | grep -v 'focus'             # 포커스 글로우만 예외

# 4. 잔여 디버그
grep -rn 'console\.log\|debugger\|TODO\|FIXME\|XXX' src/

# 5. 하드코딩된 이미지 경로 (manifest 우회)
grep -rn "images/" src/ | grep -v 'lib/images.ts'
```

---

## 3. 단위 테스트 대상 (Vitest)

UI가 아닌 **순수 로직**에 집중한다. 컴포넌트 스냅샷 테스트는 만들지 않는다(유지비만 든다).

| 대상 | 검증 |
|---|---|
| `dummyEngine.generateAnalysis` | 같은 파일 → 같은 점수 · 범위 0–10 · 총점 = 합산 · 등급 경계값(89/90) |
| `report/scoring` | AI·멘토 가중 평균, 반올림 |
| `mentor/simulator.resumeMentorProgress` | 경과 0s / 중간 / 초과 / 미래 시각 |
| `report/buildHtml` | HTML 이스케이프 — `<script>` 입력이 문자열로 남는가 |
| `store` | 회차 생성·갱신·삭제 · 20개 초과 프리뷰 정리 · Quota 예외 처리 |
| `my/history` 계산 | 증감·평균 상승·완료 회차 필터링 |
| `lib/file` | MIME 판별 · 용량 초과 · 손상 파일 |

목표 커버리지: `features/` + `lib/` 라인 커버리지 **70% 이상**.

---

## 4. 수동 검수 체크리스트

### 4.1 요구사항 대조 (프롬프트 1:1)

| # | 원문 요구 | 확인 |
|---|---|---|
| 1 | CLAUDE.md 원칙 준수 | ☐ |
| 2 | woongdesignv2 디자인 시스템 · **라이트/다크 토글이 상단바 우측** | ☐ |
| 3 | 탭 = HOME + PORTFOLIO 분석 / AlignX AI / MY / ABOUT · RESUME·VALIDATION 없음 | ☐ |
| 5 | HOME 히어로 = 이미지 무한 확산 · Thumbnails 활용 | ☐ |
| 6 | 나머지 페이지 seed-design 구성 · 탭 호버/내비/콘텐츠/스크롤 원칙 · **교체 가능한 썸네일 폴더** | ☐ |
| 7 | Montserrat(영문) + Pretendard(한글) · **전 페이지 동일** · 실제 렌더 폰트 실측 확인 | ☐ |
| 9 | 인트로 + 3단계 · 드래그앤드롭/파일선택 · 로딩 화면 · pdf/gif/png/jpeg · 10원칙 점수 + 합산 · 2단계 버튼 활성화 | ☐ |
| 9-2 | 문서 자동 첨부 · 이름/주제/요청사항 · 7점척도 3항목 · 주관식 후기 · 제출 후 "OOO님…" 화면 · 실시간 단계 모니터링 | ☐ |
| 9-3 | AI+사람 결과 통합 · **HTML 다운로드** | ☐ |
| 9-4 | 모든 단계에 적절한 문구 + 썸네일 | ☐ |
| 10 | AlignX AI 페이지 · 로고 SVG · 더미 상세 설명 | ☐ |
| 11 | MY: 단계·점수·1~3단계 한 화면 · 1회 단일/다회 카드 · N회 이력 분석 | ☐ |
| 12 | Admin 암호 `portfolio2026` · **눈 토글** · 제출 현황 · 멘토 피드백 · Portfolio-samples | ☐ |
| 13 | 비주얼 완성도 | ☐ |
| 14 | 최종 코드 검수 단계 (이 문서) | ☐ |
| 15 | GitHub Pages 배포 + README | ☐ |

### 4.2 디자인 시스템 준수

- [ ] 한 페이지 = 한 톤 세트. 혼용 0건 ([00 §6.1](00-overview.md) 매핑과 일치)
- [ ] `weight 700` 페이지당 최대 1회
- [ ] 그림자 0건 (포커스 글로우 제외)
- [ ] 순백 `#FFFFFF` · 순흑 `#000000` 미사용
- [ ] 카드 radius 28px(tile) 기본
- [ ] 섹션 80 / 카드 24 / 헤더-본문 48 여백 리듬
- [ ] 영문 라벨 + 한글 제목 더블 라인 패턴 일관 적용
- [ ] 이모지 · 일러스트 · 코어 그라디언트 0건
- [ ] Footer가 라이트 모드에서도 deep 유지

### 4.3 전체 플로우 E2E (수동)

**시나리오 A — 학생 첫 사용**
1. HOME 진입 → 히어로 스크롤 → CTA
2. 인트로 → 분석 시작 → PDF 업로드 → 로딩 6단계 → 점수 확인
3. 2단계 → 폼 작성 → 제출 → 검증 모니터
4. 새로고침 → 상태 유지 확인
5. 완료 → 3단계 → HTML 다운로드 → **파일을 열어 확인**
6. MY → 1회 상세 뷰

**시나리오 B — 반복 사용**
7. 2회차·3회차 수행 → MY 카드 그리드 → 이력 분석 버튼 활성 → `/my/history` 확인

**시나리오 C — 관리자**
8. `/admin` → 오답 1회 → 눈 토글 → 정답 → 대시보드
9. 검증 중 항목 → 피드백 작성 → 확정
10. 학생 화면 복귀 → 완료 반영 확인

**시나리오 D — 파괴적 입력**
11. 100MB PDF / `.exe` 를 `.pdf` 로 위장 / 0바이트 파일
12. 이름에 `<script>alert(1)</script>`
13. localStorage 수동 훼손(잘못된 JSON) → 앱이 죽지 않고 초기화 안내
14. 미완료 상태로 `/portfolio/report`, `/my/history` 직접 진입
15. 브라우저 뒤로/앞으로 연타

### 4.4 코드 품질

- [ ] 200줄 초과 컴포넌트 없음 (초과 시 분리 근거 명시)
- [ ] 중복 로직 3회 이상 반복 0건
- [ ] `any` 타입 0건 (불가피하면 주석으로 근거)
- [ ] 매직 넘버가 `config.ts` / `tokens.css` 로 추출됨 (`HISTORY_UNLOCK_THRESHOLD`, `ADMIN_PASSCODE`, 가중치, 단계 소요시간)
- [ ] `dummyEngine` 이 UI에서 직접 import 되지 않음 ([05 §4.2](05-portfolio-step1.md) 경계면 유지)
- [ ] 미사용 export · 죽은 코드 없음
- [ ] `useEffect` 정리 함수 누락 없음 (타이머·옵저버·`revokeObjectURL`)
- [ ] 에러 바운더리로 화면 전체 크래시 방지

---

## 5. 산출물

`Plans/reports/` 에 다음을 남긴다.

| 파일 | 내용 |
|---|---|
| `contrast-matrix.md` | 4톤 × 2모드 대비 실측표 |
| `lighthouse.md` | 페이지별 Lighthouse 4개 지표 |
| `a11y-axe.md` | axe 스캔 결과 |
| `review-log.md` | 발견 이슈 · 수정 여부 · 미수정 사유 |

**미수정 항목은 숨기지 않고 `review-log.md` 에 사유와 함께 남긴다.**

---

## 6. 통과 게이트

아래를 **전부** 만족해야 Phase 13(배포)으로 넘어간다.

- [ ] §2 자동 검사 전부 통과
- [ ] §3 테스트 통과 + 커버리지 70%
- [ ] §4.1 요구사항 대조표 전 항목 체크
- [ ] §4.3 시나리오 A–D 완주, 크래시 0건
- [ ] [11](11-responsive-a11y-perf.md) 완료 기준 전부 충족
- [ ] §5 산출물 4종 작성
- [ ] 폰트 — 한글 Pretendard · 영문 Montserrat 실측 확인, 디스플레이 weight 300 실제 적용, `dist/` 에 TTF·OTF 0개, OFL 라이선스 동봉 ([02 §7](02-design-tokens.md))
- [ ] [00 §9](00-overview.md) 에 새로 추가된 P0 없음
