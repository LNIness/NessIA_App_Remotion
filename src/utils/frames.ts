import { MyTransitions } from "../components/transitions";

export const calculateTotalFrames = (clips: any[], fps: number): number => {
  if (clips.length === 0) return fps;

  return clips.reduce((acc, clip, i) => {
    const clipFrames = Math.round((clip.duration || 0) * fps);
    let overlap = 0;
    const transition = clip.transitionToNext;
    const isNotLastClip = i < clips.length - 1;

    if (transition && isNotLastClip) {
      if (transition.timing === "spring") {
        // springTiming dure ~0.8s par défaut — utiliser durationInFrames si fourni
        overlap = transition.durationInFrames ?? Math.round(fps * 0.8);
      } else {
        const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
        overlap = transition.durationInFrames
          ?? (transitionConfig?.timing?.getDurationInFrames({ fps }) ?? 0);
      }
    }

    return acc + clipFrames - overlap;
  }, 0);
};