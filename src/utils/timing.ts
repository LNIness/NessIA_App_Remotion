import { linearTiming, springTiming } from "@remotion/transitions";
import { MyTransitions } from "../components/transitions";
import { TransitionConfig } from "../compositions/types";

export const buildTiming = (transition: TransitionConfig, fps: number) => {
  if (transition.timing === "spring") {
    return springTiming({ config: { damping: transition.damping ?? 200 } });
  }
  return linearTiming({
    durationInFrames: transition.durationInFrames
      ?? MyTransitions[transition.type].timing.getDurationInFrames({ fps }),
  });
};