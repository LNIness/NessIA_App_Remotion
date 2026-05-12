import fs from "fs";
import path from "path";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { VideoCompositionProps } from "../compositions/types";

export type RenderRequestBody = VideoCompositionProps;

export const renderVideo = async (args: {
  serveUrl: string;
  inputProps: RenderRequestBody;
}): Promise<{ outputLocation: string }> => {
  const { serveUrl, inputProps } = args;

  if (!Array.isArray(inputProps.clips) || inputProps.clips.length === 0) {
    throw new Error("No clips provided");
  }

  // Récupère les métadonnées de la composition — calculateMetadata gère durée, width et height dynamiquement
  const compositions = await getCompositions(serveUrl, { inputProps });
  const composition = compositions.find((c) => c.id === "VideoComposition");
  if (!composition) {
    throw new Error("Composition 'VideoComposition' not found");
  }

  console.log(`Rendering ${composition.id}: ${composition.durationInFrames} frames at ${composition.fps}fps — ${composition.width}x${composition.height}`);

  // Crée le dossier de sortie si nécessaire
  const outputDir = path.resolve("./out");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputLocation = path.join(outputDir, `video-${Date.now()}.mp4`);

  // Lance le rendu — concurrence gérée automatiquement par Remotion selon les CPUs disponibles
  // Note : à tuner via le paramètre concurrency une fois déployé sur le VPS
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true,
      gl: "swiftshader",  // Nécessaire pour Docker — émulation GPU logicielle
    },
  });

  return { outputLocation };
};