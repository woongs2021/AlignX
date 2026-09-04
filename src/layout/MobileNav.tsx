import { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useLenis } from 'lenis/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { useCurrentAccount, useMentorRequestCounts, useRole } from '@/features/auth/useSession';
import { ACCOUNTS } from '@/data/accounts';
import { useAppStore } from '@/store/useAppStore';
import { navItemsFor } from './navItems';
import styles from './MobileNav.module.css';

function CloseIcon() {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** 전체 화면 오버레이 모바일 내비게이션 (Plans/03-layout-navigation.md §2.4). */
export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const role = useRole();
  const navItems = navItemsFor(role);
  const account = useCurrentAccount();
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);
  const requestCounts = useMentorRequestCounts();
  const isHome = location.pathname === '/';

  // 라우트 변경 시 자동 닫힘
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 열림 중 body 스크롤 잠금 + Lenis 정지
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  // 포커스 트랩 + Esc 닫기
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusable(): HTMLElement[] {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
    }

    getFocusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="모바일 내비게이션"
          className={styles.overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <div className={styles.topRow}>
            {!isHome && <ThemeToggle />}
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="메뉴 닫기">
              <CloseIcon />
            </button>
          </div>
          <nav className={styles.menu} aria-label="주 메뉴">
            {navItems.map((item) => (
              <motion.div key={item.to} variants={itemVariants}>
                <NavLink to={item.to} className={styles.menuLink}>
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <motion.div className={styles.accountBlock} variants={itemVariants}>
            {account ? (
              <>
                <div className={styles.accountRow}>
                  <Avatar src={account.avatarSrc} initial={account.initial} alt="" size={36} />
                  <div>
                    <p className={styles.accountName}>{account.name}</p>
                    <p className="meta">{account.title}</p>
                  </div>
                  <Badge variant={requestCounts[account.id] > 0 ? 'warning' : 'outline'}>
                    {requestCounts[account.id]}건
                  </Badge>
                </div>
                <div className={styles.accountActions}>
                  {ACCOUNTS.filter((a) => a.id !== account.id).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={styles.accountActionBtn}
                      onClick={() => {
                        login(a.id);
                        navigate('/');
                      }}
                    >
                      {a.name}({a.role === 'mentee' ? '멘티' : a.role === 'mentor' ? '멘토' : '관리자'})으로 전환
                    </button>
                  ))}
                  <button type="button" className={styles.accountActionBtn} onClick={() => logout()}>
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.accountLabel}>데모 계정으로 로그인</p>
                <div className={styles.accountActions}>
                  {ACCOUNTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={styles.accountActionBtn}
                      onClick={() => {
                        login(a.id);
                        navigate('/');
                      }}
                    >
                      <Avatar src={a.avatarSrc} initial={a.initial} alt="" size={24} /> {a.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
