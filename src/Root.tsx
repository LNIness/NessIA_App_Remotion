import React from "react";
import { Composition } from "remotion";
import { MyComp } from "./compositions/Composition";

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={fps * 10}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [],
      }}
    />
  );
};
