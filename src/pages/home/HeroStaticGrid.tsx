import type { ResolvedImage } from '@/lib/images';
import styles from './HeroStaticGrid.module.css';

type HeroStaticGridProps = {
  images: ResolvedImage[];
};

/** prefers-reduced-motion 대체 — 애니메이션 없는 정적 그리드 (04 §2.3). */
export function HeroStaticGrid({ images }: HeroStaticGridProps) {
  return (
    <div className={styles.staticGrid}>
      {images.slice(0, 9).map((image, i) => (
        <img
          key={image.src}
          src={image.src}
          srcSet={image.srcSet}
          sizes="33vw"
          alt={image.alt}
          loading={i < 6 ? undefined : 'lazy'}
          className={styles.staticCard}
        />
      ))}
    </div>
  );
}
