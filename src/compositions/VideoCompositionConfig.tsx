import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./Composition";
import { calculateTotalFrames } from "../utils/frames";

const DEFAULTS = {
  fps: 30,
  width: 1080,
  height: 1920,
};

export const VideoCompositionConfig: React.FC = () => {
  return (
    // Valeurs par défaut uniquement pour le Remotion Studio (preview).
    // Au rendu réel via l'API, calculateMetadata écrase ces valeurs avec celles de la requête.
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      fps={DEFAULTS.fps}
      width={DEFAULTS.width}
      height={DEFAULTS.height}
      defaultProps={{
        clips: [] as any[],
        width: DEFAULTS.width,
        height: DEFAULTS.height,
        fps: DEFAULTS.fps,
      }}
      calculateMetadata={({ props }) => {
        const clips = (props.clips as any[]) ?? [];
        const fps = (props.fps as number) ?? DEFAULTS.fps;
        return {
          durationInFrames: Math.max(1, calculateTotalFrames(clips, fps)),
          width: (props.width as number) ?? DEFAULTS.width,
          height: (props.height as number) ?? DEFAULTS.height,
        };
      }}
    />
  );
};