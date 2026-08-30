// 리포트 화면(Step3Page)과 HTML 다운로드(buildHtml.ts)가 공유하는 데이터 조립 — 로직 중복을 막는다.
import { PRINCIPLES } from '@/data/principles';
import { MENTORS, mentorFor } from '@/data/mentors';
import { isPerspectiveGap, sentimentOfComment } from '@/data/mentorComments';
import { computeFinalScore, scoreGapNote } from './scoring';
import type { Attempt } from '@/types';

export type ReportPrincipleRow = {
  id: string;
  order: number;
  nameKr: string;
  nameEn: string;
  aiScore: number;
  mentorComment: string;
  isGap: boolean;
};

export type ReportMentorCard = {
  id: string;
  name: string;
  role: string;
  initial: string;
  comment: string;
};

export type ReportData = {
  name: string;
  topic: string;
  submittedAt: string;
  aiScore: number;
  mentorScore: number;
  finalScore: number;
  gapNote: string | null;
  principles: ReportPrincipleRow[];
  requestNote: string;
  mentorOverall: { name: string; role: string; comment: string };
  mentorPanel: ReportMentorCard[];
  // 3단계 리포트 확인 후 "최종 포트폴리오 제출"에서 받는다 — 그 전에는 null이다.
  survey: { satisfaction: number; motivation: number; outcome: number } | null;
  review: string | null;
  previewDataUrl: string;
};

/** 필요한 데이터(ai/mentorRequest/mentorFeedback)가 전부 갖춰지지 않으면 null. */
export function buildReportData(attempt: Attempt): ReportData | null {
  const { ai, mentorRequest, mentorFeedback } = attempt;
  if (!ai || !mentorRequest || !mentorFeedback) return null;

  const principles: ReportPrincipleRow[] = PRINCIPLES.map((principle) => {
    const aiScore = ai.principles.find((p) => p.id === principle.id)?.score ?? 0;
    const comment = mentorFeedback.perPrinciple.find((p) => p.principleId === principle.id)?.comment ?? '';
    const sentiment = sentimentOfComment(principle.id, comment);
    const isGap = sentiment ? isPerspectiveGap(aiScore, sentiment) : false;
    return {
      id: principle.id,
      order: principle.order,
      nameKr: principle.nameKr,
      nameEn: principle.nameEn,
      aiScore,
      mentorComment: comment,
      isGap,
    };
  });

  const mentorPanel: ReportMentorCard[] = MENTORS.map((mentor) => {
    const owned = principles.filter((p) => mentorFor(p.id).id === mentor.id);
    const comment = owned
      .map((p) => p.mentorComment)
      .filter(Boolean)
      .join(' ');
    return { id: mentor.id, name: mentor.name, role: mentor.role, initial: mentor.initial, comment };
  });

  return {
    name: mentorRequest.name,
    topic: mentorRequest.topic,
    submittedAt: mentorRequest.submittedAt,
    aiScore: ai.totalScore,
    mentorScore: mentorFeedback.mentorScore,
    finalScore: computeFinalScore(ai.totalScore, mentorFeedback.mentorScore),
    gapNote: scoreGapNote(ai.totalScore, mentorFeedback.mentorScore),
    principles,
    requestNote: mentorRequest.requestNote,
    mentorOverall: {
      name: mentorFeedback.mentorName,
      role: mentorFeedback.mentorRole,
      comment: mentorFeedback.overall,
    },
    mentorPanel,
    survey: attempt.finalReview
      ? {
          satisfaction: attempt.finalReview.satisfaction,
          motivation: attempt.finalReview.motivation,
          outcome: attempt.finalReview.outcome,
        }
      : null,
    review: attempt.finalReview?.review ?? null,
    previewDataUrl: attempt.file.previewDataUrl,
  };
}
