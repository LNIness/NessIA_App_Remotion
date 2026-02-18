import path from "path";
import { bundle } from "@remotion/bundler";

let cachedBundleLocation: string | null = null;
let bundlingPromise: Promise<string> | null = null;

type WebpackAliasObject = { [key: string]: string | false | string[] };

const isAliasObject = (alias: unknown): alias is WebpackAliasObject => {
  return typeof alias === "object" && alias !== null && !Array.isArray(alias);
};

export const getBundleLocation = async (): Promise<string> => {
  if (cachedBundleLocation) return cachedBundleLocation;
  if (bundlingPromise) return bundlingPromise;

  bundlingPromise = (async () => {
    const location = await bundle({
      entryPoint: path.resolve("./src/index.ts"),
      webpackOverride: (config) => {
        config.resolve = config.resolve ?? {};

        const currentAlias = config.resolve.alias;

        // On ne modifie que si alias est un objet (cas standard)
        if (isAliasObject(currentAlias)) {
          const nextAlias: WebpackAliasObject = { ...currentAlias };

          // IMPORTANT:
          // empêcher "@remotion/studio" (préfixe) de matcher "@remotion/studio/renderEntry"
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

export const invalidateBundleCache = (): void => {
  cachedBundleLocation = null;
  bundlingPromise = null;
};
