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
  /** Phase14 추가 — 로그인한 멘토 계정 id. 과거(ADMIN 대행) 피드백엔 없을 수 있어 optional. */
  mentorId?: string;
  overall: string;
  /** score는 Phase14 추가(멘토 로그인 화면의 원칙별 0–10점 채점) — ADMIN 대행 경로는 comment만 채운다. */
  perPrinciple: { principleId: string; score?: number; comment: string }[];
  mentorScore: number; // 0–100 (사람 점수)
  completedAt: string;
};

export type Attempt = {
  id: string; // 'atmp_' + ulid
  createdAt: string;
  currentStep: 1 | 2 | 3;
  status: 'analyzing' | 'analyzed' | 'submitted' | 'reviewing' | 'completed';
  /** Phase14 추가 — 이 회차를 만든 계정. null = 로그인 없이(게스트) 만든 회차. */
  ownerId?: string | null;
  /** Phase14 추가 — 검증을 배정받은 멘토 계정. setMentorRequest 시점에 채워진다. */
  assignedMentorId?: string | null;
  file: {
    name: string;
    mime: 'application/pdf' | 'image/gif' | 'image/png' | 'image/jpeg';
    size: number;
    previewDataUrl: string; // 주의: 원본 아님. 640px JPEG q0.7 축소본만 저장
    /** Phase14 추가 — 전 페이지 480px JPEG q0.6 (상한 있음). 없으면 뷰어가 previewDataUrl 1장으로 폴백. */
    pages?: string[];
    /** Phase14 추가 — 원본 총 페이지 수(상한 초과 시 pages.length보다 클 수 있다). */
    pageCount?: number;
  };
  ai: AiAnalysis | null;
  mentorRequest: MentorRequest | null;
  mentorStages: MentorStage[] | null;
  mentorFeedback: MentorFeedback | null;
  finalReview: FinalReview | null;
};

export type Mode = 'light' | 'dark';

// Phase14 — 계정·알림. 계정 자체(3인 고정 프로필)는 data/accounts.ts에 둔다(Mentor가
// data/mentors.ts에 있는 것과 같은 배치 원칙) — 여기는 AppState에 실리는 상태 타입만 정의한다.
export type NotificationKind =
  | 'mentor_request_arrived'
  | 'mentor_review_started'
  | 'mentor_feedback_ready'
  | 'final_submitted'
  | 'notice';

export type AppNotification = {
  id: string;
  recipientId: string; // Account.id
  kind: NotificationKind;
  title: string;
  body: string;
  attemptId: string | null;
  createdAt: string;
  readAt: string | null;
};

export type AppState = {
  version: 2;
  session: { accountId: string | null };
  attempts: Attempt[]; // 최신순
  notifications: AppNotification[];
  admin: { unlockedAt: string | null };
  mode: Mode; // Phase 02 추가 — index.html 부트 스크립트가 읽는 값과 동일 소스 (§5.1)
};
