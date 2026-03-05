import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./compositions/Composition";
import { calculateTotalFrames } from "./utils/frames";

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
        const clips = (props.clips as any[]) ?? [];
        return {
          durationInFrames: Math.max(1, calculateTotalFrames(clips, fps)),
        };
      }}
    />
  );
};