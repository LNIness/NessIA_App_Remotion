/**
 * testPayload.ts
 * Payload de test pour Remotion Studio — DEV UNIQUEMENT.
 * Scénario actuel : test des effets de vitesse (speed / speedRamp)
 */

export const TEST_PAYLOAD = {
  width: 1080,
  height: 1920,
  fps: 30,
  clips: [
    {
      // Ralenti 0.5x
      id: 'clip-1',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2023/04/27/160708-821847891_small.mp4',
      duration: 3,
      trimStart: 2,
      speed: 0.5,
      effect: { type: 'zoomIn', intensity: 1.1 },
      transitionToNext: { type: 'swipeLeft', timing: 'spring', durationInFrames: 20, damping: 400 },
    },
    {
      // Accéléré 2x
      id: 'clip-2',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/08/18/298103_small.mp4',
      duration: 4,
      trimStart: 0,
      speed: 2.0,
      effect: { type: 'kenBurns', intensity: 1.2, fromX: 50, fromY: 50, toX: 60, toY: 40 },
      transitionToNext: { type: 'whiteFade', timing: 'linear', durationInFrames: 15 },
    },
    {
      // Vitesse variable : démarre en ralenti (0.5x) et accélère jusqu'à 2x
      id: 'clip-3',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4',
      duration: 4,
      trimStart: 1,
      speedRamp: { from: 0.5, to: 2.0 },
      effect: { type: 'zoomOut', intensity: 1.15 },
      transitionToNext: { type: 'swipeRight', timing: 'spring', durationInFrames: 20, damping: 400 },
    },
    {
      // Vitesse normale — référence sans effet de vitesse
      id: 'clip-4',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/02/13/258038_small.mp4',
      duration: 3,
      trimStart: 0,
    },
  ],
  audio: {
    musicUrl: 'https://dirkemlfbqaybvddeeis.supabase.co/storage/v1/object/public/musique_suno/musique_1772806840.mp3',
    volume: 0.8,
  },
};