import { linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';

/**swipe vers la gauche */
export const swipeLeft = {
  presentation: slide({ direction: 'from-right' }),
  timing: linearTiming({ durationInFrames: 15 }),
};