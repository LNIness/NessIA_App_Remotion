import { MyTransitions } from "../components/transitions";

// Calcule la durée totale de la composition en frames
// Tient compte des overlaps de transitions — chaque transition réduit la durée totale
// car les clips se chevauchent pendant la transition
export const calculateTotalFrames = (clips: any[], fps: number): number => {
  if (clips.length === 0) return fps;

  return clips.reduce((acc, clip, i) => {
    const clipFrames = Math.round((clip.duration || 0) * fps);
    let overlap = 0;
    const transition = clip.transitionToNext;
    const isNotLastClip = i < clips.length - 1;

    if (transition && isNotLastClip) {
      if (transition.timing === "spring") {
        if (transition.durationInFrames) {
          // durationInFrames explicite — prioritaire sur le calcul automatique
          overlap = transition.durationInFrames;
        } else {
          // Estimation de la durée du spring selon le damping
          // Plus le damping est élevé, plus le ressort est amorti et la transition courte
          // Ces valeurs doivent rester synchronisées avec buildTiming dans timing.ts
          const damping = transition.damping ?? 200;
          if (damping <= 100) overlap = Math.round(fps * 1.2);
          else if (damping <= 150) overlap = Math.round(fps * 0.8);
          else if (damping <= 200) overlap = Math.round(fps * 0.6);
          else if (damping <= 300) overlap = Math.round(fps * 0.4);
          else if (damping <= 400) overlap = Math.round(fps * 0.25);
          else overlap = Math.round(fps * 0.2);
        }
      } else {
        // Linear : durée explicite ou fallback sur la valeur par défaut de la transition
        const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
        overlap = transition.durationInFrames
          ?? (transitionConfig?.timing?.getDurationInFrames({ fps }) ?? 0);
      }
    }

    return acc + clipFrames - overlap;
  }, 0);
};