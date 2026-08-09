// ADMIN 세션 유효성 — 8시간 만료 (Plans/10-admin.md §1.3).
import { ADMIN_SESSION_DURATION_MS } from '@/data/constants';

export function isAdminSessionValid(unlockedAt: string | null, now: number = Date.now()): boolean {
  if (unlockedAt === null) return false;
  const elapsed = now - new Date(unlockedAt).getTime();
  return elapsed >= 0 && elapsed < ADMIN_SESSION_DURATION_MS;
}
