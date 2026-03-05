export type ZoomEffect =
  | { type: "zoomIn"; intensity?: number }
  | { type: "zoomOut"; intensity?: number }
  | { type: "kenBurns"; fromX?: number; fromY?: number; toX?: number; toY?: number; intensity?: number };