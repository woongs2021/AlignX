import { motion } from 'motion/react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { PRINCIPLES } from '@/data/principles';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import styles from './ShowcaseSection.module.css';

// 목업 더미 점수 — 합계 87(§6 지정값). 실제 채점 로직은 Phase 05에서 구현한다.
const DUMMY_SCORES: Record<string, number> = {
  hierarchy: 9,
  grid: 8,
  typography: 9,
  color: 8,
  whitespace: 9,
  consistency: 8,
  narrative: 9,
  research: 9,
  interaction: 8,
  impact: 10,
};

const TOTAL_SCORE = 87; // A등급(80–89) — 00 §8 등급표
const GRADE = 'A';

export function ShowcaseSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="SHOWCASE"
          title="AI와 사람이 함께 만든 리포트"
          className={styles.header}
        />

        <motion.div
          ref={ref}
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          <motion.div variants={revealItem}>
            <Card variant="deep" className={styles.card}>
              <div className={styles.top}>
                <div className={styles.scoreBlock}>
                  <span className={styles.scoreLabel}>Total Score</span>
                  <span className={`impact ${styles.score}`}>{TOTAL_SCORE}</span>
                  <span className={styles.grade}>Grade {GRADE}</span>
                </div>

                <div className={styles.bars}>
                  {PRINCIPLES.map((principle) => {
                    const score = DUMMY_SCORES[principle.id];
                    return (
                      <div key={principle.id} className={styles.barRow}>
                        <span className={styles.barLabel}>{principle.nameKr}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${(score / principle.maxScore) * 100}%` }}
                          />
                        </div>
                        <span className={styles.barScore}>{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <blockquote className={styles.quote}>
                “정보 위계가 명확해지니 문서 전체의 설득력이 달라졌어요.” — 김민 멘토
              </blockquote>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
