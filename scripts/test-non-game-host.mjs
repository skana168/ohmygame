import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { excluded } from "./application-source-boundary.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await mkdtemp(
  path.join(tmpdir(), "ohmytemplate-host-unavailable-"),
);
const unavailable = [];
async function inventory(directory) {
  for (const item of await readdir(path.join(root, directory), {
    withFileTypes: true,
  })) {
    const relative = path.join(directory, item.name);
    if (item.isDirectory()) await inventory(relative);
    else if (excluded(root, path.join(root, relative)))
      unavailable.push(relative);
  }
}
await inventory("src");
for (const name of [
  "src",
  "scripts",
  "test/fixtures",
  "package.json",
  "tsconfig.json",
  "application-identity.cjs",
  "application-identity.d.cts",
  "application.json",
  ".runtime/preinstalled-plugins",
  "packages/plugin-ui",
]) {
  await cp(path.join(root, name), path.join(fixture, name), {
    recursive: true,
    filter: (source) => !excluded(root, source),
  });
}
await symlink(
  path.join(root, "node_modules"),
  path.join(fixture, "node_modules"),
  process.platform === "win32" ? "junction" : "dir",
);
await mkdir(path.join(fixture, "evidence"));
await writeFile(
  path.join(fixture, "evidence/unavailable-sources.json"),
  JSON.stringify(unavailable, null, 2),
);
function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: fixture,
    stdio: "inherit",
  });
  assert.equal(result.status, 0, args.join(" "));
}
console.log(`Unavailable-source fixture: ${fixture}`);
console.log(
  `${unavailable.length} business implementation/resource files absent; full list: ${fixture}/evidence/unavailable-sources.json`,
);
run(["scripts/check-application-sources.mjs", "--target=host", "--non-game"]);
run(["--import", "tsx", "scripts/build-host.mjs", "--non-game"]);
run(["scripts/test-node-runtime.mjs", "--non-game"]);
