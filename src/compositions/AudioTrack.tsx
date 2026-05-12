import React from 'react';
import { Audio } from 'remotion';

type AudioTrackProps = {
  musicUrl: string;
  volume?: number;
};

export const AudioTrack: React.FC<AudioTrackProps> = ({ musicUrl, volume }) => {
  return <Audio src={musicUrl} volume={volume ?? 1} />;
};
