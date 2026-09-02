import { SectionHeader } from '@/components/SectionHeader';
import { StatusDotBadge } from '@/components/Badge';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './VisionSection.module.css';

const ROADMAP_ITEMS: { title: string; desc: string; status: 'active' | 'pending' }[] = [
  {
    title: '교육기관 공급 (B2B)',
    desc: '아카데미 · 대학교 등 교육 기관에 AX 검증 솔루션을 공급합니다.',
    status: 'active',
  },
  {
    title: '개인 서비스 확장 (B2C)',
    desc: '기관을 거치지 않고도 개인이 직접 검증받을 수 있도록 넓힙니다.',
    status: 'pending',
  },
  {
    title: '해외 진출',
    desc: '국내를 넘어 해외 기관·개인까지 서비스 범위를 확장합니다.',
    status: 'pending',
  },
];

/** 사업 로드맵 — B2B(교육기관) → B2C, 국내 → 해외. AlignX AI 페이지의 모델 로드맵과는 별개다. */
export function VisionSection() {
  return (
    <SectionAnchor id="vision">
      <section className={`container-narrow ${styles.section}`}>
        <SectionHeader eyebrow="VISION" title="개인을 넘어, 기관과 국경 너머로" className={styles.header} />
        <p className={`prose ${styles.body}`}>
          AlignX의 검증 프로세스를 전부 거치면, 개인에게는 자신에게 최적화된 성장 솔루션이 남습니다.
          AlignX는 이 경험을 아카데미·대학교 같은 교육 기관에 공급하는 AX 검증 솔루션으로 시작해,
          장기적으로는 개인 서비스(B2C)와 해외 시장까지 넓혀갈 계획입니다.
        </p>
        <div className={styles.list}>
          {ROADMAP_ITEMS.map((item) => (
            <div key={item.title} className={styles.item}>
              <div>
                <p className={styles.itemTitle}>{item.title}</p>
                <p className={`meta ${styles.itemDesc}`}>{item.desc}</p>
              </div>
              <StatusDotBadge status={item.status} label={item.status === 'active' ? '진행 중' : '예정'} />
            </div>
          ))}
        </div>
      </section>
    </SectionAnchor>
  );
}
