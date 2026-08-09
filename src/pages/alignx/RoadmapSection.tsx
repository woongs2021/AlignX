import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/Badge';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './RoadmapSection.module.css';

const ROADMAP_ITEMS = ['직무별 가중치', '산업별 벤치마크', '실시간 첨삭'];

export function RoadmapSection() {
  return (
    <SectionAnchor id="roadmap">
      <section className={styles.section}>
        <SectionHeader eyebrow="ROADMAP" title="앞으로 준비하고 있는 것" className={styles.header} />
        <div className={styles.list}>
          {ROADMAP_ITEMS.map((item) => (
            <div key={item} className={styles.item}>
              <span className={styles.itemTitle}>{item}</span>
              <Badge variant="outline">예정</Badge>
            </div>
          ))}
        </div>
      </section>
    </SectionAnchor>
  );
}
