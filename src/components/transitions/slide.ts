import { linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';

/**
 * Différentes transitions swipe
 */

export const swipeLeft = {
  presentation: slide({ direction: 'from-right' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

export const swipeRight = {
  presentation: slide({ direction: 'from-left' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

export const swipeUp = {
  presentation: slide({ direction: 'from-bottom' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

export const swipeDown = {
  presentation: slide({ direction: 'from-top' }),
  timing: linearTiming({ durationInFrames: 15 }),
};