// PortfolioIntroPage(직군별 예시)와 AnalysisStartModal(직군 선택)이 공유하는 단일 소스.

export type Role = 'planning' | 'marketing' | 'design' | 'dev' | 'other';

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'planning', label: '기획 · PM' },
  { value: 'marketing', label: '마케팅' },
  { value: 'design', label: '디자인' },
  { value: 'dev', label: '개발 · 코드리뷰' },
  { value: 'other', label: '기타' },
];
