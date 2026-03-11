import React from 'react';
import { Audio } from '@remotion/media';

type AudioTrackProps = {
  musicUrl: string;
  volume?: number;
};

// Composant de rendu de la musique de fond
// Les URLs sont passées directement — plus besoin de staticFile depuis la suppression du téléchargement local
export const AudioTrack: React.FC<AudioTrackProps> = ({ musicUrl, volume }) => {
  return <Audio src={musicUrl} volume={volume ?? 1} />;
};
