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
  // 계정 도입 이후에는 "전체 초기화"가 아니라 "내(로그인 계정 또는 게스트) 회차만 초기화"다 —
  // 다른 계정의 기록·세션·알림까지 지우면 안 된다(Plans/14 §3.1).
  const clearOwnAttempts = useAppStore((s) => s.clearOwnAttempts);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleResetConfirm() {
    clearOwnAttempts();
    setConfirmOpen(false);
  }

  return (
    <div className={styles.header}>
      <div>
        <span className="label">MY PORTFOLIO</span>
        <h1 className={styles.title}>{name}님의 포트폴리오 기록</h1>
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
        <Button variant="primary" onClick={() => navigate('/portfolio', { state: { openAnalysisModal: true } })}>
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
