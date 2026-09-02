import { SectionHeader } from '@/components/SectionHeader';
import { StatTile } from '@/components/StatTile';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './ProblemSection.module.css';

// 근거 없는 숫자를 사실처럼 적지 않는다 — 라벨에 "(예시)"를 명시한다 (08 §B3).
const STATS = [
  { value: '12%', label: '채용 과정에서 구체적 피드백을 받는 지원자 비율 (예시)' },
  { value: '47초', label: '채용 담당자가 포트폴리오 한 건을 보는 평균 시간 (예시)' },
  { value: '3.5회', label: '합격까지 평균 재도전 횟수 (예시)' },
];

export function ProblemSection() {
  return (
    <SectionAnchor id="problem">
      <section className={`container-narrow ${styles.section}`}>
        <SectionHeader eyebrow="THE PROBLEM" title="포트폴리오는 있는데, 피드백이 없다" className={styles.header} />
        <p className={styles.body}>
          기획자든, 마케터든, 디자이너든 — 취업 준비생 대부분은 포트폴리오를 여러 번 고쳐 쓰면서도
          무엇이 부족한지 구체적으로 들을 기회가 많지 않습니다. 아래 수치는 그 체감을 보여주기 위한
          예시입니다.
        </p>
        <div className={styles.stats}>
          {STATS.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </section>
    </SectionAnchor>
  );
}
