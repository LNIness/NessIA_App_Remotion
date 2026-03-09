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
        if (transition.durationInFrames) {
          overlap = transition.durationInFrames;
        } else {
          const damping = transition.damping ?? 200;
          // Plus le damping est élevé, plus le spring est court
          if (damping <= 100) overlap = Math.round(fps * 1.2);
          else if (damping <= 150) overlap = Math.round(fps * 0.8);
          else if (damping <= 200) overlap = Math.round(fps * 0.6);
          else if (damping <= 300) overlap = Math.round(fps * 0.4);
          else overlap = Math.round(fps * 0.3);
        }
      } else {
        const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
        overlap = transition.durationInFrames
          ?? (transitionConfig?.timing?.getDurationInFrames({ fps }) ?? 0);
      }
    }

    return acc + clipFrames - overlap;
  }, 0);
};