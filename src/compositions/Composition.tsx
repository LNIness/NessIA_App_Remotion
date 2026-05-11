import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { MyTransitions } from '../components/transitions';
import { ClipRenderer } from './ClipRenderer';
import { AudioTrack } from './AudioTrack';
import { buildTiming } from '../utils/timing';
import { VideoCompositionProps } from './types';

// Orchestrateur principal — assemble les clips, transitions et audio en une composition Remotion
export const VideoComposition: React.FC<VideoCompositionProps> = (props) => {
  const { fps, width, height } = useVideoConfig();
  const clips = props.clips ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', width, height }}>
      <TransitionSeries>
        {clips.map((clip, i) => {
          // Durée du clip en frames — Math.round pour cohérence avec calculateTotalFrames
          const durationInFrames = Math.max(1, Math.round(clip.duration * fps));
          const transition = clip.transitionToNext;
          // Pas de transition après le dernier clip
          const isNotLastClip = i < clips.length - 1;

          return (
            <React.Fragment key={clip.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <ClipRenderer clip={clip} durationInFrames={durationInFrames} />
              </TransitionSeries.Sequence>

              {/* Transition vers le clip suivant — uniquement si définie, connue et pas sur le dernier clip */}
              {transition && isNotLastClip && MyTransitions[transition.type] ? (
                <TransitionSeries.Transition
                  presentation={MyTransitions[transition.type].presentation}
                  timing={buildTiming(transition, fps)}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* Musique de fond — rendue uniquement si une URL est fournie */}
      {props.audio?.musicUrl ? (
        <AudioTrack
          musicUrl={props.audio.musicUrl}
          volume={props.audio.volume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
