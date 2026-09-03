import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  animate,
  motion,
  useMotionValue,
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
        <span className={styles.titleKr}>데이터로 검증하는, 모든 직무의 포트폴리오</span>
      </h1>
      <p className={styles.lead}>
        기획자·PM·마케터·디자이너, 그리고 코드리뷰까지 — AlignX가 1차로, 현직 멘토가 2차로 검증합니다.
      </p>
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
  // 사이트 공통 767px 대신 599px 사용 — iPad mini(744px) 등 좁은 태블릿도 3행 마퀴를 유지하게 함.
  const isMobile = useMediaQuery('(max-width: 599px)');
  const prefersReducedMotion = useReducedMotion();
  const documentVisible = useDocumentVisibility();
  const [images, setImages] = useState<ResolvedImage[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const revealStrength = useMotionValue(0);

  // 클릭(토글)/호버가 스크롤 진행도 위로 덮어씌우는 강도 — 0↔1 부드럽게 트윈, 꺼질 땐 스크롤 값으로 자연 복귀(max 합성).
  // 나타남·사라짐 동일하게 천천히(1.3s).
  useEffect(() => {
    const controls = animate(revealStrength, isRevealed ? 1 : 0, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [isRevealed, revealStrength]);

  useEffect(() => {
    let cancelled = false;
    getAllHero().then((resolved) => {
      if (!cancelled) setImages(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 로고 클릭(TopNav) 시 헤드라인 리셋 — "/"에서 "/"로 재이동해도 라우트가 리마운트되지 않아 직접 이벤트로 받는다.
  useEffect(() => {
    const reset = () => setIsRevealed(false);
    window.addEventListener('alignx:hero-reset', reset);
    return () => window.removeEventListener('alignx:hero-reset', reset);
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const rowGap = useTransform(scrollYProgress, [0, 0.5], ['12px', '40px']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.12, 0.94]);
  const sideOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);
  const scrollHeadlineOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1]);
  const scrollDimOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.55]);
  const headlineOpacity = useTransform(
    [scrollHeadlineOpacity, revealStrength],
    ([scroll, reveal]) => Math.max(scroll as number, reveal as number),
  );
  const dimOpacity = useTransform(
    [scrollDimOpacity, revealStrength],
    ([scroll, reveal]) => Math.max(scroll as number, (reveal as number) * 0.55),
  );

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
    <section ref={heroRef} className={styles.hero} onClick={() => setIsRevealed((prev) => !prev)}>
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
