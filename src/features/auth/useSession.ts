// 로그인 상태·역할 파생 — MyPage/router/TopNav가 전부 이 훅만 본다(Plans/14 §3.2).
import { useAppStore } from '@/store/useAppStore';
import { ACCOUNTS, accountById, type Account, type AccountRole } from '@/data/accounts';
import type { Attempt } from '@/types';

export function useCurrentAccount(): Account | null {
  const accountId = useAppStore((s) => s.session.accountId);
  return accountById(accountId);
}

export function useRole(): AccountRole | 'guest' {
  const account = useCurrentAccount();
  return account?.role ?? 'guest';
}

/** 멘티(또는 로그인하지 않은 게스트) = 본인이 만든 회차, 멘토 = 본인에게 배정된 회차,
 * 관리자 = 빈 배열(MY 자체가 없다). 게스트는 ownerId가 null인 회차를 "자기 것"으로 본다 —
 * 로그인 계정이 생기기 전부터 있던 "브라우저당 1명" 데모 경험을 그대로 유지한다. */
export function useMyAttempts(): Attempt[] {
  const account = useCurrentAccount();
  const attempts = useAppStore((s) => s.attempts);
  if (!account) return attempts.filter((a) => (a.ownerId ?? null) === null);
  if (account.role === 'mentee') return attempts.filter((a) => (a.ownerId ?? null) === account.id);
  if (account.role === 'mentor') return attempts.filter((a) => (a.assignedMentorId ?? null) === account.id);
  return [];
}

export { ACCOUNTS };
