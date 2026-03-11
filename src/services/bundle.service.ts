import path from "path";
import { bundle } from "@remotion/bundler";

// Cache du bundle — évite de rebundler à chaque requête
let cachedBundleLocation: string | null = null;

// Promesse en cours de bundling — évite les bundlings parallèles simultanés
let bundlingPromise: Promise<string> | null = null;

type WebpackAliasObject = { [key: string]: string | false | string[] };

// Vérifie que l'alias webpack est bien un objet standard (pas un tableau ni null)
const isAliasObject = (alias: unknown): alias is WebpackAliasObject => {
  return typeof alias === "object" && alias !== null && !Array.isArray(alias);
};

// Retourne le bundle caché ou le crée si absent
// Thread-safe : si un bundling est déjà en cours, attend sa résolution plutôt que d'en lancer un second
export const getBundleLocation = async (): Promise<string> => {
  if (cachedBundleLocation) return cachedBundleLocation;
  if (bundlingPromise) return bundlingPromise;

  bundlingPromise = (async () => {
    const location = await bundle({
      entryPoint: path.resolve("./src/index.ts"),
      webpackOverride: (config) => {
        config.resolve = config.resolve ?? {};

        const currentAlias = config.resolve.alias;

        if (isAliasObject(currentAlias)) {
          const nextAlias: WebpackAliasObject = { ...currentAlias };

          // Fix webpack : empêcher "@remotion/studio" de matcher "@remotion/studio/renderEntry"
          // On remplace l'alias exact par une version avec $ (correspondance stricte)
          if (
            nextAlias["@remotion/studio"] !== undefined &&
            nextAlias["@remotion/studio$"] === undefined
          ) {
            nextAlias["@remotion/studio$"] = nextAlias["@remotion/studio"];
            delete nextAlias["@remotion/studio"];
          }

          config.resolve.alias = nextAlias;
        }

        return config;
      },
    });

    cachedBundleLocation = location;
    bundlingPromise = null;
    return location;
  })();

  return bundlingPromise;
};

// Invalide le cache du bundle — à appeler si le code source change en production
export const invalidateBundleCache = (): void => {
  cachedBundleLocation = null;
  bundlingPromise = null;
};