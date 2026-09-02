import styles from './AboutHeroSection.module.css';

/** 큰 활자 + 우측 상단 브랜드 로고 이미지 (Plans/08-alignx-about.md §B1-1). */
export function AboutHeroSection() {
  return (
    <section className={`container-narrow ${styles.section}`}>
      <img
        src={`${import.meta.env.BASE_URL}images/about/about_thumbnail.png`}
        alt="AlignX 로고"
        className={styles.thumbnail}
      />
      <span className="label">ABOUT</span>
      <h1 className={styles.title}>데이터로 만드는, 모두의 합격 포트폴리오</h1>
    </section>
  );
}
