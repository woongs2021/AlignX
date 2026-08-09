import { useStorageWarningStore } from '@/store/useAppStore';
import styles from './StorageWarningBanner.module.css';

/** 저장 공간 부족·손상된 로컬 데이터 초기화 안내 — 전 페이지 공통(12 §4.3 시나리오 D-13). */
export function StorageWarningBanner() {
  const message = useStorageWarningStore((s) => s.message);
  if (!message) return null;

  return (
    <p role="status" aria-live="polite" className={styles.banner}>
      {message}
    </p>
  );
}
