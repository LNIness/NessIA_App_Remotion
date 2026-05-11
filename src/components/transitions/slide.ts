// Transitions de glissement dans les 4 directions
// Le timing ici est un fallback — le timing réel est calculé dans buildTiming selon spring/linear et damping
import { linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';

// Glissement de droite vers gauche
export const swipeLeft = {
  presentation: slide({ direction: 'from-right' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

// Glissement de gauche vers droite
export const swipeRight = {
  presentation: slide({ direction: 'from-left' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

// Glissement du bas vers le haut
export const swipeUp = {
  presentation: slide({ direction: 'from-bottom' }),
  timing: linearTiming({ durationInFrames: 15 }),
};

// Glissement du haut vers le bas
export const swipeDown = {
  presentation: slide({ direction: 'from-top' }),
  timing: linearTiming({ durationInFrames: 15 }),
};