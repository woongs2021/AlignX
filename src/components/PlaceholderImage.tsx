import { useEffect, useState } from 'react';
import { getThumb, type ResolvedImage } from '@/lib/images';
import styles from './PlaceholderImage.module.css';

type ImageStatus = 'loading' | 'ready' | 'error';

function useThumbImage(thumbKey: string) {
  const [image, setImage] = useState<ResolvedImage | null>(null);
  const [status, setStatus] = useState<ImageStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    getThumb(thumbKey)
      .then((resolved) => {
        if (cancelled) return;
        setImage(resolved);
        setStatus(resolved ? 'ready' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [thumbKey]);

  return { image, status };
}

type PlaceholderImageProps = {
  /** public/images/manifest.json 의 thumbs 키 */
  thumbKey: string;
  /** 썸네일이 없거나 로드 실패 시 표시할 라벨 (큰 활자 폴백) */
  label: string;
  className?: string;
};

export function PlaceholderImage({ thumbKey, label, className }: PlaceholderImageProps) {
  const { image, status } = useThumbImage(thumbKey);
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  if (status !== 'ready' || !image) {
    return (
      <div className={rootClassName} role="img" aria-label={label}>
        <div className={styles.fallback}>
          <span className={styles.fallbackLabel}>{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <img src={image.blurSrc} alt="" aria-hidden="true" className={styles.lqip} />
      <img
        src={image.src}
        srcSet={image.srcSet}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className={styles.full}
        onLoad={(event) => event.currentTarget.classList.add(styles.isLoaded)}
      />
    </div>
  );
}
