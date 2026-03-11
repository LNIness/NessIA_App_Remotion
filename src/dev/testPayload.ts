/**
 * testPayload.ts
 * Payload de test pour Remotion Studio — DEV UNIQUEMENT.
 * Ne jamais importer ce fichier en production.
 *
 * Pour tester : modifier les clips ici, le Studio se met à jour automatiquement.
 * Pour changer de scénario : remplacer le contenu de TEST_PAYLOAD.
 */

import { VideoCompositionProps } from '../compositions/types';

export const TEST_PAYLOAD: VideoCompositionProps = {
  width: 1080,
  height: 1920,
  clips: [
    {
      id: 'clip-1',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2023/04/27/160708-821847891_small.mp4',
      duration: 3,
      trimStart: 2,
      effect: { type: 'zoomIn', intensity: 1.1 },
      transitionToNext: { type: 'swipeLeft', timing: 'spring', durationInFrames: 20, damping: 400 },
    },
    {
      id: 'clip-2',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/08/18/298103_small.mp4',
      duration: 4,
      trimStart: 0,
      effect: { type: 'kenBurns', intensity: 1.2, fromX: 50, fromY: 50, toX: 60, toY: 40 },
      transitionToNext: { type: 'whiteFade', timing: 'linear', durationInFrames: 15 },
    },
    {
      id: 'clip-3',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4',
      duration: 3.5,
      trimStart: 1,
      effect: { type: 'zoomOut', intensity: 1.15 },
      transitionToNext: { type: 'swipeRight', timing: 'spring', durationInFrames: 20, damping: 400 },
    },
    {
      id: 'clip-4',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/02/13/258038_small.mp4',
      duration: 3,
      trimStart: 2,
      transitionToNext: { type: 'swipeLeft', timing: 'linear', durationInFrames: 12 },
    },
    {
      id: 'clip-5',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2023/04/27/160708-821847891_small.mp4',
      duration: 3.5,
      trimStart: 5,
      effect: { type: 'kenBurns', intensity: 1.1, fromX: 50, fromY: 50, toX: 55, toY: 45 },
      transitionToNext: { type: 'whiteFade', timing: 'spring', durationInFrames: 20, damping: 300 },
    },
    {
      id: 'clip-6',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/08/18/298103_small.mp4',
      duration: 3,
      trimStart: 3,
      effect: { type: 'zoomIn', intensity: 1.2 },
      transitionToNext: { type: 'swipeRight', timing: 'linear', durationInFrames: 15 },
    },
    {
      id: 'clip-7',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4',
      duration: 3.5,
      trimStart: 0,
      transitionToNext: { type: 'swipeLeft', timing: 'spring', durationInFrames: 20, damping: 400 },
    },
    {
      id: 'clip-8',
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2025/02/13/258038_small.mp4',
      duration: 4,
      trimStart: 1,
      effect: { type: 'zoomOut', intensity: 1.1 },
      // Pas de transitionToNext sur le dernier clip
    },
  ],
  audio: {
    musicUrl: 'https://dirkemlfbqaybvddeeis.supabase.co/storage/v1/object/public/musique_suno/musique_1772806840.mp3',
    volume: 0.8,
  },
};