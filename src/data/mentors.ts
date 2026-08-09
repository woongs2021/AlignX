// 더미 멘토 3인 프로필 — 검증 타임라인(Phase06)과 리포트 멘토 카드(Phase07)가 공유하는 단일 소스.
// 원칙별 담당은 역할과 맞춘다: 구조/내러티브 → UX Lead, 비주얼/UX → Product Designer, 종합 → Design Director.

export type Mentor = {
  id: string;
  name: string;
  role: string;
  /** 40px 모노톤 원형 아바타 대체 이니셜 (사진/일러스트 대신 큰 활자 원칙) */
  initial: string;
};

export const MENTORS: Mentor[] = [
  { id: 'seyeon', name: '김세연', role: 'UX Lead', initial: '김' },
  { id: 'dohyun', name: '박도현', role: 'Product Designer', initial: '박' },
  { id: 'jiwoo', name: '이지우', role: 'Design Director', initial: '이' },
];

/** 원칙 id → 담당 멘토 id. 10개 원칙을 3인에게 배분한다. */
export const PRINCIPLE_MENTOR: Record<string, string> = {
  grid: 'seyeon',
  consistency: 'seyeon',
  narrative: 'seyeon',
  research: 'seyeon',
  hierarchy: 'dohyun',
  typography: 'dohyun',
  color: 'dohyun',
  whitespace: 'dohyun',
  interaction: 'dohyun',
  impact: 'jiwoo',
};

export function mentorFor(principleId: string): Mentor {
  const id = PRINCIPLE_MENTOR[principleId] ?? MENTORS[0].id;
  return MENTORS.find((m) => m.id === id) ?? MENTORS[0];
}
