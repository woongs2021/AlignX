// TopNav(데스크톱 탭)와 MobileNav(모바일 메뉴)가 공유하는 내비게이션 항목 — 1곳에서만 관리한다.
// 로고(=HOME)는 별도. 내비 탭은 4개 (Plans/00-overview.md Q1). ADMIN은 히든 라우트라 노출하지 않는다.

export type NavItem = { to: string; label: string };

export const NAV_ITEMS: NavItem[] = [
  { to: '/portfolio', label: 'PORTFOLIO 분석' },
  { to: '/alignx', label: 'AlignX AI' },
  { to: '/my', label: 'MY' },
  { to: '/about', label: 'ABOUT' },
];
