import fs from "fs";
import path from "path";
import { getCompositions, renderMedia } from "@remotion/renderer";

type Scene = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
};

export type RenderRequestBody = {
  scenes?: Scene[];
  audio?: {
    musicUrl: string;
    volume?: number;
  };
};

export const renderVideo = async (args: {
  serveUrl: string;
  inputProps: RenderRequestBody;
}): Promise<{ outputLocation: string }> => {
  const { serveUrl, inputProps } = args;

  const scenes = inputProps.scenes ?? [];
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("No scenes provided");
  }

  const compositions = await getCompositions(serveUrl, { inputProps });
  const composition = compositions.find((c) => c.id === "MyComp");
  if (!composition) {
    throw new Error("Composition 'MyComp' not found");
  }

  const outputDir = path.resolve("./out");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputLocation = path.join(outputDir, `video-${Date.now()}.mp4`);

  const fps = composition.fps;
  const totalDurationInSeconds = scenes.reduce((acc, s) => acc + s.duration, 0);
  const totalDurationInFrames = Math.max(1, Math.floor(totalDurationInSeconds * fps));

  await renderMedia({
    composition: { ...composition, durationInFrames: totalDurationInFrames },
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true,
    },
  });

  return { outputLocation };
};
