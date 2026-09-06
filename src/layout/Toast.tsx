import { AnimatePresence, motion } from 'motion/react';
import { useToastStore } from '@/store/useToastStore';
import styles from './Toast.module.css';

/** 화면 하단 중앙에 잠깐 떴다 사라지는 토스트 — useToastStore.showToast()로 띄운다.
 * PageShell에서 전역으로 렌더돼 모든 라우트·화면 크기에서 동일하게 뜬다. */
export function Toast() {
  const message = useToastStore((s) => s.message);

  return (
    <div className={styles.wrap}>
      <AnimatePresence>
        {message && (
          <motion.p
            role="status"
            aria-live="polite"
            className={styles.toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
