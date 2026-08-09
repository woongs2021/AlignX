import { HeroMedia } from './HeroMedia';
import { AlignxLogoMotion } from './AlignxLogoMotion';
import styles from './AlignxHeroSection.module.css';

export function AlignxHeroSection() {
  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.headline}>
        <span className="label">ALIGNX AI</span>
        <h1 className={styles.titleKr}>포트폴리오를 읽는 10개의 눈</h1>
        <p className={styles.lead}>
          사람이 좋은 포트폴리오를 알아보는 기준을 10개 축으로 분해해 정량화하는 분석 모델입니다.
        </p>
      </div>

      {/* video='media/alignx.mp4' 지정하면 자동으로 영상으로 교체된다 — 지금은 에셋이 없어 로고 모션을 쓴다. */}
      <HeroMedia video={null} fallback={<AlignxLogoMotion />} />
    </section>
  );
}
