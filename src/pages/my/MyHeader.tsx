import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
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
      <Button variant="primary" onClick={() => navigate('/portfolio/analyze')}>
        새 분석 시작
      </Button>
    </div>
  );
}
