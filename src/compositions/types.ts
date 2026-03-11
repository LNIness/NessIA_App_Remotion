import { TransitionType } from "../components/transitions";
import { SpeedRamp } from "../components/effects/speed";

// --- Effets visuels ---
// Effets de zoom applicables sur un clip
// intensity : facteur de zoom (ex: 1.2 = 20% d'agrandissement)
// kenBurns : zoom + déplacement — fromX/Y → toX/Y en pourcentage (0-100)
export type ZoomEffect =
  | { type: "zoomIn"; intensity?: number }
  | { type: "zoomOut"; intensity?: number }
  | { type: "kenBurns"; fromX?: number; fromY?: number; toX?: number; toY?: number; intensity?: number };

// --- Transitions ---
// Configuration d'une transition entre deux clips
// spring : transition organique avec rebond — utiliser damping pour contrôler l'amorti (400 recommandé pour les swipes)
// linear : transition mécanique et précise — utiliser durationInFrames pour contrôler la durée
export type TransitionConfig = {
  type: TransitionType;
  timing?: "linear" | "spring";
  durationInFrames?: number; // utilisé uniquement si timing === "linear"
  damping?: number;          // utilisé uniquement si timing === "spring"
};

// --- Clips ---
// Représente un clip individuel dans la composition
// trimStart : offset de départ dans le rush en secondes (découpage du rush brut)
// speed     : vitesse de lecture constante — 0.5 = ralenti, 2.0 = accéléré, 1.0 = normal (défaut)
// speedRamp : vitesse variable — interpolation linéaire de from à to sur la durée du clip
//             prioritaire sur speed si les deux sont définis
export type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;               // URL distante — passée directement à Remotion
  duration: number;          // Durée de la scène en secondes
  trimStart?: number;        // Offset de départ dans le rush (0 par défaut)
  transitionToNext?: TransitionConfig; // Transition vers le clip suivant — absent sur le dernier clip
  effect?: ZoomEffect;       // Effet visuel optionnel
  speed?: number;            // Vitesse constante : < 1 = ralenti, > 1 = accéléré (vidéo uniquement)
  speedRamp?: SpeedRamp;     // Vitesse variable du début à la fin du clip (vidéo uniquement)
};

// --- Composition ---
// Props principales passées à la composition Remotion via l'API
export type VideoCompositionProps = {
  clips?: MediaClip[];
  audio?: {
    musicUrl: string;        // URL distante de la musique de fond
    volume?: number;         // Volume entre 0 et 1 (défaut : 1)
  };
  width?: number;            // Largeur en pixels (défaut : 1080)
  height?: number;           // Hauteur en pixels (défaut : 1920)
};