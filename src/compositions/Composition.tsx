import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Audio, Video } from "@remotion/media";
import { MyTransitions, TransitionType } from "../components/transitions";

type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
  transitionToNext?: {
    type: TransitionType;
    durationInFrames?: number;
  };
};

type VideoCompositionProps = {
  clips?: MediaClip[];
  audio?: {
    musicUrl: string;
    volume?: number;
  };
  width?: number;
  height?: number;
};

export const VideoComposition: React.FC<VideoCompositionProps> = (props) => {
  const { fps, width, height } = useVideoConfig();
  const clips = props.clips ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: "black", width, height }}>
      <TransitionSeries>
        {clips.map((clip, i) => {
          const src = clip.url.startsWith("/") ? staticFile(clip.url) : clip.url;
          const durationInFrames = Math.max(1, Math.floor(clip.duration * fps));
          const trimBeforeFrames = clip.trimStart !== undefined ? Math.floor(clip.trimStart * fps) : 0;
          const transition = clip.transitionToNext;
          const isNotLastClip = i < clips.length - 1;

          // Durée de la transition : depuis la requête ou valeur par défaut du fichier de transition
          const transitionDuration = transition?.durationInFrames
            ?? (transition ? MyTransitions[transition.type].timing.getDurationInFrames({ fps }) : 0);

          return (
            <React.Fragment key={clip.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <AbsoluteFill>
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
                </AbsoluteFill>
              </TransitionSeries.Sequence>

              {transition && isNotLastClip ? (
                <TransitionSeries.Transition
                  presentation={MyTransitions[transition.type].presentation}
                  timing={linearTiming({ durationInFrames: transitionDuration })}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

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