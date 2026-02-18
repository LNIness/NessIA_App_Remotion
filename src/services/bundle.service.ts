import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";

let cachedBundleLocation: string | null = null;
let bundlingPromise: Promise<string> | null = null;

const getStudioRenderEntryPath = (): string => {
  // On résout le dossier du package sans passer par les subpaths "exports"
  const studioPkgJson = require.resolve("@remotion/studio/package.json");
  const studioRoot = path.dirname(studioPkgJson);

  // On pointe vers le fichier réellement présent dans l'image
  const candidate = path.join(studioRoot, "dist", "renderEntry.js");

  if (!fs.existsSync(candidate)) {
    throw new Error(`@remotion/studio renderEntry not found at: ${candidate}`);
  }

  return candidate;
};

export const getBundleLocation = async (): Promise<string> => {
  if (cachedBundleLocation) return cachedBundleLocation;
  if (bundlingPromise) return bundlingPromise;

  bundlingPromise = (async () => {
    const renderEntryPath = getStudioRenderEntryPath();

    const location = await bundle({
      entryPoint: path.resolve("./src/index.ts"),
      webpackOverride: (currentConfiguration) => {
        currentConfiguration.resolve = currentConfiguration.resolve ?? {};

        // Webpack: alias peut être objet ou array selon versions/config
        const existingAlias = currentConfiguration.resolve.alias;

        if (Array.isArray(existingAlias)) {
          // Cas rare : on ne merge pas “proprement” ici,
          // mais on laisse tel quel pour ne pas casser la config.
          // Dans ce cas, on ajoute un fallback via aliasFields (moins robuste),
          // donc on préfère ne pas être dans ce cas.
          // (Si ça arrive, on adaptera précisément.)
          return currentConfiguration;
        }

        currentConfiguration.resolve.alias = {
          ...(existingAlias ?? {}),
          "@remotion/studio/renderEntry": renderEntryPath,
        };

        return currentConfiguration;
      },
    });

    cachedBundleLocation = location;
    bundlingPromise = null;
    return location;
  })();

  return bundlingPromise;
};

/**
 * À appeler si tu changes des fichiers qu'on veut voir dans le bundle (ex: nouveaux assets).
 */
export const invalidateBundleCache = (): void => {
  cachedBundleLocation = null;
  bundlingPromise = null;
};
