import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import styles from '../home/CtaBandSection.module.css';

export function AlignxCtaSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.band}>
          <p className={styles.headline}>내 포트폴리오는 이 기준에서 몇 점일까?</p>
          <Button variant="secondary" onClick={() => navigate('/portfolio')}>
            내 포트폴리오로 확인해보기
          </Button>
        </div>
      </div>
    </section>
  );
}
