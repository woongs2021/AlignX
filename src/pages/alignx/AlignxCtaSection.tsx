import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import styles from '../home/CtaBandSection.module.css';

export function AlignxCtaSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className="container-narrow">
        <div className={styles.band}>
          <img
            src={`${import.meta.env.BASE_URL}images/banner/banner-02.svg`}
            alt=""
            className={`${styles.banner} ${styles.bannerTopLeft}`}
          />
          <p className={styles.headline}>내 포트폴리오는 이 기준에서 몇 점일까?</p>
          <Button variant="primary" onClick={() => navigate('/portfolio')}>
            내 포트폴리오로 확인해보기
          </Button>
          <img
            src={`${import.meta.env.BASE_URL}images/banner/banner-02.svg`}
            alt=""
            className={`${styles.banner} ${styles.bannerBottomRight}`}
          />
        </div>
      </div>
    </section>
  );
}
