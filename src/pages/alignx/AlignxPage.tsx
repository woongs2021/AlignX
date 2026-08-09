import { usePageMeta } from '@/layout/usePageMeta';
import { TableOfContents } from '@/layout/TableOfContents';
import { AlignxHeroSection } from './AlignxHeroSection';
import { WhySection } from './WhySection';
import { PrinciplesSection } from './PrinciplesSection';
import { PipelineSection } from './PipelineSection';
import { HumanInLoopSection } from './HumanInLoopSection';
import { LimitsSection } from './LimitsSection';
import { RoadmapSection } from './RoadmapSection';
import { AlignxCtaSection } from './AlignxCtaSection';
import styles from './AlignxPage.module.css';

const TOC_ITEMS = [
  { id: 'why', label: 'WHY' },
  { id: 'principles', label: 'PRINCIPLES' },
  { id: 'how', label: 'HOW' },
  { id: 'human', label: 'HUMAN IN THE LOOP' },
  { id: 'limits', label: 'LIMITS' },
  { id: 'roadmap', label: 'ROADMAP' },
];

/** AlignX AI — mint 톤(00 §6.1 라우트 매핑으로 자동 적용), 우측 sticky 목차 (Plans/08-alignx-about.md §A). */
export function AlignxPage() {
  usePageMeta({
    title: 'AlignX AI — AlignX',
    description: '포트폴리오를 읽는 10개의 눈 — AlignX AI 분석 모델을 소개합니다.',
    width: 'full',
  });

  return (
    <>
      <AlignxHeroSection />

      <div className="container">
        <div className={styles.layout}>
          <div className={styles.content}>
            <WhySection />
            <PrinciplesSection />
            <PipelineSection />
            <HumanInLoopSection />
            <LimitsSection />
            <RoadmapSection />
          </div>
          <TableOfContents items={TOC_ITEMS} />
        </div>
      </div>

      <AlignxCtaSection />
    </>
  );
}
