import express from "express";
import { renderVideo } from "./services/render.service";
import { setupMcp } from "./mcp";
import { getBundleLocation } from "./services/bundle.service";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Monte le serveur MCP — utilisé uniquement pour Copilot Agent en développement
setupMcp(app);

const PORT = 3000;

// Route de santé — vérifie que le serveur est opérationnel
app.get("/", (_req, res) => {
  res.send("Remotion render server is running");
});

// Route principale — reçoit les props JSON et lance le rendu vidéo
app.post("/render", async (req, res) => {
  try {
    const inputProps = req.body;

    // 1) Récupérer le bundle depuis le cache — déjà préchauffé au démarrage
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
  // Préchauffage du bundle au démarrage — évite la latence sur le premier rendu
  await getBundleLocation();
});