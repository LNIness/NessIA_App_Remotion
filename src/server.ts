import express from "express";
import axios from "axios";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { renderVideo } from "./services/render.service";
import { setupMcp } from "./mcp";
import { getBundleLocation } from "./services/bundle.service";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Monte le serveur MCP — utilisé uniquement pour Copilot Agent en développement
setupMcp(app);

const PORT = 3000;

// Servir les assets statiques locaux avec CORS — requis pour Remotion (Chromium)
app.use("/assets", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static(path.join(__dirname, "../public/assets")));

// Télécharge un fichier audio externe et le sert localement
// Flow : n8n envoie l'URL Suno → on télécharge → on retourne l'URL locale
app.post("/download-audio", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing url");

  try {
    const filename = `${uuidv4()}.mp3`;
    const outputPath = path.join(__dirname, "../public/assets", filename);

    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    res.json({ audioUrl: `http://localhost:3000/assets/${filename}` });
  } catch (err) {
    console.error("Download audio error:", err);
    res.status(502).send("Failed to download audio");
  }
});

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