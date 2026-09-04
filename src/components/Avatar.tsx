import { useState } from 'react';
import styles from './Avatar.module.css';

type AvatarProps = {
  src: string;
  initial: string;
  alt: string;
  size?: number;
  className?: string;
};

/** 이미지 로드 실패 시 이니셜 원형으로 폴백한다 — MENTOR_PERSONAS 카드와 동일한 원칙
 * (Plans/14 §9): 프로필 이미지가 아직 없어도 화면이 깨지지 않는다. */
export function Avatar({ src, initial, alt, size = 32, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const classes = [styles.avatar, className].filter(Boolean).join(' ');
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.4) };

  if (errored || !src) {
    return (
      <span className={classes} style={style} aria-hidden={alt === ''} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        {initial}
      </span>
    );
  }

  return (
    <span className={classes} style={style}>
      <img src={src} alt={alt} className={styles.img} onError={() => setErrored(true)} />
    </span>
  );
}
