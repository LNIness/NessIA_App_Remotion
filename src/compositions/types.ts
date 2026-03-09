import { TransitionType } from "../components/transitions";

export type ZoomEffect =
  | { type: "zoomIn"; intensity?: number }
  | { type: "zoomOut"; intensity?: number }
  | { type: "kenBurns"; fromX?: number; fromY?: number; toX?: number; toY?: number; intensity?: number };

export type TransitionConfig = {
  type: TransitionType;
  timing?: "linear" | "spring";
  durationInFrames?: number;
  damping?: number;
};

export type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
  transitionToNext?: TransitionConfig;
  effect?: ZoomEffect;
};

export type VideoCompositionProps = {
  clips?: MediaClip[];
  audio?: {
    musicUrl: string;
    volume?: number;
  };
  width?: number;
  height?: number;
};