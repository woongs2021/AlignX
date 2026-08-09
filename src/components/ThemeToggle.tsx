import { useAppStore } from '@/store/useAppStore';
import styles from './ThemeToggle.module.css';

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

/** 라이트/다크 토글 — 배치는 Phase 03 TopNav의 몫이다. */
export function ThemeToggle() {
  const isDark = useAppStore((s) => s.mode === 'dark');
  const toggleMode = useAppStore((s) => s.toggleMode);

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleMode}
      aria-pressed={isDark}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
