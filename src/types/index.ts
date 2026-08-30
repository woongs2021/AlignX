// 데이터 모델 — Plans/00-overview.md §7 계약을 그대로 옮긴다.
// localStorage 키: alignx.v1 (스키마 변경 시 버전을 올리고 마이그레이션 없이 초기화)

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export type PrincipleScore = {
  id: string; // 'hierarchy' | 'grid' | ...
  score: number; // 0–10
  comment: string;
};

export type AiAnalysis = {
  analyzedAt: string; // ISO
  principles: PrincipleScore[]; // 길이 10
  totalScore: number; // 0–100 (10개 합산)
  grade: Grade;
  summary: string;
  strengths: string[];
  improvements: string[];
};

export type MentorRequest = {
  name: string;
  topic: string;
  requestNote: string; // 멘토에게 요청하는 사항
  submittedAt: string;
};

// 3단계 리포트 확인 후 "최종 포트폴리오 제출" 시 남기는 응답 — 2단계 제출과는 별도 시점이다.
export type FinalReview = {
  satisfaction: number; // 1–7
  motivation: number; // 1–7
  outcome: number; // 1–7
  review: string; // 주관식 교육 후기
  submittedAt: string;
};

export type MentorStage = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
  mentorName?: string;
  startedAt?: string;
  completedAt?: string;
};

export type MentorFeedback = {
  mentorName: string;
  mentorRole: string;
  overall: string;
  perPrinciple: { principleId: string; comment: string }[];
  mentorScore: number; // 0–100 (사람 점수)
  completedAt: string;
};

export type Attempt = {
  id: string; // 'atmp_' + ulid
  createdAt: string;
  currentStep: 1 | 2 | 3;
  status: 'analyzing' | 'analyzed' | 'submitted' | 'reviewing' | 'completed';
  file: {
    name: string;
    mime: 'application/pdf' | 'image/gif' | 'image/png' | 'image/jpeg';
    size: number;
    previewDataUrl: string; // 주의: 원본 아님. 640px JPEG q0.7 축소본만 저장
  };
  ai: AiAnalysis | null;
  mentorRequest: MentorRequest | null;
  mentorStages: MentorStage[] | null;
  mentorFeedback: MentorFeedback | null;
  finalReview: FinalReview | null;
};

export type Mode = 'light' | 'dark';

export type AppState = {
  version: 1;
  user: { name: string | null };
  attempts: Attempt[]; // 최신순
  admin: { unlockedAt: string | null };
  mode: Mode; // Phase 02 추가 — index.html 부트 스크립트가 읽는 값과 동일 소스 (§5.1)
};
