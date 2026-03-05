import fs from "fs";
import path from "path";
import { getCompositions, renderMedia } from "@remotion/renderer";

type MediaClip = {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  trimStart?: number;
};

export type RenderRequestBody = {
  clips?: MediaClip[];
  audio?: {
    musicUrl: string;
    volume?: number;
  };
  width?: number;
  height?: number;
  fps?: number;
};

export const renderVideo = async (args: {
  serveUrl: string;
  inputProps: RenderRequestBody;
}): Promise<{ outputLocation: string }> => {
  const { serveUrl, inputProps } = args;

  if (!Array.isArray(inputProps.clips) || inputProps.clips.length === 0) {
    throw new Error("No clips provided");
  }
  

  // calculateMetadata dans Root.tsx gère la durée, width et height
  const compositions = await getCompositions(serveUrl, { inputProps });
  const composition = compositions.find((c) => c.id === "VideoComposition");
  if (!composition) {
    throw new Error("Composition 'VideoComposition' not found");
  }


  const outputDir = path.resolve("./out");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputLocation = path.join(outputDir, `video-${Date.now()}.mp4`);

  await renderMedia({
    composition,
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