import { linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

export const MyTransitions = {
  swipeLeft: {
    presentation: slide({ direction: 'from-right' }),
    timing: linearTiming({ durationInFrames: 15 }),
  },
  whiteFade: {
    presentation: fade(),
    timing: linearTiming({ durationInFrames: 20 }),
  },
};

// On crée un type pour s'assurer que ton JSON n'envoie que des noms qui existent
export type TransitionType = keyof typeof MyTransitions;