// AI 10대 원칙 — 정의 원본은 이 파일 한 곳에만 둔다. 1·3단계·리포트·ADMIN·HOME·AlignX AI가 모두 참조한다.
// (Plans/00-overview.md §8)
import type { Grade } from '@/types';

export type Principle = {
  id: string;
  order: number;
  nameKr: string;
  nameEn: string;
  maxScore: number;
  /** 한 줄 정의 — HOME §5 PRINCIPLES 프리뷰 호버 등에서 쓴다. */
  description: string;
  /** 측정 방식 — AlignX AI §A2 원칙 카드용. */
  measurement: string;
  /** 만점 조건 — AlignX AI §A2 원칙 카드용. */
  fullScoreCondition: string;
  /** 흔한 실패 사례 — AlignX AI §A2 원칙 카드용. */
  commonFailure: string;
};

export const PRINCIPLES: Principle[] = [
  {
    id: 'hierarchy',
    order: 1,
    nameKr: '정보 위계',
    nameEn: 'Information Hierarchy',
    maxScore: 10,
    description: '가장 중요한 정보·결정이 먼저 눈에 띄도록 우선순위가 드러나는가',
    measurement: '핵심 메시지·기능·결정이 화면·문서·코드 어디서 먼저 드러나는지 배치와 강조 순서를 측정합니다.',
    fullScoreCondition: '3초 안에 가장 중요한 것이 무엇인지 파악되면 만점입니다.',
    commonFailure: '모든 항목이 같은 무게로 나열돼 무엇부터 봐야 할지 알 수 없는 경우.',
  },
  {
    id: 'grid',
    order: 2,
    nameKr: '구조적 정합성',
    nameEn: 'Structural Alignment',
    maxScore: 10,
    description: '구성 요소들이 하나의 일관된 체계 위에 정렬되어 전체가 안정적으로 읽히는가',
    measurement: '목차·화면 구성·코드 아키텍처 등 구성 단위 간 정렬과 의존 관계의 일관성을 검사합니다.',
    fullScoreCondition: '전체가 동일한 구성 원칙을 따르면 만점입니다.',
    commonFailure: '섹션마다, 파일마다 구성 방식이 미세하게 달라 전체가 흔들려 보이는 경우.',
  },
  {
    id: 'typography',
    order: 3,
    nameKr: '명료한 표현',
    nameEn: 'Clarity of Expression',
    maxScore: 10,
    description: '언어·시각·코드 표현이 의도한 의미를 정확하고 간결하게 전달하는가',
    measurement: '용어·문장·네이밍이 읽는 사람 기준으로 모호함 없이 전달되는지 분석합니다.',
    fullScoreCondition: '추가 설명 없이도 의도가 정확히 전달되면 만점입니다.',
    commonFailure: '전문 용어나 축약이 설명 없이 남발돼 의도가 흐려지는 경우.',
  },
  {
    id: 'color',
    order: 4,
    nameKr: '강조와 대비',
    nameEn: 'Emphasis & Contrast',
    maxScore: 10,
    description: '중요한 것과 부차적인 것이 뚜렷하게 구분되는가',
    measurement: '핵심 메시지·지표·로직과 부가 설명 사이의 시각적·구조적 대비를 확인합니다.',
    fullScoreCondition: '핵심과 배경이 한눈에 구분되면 만점입니다.',
    commonFailure: '모든 내용이 같은 톤과 비중으로 처리돼 핵심이 묻히는 경우.',
  },
  {
    id: 'whitespace',
    order: 5,
    nameKr: '여백과 완급',
    nameEn: 'Pacing & Space',
    maxScore: 10,
    description: '정보가 숨 쉴 틈 없이 몰아치지 않고 적절한 리듬으로 전달되는가',
    measurement: '섹션·문단·단위 작업의 분량과 간격이 일정한 리듬을 따르는지 검사합니다.',
    fullScoreCondition: '정보 밀도가 일정한 리듬으로 조절되면 만점입니다.',
    commonFailure: '한 화면·한 문단에 모든 내용을 욱여넣어 숨 돌릴 틈이 없는 경우.',
  },
  {
    id: 'consistency',
    order: 6,
    nameKr: '일관성',
    nameEn: 'Consistency',
    maxScore: 10,
    description: '용어·스타일·판단 기준이 처음부터 끝까지 흔들리지 않는가',
    measurement: '동일한 개념·컴포넌트·패턴이 전체에서 같은 방식으로 쓰이는지 비교합니다.',
    fullScoreCondition: '같은 역할의 요소가 전체에서 동일한 기준으로 처리되면 만점입니다.',
    commonFailure: '같은 개념을 화면마다, 문서마다 다른 용어·스타일로 부르는 경우.',
  },
  {
    id: 'narrative',
    order: 7,
    nameKr: '정보 구조 · 스토리텔링',
    nameEn: 'Structure & Narrative',
    maxScore: 10,
    description: '정보가 논리적인 순서로 배열되어 하나의 이야기처럼 읽히는가',
    measurement: '문제 제기부터 결론까지 정보 순서의 논리적 흐름을 추적합니다.',
    fullScoreCondition: '다음에 무슨 내용이 나올지 예측 가능하면 만점입니다.',
    commonFailure: '결론을 먼저 보여주고 나중에 배경을 설명해 순서가 뒤바뀐 경우.',
  },
  {
    id: 'research',
    order: 8,
    nameKr: '문제 정의 · 근거',
    nameEn: 'Problem Framing & Evidence',
    maxScore: 10,
    description: '주요 결정이 명확한 문제 정의와 근거로 뒷받침되는가',
    measurement: '핵심 결정 앞에 근거(데이터·리서치·테스트 결과)가 제시됐는지 확인합니다.',
    fullScoreCondition: '주요 결정마다 왜 그렇게 했는지 근거가 붙어 있으면 만점입니다.',
    commonFailure: '"검토했습니다"라고만 적고 실제 근거나 데이터가 없는 경우.',
  },
  {
    id: 'interaction',
    order: 9,
    nameKr: '실행 가능성 · 사용성',
    nameEn: 'Feasibility & Usability',
    maxScore: 10,
    description: '결과물이 실제로 작동하고, 의도한 사람이 문제없이 쓸 수 있는가',
    measurement: '플로우·로직의 예외 처리와 실제 동작 가능 여부를 확인합니다.',
    fullScoreCondition: '핵심 시나리오가 실제로 재현 가능하면 만점입니다.',
    commonFailure: '이론상으로만 그럴듯하고 실제 상황·예외 케이스를 고려하지 않은 경우.',
  },
  {
    id: 'impact',
    order: 10,
    nameKr: '결과 · 임팩트 증명',
    nameEn: 'Outcome & Impact',
    maxScore: 10,
    description: '결과 지표나 임팩트로 성과가 증명되는가',
    measurement: '정량 지표(전환율·만족도 등)와 비교 기준(이전 대비)의 존재 여부를 확인합니다.',
    fullScoreCondition: '수치와 비교 기준이 함께 제시되면 만점입니다.',
    commonFailure: '"개선되었습니다"처럼 수치 없는 주장만 있는 경우.',
  },
];

/** 등급 경계 — S≥90 / A80–89 / B70–79 / C60–69 / D<60 (00 §8, 단일 정의). */
export function gradeFromScore(totalScore: number): Grade {
  if (totalScore >= 90) return 'S';
  if (totalScore >= 80) return 'A';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 60) return 'C';
  return 'D';
}
