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
    nameKr: '시각적 위계',
    nameEn: 'Visual Hierarchy',
    maxScore: 10,
    description: '중요한 정보가 크기·색·배치로 먼저 눈에 띄도록 우선순위가 드러나는가',
    measurement: '제목·본문·CTA의 크기·색상 대비 차이를 측정합니다.',
    fullScoreCondition: '3초 안에 가장 중요한 정보가 무엇인지 파악되면 만점입니다.',
    commonFailure: '모든 텍스트가 비슷한 크기여서 무엇부터 봐야 할지 알 수 없는 경우.',
  },
  {
    id: 'grid',
    order: 2,
    nameKr: '레이아웃 · 그리드 정합성',
    nameEn: 'Layout & Grid',
    maxScore: 10,
    description: '요소들이 일관된 격자 위에 정렬되어 화면이 안정적으로 보이는가',
    measurement: '요소 간 정렬선과 여백의 일관성을 검사합니다.',
    fullScoreCondition: '전 페이지가 동일한 컬럼·거터 기준을 따르면 만점입니다.',
    commonFailure: '페이지마다 좌우 여백이 미세하게 달라 화면이 흔들려 보이는 경우.',
  },
  {
    id: 'typography',
    order: 3,
    nameKr: '타이포그래피',
    nameEn: 'Typography',
    maxScore: 10,
    description: '폰트·크기·행간이 가독성과 위계를 함께 뒷받침하는가',
    measurement: '폰트 크기 단계, 행간, 자간의 위계 표현을 분석합니다.',
    fullScoreCondition: '제목-본문-캡션이 명확한 크기 단계로 구분되면 만점입니다.',
    commonFailure: '본문에 너무 많은 폰트 크기를 섞어 써서 위계가 불분명한 경우.',
  },
  {
    id: 'color',
    order: 4,
    nameKr: '컬러 · 대비',
    nameEn: 'Color & Contrast',
    maxScore: 10,
    description: '색상 대비가 충분해 텍스트와 요소가 또렷하게 읽히는가',
    measurement: '텍스트-배경 대비비(WCAG 기준)와 색상 사용 개수를 확인합니다.',
    fullScoreCondition: '대비비 4.5:1 이상을 유지하며 팔레트가 3~4색 이내면 만점입니다.',
    commonFailure: '저채도 회색 텍스트를 밝은 배경에 올려 가독성이 떨어지는 경우.',
  },
  {
    id: 'whitespace',
    order: 5,
    nameKr: '여백 · 리듬',
    nameEn: 'Whitespace & Rhythm',
    maxScore: 10,
    description: '여백이 일정한 리듬으로 배치되어 화면에 숨 쉴 공간을 주는가',
    measurement: '섹션·카드 간 여백의 배수 관계(8/16/24…)를 검사합니다.',
    fullScoreCondition: '여백이 일정한 배수 체계를 따르면 만점입니다.',
    commonFailure: '여백을 감으로 배치해 섹션마다 호흡이 들쭉날쭉한 경우.',
  },
  {
    id: 'consistency',
    order: 6,
    nameKr: '일관성',
    nameEn: 'Consistency',
    maxScore: 10,
    description: '컴포넌트와 스타일이 화면 전반에서 일관되게 쓰이는가',
    measurement: '동일 역할 컴포넌트(버튼·카드·아이콘)의 스타일 편차를 비교합니다.',
    fullScoreCondition: '같은 역할의 요소가 페이지 전체에서 동일한 스타일이면 만점입니다.',
    commonFailure: '버튼 모서리 radius나 색이 화면마다 조금씩 달라지는 경우.',
  },
  {
    id: 'narrative',
    order: 7,
    nameKr: '정보 구조 · 스토리텔링',
    nameEn: 'IA & Narrative',
    maxScore: 10,
    description: '정보가 논리적인 순서로 배열되어 하나의 이야기처럼 읽히는가',
    measurement: '문제 제기부터 결과까지 정보 순서의 논리적 흐름을 추적합니다.',
    fullScoreCondition: '다음에 무슨 내용이 나올지 예측 가능하면 만점입니다.',
    commonFailure: '결과 화면을 먼저 보여주고 나중에 문제를 설명해 순서가 뒤바뀐 경우.',
  },
  {
    id: 'research',
    order: 8,
    nameKr: '문제 정의 · 리서치 근거',
    nameEn: 'Problem Framing & Research',
    maxScore: 10,
    description: '디자인 결정이 리서치와 문제 정의에 근거해 설명되는가',
    measurement: '디자인 결정 앞에 근거(데이터·인터뷰·경쟁사 분석)가 제시됐는지 확인합니다.',
    fullScoreCondition: '주요 결정마다 왜 그렇게 했는지 근거가 붙어 있으면 만점입니다.',
    commonFailure: '"사용자 리서치를 진행했습니다"라고만 적고 실제 데이터가 없는 경우.',
  },
  {
    id: 'interaction',
    order: 9,
    nameKr: '인터랙션 · 사용성',
    nameEn: 'Interaction & Usability',
    maxScore: 10,
    description: '인터랙션이 직관적이며 사용자의 목표 달성을 돕는가',
    measurement: '플로우 설명, 상태 변화(호버·포커스·에러)의 명시 여부를 확인합니다.',
    fullScoreCondition: '핵심 플로우가 화면 흐름이나 영상으로 재현 가능하면 만점입니다.',
    commonFailure: '정적 화면만 나열해 실제로 어떻게 동작하는지 알 수 없는 경우.',
  },
  {
    id: 'impact',
    order: 10,
    nameKr: '결과 · 임팩트 증명',
    nameEn: 'Outcome & Impact',
    maxScore: 10,
    description: '결과 지표나 임팩트로 디자인의 성과가 증명되는가',
    measurement: '정량 지표(전환율·만족도 등)와 비교 기준(이전 대비)의 존재 여부를 확인합니다.',
    fullScoreCondition: '수치와 비교 기준이 함께 제시되면 만점입니다.',
    commonFailure: '"사용성이 개선되었습니다"처럼 수치 없는 주장만 있는 경우.',
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
