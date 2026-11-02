import { describe, expect, test } from "vitest";
import { build } from "esbuild";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
export function rendererBusinessSource(file: string): boolean {
  return /^src\/renderer\/(?:auth\.|account-provider-details\.|account-settings\.|cloud-quota\.|pending-publish\.|sign-in-dialog\.|playable-|story-|game-|web-game-|playtest[.-]|node-thumbnail-page\.|community[.-]|publish-dialog\.|games\.|desktop-game-preview\.|use-web-game-player\.|business-contributions\.)/.test(
    file,
  );
}

describe("renderer composition", () => {
  test("non-game entry retains the workbench with business implementations unavailable", async () => {
    const result = await build({
      absWorkingDir: root,
      entryPoints: ["src/renderer/main.tsx"],
      bundle: true,
      platform: "browser",
      packages: "external",
      format: "esm",
      write: false,
      metafile: true,
      outdir: "/unused-renderer-composition",
      loader: {
        ".svg": "file",
        ".webp": "file",
        ".png": "file",
        ".woff2": "file",
        ".mp3": "file",
      },
      logLevel: "silent",
      plugins: [
        {
          name: "non-game-business-unavailable",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, async (args) => {
              if (args.pluginData?.checked) return;
              const target =
                args.path === "./business-contributions.js"
                  ? "./core-contributions.js"
                  : args.path;
              const resolved = await builder.resolve(target, {
                kind: args.kind,
                importer: args.importer,
                resolveDir: args.resolveDir,
                pluginData: { checked: true },
              });
              if (resolved.errors.length) return { errors: resolved.errors };
              if (
                !resolved.external &&
                rendererBusinessSource(
                  path.relative(root, resolved.path).replaceAll(path.sep, "/"),
                )
              )
                return {
                  errors: [
                    {
                      text: `Business implementation unavailable: ${resolved.path} from ${args.importer}`,
                    },
                  ],
                };
              return { ...resolved, pluginData: undefined };
            });
          },
        },
      ],
    });
    const inputs = Object.keys(result.metafile!.inputs);
    for (const source of [
      "app.tsx",
      "project-shell.tsx",
      "coding-workspace.tsx",
      "canvas-workspace.tsx",
      "asset-canvas-nodes.tsx",
      "models-settings.tsx",
      "plugins.tsx",
      "onboarding.tsx",
    ]) {
      expect(inputs).toContain(`src/renderer/${source}`);
    }
    expect(inputs.some(rendererBusinessSource)).toBe(false);
  });
});
