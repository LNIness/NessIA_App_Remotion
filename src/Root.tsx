import React from "react";
import { Composition } from "remotion";
import { MyComp } from "./compositions/Composition";
import { MyTransitions } from "./components/transitions";

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  return (
    <Composition
      id="MyComp"
      component={MyComp}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [] as any[],
      }}
      // Correction ici : on utilise 'props' au lieu de 'inputProps'
      calculateMetadata={({ props }) => {
        const scenes = (props.scenes as any[]) || [];
        
        if (scenes.length === 0) {
          return { durationInFrames: fps };
        }

        const totalFrames = scenes.reduce((acc, scene, i) => {
          const sceneFrames = Math.round((scene.duration || 0) * fps);
          
          let overlap = 0;
          const transition = scene.transitionToNext;
          const isNotLastScene = i < scenes.length - 1;

          if (transition && isNotLastScene) {
            const transitionConfig = MyTransitions[transition.type as keyof typeof MyTransitions];
            if (transitionConfig && transitionConfig.timing) {
              // LA CORRECTION : passage par un objet
              overlap = transitionConfig.timing.getDurationInFrames({ fps });
            }
          }

          return acc + sceneFrames - overlap;
        }, 0);

        return {
          durationInFrames: Math.max(1, totalFrames),
        };
      }}
    />
  );
};