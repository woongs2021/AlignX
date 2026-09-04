// 라우트 → 톤(data-theme) 매핑 — 단 1곳에서만 관리한다 (Plans/00-overview.md §6.1).

export type ThemeName = 'cool' | 'mint' | 'warm' | 'violet';

export const DEFAULT_THEME: ThemeName = 'cool';

const ROUTE_THEME: Record<string, ThemeName> = {
  '/': 'cool',
  '/portfolio': 'cool',
  '/portfolio/analyze': 'cool',
  '/portfolio/mentor': 'warm',
  '/portfolio/report': 'cool',
  '/alignx': 'mint',
  '/my': 'warm',
  '/my/history': 'warm',
  '/my/notifications': 'warm',
  '/about': 'violet',
  '/admin': 'cool',
};

// 동적 세그먼트(예: /my/review/:id, /admin/submissions/:id)는 완전일치표에 걸리지 않는다 —
// 접두사로 찾는다. /admin은 이미 cool이라 지금까지는 증상이 안 보였을 뿐, /my/review는 warm이어야
// 하므로 이 Phase에서 접두사 매칭으로 바꿨다(Plans/14 §10).
const PREFIX_THEME: [prefix: string, theme: ThemeName][] = [
  ['/my/review', 'warm'],
  ['/admin', 'cool'],
];

export function resolveRouteTheme(pathname: string): ThemeName {
  if (ROUTE_THEME[pathname]) return ROUTE_THEME[pathname];
  const match = PREFIX_THEME.find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1] ?? DEFAULT_THEME;
}
