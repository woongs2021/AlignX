import { useEffect, useRef, useState } from 'react';
import type { Variants } from 'motion/react';

/** 전 페이지 공용 리빌 모션 값 (Plans/03-layout-navigation.md §3.2) — motion.div의 variants로 쓴다. */
export const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * 섹션 진입 리빌 — IntersectionObserver(threshold 0.15)로 1회 발화 후 unobserve.
 * 반환된 ref를 리빌시킬 요소에 붙이고, revealed로 opacity/translateY를 토글한다.
 */
const SUPPORTS_INTERSECTION_OBSERVER = typeof IntersectionObserver !== 'undefined';

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(!SUPPORTS_INTERSECTION_OBSERVER);

  useEffect(() => {
    const node = ref.current;
    if (!node || !SUPPORTS_INTERSECTION_OBSERVER) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
