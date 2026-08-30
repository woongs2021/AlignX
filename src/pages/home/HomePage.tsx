import { usePageMeta } from '@/layout/usePageMeta';
import { HeroSection } from './HeroSection';
import { ValueSection } from './ValueSection';
import { HowItWorksSection } from './HowItWorksSection';
import { PrinciplesSection } from './PrinciplesSection';
import { ShowcaseSection } from './ShowcaseSection';
import { CtaBandSection } from './CtaBandSection';

export function HomePage() {
  usePageMeta({
    title: 'AlignX — 데이터로 검증하는, 모든 직무의 포트폴리오',
    description: '기획자·PM·마케터·디자이너부터 코드리뷰까지, AI 1차 검증과 현직 멘토 2차 검증으로 포트폴리오를 검증합니다.',
    width: 'full',
  });

  return (
    <>
      <HeroSection />
      <ValueSection />
      <HowItWorksSection />
      <PrinciplesSection />
      <ShowcaseSection />
      <CtaBandSection />
    </>
  );
}
