import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ZoomEffect } from './zoom';

export const useZoomStyle = (effect: ZoomEffect): React.CSSProperties => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (effect.type === 'zoomIn') {
    const intensity = effect.intensity ?? 1.2;
    const scale = interpolate(progress, [0, 1], [1, intensity]);
    return { transform: `scale(${scale})`, transformOrigin: 'center center' };
  }

  if (effect.type === 'zoomOut') {
    const intensity = effect.intensity ?? 1.2;
    const scale = interpolate(progress, [0, 1], [intensity, 1]);
    return { transform: `scale(${scale})`, transformOrigin: 'center center' };
  }

  if (effect.type === 'kenBurns') {
    const intensity = effect.intensity ?? 1.2;
    const fromX = effect.fromX ?? 50;
    const fromY = effect.fromY ?? 50;
    const toX = effect.toX ?? 60;
    const toY = effect.toY ?? 40;
    const scale = interpolate(progress, [0, 1], [1, intensity]);
    const x = interpolate(progress, [0, 1], [fromX, toX]);
    const y = interpolate(progress, [0, 1], [fromY, toY]);
    return {
      transform: `scale(${scale})`,
      transformOrigin: `${x}% ${y}%`,
    };
  }

  return {};
};