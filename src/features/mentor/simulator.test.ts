import { describe, expect, it } from 'vitest';
import {
  STAGE_CONFIG,
  isAllDone,
  isFastMode,
  resumeMentorProgress,
  totalDurationMs,
} from './simulator';
import type { Attempt } from '@/types';

function makeAttempt(submittedAt: string): Attempt {
  return {
    id: 'atmp_test',
    createdAt: submittedAt,
    currentStep: 2,
    status: 'submitted',
    file: { name: 'a.pdf', mime: 'application/pdf', size: 1, previewDataUrl: '' },
    ai: null,
    mentorRequest: {
      name: '홍길동',
      topic: '테스트',
      requestNote: '요청사항입니다 10자 이상',
      submittedAt,
    },
    mentorStages: null,
    mentorFeedback: null,
    finalReview: null,
  };
}

describe('resumeMentorProgress', () => {
  it('제출 직후(0ms 경과)에는 첫 단계만 active, 나머지는 pending', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime();
    const stages = resumeMentorProgress(attempt, now, false);

    expect(stages[0].status).toBe('active');
    expect(stages.slice(1).every((s) => s.status === 'pending')).toBe(true);
  });

  it('절대 시각 기준이라 같은 now를 넣으면 항상 같은 결과를 낸다 (탭 복귀 재현)', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 25_000;

    const first = resumeMentorProgress(attempt, now, false);
    const second = resumeMentorProgress(attempt, now, false);
    expect(first).toEqual(second);
  });

  it('mentor_review는 지속시간이 없어(Infinity) 시간이 아무리 지나도 active에 머문다 — 타이머만으로는 완료되지 않는다 (Plans/14 §6.1)', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 999 * 24 * 60 * 60 * 1000; // 999일 후
    const stages = resumeMentorProgress(attempt, now, false);

    expect(isAllDone(stages)).toBe(false);
    expect(stages.find((s) => s.id === 'mentor_review')?.status).toBe('active');
    expect(stages.find((s) => s.id === 'complete')?.status).toBe('pending');
  });

  it('탭을 3분 뒤 다시 열어도(경과 시간만 반영) 접수·배정은 끝나 있고 멘토 검토는 여전히 진행 중이다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 3 * 60 * 1000;
    const stages = resumeMentorProgress(attempt, now, false);
    expect(stages.find((s) => s.id === 'intake')?.status).toBe('done');
    expect(stages.find((s) => s.id === 'assign')?.status).toBe('done');
    expect(stages.find((s) => s.id === 'mentor_review')?.status).toBe('active');
  });

  it('중간 시점에는 정확히 하나의 단계만 active다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 30_000; // 2번째 단계(멘토 배정) 진행 중일 시점
    const stages = resumeMentorProgress(attempt, now, false);
    const activeStages = stages.filter((s) => s.status === 'active');
    expect(activeStages.length).toBe(1);
  });

  it('완료된 단계(접수·배정)는 completedAt을 갖는다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 3 * 60 * 1000;
    const stages = resumeMentorProgress(attempt, now, false);
    const doneStages = stages.filter((s) => s.status === 'done');
    expect(doneStages.length).toBeGreaterThan(0);
    for (const stage of doneStages) {
      expect(stage.completedAt).toBeTruthy();
    }
  });
});

describe('isFastMode', () => {
  it('?fast=1 쿼리가 있으면 true', () => {
    expect(isFastMode('?fast=1')).toBe(true);
  });

  it('쿼리가 없으면 false', () => {
    expect(isFastMode('')).toBe(false);
  });
});

describe('totalDurationMs', () => {
  it('fast 모드는 일반 모드의 1/10이다', () => {
    const normal = totalDurationMs(false);
    const fast = totalDurationMs(true);
    expect(fast).toBeCloseTo(normal / 10, 5);
  });
});

describe('STAGE_CONFIG', () => {
  it('mentor_review 단계에 역할이 배정되어 있고, 지속시간이 없다(Infinity) — 타이머만으론 끝나지 않는다', () => {
    const reviewStage = STAGE_CONFIG.find((c) => c.id === 'mentor_review');
    expect(reviewStage?.mentorRole).toBeTruthy();
    expect(reviewStage?.durationMs).toBe(Infinity);
  });
});
