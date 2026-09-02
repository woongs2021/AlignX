import { useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Modal } from '@/components/Modal';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { motion } from 'motion/react';
import { MENTOR_PERSONAS, type MentorPersona } from './mentorPersonas';
import styles from './TeamSection.module.css';

const CATEGORY_LABEL: Record<MentorPersona['category'], string> = {
  planning: '기획 · PM',
  marketing: '마케팅',
  design: '디자인',
  dev: '개발 · 코드리뷰',
  other: '기타',
};

function MentorAvatar({ persona, className }: { persona: MentorPersona; className: string }) {
  return (
    <span className={className} data-category={persona.category}>
      <img src={persona.avatarSrc} alt="" className={styles.avatarImg} loading="lazy" />
    </span>
  );
}

/** 멘토 3인 이상은 가상 프로필이다 — 실존 인물을 사칭하지 않는다 (08 §B3).
 * 카드는 이름·직무만 보여주고, 클릭하면 학력·경력 상세를 팝업으로 보여준다. */
export function TeamSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MENTOR_PERSONAS.find((p) => p.id === selectedId) ?? null;

  return (
    <SectionAnchor id="team">
      <section className={`container-narrow ${styles.section}`}>
        <SectionHeader eyebrow="TEAM" title="검증에 참여하는 멘토" className={styles.header} />
        <p className={`prose ${styles.body}`}>
          아래 멘토 프로필은 서비스 소개를 위한 가상의 인물입니다. 실제 검증은 이 역할군에 준하는
          각 분야 현직 실무자가 맡습니다. 카드를 클릭하면 학력·경력 예시를 볼 수 있습니다.
        </p>
        <motion.div
          ref={ref}
          className="card-grid"
          variants={revealContainer}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          {MENTOR_PERSONAS.map((persona) => (
            <motion.div key={persona.id} variants={revealItem}>
              <div className={styles.card}>
                <button
                  type="button"
                  className={styles.cardButton}
                  onClick={() => setSelectedId(persona.id)}
                >
                  <MentorAvatar persona={persona} className={styles.avatar} />
                  <p className={styles.name}>{persona.name}</p>
                  <p className={styles.roleLabel} data-category={persona.category}>
                    {persona.role}
                  </p>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Modal isOpen={selected !== null} onClose={() => setSelectedId(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className={styles.detail}>
            <button
              type="button"
              className={styles.detailClose}
              onClick={() => setSelectedId(null)}
              aria-label="닫기"
            >
              ×
            </button>
            <div className={styles.detailHead}>
              <MentorAvatar persona={selected} className={styles.detailAvatar} />
              <p className={styles.roleLabel} data-category={selected.category}>
                {selected.role} · {CATEGORY_LABEL[selected.category]}
              </p>
            </div>

            <p className={styles.detailFocus}>{selected.bio.focus}</p>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>학력</p>
              <ul className={styles.detailList}>
                {selected.bio.education.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>경력</p>
              <ul className={styles.detailList}>
                {selected.bio.career.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <p className={`meta ${styles.detailNotice}`}>
              위 프로필은 서비스 소개를 위한 가상의 예시입니다.
            </p>
          </div>
        )}
      </Modal>
    </SectionAnchor>
  );
}
