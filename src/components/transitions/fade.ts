import { linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

export const whiteFade = {
  presentation: fade(),
  timing: linearTiming({ durationInFrames: 20 }),
};