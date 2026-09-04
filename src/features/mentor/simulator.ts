// 실시간 검증 모니터 시뮬레이터 — 절대 시각 기준으로 단계를 역산한다 (Plans/06-portfolio-step2.md §3.3).
// setInterval 카운터를 상태로 들면 탭을 닫았다 열 때 진행이 멈추거나 튄다 — 그래서 매 tick마다
// mentorRequest.submittedAt + 현재 시각으로 전체를 다시 계산한다.
//
// Plans/14-accounts-notifications.md §6.1 — "접수 확인"·"멘토 배정"까지는 여전히 타이머 연출이지만,
// 그 이후(mentor_review)는 지속시간이 없다(Infinity) — 실제 멘토가 확정 제출하기 전까지는 시간이
// 아무리 지나도 완료되지 않는다. "검증 완료" 단계도 마찬가지로 타이머만으로는 done이 되지 않는다.
import { accountById } from '@/data/accounts';
import type { Attempt, MentorStage } from '@/types';

export type StageConfig = {
  id: string;
  label: string;
  mentorName?: string;
  mentorRole?: string;
  workingCopy?: string;
  durationMs: number;
};

const FAST_FORWARD_FACTOR = 10; // ?fast=1 — 시연용 10배속

export const STAGE_CONFIG: StageConfig[] = [
  { id: 'intake', label: '접수 확인', mentorName: '시스템', workingCopy: '접수를 확인하는 중입니다', durationMs: 3_000 },
  {
    id: 'assign',
    label: '멘토 배정',
    mentorName: '운영팀',
    workingCopy: '적합한 멘토를 배정하는 중입니다',
    durationMs: 5_000,
  },
  {
    id: 'mentor_review',
    label: '멘토 검토',
    mentorRole: '현직 멘토',
    workingCopy: '멘토가 직접 검토하는 중입니다',
    durationMs: Infinity,
  },
  { id: 'complete', label: '검증 완료', durationMs: 0 },
];

export function isFastMode(search: string = typeof window === 'undefined' ? '' : window.location.search): boolean {
  return new URLSearchParams(search).get('fast') === '1';
}

function scaled(ms: number, fast: boolean): number {
  return fast ? ms / FAST_FORWARD_FACTOR : ms;
}

export function totalDurationMs(fast = isFastMode()): number {
  return STAGE_CONFIG.reduce((sum, c) => sum + scaled(c.durationMs, fast), 0);
}

/** mentorRequest.submittedAt을 기준 삼아 현재 시각에서의 각 단계 상태를 절대시간으로 계산한다.
 * mentor_review는 durationMs가 Infinity라 시간이 아무리 지나도 'active'에 머문다 — 실제로
 * 멘토가 확정 제출(setMentorFeedback)해야만 완료로 취급된다(호출부는 mentorFeedback 유무를 본다). */
export function resumeMentorProgress(attempt: Attempt, now = Date.now(), fast = isFastMode()): MentorStage[] {
  const submittedAt = attempt.mentorRequest?.submittedAt;
  const mentorName = accountById(attempt.assignedMentorId)?.name;
  let cursor = submittedAt ? new Date(submittedAt).getTime() : now;

  return STAGE_CONFIG.map((config) => {
    const duration = scaled(config.durationMs, fast);
    const startedAt = cursor;
    const endsAt = cursor + duration;

    let status: MentorStage['status'];
    if (config.id === 'complete') {
      status = Number.isFinite(cursor) && now >= cursor ? 'done' : 'pending';
    } else if (now >= endsAt) {
      status = 'done';
    } else if (now >= startedAt) {
      status = 'active';
    } else {
      status = 'pending';
    }

    const resolvedMentorName = config.id === 'mentor_review' ? mentorName : config.mentorName;

    const stage: MentorStage = {
      id: config.id,
      label: config.label,
      status,
      ...(resolvedMentorName ? { mentorName: resolvedMentorName } : {}),
      ...(status !== 'pending' ? { startedAt: new Date(startedAt).toISOString() } : {}),
      ...(status === 'done' ? { completedAt: new Date(config.id === 'complete' ? cursor : endsAt).toISOString() } : {}),
    };

    cursor = endsAt;
    return stage;
  });
}

/** 활성 단계를 완료 처리하고 다음 대기 단계를 활성화한다 — 스토어의 자동 진행과 ADMIN의 수동
 * 진행(다음 단계로/즉시 완료 처리)이 이 순수 함수를 공유한다 (Plans/10-admin.md §3.3). */
export function advanceStages(stages: MentorStage[], now: string = new Date().toISOString()): MentorStage[] {
  const next = [...stages];
  const activeIdx = next.findIndex((s) => s.status === 'active');
  if (activeIdx !== -1) {
    next[activeIdx] = { ...next[activeIdx], status: 'done', completedAt: now };
  }
  const nextIdx = next.findIndex((s) => s.status === 'pending');
  if (nextIdx !== -1) {
    next[nextIdx] = { ...next[nextIdx], status: 'active', startedAt: now };
  }
  return next;
}

/** advanceStages를 전 단계 수만큼 반복해 모두 done으로 만든다 — 멘토가 실제로 확정 제출했을 때
 * (setMentorFeedback) 화면상 타임라인도 즉시 "검증 완료"로 맞추는 데 쓴다. ADMIN의 "즉시 완료
 * 처리"·샘플 데이터 완료 처리와 동일한 로직을 공유한다. */
export function completeAllStages(stages: MentorStage[], now: string = new Date().toISOString()): MentorStage[] {
  let result = stages;
  for (let i = 0; i < STAGE_CONFIG.length; i += 1) {
    result = advanceStages(result, now);
  }
  return result;
}

export function isAllDone(stages: MentorStage[]): boolean {
  return stages.length > 0 && stages.every((s) => s.status === 'done');
}
