import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeader } from '@/components/SectionHeader';
import { PRINCIPLES } from '@/data/principles';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import styles from './PrinciplesSection.module.css';

/** 툴팁 대신 하단 고정 영역에 정의를 표시 — 모바일에서 툴팁은 무력하다 (04 §5). */
export function PrinciplesSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [activeId, setActiveId] = useState(PRINCIPLES[0].id);
  const active = PRINCIPLES.find((p) => p.id === activeId) ?? PRINCIPLES[0];

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="10 PRINCIPLES"
          title="AI가 살펴보는 10가지 기준"
          className={styles.header}
        />

        <motion.div
          ref={ref}
          className={styles.grid}
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {PRINCIPLES.map((principle) => (
            <motion.button
              key={principle.id}
              type="button"
              variants={revealItem}
              className={[styles.pill, principle.id === activeId && styles.pillActive]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setActiveId(principle.id)}
              onFocus={() => setActiveId(principle.id)}
            >
              <span className={styles.pillNumber}>{String(principle.order).padStart(2, '0')}</span>
              <span className={styles.pillNameKr}>{principle.nameKr}</span>
              <span className={styles.pillNameEn}>{principle.nameEn}</span>
            </motion.button>
          ))}
        </motion.div>

        <p className={styles.definition} aria-live="polite">
          {active.nameKr} — {active.description}
        </p>

        <Link to="/alignx" className={styles.footerLink}>
          AlignX AI 자세히 보기 →
        </Link>
      </div>
    </section>
  );
}
