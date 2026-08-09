import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { motion } from 'motion/react';
import { MENTORS } from '@/data/mentors';
import styles from './TeamSection.module.css';

/** 멘토 3인은 가상 프로필이다 — 실존 인물을 사칭하지 않는다 (08 §B3). */
export function TeamSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <SectionAnchor id="team">
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="TEAM" title="검증에 참여하는 멘토" className={styles.header} />
        <p className={`prose ${styles.body}`}>
          아래 멘토 프로필은 서비스 소개를 위한 가상의 인물입니다. 실제 검증은 이 역할군에 준하는
          현직 디자이너가 맡습니다.
        </p>
        <motion.div
          ref={ref}
          className="card-grid"
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {MENTORS.map((mentor) => (
            <motion.div key={mentor.id} variants={revealItem}>
              <Card className={styles.card}>
                <span className={styles.avatar} aria-hidden="true">
                  {mentor.initial}
                </span>
                <p className={styles.name}>{mentor.name}</p>
                <p className="meta">{mentor.role}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </SectionAnchor>
  );
}
