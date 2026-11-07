import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { motion } from '@actual-app/components/tokens';

import { useReducedMotion } from '#hooks/useReducedMotion';

const FADE_FROM_OPACITY = 0.35;

/**
 * Fades the returned element back in when the first shown month changes:
 * an opacity crossfade instead of a slide, and nothing under reduced
 * motion.
 */
export function useMonthCrossfade(
  startMonth: string,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  const previousMonthRef = useRef(startMonth);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    if (previousMonthRef.current === startMonth) {
      return;
    }
    previousMonthRef.current = startMonth;
    const element = ref.current;
    if (isReducedMotion || !element || typeof element.animate !== 'function') {
      return;
    }
    const animation = element.animate(
      [{ opacity: FADE_FROM_OPACITY }, { opacity: 1 }],
      { duration: Number.parseInt(motion.base, 10), easing: motion.ease },
    );
    return () => animation.cancel();
  }, [startMonth, isReducedMotion]);

  return ref;
}
