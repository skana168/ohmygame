import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Shared persisted data/protocol contracts remain available. Implementations and
// shipped business resources do not. Resolve first so aliases and transitive
// imports cannot evade this check by changing the import spelling.
function excluded(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (
    relative.startsWith("src/story-web/") ||
    relative.startsWith("src/daemon/assets/story-templates/")
  )
    return true;
  if (relative.startsWith("src/daemon/publish/")) return true;
  if (
    /^src\/(?:daemon|desktop|renderer)\/(?:playable-|story-|game-|web-game-|playtest(?:[.-])|owned-playtest|ohmygame-agent-tools)/.test(
      relative,
    )
  )
    return true;
  return (
    [
      "src/daemon/cloud-models.ts",
      "src/renderer/auth.tsx",
      "src/renderer/cloud-quota.tsx",
      "src/renderer/pending-publish.ts",
    ].includes(relative) ||
    /^src\/renderer\/(?:community[.-]|publish-dialog|games\.tsx|desktop-game-preview|use-web-game-player)/.test(
      relative,
    )
  );
}

const surfaces = process.argv.includes("--core")
  ? ["src/daemon/agent-tools.ts", "src/daemon/preview.ts"]
  : ["src/daemon/server.ts", "src/desktop/main.ts", "src/renderer/main.tsx"];
const results = await Promise.allSettled(
  surfaces.map(async (entry) => {
    const result = await build({
      absWorkingDir: root,
      entryPoints: [entry],
      bundle: true,
      platform: entry.includes("renderer") ? "browser" : "node",
      format: "esm",
      packages: "external",
      write: false,
      metafile: true,
      outdir: "/unused-source-check-output",
      loader: {
        ".svg": "file",
        ".png": "file",
        ".webp": "file",
        ".woff2": "file",
        ".mp3": "file",
      },
      logLevel: "silent",
      plugins: [
        {
          name: "excluded-business-sources-unavailable",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, async (args) => {
              if (args.pluginData?.checked) return;
              const resolved = await builder.resolve(args.path, {
                kind: args.kind,
                importer: args.importer,
                resolveDir: args.resolveDir,
                pluginData: { checked: true },
              });
              if (resolved.errors.length) return { errors: resolved.errors };
              if (!resolved.external && excluded(resolved.path))
                return {
                  errors: [
                    {
                      text: `Excluded implementation unavailable: ${path.relative(root, resolved.path)} required by ${path.relative(root, args.importer) || entry}`,
                    },
                  ],
                };
              return { ...resolved, pluginData: undefined };
            });
          },
        },
      ],
    });
    const requiredExcluded = Object.keys(result.metafile.inputs).filter(
      (file) => excluded(path.resolve(root, file)),
    );
    if (requiredExcluded.length)
      throw new Error(`Excluded inputs remain: ${requiredExcluded.join(", ")}`);
    console.log(
      `PASS ${entry}: ${Object.keys(result.metafile.inputs).length} source inputs; no excluded implementation`,
    );
  }),
);
for (let i = 0; i < results.length; i++) {
  const result = results[i];
  if (result.status === "rejected") {
    console.error(`FAIL ${surfaces[i]}`);
    for (const error of result.reason.errors ?? [
      { text: String(result.reason) },
    ])
      console.error(error.text);
  }
}
if (results.some((result) => result.status === "rejected"))
  process.exitCode = 1;
