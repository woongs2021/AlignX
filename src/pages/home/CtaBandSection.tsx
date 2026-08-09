import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/Button';
import { revealItem, useReveal } from '@/layout/useReveal';
import styles from './CtaBandSection.module.css';

export function CtaBandSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          ref={ref}
          className={styles.band}
          variants={revealItem}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          <p className={styles.headline}>지금 내 포트폴리오는 몇 점일까?</p>
          <Button variant="secondary" onClick={() => navigate('/portfolio')}>
            무료로 분석 시작
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
