import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { MyTransitions } from '../components/transitions';
import { ClipRenderer } from './ClipRenderer';
import { AudioTrack } from './AudioTrack';
import { buildTiming } from '../utils/timing';
import { VideoCompositionProps } from './types';

export const VideoComposition: React.FC<VideoCompositionProps> = (props) => {
  const { fps, width, height } = useVideoConfig();
  const clips = props.clips ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', width, height }}>
      <TransitionSeries>
        {clips.map((clip, i) => {
          const durationInFrames = Math.max(1, Math.round(clip.duration * fps));
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
        <AudioTrack
          musicUrl={props.audio.musicUrl}
          volume={props.audio.volume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
