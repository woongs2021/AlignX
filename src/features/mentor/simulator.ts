// 실시간 검증 모니터 시뮬레이터 — 절대 시각 기준으로 단계를 역산한다 (Plans/06-portfolio-step2.md §3.3).
// setInterval 카운터를 상태로 들면 탭을 닫았다 열 때 진행이 멈추거나 튄다 — 그래서 매 tick마다
// mentorRequest.submittedAt + 현재 시각으로 전체를 다시 계산한다.
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

// 전체 합 60초 — "컨펌 프로세스도 1분 정도" 요청에 맞춰 원래 비율(6:12:40:40:50)을 유지한 채
// 축소했다.
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
    id: 'review1',
    label: '1차 리뷰 — 구조 · 내러티브',
    mentorName: '김세연',
    mentorRole: 'UX Lead',
    workingCopy: '구조와 내러티브를 검토하는 중입니다',
    durationMs: 16_000,
  },
  {
    id: 'review2',
    label: '2차 리뷰 — 비주얼 · UX',
    mentorName: '박도현',
    mentorRole: 'Product Designer',
    workingCopy: '비주얼과 UX를 검토하는 중입니다',
    durationMs: 16_000,
  },
  {
    id: 'synthesis',
    label: '종합 코멘트 작성',
    mentorName: '이지우',
    mentorRole: 'Design Director',
    workingCopy: '종합 코멘트를 작성하는 중입니다',
    durationMs: 20_000,
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

/** mentorRequest.submittedAt을 기준 삼아 현재 시각에서의 각 단계 상태를 절대시간으로 계산한다. */
export function resumeMentorProgress(attempt: Attempt, now = Date.now(), fast = isFastMode()): MentorStage[] {
  const submittedAt = attempt.mentorRequest?.submittedAt;
  let cursor = submittedAt ? new Date(submittedAt).getTime() : now;

  return STAGE_CONFIG.map((config) => {
    const duration = scaled(config.durationMs, fast);
    const startedAt = cursor;
    const endsAt = cursor + duration;

    let status: MentorStage['status'];
    if (config.id === 'complete') {
      status = now >= cursor ? 'done' : 'pending';
    } else if (now >= endsAt) {
      status = 'done';
    } else if (now >= startedAt) {
      status = 'active';
    } else {
      status = 'pending';
    }

    const stage: MentorStage = {
      id: config.id,
      label: config.label,
      status,
      ...(config.mentorName ? { mentorName: config.mentorName } : {}),
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

export function isAllDone(stages: MentorStage[]): boolean {
  return stages.length > 0 && stages.every((s) => s.status === 'done');
}
