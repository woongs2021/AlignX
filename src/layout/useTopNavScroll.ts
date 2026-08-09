import { useEffect, useState } from 'react';

const BLUR_THRESHOLD = 8;
const HIDE_THRESHOLD = 80;

/**
 * 상단바 스크롤 거동 (Plans/03-layout-navigation.md §2.2).
 * scrolled: scrollY > 8 → 반투명 배경 + blur + hairline
 * hidden:   아래로 80px 이상 이동 시 숨김, 위로 스크롤하면 즉시 복귀
 * prefers-reduced-motion 이면 숨김/복귀를 하지 않는다(항상 고정).
 */
export function useTopNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lastY = window.scrollY;
    let downAccum = 0;
    let ticking = false;

    function apply() {
      const y = window.scrollY;
      setScrolled(y > BLUR_THRESHOLD);

      if (!reduceMotion) {
        const delta = y - lastY;
        if (delta > 0) {
          downAccum += delta;
          if (downAccum > HIDE_THRESHOLD && y > HIDE_THRESHOLD) {
            setHidden(true);
          }
        } else if (delta < 0) {
          downAccum = 0;
          setHidden(false);
        }
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, hidden };
}
