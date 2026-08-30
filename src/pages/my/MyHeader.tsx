import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/lib/format';
import styles from './MyHeader.module.css';

type MyHeaderProps = {
  name: string;
  totalCount: number;
  bestScore: number | null;
  latestDate: string | null;
};

/** 회차 수와 무관하게 항상 보이는 공통 헤드 (09 §2). */
export function MyHeader({ name, totalCount, bestScore, latestDate }: MyHeaderProps) {
  const navigate = useNavigate();
  const resetAll = useAppStore((s) => s.resetAll);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleResetConfirm() {
    resetAll();
    setConfirmOpen(false);
  }

  return (
    <div className={styles.header}>
      <div>
        <span className="label">MY PORTFOLIO</span>
        <h1 className={`kr-2 ${styles.title}`}>{name}님의 포트폴리오 기록</h1>
        {totalCount > 0 && (
          <p className="meta">
            총 {totalCount}회 분석
            {bestScore !== null && ` · 최고 ${bestScore}점`}
            {latestDate && ` · 최근 ${formatDate(latestDate)}`}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        {totalCount > 0 && (
          <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
            초기화
          </Button>
        )}
        <Button variant="primary" onClick={() => navigate('/portfolio/analyze')}>
          새 분석 시작
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="정말 초기화하시겠습니까?"
        actions={
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleResetConfirm}>
              초기화
            </Button>
          </div>
        }
      >
        초기화 버튼을 누르면 지금까지의 모든 분석 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </div>
  );
}
