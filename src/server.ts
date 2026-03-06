import express from "express";
import { bundle } from "@remotion/bundler";
import path from "path";
import { downloadMediaToPublic } from "./services/download.service";
import { renderVideo } from "./services/render.service";
import { setupMcp } from "./mcp";

const app = express();
app.use(express.json({ limit: "50mb" }));
setupMcp(app);
const PORT = 3000;

app.get("/", (_req, res) => {
  res.send("Remotion render server is running");
});

app.post("/render", async (req, res) => {
  try {
    const inputProps = req.body;

    // 1) Télécharger les médias -> /public/assets (pour staticFile)
    if (Array.isArray(inputProps.clips)) {
      for (let i = 0; i < inputProps.clips.length; i++) {
        const clip = inputProps.clips[i];
        if (clip?.url && typeof clip.url === "string" && !clip.url.startsWith("/assets/")) {
          const newUrl = await downloadMediaToPublic(clip.url, i);
          inputProps.clips[i].url = newUrl;
        }
      }
    }

    // 2) Bundle le projet Remotion
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./src/index.ts"),
    });

    // 3) Rendu via le service
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