import { motion } from 'motion/react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { PRINCIPLES } from '@/data/principles';
import styles from './PrinciplesSection.module.css';

/** 10대 원칙 카드 — principles.ts 단일 소스만 참조한다(하드코딩 중복 0, 08 §완료 기준). */
export function PrinciplesSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <SectionAnchor id="principles">
      <section className={styles.section}>
        <SectionHeader eyebrow="10 PRINCIPLES" title="AI가 채점하는 10가지 기준" className={styles.header} />

        <motion.div
          ref={ref}
          className="card-grid"
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {PRINCIPLES.map((principle) => (
            <motion.div key={principle.id} variants={revealItem}>
              <Card className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.number}>{String(principle.order).padStart(2, '0')}</span>
                  <div>
                    <p className={styles.titleKr}>{principle.nameKr}</p>
                    <p className={styles.titleEn}>{principle.nameEn}</p>
                  </div>
                </div>
                <p className={styles.description}>{principle.description}</p>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>측정 방식</span>
                  <span className={styles.rowText}>{principle.measurement}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>만점 조건</span>
                  <span className={styles.rowText}>{principle.fullScoreCondition}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>흔한 실패 사례</span>
                  <span className={styles.rowText}>{principle.commonFailure}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </SectionAnchor>
  );
}
