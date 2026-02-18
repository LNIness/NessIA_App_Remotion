import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  staticFile,
  useVideoConfig,
} from "remotion";

type Scene = {
  id: string;
  type: "image" | "video";
  url: string; // peut être URL externe OU "/assets/xxx"
  duration: number; // secondes
  trimStart?: number; // secondes
};

type VideoProject = {
  scenes?: Scene[];
  audio?: {
    musicUrl: string; // URL externe OU "/assets/xxx"
    volume?: number;
  };
};

export const MyComp: React.FC<VideoProject> = (props) => {
  const { fps } = useVideoConfig();
  const scenes = props.scenes ?? [];

  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {scenes.map((scene) => {
        const src = scene.url.startsWith("/") ? staticFile(scene.url) : scene.url;

        const durationInFrames = Math.max(1, Math.floor(scene.duration * fps));
        const from = accumulatedFrames;
        accumulatedFrames += durationInFrames;

        const trimStartFrames =
          scene.trimStart !== undefined ? Math.floor(scene.trimStart * fps) : 0;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            {scene.type === "image" ? (
              <Img
                src={src}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Video
                src={src}
                startFrom={trimStartFrames}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Sequence>
        );
      })}

      {props.audio?.musicUrl ? (
        <Audio
          src={props.audio.musicUrl.startsWith("/") ? staticFile(props.audio.musicUrl) : props.audio.musicUrl}
          volume={props.audio.volume ?? 1}
        />
      ) : null}
    </AbsoluteFill>
  );
};
