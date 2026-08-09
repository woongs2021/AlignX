// 멘토 더미 코멘트 풀 — 원칙 10개 × 2단계(긍정/보완) = 20문장.
// AI 코멘트(principleComments.ts)와 달리 사람의 목소리로 구체적인 장면을 짚는다 —
// AI 점수와 멘토 코멘트의 어조가 어긋나면 "관점 차이"로 표시된다 (Plans/07-portfolio-step3.md §3).

export type MentorSentiment = 'positive' | 'critical';

const MENTOR_COMMENTS: Record<string, Record<MentorSentiment, string>> = {
  hierarchy: {
    positive: '첫 화면의 시선 흐름이 특히 잘 잡혔어요. 어디부터 봐야 할지 바로 느껴집니다.',
    critical: '중요한 정보와 부가 정보의 크기 차이가 아직 작아요. 조금 더 과감하게 벌려도 좋겠습니다.',
  },
  grid: {
    positive: '전 페이지에 걸쳐 그리드가 안정적으로 유지되고 있어요.',
    critical: '3, 4번째 화면에서 정렬이 살짝 흔들립니다. 여백 기준을 다시 맞춰보세요.',
  },
  typography: {
    positive: '본문과 제목의 크기 대비가 명확해서 읽기 편했습니다.',
    critical: '본문 줄간격이 좁아 텍스트가 많은 페이지에서는 눈이 피로할 수 있어요.',
  },
  color: {
    positive: '컬러를 절제해서 쓴 덕분에 강조 포인트가 명확하게 보입니다.',
    critical: '일부 텍스트가 배경과 대비가 낮아 잘 안 읽히는 구간이 있었어요.',
  },
  whitespace: {
    positive: '섹션 간 여백이 일정해서 읽는 리듬이 편안했습니다.',
    critical: '카드 내부 여백이 섹션마다 달라 살짝 산만하게 느껴져요.',
  },
  consistency: {
    positive: '버튼과 카드 스타일이 끝까지 일관돼서 신뢰가 갑니다.',
    critical: '아이콘 스타일이 화면마다 조금씩 달라요. 하나로 통일해보세요.',
  },
  narrative: {
    positive: '문제 제기부터 결과까지 흐름이 자연스러워 술술 읽혔습니다.',
    critical: '중간에 과정 설명이 갑자기 건너뛰는 구간이 있어 맥락이 끊겨요.',
  },
  research: {
    positive: '리서치 데이터를 근거로 결정을 설명한 부분이 설득력 있었습니다.',
    critical: '왜 이 방향을 택했는지 리서치 근거가 조금 더 보이면 좋겠어요.',
  },
  interaction: {
    positive: '플로우 설명이 친절해서 실제 화면을 안 봐도 흐름이 그려졌어요.',
    critical: '핵심 인터랙션 하나 정도는 짧은 GIF로 보여주면 더 설득력 있을 것 같아요.',
  },
  impact: {
    positive: '수치로 성과를 보여준 부분이 인상적이었습니다. 설득력이 확실히 다릅니다.',
    critical: '결과가 어떤 변화를 만들었는지 비교 수치가 있으면 더 좋겠어요.',
  },
};

export function getMentorComment(principleId: string, sentiment: MentorSentiment): string {
  return MENTOR_COMMENTS[principleId]?.[sentiment] ?? '';
}

/** 저장된 코멘트 문장이 어느 감성(positive/critical)에서 나왔는지 역추적한다 — "관점 차이" 판정용. */
export function sentimentOfComment(principleId: string, comment: string): MentorSentiment | null {
  const entry = MENTOR_COMMENTS[principleId];
  if (!entry) return null;
  if (entry.positive === comment) return 'positive';
  if (entry.critical === comment) return 'critical';
  return null;
}

/** AI 점수와 멘토 코멘트 톤이 어긋나면 "관점 차이"로 본다 (07 §3). */
export function isPerspectiveGap(aiScore: number, sentiment: MentorSentiment): boolean {
  if (aiScore >= 8 && sentiment === 'critical') return true;
  if (aiScore <= 6 && sentiment === 'positive') return true;
  return false;
}
