// Définition des effets de zoom disponibles sur les clips
export type ZoomEffect =
  // Zoom avant progressif — intensity : facteur d'agrandissement (défaut recommandé : 1.2)
  | { type: "zoomIn"; intensity?: number }
  // Zoom arrière progressif — intensity : facteur de réduction (défaut recommandé : 1.2)
  | { type: "zoomOut"; intensity?: number }
  // Zoom + déplacement — fromX/Y : point de départ en %, toX/Y : point d'arrivée en %, intensity : facteur de zoom
  | { type: "kenBurns"; fromX?: number; fromY?: number; toX?: number; toY?: number; intensity?: number };