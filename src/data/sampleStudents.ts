// ADMIN 대시보드용 샘플 시드 10건 — Portfolio-samples/ PDF를 프리뷰로 쓰되, 학생 이름·주제는
// 전부 가상이다(실존 인물 사칭 금지). 원본 PDF 파일명의 기업명은 지원 목표 기업 맥락이므로
// 주제 컬럼에서는 일반화해 표기한다 (Plans/10-admin.md §2.3, §4).
import { generateAnalysis } from '@/features/analysis/dummyEngine';
import { STAGE_CONFIG } from '@/features/mentor/simulator';
import { MENTOR_ACCOUNT } from '@/data/accounts';
import { PRINCIPLES } from '@/data/principles';
import { getMentorComment, type MentorSentiment } from '@/data/mentorComments';
import { MENTORS } from '@/data/mentors';
import { hashString, mulberry32 } from '@/lib/seededRandom';
import type { Attempt, FinalReview, MentorFeedback, MentorStage } from '@/types';

const MENTOR_SCORE_SPREAD = 8; // 멘토 총점 = AI 총점 ± 8

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 샘플 학생용 정적 멘토 피드백 — 과거엔 features/mentor/dummyFeedback.ts를 공유했지만, 그 모듈은
 * "타이머가 끝나면 자동으로 피드백을 만드는" 용도였고 Phase14에서 삭제됐다(실제 멘토가 확정
 * 제출해야만 완료되도록 바뀌었다 — Plans/14 §6.1). 샘플 10건은 화면 데모용으로 항상 같은 값이
 * 나와야 하므로, 같은 시드 로직을 이 파일 안에 그대로 유지한다. */
function buildSampleMentorFeedback(attempt: Attempt): MentorFeedback {
  const ai = attempt.ai;
  if (!ai) throw new Error('AI 분석이 없는 샘플은 멘토 피드백을 만들 수 없습니다.');

  const rand = mulberry32(hashString(`sample-mentor:${attempt.id}`));

  const perPrinciple = PRINCIPLES.map((principle) => {
    const aiScore = ai.principles.find((p) => p.id === principle.id)?.score ?? 5;
    const positiveProbability = clamp((aiScore - 4) / 6, 0.15, 0.85);
    const sentiment: MentorSentiment = rand() < positiveProbability ? 'positive' : 'critical';
    return { principleId: principle.id, comment: getMentorComment(principle.id, sentiment) };
  });

  const delta = Math.round((rand() * 2 - 1) * MENTOR_SCORE_SPREAD);
  const mentorScore = clamp(ai.totalScore + delta, 0, 100);
  const lead = MENTORS.find((m) => m.id === 'jiwoo') ?? MENTORS[0];
  const topic = attempt.mentorRequest?.topic ?? '이번 작업';

  return {
    mentorName: lead.name,
    mentorRole: lead.role,
    mentorId: MENTOR_ACCOUNT.id,
    overall: `AI 분석과 대체로 결이 비슷합니다. 종합 ${mentorScore}점으로 평가했고, 세부 코멘트는 원칙별로 남겨두었습니다. ${topic}의 방향은 좋으니 지적된 부분 위주로 다듬어보세요.`,
    perPrinciple,
    mentorScore,
    completedAt: attempt.mentorRequest?.submittedAt ?? new Date().toISOString(),
  };
}

export const SAMPLE_ID_PREFIX = 'sample_';

export type SampleBaseStatus = 'analyzing' | 'submitted' | 'reviewing' | 'completed';

export type SampleStudent = {
  id: string;
  name: string;
  topic: string;
  preview: string;
  pageCount: number;
  sourceFile: string;
  baseStatus: SampleBaseStatus;
  /** baseStatus === 'reviewing'일 때 완료된 리뷰 단계 수 (0~4, 전체 5단계 중). */
  reviewProgress?: number;
};

export const SAMPLE_STUDENTS: SampleStudent[] = [
  { id: '001', name: '김하늘', topic: '커머스 앱 UX 리디자인', preview: '001.jpg', pageCount: 21, sourceFile: '001.pdf', baseStatus: 'completed' },
  { id: '002', name: '이도윤', topic: '리테일 서비스 UX', preview: '002.jpg', pageCount: 22, sourceFile: '002.pdf', baseStatus: 'reviewing', reviewProgress: 1 },
  { id: '003', name: '박서연', topic: '브랜드 아이덴티티', preview: '003.jpg', pageCount: 42, sourceFile: '003.pdf', baseStatus: 'submitted' },
  { id: '004', name: '최민준', topic: 'B2B 대시보드 UX', preview: '004.jpg', pageCount: 30, sourceFile: '004.pdf', baseStatus: 'completed' },
  { id: '005', name: '정하은', topic: '배달 서비스 UX', preview: '005.jpg', pageCount: 18, sourceFile: '005.pdf', baseStatus: 'reviewing', reviewProgress: 2 },
  { id: '006', name: '강지호', topic: '메신저 UX 개선', preview: '006.jpg', pageCount: 18, sourceFile: '006.pdf', baseStatus: 'submitted' },
  { id: '007', name: '윤채원', topic: '커머스 브랜드 디자인', preview: '007.jpg', pageCount: 43, sourceFile: '007.pdf', baseStatus: 'completed' },
  { id: '008', name: '임태양', topic: '사내 시스템 UX', preview: '008.jpg', pageCount: 22, sourceFile: '008.pdf', baseStatus: 'analyzing' },
  { id: '009', name: '오세림', topic: '에너지 플랫폼 UX', preview: '009.jpg', pageCount: 19, sourceFile: '009.pdf', baseStatus: 'completed' },
  { id: '010', name: '한도현', topic: '엔터 서비스 UX', preview: '010.jpg', pageCount: 20, sourceFile: '010.pdf', baseStatus: 'reviewing', reviewProgress: 2 },
];

export function samplePreviewUrl(preview: string): string {
  return `${import.meta.env.BASE_URL}samples/${preview}`;
}

function samplesBase(id: string): number {
  return Date.parse('2026-08-09T00:00:00.000Z') - Number(id) * 3 * 60 * 60 * 1000;
}

/** 제출은 됐지만 아직 어떤 단계도 시작 전인 스냅샷 — 하나라도 active면 deriveSubmissionStatus가
 * "검증중"으로 판정해버리므로, '제출완료' 상태는 전부 pending으로 둔다. */
function buildPendingStages(): MentorStage[] {
  return STAGE_CONFIG.map((config) => ({
    id: config.id,
    label: config.label,
    status: 'pending',
    ...(config.mentorName ? { mentorName: config.mentorName } : {}),
  }));
}

/** '리뷰 중'·'완료' 스냅샷 — 실시간 시뮬레이터를 타지 않는다(샘플 제출 시각이 훨씬 오래돼
 * resumeMentorProgress로 계산하면 항상 "전부 완료"가 나와버린다). 정적 스냅샷만 쓴다. */
function buildStaticStages(doneCount: number, at: string): MentorStage[] {
  const reviewLength = STAGE_CONFIG.length - 1; // 'complete' 제외 5단계
  const clamped = Math.min(doneCount, reviewLength);
  return STAGE_CONFIG.map((config, i) => {
    let status: MentorStage['status'];
    if (config.id === 'complete') status = 'pending';
    else if (i < clamped) status = 'done';
    else if (i === clamped) status = 'active';
    else status = 'pending';
    return {
      id: config.id,
      label: config.label,
      status,
      ...(config.mentorName ? { mentorName: config.mentorName } : {}),
      ...(status !== 'pending' ? { startedAt: at } : {}),
      ...(status === 'done' ? { completedAt: at } : {}),
    };
  });
}

/** 샘플 학생 1명을 실제 Attempt와 동일한 모양으로 합성한다 — 더미 엔진을 그대로 재사용해
 * 점수도 나머지 화면과 일관되게 만든다(id가 시드이므로 결정론적). */
export function buildSampleAttempt(student: SampleStudent): Attempt {
  const submittedAtMs = samplesBase(student.id);
  const submittedAt = new Date(submittedAtMs).toISOString();
  const fileSize = student.pageCount * 120_000; // 실측 아님 — 더미 엔진 시드 용도

  const ai = student.baseStatus === 'analyzing' ? null : generateAnalysis({ name: student.sourceFile, size: fileSize });

  const mentorRequest =
    student.baseStatus === 'analyzing'
      ? null
      : {
          name: student.name,
          topic: student.topic,
          requestNote: '전체적인 완성도와 개선 방향을 자유롭게 봐주세요.',
          submittedAt,
        };

  // '완료' 스냅샷은 최종 제출(리포트 확인 후 후기)까지 마친 상태를 나타낸다.
  const finalReview: FinalReview | null =
    student.baseStatus === 'completed'
      ? {
          satisfaction: 6,
          motivation: 6,
          outcome: 6,
          review: '실습 위주로 준비하며 많이 배웠습니다. 냉정한 피드백 부탁드립니다.',
          submittedAt,
        }
      : null;

  const attempt: Attempt = {
    id: SAMPLE_ID_PREFIX + student.id,
    createdAt: submittedAt,
    currentStep: student.baseStatus === 'analyzing' ? 1 : student.baseStatus === 'completed' ? 3 : 2,
    status: student.baseStatus,
    ownerId: null, // 샘플은 특정 계정 소유가 아니다 — ADMIN 대시보드에서만 보인다
    assignedMentorId: mentorRequest ? MENTOR_ACCOUNT.id : null,
    file: {
      name: student.sourceFile,
      mime: 'application/pdf',
      size: fileSize,
      previewDataUrl: samplePreviewUrl(student.preview),
    },
    ai,
    mentorRequest,
    mentorStages:
      student.baseStatus === 'submitted'
        ? buildPendingStages()
        : student.baseStatus === 'reviewing'
          ? buildStaticStages(student.reviewProgress ?? 0, submittedAt)
          : student.baseStatus === 'completed'
            ? buildStaticStages(STAGE_CONFIG.length - 1, submittedAt)
            : null,
    mentorFeedback: null,
    finalReview,
  };

  if (student.baseStatus === 'completed') {
    attempt.mentorFeedback = buildSampleMentorFeedback(attempt);
  }

  return attempt;
}

export const SAMPLE_ATTEMPTS: Attempt[] = SAMPLE_STUDENTS.map(buildSampleAttempt);

export function isSampleAttemptId(id: string): boolean {
  return id.startsWith(SAMPLE_ID_PREFIX);
}
