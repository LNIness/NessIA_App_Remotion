import React from "react";
import { staticFile } from "remotion";
import { Audio } from "@remotion/media";

type AudioTrackProps = {
  musicUrl: string;
  volume?: number;
};

export const AudioTrack: React.FC<AudioTrackProps> = ({ musicUrl, volume }) => {
  const src = musicUrl.startsWith("/") ? staticFile(musicUrl) : musicUrl;
  return <Audio src={src} volume={volume ?? 1} />;
};