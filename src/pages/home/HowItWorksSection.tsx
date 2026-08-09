import { motion } from 'motion/react';
import { SectionHeader } from '@/components/SectionHeader';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import styles from './HowItWorksSection.module.css';

const STEPS = [
  {
    number: '01',
    labelEn: 'AI ANALYSIS',
    titleKr: 'AI 분석',
    description: '포트폴리오를 업로드하면 10대 비주얼·UX 원칙으로 90초 안에 채점합니다.',
    thumbKey: 'step1-loading',
  },
  {
    number: '02',
    labelEn: 'MENTOR REVIEW',
    titleKr: '멘토 검증',
    description: '현직 디자이너 멘토가 AI 점수 위에 사람의 관점을 덧댑니다.',
    thumbKey: 'step2-mentor',
  },
  {
    number: '03',
    labelEn: 'INTEGRATED REPORT',
    titleKr: '통합 리포트',
    description: 'AI와 사람의 결론을 한 장으로 묶어 HTML로 내려받습니다.',
    thumbKey: 'step3-report',
  },
];

export function HowItWorksSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="HOW IT WORKS"
          title="3단계로 완성하는 포트폴리오 검증"
          className={styles.header}
        />

        <motion.div
          ref={ref}
          className="card-grid"
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {STEPS.map((step) => (
            <motion.article key={step.number} variants={revealItem} className={styles.card}>
              <div className={styles.thumbWrap}>
                <PlaceholderImage thumbKey={step.thumbKey} label={step.titleKr} />
              </div>
              <span className={styles.number}>{step.number}</span>
              <span className={`label ${styles.labelEn}`}>{step.labelEn}</span>
              <h3 className={styles.titleKr}>{step.titleKr}</h3>
              <p className={styles.description}>{step.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
