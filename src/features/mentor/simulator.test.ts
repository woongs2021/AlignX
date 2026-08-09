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
      survey: { satisfaction: 5, motivation: 5, outcome: 5 },
      review: '후기입니다 10자 이상 작성합니다',
      submittedAt,
    },
    mentorStages: null,
    mentorFeedback: null,
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

  it('전체 소요시간이 지나면 모든 단계가 done이다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + totalDurationMs(false) + 1000;
    const stages = resumeMentorProgress(attempt, now, false);

    expect(isAllDone(stages)).toBe(true);
    expect(stages.every((s) => s.status === 'done')).toBe(true);
  });

  it('탭을 3분 뒤 다시 열어도(경과 시간만 반영) 완료 상태로 정확히 복원된다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    // 전체 소요는 약 2분 30초 — 3분 뒤라면 이미 끝나 있어야 한다.
    const now = new Date(submittedAt).getTime() + 3 * 60 * 1000;
    const stages = resumeMentorProgress(attempt, now, false);
    expect(isAllDone(stages)).toBe(true);
  });

  it('중간 시점에는 정확히 하나의 단계만 active다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + 30_000; // 2번째 단계(멘토 배정) 진행 중일 시점
    const stages = resumeMentorProgress(attempt, now, false);
    const activeStages = stages.filter((s) => s.status === 'active');
    expect(activeStages.length).toBe(1);
  });

  it('완료된 단계는 completedAt을 갖는다', () => {
    const submittedAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const attempt = makeAttempt(submittedAt);
    const now = new Date(submittedAt).getTime() + totalDurationMs(false) + 1000;
    const stages = resumeMentorProgress(attempt, now, false);
    for (const stage of stages) {
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
  it('review1/review2/synthesis 단계에 실제 멘토 이름·역할이 배정되어 있다', () => {
    const named = STAGE_CONFIG.filter((c) => c.mentorRole);
    expect(named).toHaveLength(3);
    for (const stage of named) {
      expect(stage.mentorName).toBeTruthy();
    }
  });
});
