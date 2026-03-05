import { whiteFade } from './fade';
import { swipeLeft, swipeRight, swipeUp, swipeDown } from './slide';

export const MyTransitions = {
  whiteFade,
  swipeLeft,
  swipeRight,
  swipeUp,
  swipeDown,
};

export type TransitionType = keyof typeof MyTransitions;