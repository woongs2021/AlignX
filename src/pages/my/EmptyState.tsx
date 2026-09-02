import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import styles from './EmptyState.module.css';

/** 0회 — 일러스트 대신 큰 활자 + 색면 (09 §3, 디자인 시스템 §빈 상태). */
export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className={styles.section}>
      <div className={styles.colorBlock} aria-hidden="true" />
      <span className={styles.number}>00</span>
      <p className={`kr-3 ${styles.title}`}>아직 분석한 포트폴리오가 없습니다</p>
      <p className="meta">첫 분석은 90초면 끝납니다</p>
      <Button variant="primary" onClick={() => navigate('/portfolio', { state: { openAnalysisModal: true } })}>
        포트폴리오 분석 시작하기
      </Button>
    </div>
  );
}
