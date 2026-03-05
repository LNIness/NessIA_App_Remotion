import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";

import { Audio, Video } from "@remotion/media";

type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
};

type VideoCompositionProps = {
  clips?: MediaClip[];
  audio?: {
    musicUrl: string;
    volume?: number;
  };
};

export const VideoComposition: React.FC<VideoCompositionProps> = (props) => {
  const { fps } = useVideoConfig();
  const clips = props.clips ?? [];

  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {clips.map((clip) => {
        const src = clip.url.startsWith("/") ? staticFile(clip.url) : clip.url;

        const durationInFrames = Math.max(1, Math.floor(clip.duration * fps));
        const from = accumulatedFrames;
        accumulatedFrames += durationInFrames;

        const trimBeforeFrames =
          clip.trimStart !== undefined ? Math.floor(clip.trimStart * fps) : 0;

        return (
          <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
            {clip.type === "image" ? (
              <Img
                src={src}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Video
                src={src}
                trimBefore={trimBeforeFrames}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Sequence>
        );
      })}

      {props.audio?.musicUrl ? (
        <Audio
          src={
            props.audio.musicUrl.startsWith("/")
              ? staticFile(props.audio.musicUrl)
              : props.audio.musicUrl
          }
          volume={props.audio.volume ?? 1}
        />
      ) : null}
    </AbsoluteFill>
  );
};