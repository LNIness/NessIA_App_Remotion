import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { Audio, Video } from "@remotion/media";
import { MyTransitions, TransitionType } from "../components/transitions";

type ZoomEffect =
  | { type: "zoomIn"; intensity?: number }
  | { type: "zoomOut"; intensity?: number }
  | { type: "kenBurns"; fromX?: number; fromY?: number; toX?: number; toY?: number; intensity?: number };

type TransitionConfig = {
  type: TransitionType;
  timing?: "linear" | "spring";
  durationInFrames?: number;
  damping?: number;
};

type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
  transitionToNext?: TransitionConfig;
  effect?: ZoomEffect;
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

const buildTiming = (transition: TransitionConfig, fps: number) => {
  if (transition.timing === "spring") {
    return springTiming({ config: { damping: transition.damping ?? 200 } });
  }
  return linearTiming({
    durationInFrames: transition.durationInFrames
      ?? MyTransitions[transition.type].timing.getDurationInFrames({ fps }),
  });
};

const useZoomStyle = (effect: ZoomEffect, durationInFrames: number): React.CSSProperties => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (effect.type === "zoomIn") {
    const scale = interpolate(progress, [0, 1], [1, effect.intensity ?? 1.2]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  if (effect.type === "zoomOut") {
    const scale = interpolate(progress, [0, 1], [effect.intensity ?? 1.2, 1]);
    return { transform: `scale(${scale})`, transformOrigin: "center center" };
  }

  if (effect.type === "kenBurns") {
    const intensity = effect.intensity ?? 1.2;
    const scale = interpolate(progress, [0, 1], [1, intensity]);
    const x = interpolate(progress, [0, 1], [effect.fromX ?? 50, effect.toX ?? 60]);
    const y = interpolate(progress, [0, 1], [effect.fromY ?? 50, effect.toY ?? 40]);
    return { transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` };
  }

  return {};
};

// Composant dédié pour chaque clip — permet d'appeler les hooks légalement
const ClipRenderer: React.FC<{ clip: MediaClip; durationInFrames: number }> = ({ clip, durationInFrames }) => {
  const src = clip.url.startsWith("/") ? staticFile(clip.url) : clip.url;
  const zoomStyle = clip.effect ? useZoomStyle(clip.effect, durationInFrames) : {};
  const trimBeforeFrames = clip.trimStart !== undefined ? Math.floor(clip.trimStart * 30) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {clip.type === "image" ? (
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover", ...zoomStyle }}
        />
      ) : (
        <Video
          src={src}
          trimBefore={trimBeforeFrames}
          style={{ width: "100%", height: "100%", objectFit: "cover", ...zoomStyle }}
        />
      )}
    </AbsoluteFill>
  );
};

export const VideoComposition: React.FC<VideoCompositionProps> = (props) => {
  const { fps, width, height } = useVideoConfig();
  const clips = props.clips ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: "black", width, height }}>
      <TransitionSeries>
        {clips.map((clip, i) => {
          const durationInFrames = Math.max(1, Math.floor(clip.duration * fps));
          const transition = clip.transitionToNext;
          const isNotLastClip = i < clips.length - 1;

          return (
            <React.Fragment key={clip.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <ClipRenderer clip={clip} durationInFrames={durationInFrames} />
              </TransitionSeries.Sequence>

              {transition && isNotLastClip ? (
                <TransitionSeries.Transition
                  presentation={MyTransitions[transition.type].presentation}
                  timing={buildTiming(transition, fps)}
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