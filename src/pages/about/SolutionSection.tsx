import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { motion } from 'motion/react';
import styles from './SolutionSection.module.css';

const AI_POINTS = [
  '10개 원칙을 기준으로 정량 채점합니다.',
  '수 초 안에 결과가 나옵니다.',
  '언제 채점해도 같은 기준, 같은 점수입니다.',
];

const MENTOR_POINTS = [
  'AI가 놓치는 맥락과 의도를 읽습니다.',
  '직무·회사에 맞는 적합성을 판단합니다.',
  '실무 경험에 기반한 구체적 코멘트를 남깁니다.',
];

export function SolutionSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <SectionAnchor id="solution">
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="SOLUTION" title="AI와 사람, 두 축으로 본다" className={styles.header} />
        <motion.div
          ref={ref}
          className={styles.grid}
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          <motion.div variants={revealItem}>
            <Card variant="soft" className={styles.column}>
              <p className={styles.columnTitle}>AI 분석</p>
              <ul className={styles.list}>
                {AI_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
          <motion.div variants={revealItem}>
            <Card variant="soft" className={styles.column}>
              <p className={styles.columnTitle}>멘토 검증</p>
              <ul className={styles.list}>
                {MENTOR_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </SectionAnchor>
  );
}
