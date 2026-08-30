import styles from './AboutHeroSection.module.css';

/** 이미지 없이 큰 활자 + 색면만 (Plans/08-alignx-about.md §B1-1). */
export function AboutHeroSection() {
  return (
    <section className={`container ${styles.section}`}>
      <div className={styles.colorBlock} aria-hidden="true" />
      <span className="label">ABOUT</span>
      <h1 className={styles.title}>데이터로 만드는, 모두의 합격 포트폴리오</h1>
    </section>
  );
}
