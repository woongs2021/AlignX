// TopNav(데스크톱 탭)와 MobileNav(모바일 메뉴)가 공유하는 내비게이션 항목 — 1곳에서만 관리한다.
// 로고(=HOME)는 별도. ADMIN 탭은 링크일 뿐 — 클릭해도 /admin의 기존 암호 게이트가 그대로 뜬다
// (실제 접근 통제는 없다는 고지도 그대로 유지된다).
//
// Phase14 — 계정 도입 이후 탭 구성이 역할에 따라 달라진다(Plans/14 §3.3): 멘티·멘토는 MY,
// 관리자는 ADMIN만 노출한다. ADMIN 라우트 자체의 접근 통제는 바뀌지 않는다 — 여전히 히든
// 라우트 + 암호 게이트다. 여기서 숨기는 건 "탭 노출" 뿐이다.
import type { AccountRole } from '@/data/accounts';

export type NavItem = { to: string; label: string };

const PORTFOLIO: NavItem = { to: '/portfolio', label: 'PORTFOLIO 분석' };
const ALIGNX: NavItem = { to: '/alignx', label: 'AlignX AI' };
const MY: NavItem = { to: '/my', label: 'MY' };
const ABOUT: NavItem = { to: '/about', label: 'ABOUT' };
const ADMIN: NavItem = { to: '/admin', label: 'ADMIN' };

export function navItemsFor(role: AccountRole | 'guest'): NavItem[] {
  if (role === 'admin') return [PORTFOLIO, ALIGNX, ABOUT, ADMIN];
  return [PORTFOLIO, ALIGNX, MY, ABOUT];
}
