import { motion } from 'motion/react';
import { StatTile } from '@/components/StatTile';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import styles from './ValueSection.module.css';

const STATS = [
  { value: '10', label: 'VISUAL & UX PRINCIPLES' },
  { value: '3', label: 'AI → MENTOR → REPORT' },
  { value: '90초', label: 'AVERAGE ANALYSIS' },
];

export function ValueSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <motion.div
        ref={ref}
        className={`container ${styles.inner}`}
        variants={revealContainer}
        initial="hidden"
        animate={revealed ? 'visible' : 'hidden'}
      >
        <motion.p variants={revealItem} className={`prose ${styles.lead}`}>
          AlignX는 AI의 객관적인 10대 원칙 분석과 현직 디자이너 멘토의 실전 피드백을 한 번에 더해,
          포트폴리오가 놓치기 쉬운 지점까지 짚어드립니다.
        </motion.p>

        <motion.div variants={revealItem} className={styles.stats}>
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
