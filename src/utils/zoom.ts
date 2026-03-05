import { useCurrentFrame, interpolate } from "remotion";
import { ZoomEffect } from "../compositions/types";
import React from "react";

export const useZoomStyle = (effect: ZoomEffect, durationInFrames: number): React.CSSProperties => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (effect.type === "zoomIn") {
    const scale = interpolate(progress, [0, 1], [1, effect.intensity ?? 1.2]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  if (effect.type === "zoomOut") {
    const scale = interpolate(progress, [0, 1], [effect.intensity ?? 1.2, 1]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  if (effect.type === "kenBurns") {
    const intensity = effect.intensity ?? 1.2;
    const scale = interpolate(progress, [0, 1], [1, intensity]);
    const x = interpolate(progress, [0, 1], [effect.fromX ?? 50, effect.toX ?? 60]);
    const y = interpolate(progress, [0, 1], [effect.fromY ?? 50, effect.toY ?? 40]);
    return { transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` };
  }

  return {};
};