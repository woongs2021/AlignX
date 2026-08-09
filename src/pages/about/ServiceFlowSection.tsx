import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { motion } from 'motion/react';
import styles from './ServiceFlowSection.module.css';

const STEPS = [
  { title: '업로드 · AI 분석', desc: '포트폴리오를 올리면 10대 원칙으로 즉시 채점합니다.' },
  { title: '멘토 검증', desc: '현직 멘토가 AI 점수 위에 사람의 판단을 더합니다.' },
  { title: '통합 리포트', desc: 'AI와 멘토의 결과를 한 장의 HTML 리포트로 받습니다.' },
];

export function ServiceFlowSection() {
  const { ref, revealed } = useReveal<HTMLOListElement>();

  return (
    <SectionAnchor id="flow">
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="SERVICE FLOW" title="3단계로 끝나는 검증" className={styles.header} />
        <motion.ol
          ref={ref}
          className={styles.steps}
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {STEPS.map((step, i) => (
            <motion.li key={step.title} variants={revealItem}>
              <Link to="/portfolio" className={styles.step}>
                <span className={styles.number}>0{i + 1}</span>
                <span className={styles.body}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepDesc}>{step.desc}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ol>
      </section>
    </SectionAnchor>
  );
}
