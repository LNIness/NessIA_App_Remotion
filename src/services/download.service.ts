import axios from "axios";
import fs from "fs";
import path from "path";

const PUBLIC_ASSETS_DIR = path.resolve("./public/assets");

/**
 * Télécharge un média distant et l’écrit dans public/assets.
 * Retourne un chemin relatif compatible Remotion: "/assets/xxx.ext"
 */
export const downloadMediaToPublic = async (url: string, index: number): Promise<string> => {
  if (!url || typeof url !== "string") {
    throw new Error("downloadMediaToPublic: url manquante ou invalide");
  }

  const response = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer",
    // petite robustesse : timeout réseau
    timeout: 30_000,
  });

  const extension = url.split(".").pop()?.split("?")[0] || "dat";

  if (!fs.existsSync(PUBLIC_ASSETS_DIR)) {
    fs.mkdirSync(PUBLIC_ASSETS_DIR, { recursive: true });
  }

  const fileName = `media-${Date.now()}-${index}.${extension}`;
  const localPath = path.join(PUBLIC_ASSETS_DIR, fileName);

  fs.writeFileSync(localPath, response.data);

  return `/assets/${fileName}`;
};
