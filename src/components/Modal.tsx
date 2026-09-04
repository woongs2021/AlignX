import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import styles from './Modal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** 타이틀 우측에 보조로 띄우는 내용(예: 실시간 경과 시간) — 계속 바뀌는 값이라
   * aria-labelledby가 가리키는 접근 가능한 이름에는 포함하지 않는다. */
  titleMeta?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  /** 다이얼로그 크기를 개별 호출부에서 조정해야 할 때(예: 더 넓은 폭)만 쓴다 — 기본 크기는
   * 이 prop 없이 .dialog가 그대로 결정한다. */
  className?: string;
};

/** 접근성 기본기를 갖춘 확인 모달 — 포커스 트랩·Esc·스크롤 잠금 (MobileNav와 동일 패턴). */
export function Modal({ isOpen, onClose, title, titleMeta, children, actions, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const lenis = useLenis();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusable(): HTMLElement[] {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea') ?? [],
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

  // 열림 중 body 스크롤 잠금 + Lenis 정지 (MobileNav와 동일 패턴) — Lenis는 body overflow와
  // 무관하게 전역 휠 이벤트를 가로채므로, 정지시키지 않으면 모달 내부를 스크롤해도 뒤 페이지가
  // 대신 스크롤된다.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      document.body.style.overflow = original;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={[styles.dialog, className].filter(Boolean).join(' ')}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className={styles.title}>
              <span id={titleId}>{title}</span>
              {titleMeta && <span className={styles.titleMeta}>{titleMeta}</span>}
            </h2>
            <div className={styles.body}>{children}</div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
