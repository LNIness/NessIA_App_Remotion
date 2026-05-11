import React from 'react';
import { VideoCompositionConfig } from './compositions/VideoCompositionConfig';

// Composant racine Remotion — enregistré via registerRoot dans index.ts
// Point d'entrée unique pour toutes les compositions du projet
export const RemotionRoot: React.FC = () => {
  return <VideoCompositionConfig />;
};
