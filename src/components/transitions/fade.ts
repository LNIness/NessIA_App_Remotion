// Transition fondu blanc — douce et naturelle
// Adaptée aux ambiances calmes, émotionnelles ou pour conclure une vidéo
import { linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

export const whiteFade = {
  presentation: fade(),
  // Durée par défaut : 20 frames — utilisée comme fallback si aucune durée n'est précisée dans le JSON
  timing: linearTiming({ durationInFrames: 20 }),
};