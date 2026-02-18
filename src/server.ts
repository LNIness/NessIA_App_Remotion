import express from "express";
import { bundle } from "@remotion/bundler";
import { renderMedia, getCompositions } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { downloadMediaToPublic } from "./services/download.service";

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;

app.get("/", (_req, res) => {
  res.send("Remotion render server is running");
});

app.post("/render", async (req, res) => {
  try {
    const inputProps = req.body;

    // 1) Télécharger les médias -> /public/assets (pour staticFile)
    if (Array.isArray(inputProps.scenes)) {
      for (let i = 0; i < inputProps.scenes.length; i++) {
        const scene = inputProps.scenes[i];
        if (scene?.url && typeof scene.url === "string" && !scene.url.startsWith("/assets/")) {
          const newUrl = await downloadMediaToPublic(scene.url, i);
          inputProps.scenes[i].url = newUrl;
        }
      }
    }

    console.log("SCENES:", inputProps.scenes);

    // 2) Bundle
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./src/index.ts"),
    });

    // 3) Compositions
    const compositions = await getCompositions(bundleLocation, { inputProps });
    const composition = compositions.find((c) => c.id === "MyComp");

    if (!composition) {
      throw new Error("Composition 'MyComp' not found");
    }

    // 4) Output
    const outputDir = path.resolve("./out");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputLocation = path.join(outputDir, `video-${Date.now()}.mp4`);

    // 5) Durée
    const fps = composition.fps;
    const totalDurationInSeconds = (inputProps.scenes ?? []).reduce(
      (acc: number, scene: any) => acc + (scene?.duration ?? 0),
      0
    );
    const totalDurationInFrames = Math.max(1, Math.floor(totalDurationInSeconds * fps));

    console.log("TOTAL SECONDS:", totalDurationInSeconds);
    console.log("TOTAL FRAMES:", totalDurationInFrames);

    // 6) Render
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: totalDurationInFrames,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
      chromiumOptions: {
        disableWebSecurity: true,
        ignoreCertificateErrors: true,
      },
    });

    res.json({ success: true, output: outputLocation });
  } catch (error) {
    console.error("Render error:", error);
    res.status(500).json({ error: "Render failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Render server running on port ${PORT}`);
});
