// 로그인 없는 데모용 계정 3종 — 비밀번호 없이 목록에서 고르면 즉시 전환된다(Phase14 §1 요구 3).
// public/mentors/*.png와 동일한 배치 원칙: 이미지 로드 실패 시 이니셜 원형으로 폴백한다(Avatar.tsx).
import type { Attempt } from '@/types';

export type AccountRole = 'mentee' | 'mentor' | 'admin';

export type Account = {
  id: string;
  role: AccountRole;
  name: string;
  title: string;
  initial: string;
  avatarSrc: string;
};

function accountAvatarUrl(file: string): string {
  return `${import.meta.env.BASE_URL}accounts/${file}`;
}

export const ACCOUNTS: Account[] = [
  {
    id: 'acc_mentee',
    role: 'mentee',
    name: '김지민',
    title: '취업준비생 · 프로덕트 디자인',
    initial: '김',
    avatarSrc: accountAvatarUrl('mentee.png'),
  },
  {
    id: 'acc_mentor',
    role: 'mentor',
    name: '서준혁',
    title: 'UX Lead · 현직 멘토',
    initial: '서',
    avatarSrc: accountAvatarUrl('mentor.png'),
  },
  {
    id: 'acc_admin',
    role: 'admin',
    name: '운영 관리자',
    title: 'AlignX 운영팀',
    initial: 'A',
    avatarSrc: accountAvatarUrl('admin.png'),
  },
];

export function accountById(id: string | null | undefined): Account | null {
  if (!id) return null;
  return ACCOUNTS.find((a) => a.id === id) ?? null;
}

export const MENTEE_ACCOUNT = ACCOUNTS[0];
export const MENTOR_ACCOUNT = ACCOUNTS[1];
export const ADMIN_ACCOUNT = ACCOUNTS[2];

/** 이 계정에 멘토 검증 요청이 몇 건 있는지 — 진행 중이든 이미 멘토 피드백까지 끝난 완료
 * 건이든 모두 센다(멘토 검증을 신청한 적이 있는지가 기준). 계정 메뉴의 본인 배지가 쓴다.
 * admin은 항상 0건. */
export function countMentorRequests(attempts: Attempt[], account: Account): number {
  return attempts.filter((a) => {
    if (a.mentorRequest === null) return false;
    if (account.role === 'mentee') return (a.ownerId ?? null) === account.id;
    if (account.role === 'mentor') return (a.assignedMentorId ?? null) === account.id;
    return false;
  }).length;
}
