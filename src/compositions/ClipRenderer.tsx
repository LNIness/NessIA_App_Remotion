import React from 'react';
import { AbsoluteFill, Img, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { MediaClip } from './types';
import { useZoomStyle } from '../utils/zoom';

// Rendu d'un clip individuel — gère images et vidéos avec effets et trimStart
export const ClipRenderer: React.FC<{
  clip: MediaClip;
  durationInFrames: number;
}> = ({ clip, durationInFrames }) => {
  const { fps } = useVideoConfig();

  // URL passée directement à Remotion — pas de téléchargement local
  const src = clip.url;

  // Calcul du style de zoom/kenBurns — objet vide si aucun effet défini
  const zoomStyle = clip.effect
    ? useZoomStyle(clip.effect, durationInFrames)
    : {};

  // Conversion du trimStart en frames pour l'API Remotion
  const trimBeforeFrames =
    clip.trimStart !== undefined ? Math.round(clip.trimStart * fps) : 0;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {clip.type === 'image' ? (
        // Rendu image — pas de trimStart applicable
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...zoomStyle,
          }}
        />
      ) : (
        // Rendu vidéo — trimBefore pour démarrer dans le rush à l'offset souhaité
        <Video
          src={src}
          trimBefore={trimBeforeFrames}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...zoomStyle,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
