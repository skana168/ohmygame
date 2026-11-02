import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const capabilities = process.argv.includes("--capabilities");
const directory = process.env.OHMYGAME_SMOKE_DIRECTORY ?? await mkdtemp(path.join(tmpdir(), "ohmygame-desktop-game-"));
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
try {
  const child = spawn(require("electron"), [path.join(import.meta.dirname, capabilities ? "desktop-capability-runtime-check.cjs" : "web-game-runtime-check.cjs"), directory], { stdio: "inherit", env: environment });
  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  process.exitCode = code;
  if (capabilities && code === 0) {
    const targets = JSON.parse(await readFile(path.join(directory, "shutdown-targets.json"), "utf8"));
    for (const url of targets) {
      assert.ok(url, "Shutdown target was running before application quit");
      await assert.rejects(fetch(url, { signal: AbortSignal.timeout(1000) }), `Application shutdown releases ${url}`);
    }
    console.log("Application save/quit handshake stopped the owned daemon and remaining game preview");
  }
} finally {
  if (!process.env.OHMYGAME_SMOKE_DIRECTORY) await rm(directory, { recursive: true, force: true });
}
