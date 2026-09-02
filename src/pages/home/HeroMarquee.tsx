import type { CSSProperties } from 'react';
import { motion, type MotionValue } from 'motion/react';
import type { ResolvedImage } from '@/lib/images';
import { HeroCard } from './HeroCard';
import styles from './HeroMarquee.module.css';

type RowConfig = { direction: 'left' | 'right'; duration: number; cardWidth: number; isCenter: boolean };

const DESKTOP_ROWS: RowConfig[] = [
  { direction: 'left', duration: 60, cardWidth: 320, isCenter: false },
  { direction: 'right', duration: 80, cardWidth: 400, isCenter: true },
  { direction: 'left', duration: 70, cardWidth: 320, isCenter: false },
];

// 모바일: 3행 → 2행, 카드 폭 220px, 속도 20% 감속 (04 §2.3)
const MOBILE_SLOWDOWN = 1.2;
const MOBILE_ROWS: RowConfig[] = [
  { direction: 'left', duration: 60 * MOBILE_SLOWDOWN, cardWidth: 220, isCenter: false },
  { direction: 'right', duration: 80 * MOBILE_SLOWDOWN, cardWidth: 220, isCenter: true },
];

/** 이미지 풀을 행 수만큼 균등 분할 — 데스크톱 3행 × 6장, 모바일 2행 × 9장 (18장 기준). */
function splitIntoRows<T>(arr: T[], rowCount: number): T[][] {
  const size = Math.ceil(arr.length / rowCount);
  return Array.from({ length: rowCount }, (_, i) => arr.slice(i * size, i * size + size));
}

type HeroMarqueeProps = {
  images: ResolvedImage[];
  isMobile: boolean;
  playing: boolean;
  rowGap: MotionValue<string>;
  scale: MotionValue<number>;
  sideOpacity: MotionValue<number>;
};

/** 3행(모바일 2행) 무한 마퀴 — 행당 이미지 6장(18장 기준) + 복제본 1세트 = 12장 (DOM 노드 상한 60개). */
export function HeroMarquee({ images, isMobile, playing, rowGap, scale, sideOpacity }: HeroMarqueeProps) {
  const rows = isMobile ? MOBILE_ROWS : DESKTOP_ROWS;
  const rowChunks = splitIntoRows(images, rows.length);

  return (
    <motion.div className={styles.rows} style={{ scale, gap: rowGap, y: -20 }}>
      {rows.map((row, rowIndex) => {
        const rowImages = rowChunks[rowIndex];
        const cards = [...rowImages, ...rowImages];
        const trackStyle = {
          '--card-width': `${row.cardWidth}px`,
          animationDuration: `${row.duration}s`,
        } as CSSProperties;

        return (
          <motion.div
            key={rowIndex}
            className={styles.row}
            style={row.isCenter ? undefined : { opacity: sideOpacity }}
          >
            <div
              className={[styles.track, styles[row.direction], !playing && styles.paused]
                .filter(Boolean)
                .join(' ')}
              style={trackStyle}
            >
              {cards.map((image, i) => (
                <HeroCard key={`${rowIndex}-${i}`} image={image} priority={i < 2} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
