import { SectionHeader } from '@/components/SectionHeader';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { revealContainer, revealItem, useReveal } from '@/layout/useReveal';
import { motion } from 'motion/react';
import styles from './WhySection.module.css';

export function WhySection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <SectionAnchor id="why">
      <motion.div
        ref={ref}
        className={styles.section}
        variants={revealContainer}
        initial="hidden"
        animate={revealed ? 'visible' : 'hidden'}
      >
        <motion.div variants={revealItem}>
          <SectionHeader eyebrow="WHY" title="왜 AlignX를 만들었나" />
          <p className={`prose ${styles.body}`}>
            포트폴리오 피드백은 대부분 "느낌"에 의존합니다. 같은 포트폴리오를 두 심사자에게 보여줘도
            정반대의 평가가 나오는 경우가 드물지 않습니다. 무엇을 잘했고 무엇을 고쳐야 하는지에 대한
            합의된 기준이 없기 때문입니다. AlignX는 이 기준을 10개의 원칙으로 명문화해, 같은
            포트폴리오는 언제 채점해도 같은 근거로 같은 결과가 나오게 합니다.
          </p>
        </motion.div>
        <motion.div variants={revealItem} className={styles.thumb}>
          <PlaceholderImage thumbKey="alignx-model" label="AlignX 모델 구조" />
        </motion.div>
      </motion.div>
    </SectionAnchor>
  );
}
