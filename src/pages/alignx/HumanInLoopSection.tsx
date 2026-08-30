import { SectionHeader } from '@/components/SectionHeader';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './WhySection.module.css';

export function HumanInLoopSection() {
  return (
    <SectionAnchor id="human">
      <div className={styles.section}>
        <div className={styles.thumb}>
          <PlaceholderImage thumbKey="alignx-model" label="멘토 검증" />
        </div>
        <div>
          <SectionHeader eyebrow="HUMAN IN THE LOOP" title="AI 위에 사람의 판단을 얹는 이유" />
          <p className={`prose ${styles.body}`}>
            AI는 구조·표현·강조 같은 패턴은 정확히 짚어내지만, 이 결과물이 어떤 맥락에서 만들어졌는지,
            작성자가 어떤 의도로 특정 결정을 내렸는지, 그리고 지원하는 직무에 실제로 맞는 역량인지는
            판단하지 못합니다. AlignX는 AI의 1차 검증 위에 각 분야 현직 실무 멘토의 2차 검증을 더해,
            기계가 못 보는 맥락·의도·직무 적합성까지 함께 짚어드립니다.
          </p>
        </div>
      </div>
    </SectionAnchor>
  );
}
