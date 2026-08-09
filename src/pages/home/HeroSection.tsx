import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Button } from '@/components/Button';
import { getAllHero, type ResolvedImage } from '@/lib/images';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useDocumentVisibility } from '@/lib/useDocumentVisibility';
import { HeroMarquee } from './HeroMarquee';
import { HeroStaticGrid } from './HeroStaticGrid';
import styles from './HeroSection.module.css';

function HeroHeadline({ opacity }: { opacity: number | MotionValue<number> }) {
  const navigate = useNavigate();
  return (
    <motion.div className={styles.headline} style={{ opacity }}>
      <span className={`label ${styles.eyebrow}`}>ALIGNX</span>
      <h1 className={styles.title}>
        <span className={styles.titleEn}>PORTFOLIO</span>
        <span className={styles.titleKr}>데이터로 검증하는 합격 포트폴리오</span>
      </h1>
      <p className={styles.lead}>AI 10대 원칙 분석과 현직 멘토 검증을 한 번에.</p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate('/portfolio')}>
          포트폴리오 분석 시작
        </Button>
        <Button variant="secondary" onClick={() => navigate('/alignx')}>
          AlignX AI 알아보기
        </Button>
      </div>
    </motion.div>
  );
}

function ScrollHint() {
  return (
    <div className={styles.scrollHint} aria-hidden="true">
      <span className="label">SCROLL</span>
      <div className={styles.scrollHintTrack}>
        <div className={styles.scrollHintDot} />
      </div>
    </div>
  );
}

/** HOME 히어로 — 무한 마퀴 + 스크롤 확산 (Plans/04-home.md §2). */
export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const prefersReducedMotion = useReducedMotion();
  const documentVisible = useDocumentVisibility();
  const [images, setImages] = useState<ResolvedImage[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllHero().then((resolved) => {
      if (!cancelled) setImages(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const rowGap = useTransform(scrollYProgress, [0, 0.5], ['12px', '40px']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.12, 0.94]);
  const sideOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);
  const headlineOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1]);
  const dimOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.55]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (value > 0.01 && !hasScrolled) setHasScrolled(true);
  });

  if (images.length === 0) {
    return <section ref={heroRef} className={styles.hero} />;
  }

  if (prefersReducedMotion) {
    return (
      <section ref={heroRef} className={styles.hero}>
        <HeroStaticGrid images={images} />
        <div className={styles.dim} style={{ opacity: 0.55 }} />
        <HeroHeadline opacity={1} />
      </section>
    );
  }

  return (
    <section ref={heroRef} className={styles.hero}>
      <HeroMarquee
        images={images}
        isMobile={isMobile}
        playing={documentVisible}
        rowGap={rowGap}
        scale={scale}
        sideOpacity={sideOpacity}
      />
      <motion.div className={styles.dim} style={{ opacity: dimOpacity }} />
      <HeroHeadline opacity={headlineOpacity} />
      {!hasScrolled && <ScrollHint />}
    </section>
  );
}
