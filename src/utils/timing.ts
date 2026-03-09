import { linearTiming, springTiming } from "@remotion/transitions";
import { MyTransitions } from "../components/transitions";
import { TransitionConfig } from "../compositions/types";

export const buildTiming = (transition: TransitionConfig, fps: number) => {
  if (transition.timing === "spring") {
    const damping = transition.damping ?? 200;
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
  return linearTiming({
    durationInFrames: transition.durationInFrames
      ?? MyTransitions[transition.type].timing.getDurationInFrames({ fps }),
  });
};