import { MyTransitions } from "../components/transitions";

export const calculateTotalFrames = (clips: any[], fps: number): number => {
  if (clips.length === 0) return fps;

  return clips.reduce((acc, clip, i) => {
    const clipFrames = Math.round((clip.duration || 0) * fps);

    let overlap = 0;
    const transition = clip.transitionToNext;
    const isNotLastClip = i < clips.length - 1;

    if (transition && isNotLastClip) {
      const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
      if (transitionConfig?.timing) {
        overlap = transitionConfig.timing.getDurationInFrames({ fps });
      }
    }

    return acc + clipFrames - overlap;
  }, 0);
};