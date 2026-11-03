import { describe, expect, test } from "vitest";
import { build } from "esbuild";
import path from "node:path";
import {
  cp,
  mkdtemp,
  readFile,
  realpath,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { build as viteBuild } from "vite";

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
              const target = args.path.endsWith("/business-contributions.js")
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
      "library.tsx",
      "project-create-dialog.tsx",
      "provider-models.tsx",
      "connections-settings.tsx",
      "agent-timeline.tsx",
      "coding-agents-settings.tsx",
      "custom-canvas-node.tsx",
      "asset-canvas-workspace.tsx",
    ]) {
      expect(inputs).toContain(`src/renderer/${source}`);
    }
    expect(inputs).toContain("src/modules/example/note.tsx");
    expect(inputs.some(rendererBusinessSource)).toBe(false);
  });
  test("production Vite builds the selected core with business source files absent", async () => {
    const fixture = await realpath(
      await mkdtemp(path.join(tmpdir(), "ohmytemplate-renderer-")),
    );
    for (const file of [
      "src",
      "test",
      "index.html",
      "vite.config.ts",
      "package.json",
      "application-identity.cjs",
      "application.json",
      "CHANGELOG.md",
      "tsconfig.json",
    ]) {
      await cp(path.join(root, file), path.join(fixture, file), {
        recursive: true,
        filter: (source) =>
          !rendererBusinessSource(
            path.relative(root, source).replaceAll(path.sep, "/"),
          ),
      });
    }
    await symlink(
      path.join(root, "node_modules"),
      path.join(fixture, "node_modules"),
      "dir",
    );
    await writeFile(
      path.join(fixture, "src/shared/application-selection.ts"),
      'export const applicationCompositionId: "ohmygame" | "non-game" = "non-game";\n',
    );
    const inputs = new Set<string>();
    await viteBuild({
      root: fixture,
      configFile: path.join(fixture, "vite.config.ts"),
      logLevel: "error",
      plugins: [
        {
          name: "verify-selected-renderer-graph",
          moduleParsed(module) {
            const relative = path
              .relative(fixture, module.id)
              .replaceAll(path.sep, "/");
            if (rendererBusinessSource(relative))
              throw new Error(`Excluded business source: ${relative}`);
            inputs.add(relative);
          },
        },
      ],
    });
    expect(inputs).toContain("src/renderer/core-contributions.ts");
    expect(inputs).toContain("src/renderer/canvas-workspace.tsx");
    expect(inputs).toContain("src/renderer/coding-workspace.tsx");
    expect(inputs).toContain("src/modules/example/note.tsx");
    expect(
      await readFile(path.join(fixture, "dist/renderer/index.html"), "utf8"),
    ).toContain('type="module"');
    // Run unchanged core interaction suites against this source selection, with
    // the same physically absent business UI files and production alias.
    const behavior = await promisify(execFile)(
      process.execPath,
      [
        "--bun",
        path.join(root, "node_modules/vitest/vitest.mjs"),
        "run",
        "test/asset-canvas-serialize.test.ts",
        "test/canvas-table-node.test.tsx",
        "test/canvas-markdown.test.tsx",
        "test/editor-canvas-viewport.test.tsx",
      ],
      { cwd: fixture, timeout: 90_000, maxBuffer: 4 * 1024 * 1024 },
    );
    expect(behavior.stdout).toContain("Tests");
    await writeFile(
      path.join(fixture, "core-behavior.log"),
      behavior.stdout + behavior.stderr,
    );
    console.info(`Renderer unavailable-source fixture: ${fixture}`);
  }, 120_000);
});
