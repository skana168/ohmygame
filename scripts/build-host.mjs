import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";
import { applicationComposition } from "../src/shared/application-composition.ts";
import { typecheckHost } from "./typecheck-host.mjs";
import { hostAssemblyPlugin } from "./application-host-build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nonGame =
  process.argv.includes("--non-game") ||
  applicationComposition.id === "non-game";
if (!nonGame) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  await import("./build-story-resources.mjs");
} else {
  const desktop = spawnSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", "src/desktop/tsconfig.core.json"],
    { cwd: root, stdio: "inherit" },
  );
  if (desktop.status !== 0) process.exit(desktop.status ?? 1);
  // Discover the selected full daemon graph, then compile its modules separately.
  // Separate modules preserve import.meta.url, used by worker and resource paths.
  const graph = await build({
    absWorkingDir: root,
    entryPoints: [
      "src/daemon/server.ts",
      "src/daemon/extension-hosts.ts",
      "src/daemon/extension-host-process.ts",
      "src/desktop/daemon-process.ts",
    ],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    write: false,
    metafile: true,
    outdir: "/unused-host-graph",
    plugins: [hostAssemblyPlugin(root, true)],
  });
  typecheckHost(
    root,
    Object.keys(graph.metafile.inputs).filter(
      (file) => file.startsWith("src/") && file.endsWith(".ts"),
    ),
  );
  const { readFile } = await import("node:fs/promises");
  for (const input of Object.keys(graph.metafile.inputs)) {
    if (!input.startsWith("src/") || !input.endsWith(".ts")) continue;
    let source = await readFile(path.join(root, input), "utf8");
    if (input === "src/shared/application-selection.ts")
      source = 'export const applicationCompositionId = "non-game" as const;';
    const compiled = await transform(source, {
      loader: "ts",
      format: "esm",
      target: "node22",
      sourcemap: "external",
      sourcefile: input,
    });
    const outputs = [input.replace(/^src\//, "dist/").replace(/\.ts$/, ".js")];
    if (input === "src/daemon/non-game-host.ts")
      outputs.push("dist/daemon/host-business.js");
    for (const output of outputs) {
      await mkdir(path.dirname(path.join(root, output)), { recursive: true });
      await writeFile(path.join(root, output), compiled.code);
      await writeFile(path.join(root, `${output}.map`), compiled.map);
    }
  }
  console.log(
    `Compiled non-game host: ${Object.keys(graph.metafile.inputs).length} selected source inputs; no story resources prepared.`,
  );
}
