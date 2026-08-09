import { describe, expect, it } from 'vitest';
import { SAMPLE_STUDENTS, buildSampleAttempt, isSampleAttemptId, SAMPLE_ID_PREFIX } from './sampleStudents';
import { deriveSubmissionStatus } from '@/features/admin/status';

describe('SAMPLE_STUDENTS — 가상 학생 10명 (10 §2.3)', () => {
  it('10명이고 실존 인물이 아니라 전부 성명 형태의 가상 이름이다(고유 id)', () => {
    expect(SAMPLE_STUDENTS).toHaveLength(10);
    expect(new Set(SAMPLE_STUDENTS.map((s) => s.id)).size).toBe(10);
  });

  it('주제 컬럼에 원본 PDF의 실제 기업명이 노출되지 않는다', () => {
    const leakedCompanies = ['카카오', '롯데', '배민', '라인', '쿠팡', 'SK'];
    for (const student of SAMPLE_STUDENTS) {
      for (const company of leakedCompanies) {
        expect(student.topic).not.toContain(company);
        expect(student.sourceFile).not.toContain(company);
      }
    }
  });
});

describe('buildSampleAttempt — 결정론적 합성', () => {
  it('같은 학생이면 항상 같은 Attempt를 만든다', () => {
    const student = SAMPLE_STUDENTS[0];
    const a = buildSampleAttempt(student);
    const b = buildSampleAttempt(student);
    expect(a).toEqual(b);
  });

  it('id는 sample_ 접두사를 갖고 isSampleAttemptId로 식별된다', () => {
    const attempt = buildSampleAttempt(SAMPLE_STUDENTS[0]);
    expect(attempt.id).toBe(SAMPLE_ID_PREFIX + SAMPLE_STUDENTS[0].id);
    expect(isSampleAttemptId(attempt.id)).toBe(true);
  });

  it('baseStatus가 analyzing이면 ai·mentorRequest·mentorStages가 전부 비어있다', () => {
    const student = SAMPLE_STUDENTS.find((s) => s.baseStatus === 'analyzing')!;
    const attempt = buildSampleAttempt(student);
    expect(attempt.ai).toBeNull();
    expect(attempt.mentorRequest).toBeNull();
    expect(attempt.mentorStages).toBeNull();
  });

  it('baseStatus가 completed면 mentorFeedback까지 채워지고 상태가 "완료"로 계산된다', () => {
    const student = SAMPLE_STUDENTS.find((s) => s.baseStatus === 'completed')!;
    const attempt = buildSampleAttempt(student);
    expect(attempt.ai).not.toBeNull();
    expect(attempt.mentorFeedback).not.toBeNull();
    expect(deriveSubmissionStatus(attempt)).toMatchObject({ kind: 'completed', label: '완료' });
  });

  it('baseStatus가 reviewing이면 정적 스냅샷이 실시간 계산과 무관하게 "검증중"으로 유지된다', () => {
    // 샘플의 제출 시각은 몇 시간 전으로 고정돼 있어, 절대시간 기반 resumeMentorProgress를 그대로
    // 쓰면 이미 다 끝난 것처럼 계산돼버린다 — buildSampleAttempt는 정적 스냅샷을 써야 한다.
    const student = SAMPLE_STUDENTS.find((s) => s.baseStatus === 'reviewing')!;
    const attempt = buildSampleAttempt(student);
    const status = deriveSubmissionStatus(attempt);
    expect(status.kind).toBe('reviewing');
    expect(status.doneCount).toBe(student.reviewProgress ?? 0);
  });

  it('baseStatus가 submitted면 "제출완료"로 계산된다', () => {
    const student = SAMPLE_STUDENTS.find((s) => s.baseStatus === 'submitted')!;
    const attempt = buildSampleAttempt(student);
    expect(deriveSubmissionStatus(attempt).kind).toBe('submitted');
  });
});
