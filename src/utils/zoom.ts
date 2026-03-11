import { useCurrentFrame, interpolate } from "remotion";
import { ZoomEffect } from "../compositions/types";
import React from "react";

// Hook Remotion — calcule le style CSS de zoom/kenBurns frame par frame
// Doit être appelé uniquement dans un composant Remotion (contexte de rendu actif)
export const useZoomStyle = (effect: ZoomEffect, durationInFrames: number): React.CSSProperties => {
  const frame = useCurrentFrame();

  // Progression normalisée entre 0 et 1 sur la durée du clip
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Zoom avant : agrandissement progressif de 1 vers intensity
  if (effect.type === "zoomIn") {
    const scale = interpolate(progress, [0, 1], [1, effect.intensity ?? 1.2]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  // Zoom arrière : réduction progressive de intensity vers 1
  if (effect.type === "zoomOut") {
    const scale = interpolate(progress, [0, 1], [effect.intensity ?? 1.2, 1]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  // Ken Burns : zoom + déplacement du point d'origine
  // fromX/Y → toX/Y en pourcentage (0-100), défauts : léger déplacement centre → haut-droit
  if (effect.type === "kenBurns") {
    const intensity = effect.intensity ?? 1.2;
    const scale = interpolate(progress, [0, 1], [1, intensity]);
    const x = interpolate(progress, [0, 1], [effect.fromX ?? 50, effect.toX ?? 60]);
    const y = interpolate(progress, [0, 1], [effect.fromY ?? 50, effect.toY ?? 40]);
    return { transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` };
  }

  return {};
};