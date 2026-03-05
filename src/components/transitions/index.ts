import { whiteFade } from './fade';
import { swipeLeft } from './slide';

export const MyTransitions = {
  swipeLeft,
  whiteFade,
};

export type TransitionType = keyof typeof MyTransitions;