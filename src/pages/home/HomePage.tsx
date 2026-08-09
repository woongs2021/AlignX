import { usePageMeta } from '@/layout/usePageMeta';
import { HeroSection } from './HeroSection';
import { ValueSection } from './ValueSection';
import { HowItWorksSection } from './HowItWorksSection';
import { PrinciplesSection } from './PrinciplesSection';
import { ShowcaseSection } from './ShowcaseSection';
import { CtaBandSection } from './CtaBandSection';

export function HomePage() {
  usePageMeta({
    title: 'AlignX — 포트폴리오 분석',
    description: 'AI 10대 원칙 스코어링과 사람 멘토 검증으로 포트폴리오를 검증합니다.',
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
