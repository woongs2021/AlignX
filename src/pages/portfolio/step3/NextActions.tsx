import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import styles from './NextActions.module.css';

export function NextActions() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <Button variant="primary" onClick={() => navigate('/portfolio', { state: { openAnalysisModal: true } })}>
        다시 분석하기
      </Button>
      <Button variant="secondary" onClick={() => navigate('/my')}>
        MY에서 이력 보기
      </Button>
    </section>
  );
}
