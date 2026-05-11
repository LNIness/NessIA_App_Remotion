import { linearTiming, springTiming } from "@remotion/transitions";
import { MyTransitions } from "../components/transitions";
import { TransitionConfig } from "../compositions/types";

// Construit le timing Remotion d'une transition depuis sa configuration JSON
// IMPORTANT : les durées spring doivent rester synchronisées avec calculateTotalFrames dans frames.ts
export const buildTiming = (transition: TransitionConfig, fps: number) => {
  if (transition.timing === "spring") {
    const damping = transition.damping ?? 200;

    // Estimation de la durée du spring selon le damping
    // Plus le damping est élevé, plus le ressort est amorti et la transition courte
    // Valeurs recommandées : 400 pour les swipes, 200-300 pour les fondus organiques
    let durationInFrames: number;
    if (damping <= 100) durationInFrames = Math.round(fps * 1.2);
    else if (damping <= 150) durationInFrames = Math.round(fps * 0.8);
    else if (damping <= 200) durationInFrames = Math.round(fps * 0.6);
    else if (damping <= 300) durationInFrames = Math.round(fps * 0.4);
    else if (damping <= 400) durationInFrames = Math.round(fps * 0.25);
    else durationInFrames = Math.round(fps * 0.2);

    return springTiming({
      durationInFrames,
      config: { damping },
    });
  }

  // Linear : durée explicite ou fallback sur la valeur par défaut de la transition
  return linearTiming({
    durationInFrames: transition.durationInFrames
      ?? MyTransitions[transition.type].timing.getDurationInFrames({ fps }),
  });
};