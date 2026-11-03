import { cp, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { excluded } from "./application-source-boundary.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination = process.argv[2] && path.resolve(process.argv[2]);
if (!destination)
  throw new Error("Usage: bun run export:template /absolute/new-directory");
if (destination === root || destination.startsWith(`${root}${path.sep}`))
  throw new Error("Export outside the source checkout to a new directory.");
// Atomic refusal also protects an existing empty directory. Never merge exports.
await mkdir(destination);
const scripts = [
  "application-source-boundary.mjs",
  "application-host-build.mjs",
  "check-application-sources.mjs",
  "typecheck-host.mjs",
  "build-host.mjs",
  "prepare-preinstalled-plugins.ts",
  "runtime-directory.ts",
  "test-node-runtime.mjs",
  "test-web-game-runtime.mjs",
  "desktop-capability-runtime-check.cjs",
];
const tests = [
  "provider-environment.ts",
  "dom-environment.ts",
  "fixtures/plugin-mcp-server.mjs",
  "asset-canvas-serialize.test.ts",
  "canvas-table-node.test.tsx",
  "canvas-markdown.test.tsx",
  "editor-canvas-viewport.test.tsx",
];
for (const name of [
  "src",
  "patches",
  "packages/plugin-ui",
  "config/preinstalled-plugins.json",
  "config/plugin-assets",
  "LICENSE",
  "application-identity.cjs",
  "application-identity.d.cts",
  "tsconfig.json",
  "tsconfig.build.json",
  "vite.config.ts",
  "index.html",
  "bun.lock",
  "bunfig.toml",
  ".oxlintrc.json",
  ".gitignore",
  ...scripts.map((file) => `scripts/${file}`),
  ...tests.map((file) => `test/${file}`),
]) {
  await cp(path.join(root, name), path.join(destination, name), {
    recursive: true,
    filter: async (source) => {
      if ((await lstat(source)).isSymbolicLink())
        throw new Error(`Template inputs must be ordinary files: ${source}`);
      return !excluded(root, source);
    },
  });
}
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
pkg.name = "ohmytemplate";
pkg.description =
  "A local-first agent workbench with an example source module.";
pkg.scripts = {
  build: "bun run build:host && bun run build:renderer",
  "build:host": "node --import tsx scripts/build-host.mjs",
  "build:renderer": "bun --bun node_modules/vite/bin/vite.js build",
  typecheck:
    "node scripts/check-application-sources.mjs --non-game --typecheck",
  lint: "oxlint --deny-warnings",
  test: "bun --bun node_modules/vitest/vitest.mjs run",
  "prepare:preinstalled-plugins":
    "node --import tsx scripts/prepare-preinstalled-plugins.ts",
  dev: pkg.scripts.dev,
  "dev:daemon":
    "bun run prepare:preinstalled-plugins && node --import tsx --watch src/daemon/server.ts --dev",
  "dev:renderer": pkg.scripts["dev:renderer"],
  "dev:desktop":
    'bun run prepare:preinstalled-plugins && bun run build:host && bun --bun node_modules/concurrently/dist/bin/index.js --kill-others --names renderer,desktop "bun run dev:renderer" "bun --bun node_modules/electron/cli.js ."',
  start: pkg.scripts.start,
  "start:desktop":
    "bun run prepare:preinstalled-plugins && bun run build && bun --bun node_modules/electron/cli.js . --built-renderer",
  "test:node-runtime":
    "bun run build:host && node scripts/test-node-runtime.mjs --non-game",
  "test:desktop": "node scripts/test-web-game-runtime.mjs --non-game",
};
await writeFile(path.join(destination, "package.json"), json(pkg));
// Only the workspace name changes; dependency versions, integrity and patches stay pinned.
const lock = await readFile(path.join(destination, "bun.lock"), "utf8");
await writeFile(
  path.join(destination, "bun.lock"),
  lock.replace('"name": "ohmygame"', '"name": "ohmytemplate"'),
);
await writeFile(
  path.join(destination, "application.json"),
  json({
    name: "OhMyTemplate",
    packageName: "ohmytemplate",
    desktopId: "org.example.ohmytemplate",
    dataDirectory: ".data",
  }),
);
await writeFile(
  path.join(destination, "src/shared/application-selection.ts"),
  'export const applicationCompositionId: "ohmygame" | "non-game" = "non-game";\n',
);
// Select the real core assembly for Node/tsx watch as well as compiled builds.
await writeFile(
  path.join(destination, "src/daemon/host-business.ts"),
  'export { hostBusiness, requireHostBusiness } from "./non-game-host.js";\nexport type { HostBusiness } from "./host-business-contract.js";\n',
);
for (const name of ["README.md", "README.zh-CN.md", "CHANGELOG.md", "NOTICE"])
  await cp(
    path.join(root, "templates/standalone", name),
    path.join(destination, name),
  );
console.log(`Standalone template: ${destination}`);
