import fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { VideoCompositionProps } from "../compositions/types";

export type RenderRequestBody = VideoCompositionProps;

const downloadAudioLocally = async (url: string): Promise<string> => {
  const filename = `${uuidv4()}.mp3`;
  const outputPath = path.join(__dirname, "../../public/assets", filename);

  const assetsDir = path.dirname(outputPath);
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return `http://localhost:3000/assets/${filename}`;
};

export const renderVideo = async (args: {
  serveUrl: string;
  inputProps: RenderRequestBody;
}): Promise<{ outputLocation: string }> => {
  const { serveUrl, inputProps } = args;

  if (!Array.isArray(inputProps.clips) || inputProps.clips.length === 0) {
    throw new Error("No clips provided");
  }

  // Télécharge automatiquement la musique si l'URL est externe
  if (inputProps.audio?.musicUrl && !inputProps.audio.musicUrl.startsWith("http://localhost")) {
    console.log(`Downloading audio: ${inputProps.audio.musicUrl}`);
    inputProps.audio.musicUrl = await downloadAudioLocally(inputProps.audio.musicUrl);
    console.log(`Audio ready: ${inputProps.audio.musicUrl}`);
  }

  const compositions = await getCompositions(serveUrl, { inputProps });
  const composition = compositions.find((c) => c.id === "VideoComposition");
  if (!composition) throw new Error("Composition 'VideoComposition' not found");

  console.log(`Rendering ${composition.id}: ${composition.durationInFrames} frames at ${composition.fps}fps — ${composition.width}x${composition.height}`);

  const outputDir = path.resolve("./out");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

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
      gl: "swiftshader",
    },
  });

  return { outputLocation };
};