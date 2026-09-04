// 더미 멘토 3인 프로필 — ADMIN 대행 피드백에서 어느 멘토 명의로 제출할지 고를 때(FeedbackComposer)와
// 샘플 데이터(sampleStudents)가 공유하는 단일 소스.

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
