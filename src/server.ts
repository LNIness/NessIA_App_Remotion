import express from "express";
import { bundle } from "@remotion/bundler";
import path from "path";
import { renderVideo } from "./services/render.service";
import { setupMcp } from "./mcp";

const app = express();
app.use(express.json({ limit: "50mb" }));
setupMcp(app);
const PORT = 3000;

// Cache du bundle Remotion — calculé une seule fois au démarrage
let bundleCache: string | null = null;

const getBundleLocation = async (): Promise<string> => {
  if (bundleCache) return bundleCache;
  console.log("Bundling Remotion project...");
  bundleCache = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
  });
  console.log("Bundle prêt et mis en cache.");
  return bundleCache;
};

app.get("/", (_req, res) => {
  res.send("Remotion render server is running");
});

app.post("/render", async (req, res) => {
  try {
    const inputProps = req.body;

    // 1) Récupérer le bundle depuis le cache
    const bundleLocation = await getBundleLocation();

    // 2) Lancer le rendu — les URLs distantes sont passées directement à Remotion
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

app.listen(PORT, async () => {
  console.log(`Render server running on port ${PORT}`);
  // Préchauffage du bundle au démarrage pour le premier rendu
  await getBundleLocation();
});