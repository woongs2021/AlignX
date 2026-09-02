import { HeroMedia } from './HeroMedia';
import { AlignxLogoMotion } from './AlignxLogoMotion';
import styles from './AlignxHeroSection.module.css';

export function AlignxHeroSection() {
  return (
    <section className={`container-narrow ${styles.section}`}>
      <div className={styles.headline}>
        <span className="label">ALIGNX AI</span>
        <h1 className={styles.titleKr}>모든 직무를 읽는 10개의 눈</h1>
        <p className={styles.lead}>
          기획·마케팅·디자인·코드까지 — 좋은 결과물을 알아보는 기준을 10개 축으로 분해해 정량화하는,
          당사가 직접 튜닝한 AX(AI Transformation) 검증 모델입니다.
        </p>
      </div>

      {/* video='media/alignx.mp4' 지정하면 자동으로 영상으로 교체된다 — 지금은 에셋이 없어 로고 모션을 쓴다. */}
      <HeroMedia video={null} fallback={<AlignxLogoMotion />} />
    </section>
  );
}
