import { useState } from 'react';
import type { ResolvedImage } from '@/lib/images';
import styles from './HeroCard.module.css';

type HeroCardProps = {
  image: ResolvedImage;
  priority?: boolean;
};

/** 마퀴 카드 1장 — LQIP→원본 300ms 크로스페이드, 로드 실패 시 --soft 색면 + 라벨 폴백 (04 §2.3–2.4). */
export function HeroCard({ image, priority = false }: HeroCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={styles.card}>
        <div className={styles.fallback}>
          <span className={styles.fallbackLabel}>{image.alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <img src={image.blurSrc} alt="" aria-hidden="true" className={styles.lqip} />
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(min-width: 768px) 400px, 220px"
        alt={image.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={[styles.full, loaded && styles.isLoaded].filter(Boolean).join(' ')}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
