import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/Badge';
import { SectionAnchor } from '@/layout/SectionAnchor';
import { MODEL_LIMITATION_NOTICE } from '@/data/copy';
import styles from './LimitsSection.module.css';

/** 필수 섹션 — MVP 점수는 더미 생성기 출력이지 실제 모델이 아니라는 사실을 숨기지 않는다 (08 §A3). */
export function LimitsSection() {
  return (
    <SectionAnchor id="limits">
      <section className={styles.section}>
        <SectionHeader eyebrow="LIMITS" title="지금 이 모델의 한계" />
        <div className={styles.note}>
          <Badge variant="warning">한계 고지</Badge>
          <p className={styles.text}>{MODEL_LIMITATION_NOTICE}</p>
        </div>
      </section>
    </SectionAnchor>
  );
}
