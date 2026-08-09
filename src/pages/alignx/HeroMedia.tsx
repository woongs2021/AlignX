import { useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import styles from './HeroMedia.module.css';

type HeroMediaProps = {
  /** null이면 fallback을 쓴다 — 'media/alignx.mp4'처럼 지정하면 자동으로 영상으로 교체된다. */
  video: string | null;
  poster?: string;
  fallback: ReactNode;
};

/** 영상 슬롯 — video prop 하나만 채우면 교체 완료 (Plans/08-alignx-about.md §A1). */
export function HeroMedia({ video, poster, fallback }: HeroMediaProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [playing, setPlaying] = useState(false);

  if (!video) return <>{fallback}</>;

  // 모바일은 데이터 절약을 위해 poster만 보여주고 탭해야 재생한다.
  if (isMobile && !playing) {
    return (
      <button type="button" className={styles.posterButton} onClick={() => setPlaying(true)}>
        {poster && <img src={poster} alt="" className={styles.posterImg} />}
        <span className={styles.playLabel}>탭하여 재생</span>
      </button>
    );
  }

  return (
    <video
      className={styles.video}
      src={video}
      poster={poster}
      muted
      playsInline
      loop
      autoPlay
    />
  );
}
