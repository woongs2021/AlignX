// TopNav(데스크톱 탭)와 MobileNav(모바일 메뉴)가 공유하는 내비게이션 항목 — 1곳에서만 관리한다.
// 로고(=HOME)는 별도. ADMIN 탭은 링크일 뿐 — 클릭해도 /admin의 기존 암호 게이트가 그대로 뜬다
// (실제 접근 통제는 없다는 고지도 그대로 유지된다).

export type NavItem = { to: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { to: '/portfolio', label: 'PORTFOLIO 분석' },
  { to: '/alignx', label: 'AlignX AI' },
  { to: '/my', label: 'MY' },
  { to: '/about', label: 'ABOUT' },
  { to: '/admin', label: 'ADMIN' },
];
