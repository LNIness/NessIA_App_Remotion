import express from "express";
import { downloadMediaToPublic } from "./services/download.service";
import { getBundleLocation, invalidateBundleCache } from "./services/bundle.service";
import { renderVideo, RenderRequestBody } from "./services/render.service";

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = 3000;

app.get("/", (_req, res) => {
  res.send("Remotion render server is running");
});

app.post("/render", async (req, res) => {
  try {
    const inputProps = req.body as RenderRequestBody;
    const scenes = inputProps.scenes ?? [];

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: "No scenes provided" });
    }

    // Download -> /public/assets
    // IMPORTANT: si on télécharge au moins un fichier, on invalide le bundle
    // pour être sûr que staticFile() puisse les servir.
    let downloaded = false;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene?.url) {
        return res.status(400).json({ error: `Scene ${i} missing url` });
      }

      if (scene.url.startsWith("/assets/")) continue;

      const newUrl = await downloadMediaToPublic(scene.url, i);
      scenes[i] = { ...scene, url: newUrl };
      downloaded = true;
    }

    inputProps.scenes = scenes;

    if (downloaded) {
      invalidateBundleCache();
    }

    const bundleLocation = await getBundleLocation();
    const { outputLocation } = await renderVideo({
      serveUrl: bundleLocation,
      inputProps,
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
