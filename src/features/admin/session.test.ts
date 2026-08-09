import { describe, expect, it } from 'vitest';
import { isAdminSessionValid } from './session';
import { ADMIN_SESSION_DURATION_MS } from '@/data/constants';

describe('isAdminSessionValid — 8시간 세션 만료 (10 §1.3)', () => {
  it('unlockedAt이 없으면 무효다', () => {
    expect(isAdminSessionValid(null)).toBe(false);
  });

  it('방금 잠금 해제했으면 유효하다', () => {
    const now = Date.now();
    expect(isAdminSessionValid(new Date(now).toISOString(), now)).toBe(true);
  });

  it('만료 시각 직전까지는 유효하다', () => {
    const now = Date.now();
    const unlockedAt = new Date(now - ADMIN_SESSION_DURATION_MS + 1000).toISOString();
    expect(isAdminSessionValid(unlockedAt, now)).toBe(true);
  });

  it('8시간이 지나면 무효가 된다', () => {
    const now = Date.now();
    const unlockedAt = new Date(now - ADMIN_SESSION_DURATION_MS - 1000).toISOString();
    expect(isAdminSessionValid(unlockedAt, now)).toBe(false);
  });

  it('미래 시각(시계 오류 등)도 무효로 취급한다', () => {
    const now = Date.now();
    const unlockedAt = new Date(now + 1000).toISOString();
    expect(isAdminSessionValid(unlockedAt, now)).toBe(false);
  });
});
