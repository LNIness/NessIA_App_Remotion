import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./compositions/Composition";
import { MyTransitions } from "./components/transitions";

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        clips: [] as any[],
      }}
      calculateMetadata={({ props }) => {
        const clips = (props.clips as any[]) || [];

        if (clips.length === 0) {
          return { durationInFrames: fps };
        }

        const totalFrames = clips.reduce((acc, clip, i) => {
          const clipFrames = Math.round((clip.duration || 0) * fps);

          let overlap = 0;
          const transition = clip.transitionToNext;
          const isNotLastClip = i < clips.length - 1;

          if (transition && isNotLastClip) {
            const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
            if (transitionConfig && transitionConfig.timing) {
              overlap = transitionConfig.timing.getDurationInFrames({ fps });
            }
          }

          return acc + clipFrames - overlap;
        }, 0);

        return {
          durationInFrames: Math.max(1, totalFrames),
        };
      }}
    />
  );
};