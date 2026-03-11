/**
 * speed.ts
 * Effets de vitesse pour les clips vidéo : ralenti, accéléré, vitesse variable (ramp).
 *
 * Utilisation dans le JSON :
 *   speed: 0.5          → ralenti (2x plus lent)
 *   speed: 2.0          → accéléré (2x plus rapide)
 *   speedRamp: { from: 0.5, to: 2.0 } → vitesse variable du début à la fin du clip
 *
 * Principe :
 *   Remotion expose playbackRate sur le composant <Video>.
 *   Pour le ramp, on interpole la vitesse entre from et to selon la progression du clip.
 *
 * Note : playbackRate affecte la vitesse de lecture mais pas la durée du clip dans
 *   la timeline Remotion — c'est ClipRenderer qui gère la durée via durationInFrames.
 *   Pour qu'un ralenti à 0.5x couvre toute la durée souhaitée, le rush source doit
 *   être suffisamment long (duration / speed secondes de rush nécessaires).
 */

import { useCurrentFrame } from 'remotion';

// --- Types ---

export type SpeedRamp = {
  from: number; // Vitesse de départ (ex: 0.5 = ralenti)
  to: number;   // Vitesse d'arrivée (ex: 2.0 = accéléré)
};

// --- Hook principal ---

/**
 * usePlaybackRate
 * Retourne le playbackRate à appliquer sur <Video> pour le frame courant.
 *
 * @param durationInFrames - Durée totale du clip en frames
 * @param speed            - Vitesse constante (optionnel)
 * @param speedRamp        - Vitesse variable de from à to (optionnel, prioritaire sur speed)
 * @returns number         - playbackRate à passer à <Video playbackRate={...}>
 */
export function usePlaybackRate(
  durationInFrames: number,
  speed?: number,
  speedRamp?: SpeedRamp
): number {
  const frame = useCurrentFrame();

  // Ramp : interpolation linéaire entre from et to sur la durée du clip
  if (speedRamp) {
    const progress = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;
    const rate = speedRamp.from + (speedRamp.to - speedRamp.from) * progress;
    // Clamp : playbackRate doit être entre 0.1 et 16 (limites navigateur)
    return Math.min(16, Math.max(0.1, rate));
  }

  // Vitesse constante — 1.0 par défaut (comportement normal)
  if (speed !== undefined) {
    return Math.min(16, Math.max(0.1, speed));
  }

  return 1;
}

/**
 * getEffectiveTrimEnd
 * Calcule le trimEnd pour <Video> en tenant compte de la vitesse.
 * Remotion lit toujours à 1x mais playbackRate avance plus vite dans le rush —
 * on limite donc la plage lue pour éviter de déborder sur le rush suivant.
 *
 * @param trimBeforeFrames - Offset de départ dans le rush (en frames)
 * @param durationInFrames - Durée souhaitée du clip dans la timeline (en frames)
 * @param speed            - Vitesse constante
 * @param speedRamp        - Vitesse variable
 * @param fps              - Frames par seconde
 * @returns number | undefined - trimAfter en frames, ou undefined si inutile
 */
export function getEffectiveTrimAfter(
  trimBeforeFrames: number,
  durationInFrames: number,
  fps: number,
  speed?: number,
  speedRamp?: SpeedRamp
): number | undefined {
  // Vitesse variable : utiliser la vitesse moyenne pour estimer la plage consommée
  if (speedRamp) {
    const avgSpeed = (speedRamp.from + speedRamp.to) / 2;
    return trimBeforeFrames + Math.round(durationInFrames * avgSpeed);
  }

  // Vitesse constante > 1 : on consomme plus de rush que la durée du clip
  if (speed && speed !== 1) {
    return trimBeforeFrames + Math.round(durationInFrames * speed);
  }

  return undefined;
}