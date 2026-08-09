# Phase 05 — 포트폴리오 분석 · 인트로 + 1단계(업로드 · AI 스코어링)

> 선행: [03-layout-navigation.md](03-layout-navigation.md) · 후행: [06-portfolio-step2.md](06-portfolio-step2.md)
> 톤: **Cool · Blue** — 도구·데이터 맥락 · 프롬프트 9번

---

## 1. 라우트 & 진행 셸

```
/portfolio           인트로 (설명 + [분석 시작])
/portfolio/analyze   1단계 ← 이 문서
/portfolio/mentor    2단계 → Phase 06
/portfolio/report    3단계 → Phase 07
```

`PortfolioLayout` — 3개 단계 라우트를 감싸며 상단에 **StepIndicator** 고정.

```
①  AI 분석 ————— ②  멘토 검증 ————— ③  통합 리포트
   완료(채워짐)      진행(--primary)      대기(--mute)
```

- pill 노드 + 연결선. 완료 `--primary` 채움 / 진행 `--primary` 링 + 펄스 / 대기 `--mute`
- 완료된 단계만 클릭으로 되돌아갈 수 있다. 미도달 단계는 `aria-disabled`
- 모바일에서는 "2 / 3 · 멘토 검증" 텍스트 + 6px ProgressBar 로 축약

---

## 2. `/portfolio` — 인트로

| 섹션 | 내용 |
|---|---|
| 헤드 | `PORTFOLIO ANALYSIS` / "3단계로 검증하는 내 포트폴리오" |
| 리드 | AI가 10대 원칙으로 채점하고, 현직 멘토가 그 위에 사람의 판단을 얹습니다. 두 결과를 한 장의 리포트로 받습니다. |
| 3단계 설명 | 각 단계 = 썸네일 + 소요 시간 + 산출물. 썸네일 키 `step1-loading` / `step2-mentor` / `step3-report` |
| 준비물 | 지원 포맷 · 용량 · 권장 페이지 수 카드 |
| 주의 | "분석 결과는 브라우저에만 저장됩니다. 기기를 바꾸면 사라집니다." (`badge-warning`) |
| CTA | `[ 분석 시작하기 ]` → `/portfolio/analyze` · 진행 중 회차가 있으면 `[ 이어서 하기 ]` 동시 노출 |

---

## 3. 1단계 화면 상태 머신

```
idle ──파일 선택──► validating ──통과──► analyzing ──► result
  ▲                    │                    │
  └──── error ◄────────┘                    └── (실패 시) error
```

### 3.1 `idle` — 업로드 존

- **드래그앤드롭 + 클릭 파일 선택** 동시 지원 (프롬프트 9번)
- 점선 2px `--stroke` 테두리, radius `--r-frame`, 최소 높이 320px
- 드래그 오버: 테두리 `--primary` 실선 + 배경 `--tint`. `dragleave` 오탐 방지를 위해 **카운터 방식**으로 처리
- 중앙: 업로드 아이콘(인라인 SVG) + "포트폴리오를 여기에 놓으세요" + "또는 파일 선택" 버튼
- 하단 메타: `PDF · PNG · JPEG · GIF · 최대 50MB · 1개 파일`
- 숨은 `<input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif">` — 키보드로도 도달 가능해야 한다 (`label` 연결, Enter/Space 동작)

### 3.2 `validating` — 검증 규칙

| 규칙 | 실패 메시지 |
|---|---|
| MIME이 `application/pdf`, `image/png`, `image/jpeg`, `image/gif` 중 하나 | "PDF, PNG, JPEG, GIF 파일만 분석할 수 있습니다." |
| 크기 ≤ 50MB | "파일이 너무 큽니다. 50MB 이하로 줄여주세요." |
| 파일 1개 | "한 번에 한 개 파일만 분석합니다." |
| 실제 열림 (PDF는 pdf.js 파싱 성공) | "파일을 열 수 없습니다. 손상되었는지 확인해주세요." |

⚠️ **확장자가 아닌 MIME + 매직 넘버로 판별한다.** 확장자만 믿으면 `.pdf` 로 이름만 바꾼 파일에서 파싱이 터진다.

**프리뷰 생성** — PDF는 pdf.js로 1페이지 렌더, 이미지는 그대로 → `<canvas>` 로 **폭 640px JPEG q0.7** 축소 → `previewDataUrl`.
원본은 세션 메모리에만 유지하고 저장하지 않는다 ([00 §7](00-overview.md) 저장 규칙).

### 3.3 `analyzing` — 로딩 화면 ★

프롬프트 9번 "AI가 여러 단계를 분석해주는 로딩 화면". 총 **약 9초**.

| # | 단계 라벨 | 소요 |
|---|---|---|
| 1 | 파일 구조 해석 | 1.2s |
| 2 | 레이아웃 · 그리드 추출 | 1.6s |
| 3 | 컬러 · 타이포 토큰 분석 | 1.4s |
| 4 | 콘텐츠 내러티브 파싱 | 1.8s |
| 5 | 10대 원칙 스코어링 | 2.2s |
| 6 | 리포트 생성 | 0.8s |

**표현**
- 좌: 업로드한 포트폴리오 프리뷰. 분석 중인 영역을 스캔선이 훑고 지나감 (2px `--primary` 가로선, 2.4s 루프)
- 우: 6단계 체크리스트. 완료 → `--primary` 체크, 진행 → 3점 펄스, 대기 → `--mute`
- 하단: 전체 ProgressBar + 경과 시간(`--font-mono`)
- 카피는 단계마다 교체 — 예: "여백과 리듬을 읽는 중입니다"

**접근성:** `role="status" aria-live="polite"` 로 단계 전환을 읽어준다. 스캔선 애니메이션은 `prefers-reduced-motion` 에서 정적 표시.
**이탈 방지:** 분석 중 라우트 이동 시 "분석을 중단할까요?" 확인. 브라우저 `beforeunload` 는 걸지 않는다(과함).

### 3.4 `result` — 점수 화면

```
┌──────────────────────────────┬────────────────────────────┐
│  TOTAL SCORE                 │  10개 원칙 바 차트          │
│      87 / 100                │  각 행: 번호·한글명·0–10 바 │
│      Grade A                 │  단색 면, 격자·그라디언트 X │
│  [프리뷰 썸네일]              │  클릭 → 코멘트 아코디언 확장 │
└──────────────────────────────┴────────────────────────────┘
  STRENGTHS (3)          IMPROVEMENTS (3)
  [ 2단계 · 멘토 검증 받기 → ]   ← 분석 완료 시에만 활성 (프롬프트 9번)
```

- 총점: `--t-impact`(700) — **이 페이지 유일한 700 사용**
- 총점 카운트업 애니메이션 0 → 87, 1.2s `--ease-out`
- 바 차트: 좌→우 `scaleX` 진입, 원칙별 60ms stagger. 8점 이상 `--primary`, 5–7 `--soft`, 4 이하 `--mute`
- 각 행 클릭 시 코멘트 펼침 (`<details>` 기반 — JS 없이도 동작)
- `[다시 분석하기]` 는 새 회차를 만든다 (기존 회차 덮어쓰지 않음)

---

## 4. 더미 스코어링 엔진 ★

프롬프트 9번 — "MVP에서는 10가지 원칙과 분석 점수를 더미로". 나중에 실제 AlignX 모델로 교체한다.

### 4.1 결정론적 생성 (중요)

`Math.random()` 을 쓰면 **새로고침마다 점수가 바뀌어 데모가 무너진다.** 파일 지문 기반 시드로 결정론적으로 만든다.

```ts
// src/features/analysis/dummyEngine.ts
function seedFrom(file: { name: string; size: number }): number;   // FNV-1a 해시
function mulberry32(seed: number): () => number;                   // 시드 PRNG

export function generateAnalysis(file, seed = seedFrom(file)): AiAnalysis {
  // 원칙별 5~10점 분포. 평균 총점 72~88 대역에 들도록 보정
  // 강점 상위 3개 / 개선 하위 3개를 점수에서 유도
}
```

- 같은 파일 → 항상 같은 점수
- 점수 대역: 각 원칙 **5–10점**, 총점 **68–92** (0점대는 데모에서 무의미하고 사용자를 낙담시킨다)
- 코멘트: 원칙 × 점수구간(상/중/하) = **30개 문장 풀**을 `src/data/principleComments.ts` 에 작성
- 요약/강점/개선은 문장 템플릿에 원칙명을 주입

### 4.2 실제 모델 교체 경계면

```ts
// src/features/analysis/index.ts — 이 인터페이스만 유지하면 교체 완료
export interface AnalysisProvider {
  analyze(file: File, onProgress: (stageIndex: number) => void): Promise<AiAnalysis>;
}
export const provider: AnalysisProvider = dummyProvider;   // ← 여기 한 줄만 교체
```

UI는 `provider` 만 알고, `dummyEngine` 을 직접 import 하지 않는다. **이 경계를 지키는 것이 이 Phase의 핵심 산출물이다.**
`src/features/analysis/README.md` 에 실 API 연동 시 필요한 요청/응답 형태를 미리 적어둔다.

---

## 5. 리스크

| 리스크 | 대응 |
|---|---|
| pdf.js 워커가 Vite에서 로드 실패 (빈번) | `import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'` 방식 고정, 실제 PDF로 초기 검증 |
| 50MB PDF 렌더 시 메인 스레드 블로킹 | 1페이지만 렌더 + `scale` 제한. 3초 초과 시 프리뷰 생략하고 색면 폴백 |
| GIF 애니메이션 프리뷰 | 첫 프레임만 캡처 |
| 분석 9초가 지루함 | 단계 카피와 스캔선으로 정보를 제공. 6초 미만으로 줄이지 않는다(신뢰감 손상) |

---

## 6. 완료 기준

- [ ] 드래그앤드롭 · 파일 선택 · **키보드 조작** 3경로 모두 업로드 성공
- [ ] PDF / PNG / JPEG / GIF 각 1건 실제 파일로 성공 (`Portfolio-samples/` PDF 사용)
- [ ] 미지원 포맷 · 초과 용량 · 손상 파일 각각 정확한 에러 메시지
- [ ] 같은 파일 재업로드 시 **동일 점수** 재현
- [ ] 6단계 로딩이 순서대로 진행되고 `aria-live` 로 읽힘
- [ ] 분석 완료 전 2단계 버튼 비활성, 완료 시 활성
- [ ] 새로고침 후에도 결과 유지, 원본 파일은 저장되지 않음(용량 확인)
- [ ] `provider` 교체만으로 실제 모델 연동이 가능한 구조 — `dummyEngine` 이 UI에서 직접 import 되지 않음
- [ ] 라이트/다크 · 360/768/1440 전부 정상
