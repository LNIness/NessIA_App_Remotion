import React from 'react';
import { AbsoluteFill, Img, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { MediaClip } from './types';
import { useZoomStyle } from '../utils/zoom';

export const ClipRenderer: React.FC<{
  clip: MediaClip;
  durationInFrames: number;
}> = ({ clip, durationInFrames }) => {
  const { fps } = useVideoConfig();
  // Les URLs sont passées directement — plus de staticFile nécessaire
  const src = clip.url;
  const zoomStyle = clip.effect
    ? useZoomStyle(clip.effect, durationInFrames)
    : {};
  const trimBeforeFrames =
    clip.trimStart !== undefined ? Math.round(clip.trimStart * fps) : 0;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {clip.type === 'image' ? (
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
