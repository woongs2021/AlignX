# analysis provider

`provider.analyze(file, onProgress)` 가 이 기능의 유일한 진입점이다. UI(`Step1Page` 등)는 이 인터페이스만
알고 `dummyEngine.ts`를 직접 import하지 않는다 — 실 모델 연동 시 이 경계만 지키면 UI 코드는 손대지 않아도 된다.

## 실 API로 교체하는 방법

1. `AnalysisProvider`를 구현하는 새 provider를 추가한다 (예: `httpProvider.ts`).
2. `index.ts`의 `export const provider: AnalysisProvider = dummyProvider;` 한 줄만 바꾼다.

```ts
export const provider: AnalysisProvider = httpProvider;
```

## 예상 요청

```
POST /api/analyze
Content-Type: multipart/form-data

file: <업로드 원본>
```

## 예상 응답 — `AiAnalysis` (src/types/index.ts)

```ts
{
  analyzedAt: string;              // ISO
  principles: PrincipleScore[];    // 길이 10, id는 src/data/principles.ts의 PRINCIPLES와 동일
  totalScore: number;              // 0–100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  summary: string;
  strengths: string[];
  improvements: string[];
}
```

## 진행률(onProgress)

- 실 API가 스트리밍(SSE/WebSocket)으로 단계 진행을 보내주면 그 이벤트를 `onProgress(stageIndex)`로
  매핑한다.
- 스트리밍이 없다면 응답을 기다리는 동안 `onProgress(0)`만 호출하고, `Step1Page`의 로딩 UI는
  `STAGE_LABELS`/`STAGE_COPY`(이 파일의 `index.ts`)를 그대로 재사용해 자체 타이머로 진행 연출을 만든다.
- 실 API의 처리 시간이 6단계·9초 구조와 크게 다르면 `STAGE_LABELS`/`STAGE_COPY`/로딩 UI도 함께
  재검토한다 — 지금은 더미 provider의 연출에 맞춰져 있다.
