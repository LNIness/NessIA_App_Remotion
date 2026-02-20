import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Video,
  staticFile,
  useVideoConfig,
} from "remotion";

// ✅ Correct Remotion v4 imports
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";

type Transition =
  | { type: "whiteFlash"; preset?: "ultraFast" }
  | { type: "whiteFade"; preset?: "ultraFast" }
  | { type: "swipeLeft"; preset?: "ultraFast" }
  | { type: "zoom"; preset?: "ultraFast"; params?: { scale?: number } };

type Scene = {
  id: string;
  type: "image" | "video";
  url: string; // URL externe OU "/assets/xxx"
  duration: number; // secondes
  trimStart?: number; // secondes
  transitionToNext?: Transition; // NEW
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

  // Ultra-rapide implicite (sans durée dans le JSON)
  const ULTRA_FAST_FRAMES = 4;
  const ultraFast = linearTiming({ durationInFrames: ULTRA_FAST_FRAMES });

  const renderSceneContent = (scene: Scene) => {
    const src = scene.url.startsWith("/") ? staticFile(scene.url) : scene.url;
    const trimStartFrames =
      scene.trimStart !== undefined ? Math.floor(scene.trimStart * fps) : 0;

    return scene.type === "image" ? (
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
    );
  };

  const toPresentation = (t: Transition) => {
    switch (t.type) {
      case "whiteFade":
        return fade(); // ok :contentReference[oaicite:3]{index=3}

      case "swipeLeft":
        // Pour un "swipe vers la gauche", le plan entrant vient de la droite
        return wipe({ direction: "from-right" }); // directions doc :contentReference[oaicite:4]{index=4}

      case "whiteFlash":
        // Fallback (étape suivante: vrai flash blanc via custom/overlay)
        return fade();

      case "zoom":
        // Fallback (étape suivante: vrai zoom via custom presentation)
        return fade();

      default:
        return fade();
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {scenes.map((scene, i) => {
          const durationInFrames = Math.max(1, Math.floor(scene.duration * fps));
          const transition = scene.transitionToNext;

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                {renderSceneContent(scene)}
              </TransitionSeries.Sequence>

              {transition && i < scenes.length - 1 ? (
                <TransitionSeries.Transition
                  timing={ultraFast}
                  presentation={toPresentation(transition) as unknown as Parameters<typeof TransitionSeries.Transition>[0]["presentation"]}
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