import React from 'react';
import { AbsoluteFill, Img, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { MediaClip } from './types';
import { useZoomStyle } from '../utils/zoom';
import {
  usePlaybackRate,
  getEffectiveTrimAfter,
} from '../components/effects/speed';

// Rendu d'un clip individuel — gère images et vidéos avec effets, trimStart et vitesse
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

  // Calcul du playbackRate selon speed ou speedRamp (vidéo uniquement)
  const playbackRate = usePlaybackRate(
    durationInFrames,
    clip.speed,
    clip.speedRamp
  );

  // Calcul du trimAfter pour limiter la plage de rush consommée selon la vitesse
  const trimAfterFrames = getEffectiveTrimAfter(
    trimBeforeFrames,
    durationInFrames,
    fps,
    clip.speed,
    clip.speedRamp
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {clip.type === 'image' ? (
        // Rendu image — speed ignoré (pas de playbackRate applicable sur une image)
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
        // playbackRate pour ralenti/accéléré/ramp
        // trimAfter pour limiter la plage lue selon la vitesse
        <Video
          src={src}
          trimBefore={trimBeforeFrames}
          {...(trimAfterFrames !== undefined
            ? { trimAfter: trimAfterFrames }
            : {})}
          playbackRate={playbackRate}
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
