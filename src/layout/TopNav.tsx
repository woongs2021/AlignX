import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AlignXLogo } from '@/components/AlignXLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { AccountMenu } from './AccountMenu';
import { useRole } from '@/features/auth/useSession';
import { navItemsFor } from './navItems';
import { MobileNav } from './MobileNav';
import { useTopNavScroll } from './useTopNavScroll';
import styles from './TopNav.module.css';

function HamburgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

/** 상단 고정 내비게이션 (Plans/03-layout-navigation.md §2). */
export function TopNav() {
  const { scrolled, hidden } = useTopNavScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useRole();
  const navItems = navItemsFor(role);
  // HOME의 다크모드 dim 토글은 제거 대상이었다(Plans/14 §4.1) — 아예 렌더하지 않는다.
  const isHome = useLocation().pathname === '/';

  const navClass = [styles.nav, scrolled && styles.scrolled, hidden && styles.hidden]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={navClass}>
        <div className={styles.container}>
          <NavLink
            to="/"
            className={styles.logoLink}
            aria-label="AlignX 홈"
            onClick={() => window.dispatchEvent(new Event('alignx:hero-reset'))}
          >
            <AlignXLogo className={styles.logo} />
          </NavLink>

          <nav className={styles.tabs} aria-label="주 메뉴">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [styles.tab, item.to === '/alignx' && styles.tabNatural, isActive && styles.tabActive]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {!isHome && <ThemeToggle />}
            <NotificationBell />
            <AccountMenu />
            <button
              type="button"
              className={styles.hamburger}
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
