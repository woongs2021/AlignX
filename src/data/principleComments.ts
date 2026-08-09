// 더미 스코어링 엔진의 코멘트 풀 — 원칙 10개 × 점수 구간 3단계 = 30문장 (Plans/05-portfolio-step1.md §4.1).
// 점수 5–10 범위를 low(5–6) / mid(7–8) / high(9–10)로 나눈다.

export type CommentTier = 'low' | 'mid' | 'high';

export function scoreTier(score: number): CommentTier {
  if (score >= 9) return 'high';
  if (score >= 7) return 'mid';
  return 'low';
}

const PRINCIPLE_COMMENTS: Record<string, Record<CommentTier, string>> = {
  hierarchy: {
    low: '어떤 요소를 먼저 봐야 할지 판단하기 어렵습니다. 크기·굵기 차이를 더 크게 벌려보세요.',
    mid: '핵심 요소는 눈에 띄지만 보조 정보와의 위계 차이가 다소 약합니다.',
    high: '가장 중요한 정보가 한눈에 들어오도록 크기·색·배치의 위계가 명확합니다.',
  },
  grid: {
    low: '요소들의 정렬이 어긋나 화면이 불안정해 보입니다. 공통 그리드를 잡아보세요.',
    mid: '대체로 정렬되어 있지만 일부 섹션에서 여백과 폭이 흔들립니다.',
    high: '일관된 그리드 위에 모든 요소가 정확히 정렬되어 있습니다.',
  },
  typography: {
    low: '본문과 제목의 크기·행간 차이가 부족해 위계가 잘 읽히지 않습니다.',
    mid: '타이포 스케일은 무난하지만 줄간격이 다소 좁아 읽기에 살짝 빡빡합니다.',
    high: '폰트 크기·굵기·행간이 위계와 가독성을 동시에 잘 뒷받침합니다.',
  },
  color: {
    low: '텍스트와 배경의 대비가 낮아 일부 구간이 읽기 어렵습니다.',
    mid: '전반적인 색 대비는 무난하나 강조색 사용이 산발적입니다.',
    high: '충분한 대비와 절제된 컬러 팔레트로 정보가 또렷하게 읽힙니다.',
  },
  whitespace: {
    low: '여백이 불규칙해 화면이 답답하게 느껴집니다. 섹션 간 간격을 통일해보세요.',
    mid: '여백은 있지만 섹션마다 리듬이 달라 흐름이 매끄럽지 않습니다.',
    high: '일정한 리듬의 여백이 화면에 안정적인 호흡을 만듭니다.',
  },
  consistency: {
    low: '버튼·카드 등 컴포넌트 스타일이 화면마다 달라 통일감이 부족합니다.',
    mid: '핵심 컴포넌트는 일관되지만 세부 스타일에 약간의 편차가 있습니다.',
    high: '컴포넌트와 스타일이 전 화면에서 일관되게 유지되고 있습니다.',
  },
  narrative: {
    low: '정보가 나열식이라 어떤 순서로 읽어야 할지 파악하기 어렵습니다.',
    mid: '전반적인 흐름은 있지만 일부 섹션의 연결이 매끄럽지 않습니다.',
    high: '문제-과정-결과의 흐름이 이야기처럼 자연스럽게 이어집니다.',
  },
  research: {
    low: '디자인 결정의 근거(리서치·데이터)가 거의 드러나지 않습니다.',
    mid: '문제 정의는 있으나 이를 뒷받침하는 근거가 다소 빈약합니다.',
    high: '문제 정의와 리서치 근거가 디자인 결정과 탄탄하게 연결되어 있습니다.',
  },
  interaction: {
    low: '인터랙션 흐름이 직관적이지 않아 다음 행동을 예측하기 어렵습니다.',
    mid: '핵심 흐름은 무리 없지만 일부 화면 전환에서 설명이 부족합니다.',
    high: '인터랙션이 직관적이고 사용자의 목표 달성을 자연스럽게 돕습니다.',
  },
  impact: {
    low: '결과 지표나 임팩트가 제시되지 않아 성과를 가늠하기 어렵습니다.',
    mid: '결과는 언급되지만 수치나 비교 기준이 부족해 설득력이 약합니다.',
    high: '구체적인 지표와 비교로 디자인의 임팩트가 명확히 증명됩니다.',
  },
};

export function getPrincipleComment(principleId: string, score: number): string {
  const tier = scoreTier(score);
  return PRINCIPLE_COMMENTS[principleId]?.[tier] ?? '';
}
