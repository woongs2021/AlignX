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
  '/about': 'violet',
  '/admin': 'cool',
};

export function resolveRouteTheme(pathname: string): ThemeName {
  return ROUTE_THEME[pathname] ?? DEFAULT_THEME;
}
