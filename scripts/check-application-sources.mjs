import { typecheckHost } from "./typecheck-host.mjs";
import { hostAssemblyPlugin } from "./application-host-build.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

import { excluded as excludedSource } from "./application-source-boundary.mjs";
const excluded = (file) => excludedSource(root, file);

const target = process.argv
  .find((arg) => arg.startsWith("--target="))
  ?.split("=")[1];
const targets = {
  host: "src/daemon/server.ts",
  desktop: "src/desktop/main.ts",
  renderer: "src/renderer/main.tsx",
};
if (target && !Object.hasOwn(targets, target))
  throw new Error(`Unknown application target: ${target}`);
const surfaces = target
  ? [targets[target]]
  : process.argv.includes("--core")
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
        hostAssemblyPlugin(root, process.argv.includes("--non-game")),
        {
          name: "application-renderer-assembly",
          setup(builder) {
            if (!process.argv.includes("--non-game")) return;
            builder.onResolve(
              { filter: /(?:^|\/)business-contributions\.js$/ },
              () => ({
                path: path.join(root, "src/renderer/core-contributions.ts"),
              }),
            );
          },
        },
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
    if (process.argv.includes("--typecheck")) {
      const inputs = Object.keys(result.metafile.inputs).filter((file) =>
        /^src\/.*\.(?:ts|tsx|cts)$/.test(file),
      );
      if (entry.includes("renderer")) inputs.push("src/vite-env.d.ts");
      typecheckHost(root, inputs, entry);
    }
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
