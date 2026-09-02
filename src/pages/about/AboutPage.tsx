import { usePageMeta } from '@/layout/usePageMeta';
import { AboutHeroSection } from './AboutHeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { ServiceFlowSection } from './ServiceFlowSection';
import { VisionSection } from './VisionSection';
import { TeamSection } from './TeamSection';
import { ContactSection } from './ContactSection';

/** ABOUT — violet 톤(00 §6.1 라우트 매핑으로 자동 적용) (Plans/08-alignx-about.md §B). */
export function AboutPage() {
  usePageMeta({
    title: 'ABOUT — AlignX',
    description: '데이터로 만드는, 모두의 합격 포트폴리오 — AlignX가 만들어진 이유를 소개합니다.',
    width: 'full',
  });

  return (
    <>
      <AboutHeroSection />
      <ProblemSection />
      <SolutionSection />
      <ServiceFlowSection />
      <VisionSection />
      <TeamSection />
      <ContactSection />
    </>
  );
}
