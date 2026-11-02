import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ExtensionHosts } from "../dist/daemon/extension-hosts.js";
import { startDaemon } from "../dist/desktop/daemon-process.js";
import { checkStoryWeb } from "./check-story-web.mjs";

assert(
  !process.versions.bun,
  "The application runtime check must execute with Node.js",
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = await mkdtemp(path.join(tmpdir(), "ohmygame-node-runtime-"));
let daemon;
try {
  daemon = await startDaemon({
    daemonEntry: path.join(root, "dist", "daemon", "server.js"),
    dataDirectory: path.join(directory, "data"),
    piAgentDirectory: path.join(directory, "pi-agent"),
    token: "node-runtime-check",
    allowedOrigins: [],
  });
  const unauthorized = await fetch(`${daemon.runtime.url}/projects`);
  assert.equal(unauthorized.status, 401);
  for (const route of ["/health", "/projects"]) {
    const response = await fetch(`${daemon.runtime.url}${route}`, {
      headers: { authorization: `Bearer ${daemon.runtime.token}` },
      signal: AbortSignal.timeout(5_000),
    });
    assert.equal(response.status, 200, `${route} must be available on Node`);
    const body = await response.json();
    if (route === "/projects") assert.deepEqual(body, []);
  }
  await checkStoryWeb(daemon.runtime);
  const headers = { authorization: `Bearer ${daemon.runtime.token}`, "content-type": "application/json" };
  const projects = await fetch(`${daemon.runtime.url}/projects`, { headers }).then(response => response.json());
  const story = projects.find(project => project.type === "interactive-story");
  assert(story, "The story fixture must exist before checking project archives");
  const exported = await fetch(`${daemon.runtime.url}/projects/${story.id}/export`, {
    method: "POST", headers: { authorization: headers.authorization }, signal: AbortSignal.timeout(10_000),
  });
  assert.equal(exported.status, 200, "Project export must work on Node");
  const imported = await fetch(`${daemon.runtime.url}/projects/import`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/vnd.ohmygame.project-archive" },
    body: await exported.arrayBuffer(), signal: AbortSignal.timeout(10_000),
  });
  assert.equal(imported.status, 201, "Project import must work on Node");
  const copy = await imported.json();
  assert.notEqual(copy.id, story.id);
  assert.equal(copy.type, story.type);
  assert.equal(copy.name, story.name);
  const createdResponse = await fetch(`${daemon.runtime.url}/connections`, {
    method: "POST", headers, body: JSON.stringify({ displayName: "Node runtime fixture", definition: {
      command: process.execPath, args: [path.join(root, "test", "fixtures", "plugin-mcp-server.mjs")],
    } }), signal: AbortSignal.timeout(10_000),
  });
  const created = await createdResponse.text();
  assert.equal(createdResponse.status, 201, created);
  const connection = JSON.parse(created);
  const tested = await fetch(`${daemon.runtime.url}/connections/${encodeURIComponent(connection.id)}/test`, {
    method: "POST", headers, body: "{}", signal: AbortSignal.timeout(30_000),
  });
  assert.equal(tested.status, 200);
  const result = await tested.json();
  assert.equal(result.status, "connected", JSON.stringify(result));
  assert.equal(result.toolCount, 1);
  await checkExtensionHosts(path.join(directory, "native-plugin"));
  await checkApplicationIdentity(path.join(directory, "independent-app"));
} finally {
  await daemon?.stop();
  await rm(directory, { recursive: true, force: true });
}
console.log(
  `Node.js ${process.versions.node}: daemon startup, authenticated API, story creation, upgrade and preview, project export/import, native MCP runtime, extension hosts, configured independent application restart and graceful shutdown passed`,
);

// The built host runs plugins' native code, and its heap limit holds on Node.
async function checkExtensionHosts(folder) {
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, "index.mjs"), `export function activate(context) {
    context.registerTool("ping", (input) => ({ pong: input }));
    context.registerTool("hog", () => { const kept = []; for (;;) kept.push(new Array(1e5).fill(1)); });
  }`);
  const hosts = new ExtensionHosts({ maxHeapMb: 32, crashLimit: 1 });
  const plugin = { id: "check/native", version: "1.0.0", root: folder, entry: "index.mjs", tools: ["ping", "hog"], commands: [], projectTypes: [] };
  try {
    assert.deepEqual(await hosts.invoke({ scope: "app", plugin, tool: "ping", input: 1 }), { pong: 1 });
    const crash = await hosts.invoke({ scope: "app", plugin, tool: "hog", timeoutMs: 20_000 }).then(() => undefined, error => error);
    assert.equal(crash?.code, "crashed", "Running out of heap must crash only the extension host");
    assert.equal(hosts.quarantined("check/native"), true);
  } finally {
    await hosts.dispose();
  }
}


// A copied build uses its own configuration, without any initializer or source checkout.
async function checkApplicationIdentity(folder) {
  await mkdir(folder, { recursive: true });
  await cp(path.join(root, "dist"), path.join(folder, "dist"), { recursive: true });
  await cp(path.join(root, ".runtime/preinstalled-plugins"), path.join(folder, ".runtime/preinstalled-plugins"), { recursive: true });
  await cp(path.join(root, "application-identity.cjs"), path.join(folder, "application-identity.cjs"));
  await writeFile(path.join(folder, "package.json"), '{"type":"module","name":"identity-fixture"}');
  await writeFile(path.join(folder, "application.json"), JSON.stringify({
    name: "Studio Notes", packageName: "studio-notes", desktopId: "org.example.notes", dataDirectory: "notes-state",
  }));
  await symlink(path.join(root, "node_modules"), path.join(folder, "node_modules"), process.platform === "win32" ? "junction" : "dir");
  const environment = { ...process.env, DAEMON_PORT: "0", DAEMON_HOST: "127.0.0.1", OHMYGAME_DAEMON_TOKEN: "identity-check" };
  for (const key of ["OHMYGAME_DATA_DIR", "PI_CODING_AGENT_DIR", "OHMYGAME_DAEMON_TOKEN_STDIN"]) delete environment[key];
  const launch = async () => {
    const child = spawn(process.execPath, [path.join(folder, "dist/daemon/server.js")], { env: environment, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { child.kill(); reject(new Error(`Identity startup timed out: ${output}`)); }, 30_000);
      child.on("error", error => { clearTimeout(timer); reject(error); });
      child.on("exit", code => { clearTimeout(timer); reject(new Error(`Identity daemon exited ${code}: ${output}`)); });
      child.stderr.on("data", chunk => { output += chunk; });
      child.stdout.on("data", chunk => {
        output += chunk;
        const address = output.match(/Server listening at (http:\/\/127\.0\.0\.1:\d+)/)?.[1];
        if (address) { clearTimeout(timer); resolve(address); }
      });
    });
    return { url, stop: async () => { if (child.exitCode === null) { const exited = once(child, "exit"); child.kill(); await exited; } } };
  };
  const request = async (running, route, method = "GET", payload) => {
    const response = await fetch(`${running.url}${route}`, { method, headers: { authorization: "Bearer identity-check", "content-type": "application/json" }, ...(payload ? { body: JSON.stringify(payload) } : {}), signal: AbortSignal.timeout(10_000) });
    assert(response.ok, `${method} ${route}: ${await response.clone().text()}`);
    return response.json();
  };
  let running = await launch();
  try {
    await request(running, "/projects", "POST", { name: "Independent notes", type: "general" });
    await request(running, "/settings/models/providers/meshy", "PUT", { apiKey: "identity-fixture-key" });
    await running.stop();
    running = await launch();
    const projects = await request(running, "/projects");
    assert.equal(projects[0]?.name, "Independent notes");
    assert(projects[0].workspacePath.startsWith(path.join(await realpath(folder), "notes-state")), "Standalone startup must honor configured storage");
    assert.equal((await request(running, "/settings/models/providers/meshy")).configured, true);
  } finally { await running.stop(); }
}
