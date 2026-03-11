import React from 'react';
import { Composition } from 'remotion';
import { TEST_PAYLOAD } from '../dev/testPayload';
import { VideoComposition } from './Composition';
import { calculateTotalFrames } from '../utils/frames';

// Valeurs par défaut utilisées en Remotion Studio et comme fallback
const DEFAULTS = {
  fps: 30,
  width: 1080,
  height: 1920,
};

export const VideoCompositionConfig: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      fps={DEFAULTS.fps}
      width={DEFAULTS.width}
      height={DEFAULTS.height}
      // defaultProps : utilisés uniquement en Remotion Studio pour la preview
      // En rendu API, calculateMetadata écrase ces valeurs avec celles de la requête
      /**defaultProps={{
        clips: [] as any[],
        width: DEFAULTS.width,
        height: DEFAULTS.height,
        fps: DEFAULTS.fps,
      }}**/
      defaultProps={
        process.env.NODE_ENV === 'development'
          ? TEST_PAYLOAD
          : {
              clips: [] as any[],
              width: DEFAULTS.width,
              height: DEFAULTS.height,
              fps: DEFAULTS.fps,
            }
      }
      // calculateMetadata : calcule dynamiquement la durée, width et height depuis les props reçues
      calculateMetadata={({ props }) => {
        const clips = (props.clips as any[]) ?? [];
        const fps = (props.fps as number) ?? DEFAULTS.fps;
        return {
          // Durée totale calculée en tenant compte des overlaps de transitions
          durationInFrames: Math.max(1, calculateTotalFrames(clips, fps)),
          width: (props.width as number) ?? DEFAULTS.width,
          height: (props.height as number) ?? DEFAULTS.height,
        };
      }}
    />
  );
};
