import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
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
const nonGame = process.argv.includes("--non-game");
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
  if (nonGame) await checkNonGame(daemon.runtime, path.join(directory, "data"));
  else await checkStoryWeb(daemon.runtime);
  const headers = { authorization: `Bearer ${daemon.runtime.token}`, "content-type": "application/json" };
  const projects = await fetch(`${daemon.runtime.url}/projects`, { headers }).then(response => response.json());
  const story = projects.find(project => project.type === (nonGame ? "general" : "interactive-story"));
  assert(story, "The selected composition fixture must exist before checking project archives");
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
  if (nonGame) {
    const workspace = await fetch(`${daemon.runtime.url}/projects/${copy.id}/canvas/workspace`, { headers }).then(response => response.json());
    const board = await fetch(`${daemon.runtime.url}/projects/${copy.id}/canvas/boards/${workspace.boards[0].id}`, { headers }).then(response => response.json());
    assert(board.board.nodes.some(node => node.id === "runtime-note" && node.data.value.text === "Persisted non-game note"), "Archive import must retain custom module data");
  }
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
  `Node.js ${process.versions.node}: daemon startup, authenticated API, ${nonGame ? "non-game defaults and custom canvas persistence" : "story creation, upgrade and preview"}, project export/import, native MCP runtime, extension hosts, configured independent application restart and graceful shutdown passed`,
);

// Same authenticated built daemon and persisted canvas API as application consumers.
async function checkNonGame(runtime, dataDirectory) {
  const headers = { authorization: `Bearer ${runtime.token}`, "content-type": "application/json" };
  const request = async (route, method = "GET", body) => {
    const response = await fetch(runtime.url + route, { method, headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(10_000) });
    assert(response.ok, `${method} ${route}: ${await response.clone().text()}`);
    return response.json();
  };
  const project = await request("/projects", "POST", { name: "Non-game runtime notes" });
  assert.equal(project.type, "general");
  assert.equal(project.gameCapability, false);
  assert.equal(project.storyCapability, false);
  assert.deepEqual(project.workspaceManifest.modules, [{ id: "example", config: {} }]);
  assert.deepEqual((await request("/project-types")).map(type => type.id), ["general"]);
  for (const route of ["/cloud/session", "/community/games", "/playable/presets"]) {
    assert.equal((await fetch(runtime.url + route, { headers })).status, 404);
  }
  const base = `/projects/${project.id}/canvas`;
  const workspace = await request(`${base}/workspace`);
  const boardRoute = `${base}/boards/${workspace.boards[0].id}`;
  const detail = await request(boardRoute);
  detail.board.nodes.push({ id: "runtime-note", type: "custom", position: { x: 20, y: 30 },
    data: { module: "example", kind: "note", value: { text: "Persisted non-game note", done: false } } });
  detail.board.editorLayout.nodes["runtime-note"] = { x: 20, y: 30 };
  await request(boardRoute, "PUT", detail);
  assert((await request(boardRoute)).board.nodes.some(node => node.id === "runtime-note" && node.data.value.text === "Persisted non-game note"));
  assert.equal((await request(`${base}/workspace`)).mainDocumentId, undefined);
  await request("/settings/external-agents", "PUT", { enabled: true });
  const endpoint = JSON.parse(await readFile(path.join(dataDirectory, "external-mcp/endpoint.json"), "utf8"));
  let session;
  let id = 0;
  const rpc = async (method, params = {}) => {
    const response = await fetch(endpoint.url, { method: "POST", headers: {
      "content-type": "application/json", authorization: `Bearer ${endpoint.token}`,
      ...(session ? { "mcp-session-id": session } : {}),
    }, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }), signal: AbortSignal.timeout(10_000) });
    assert.equal(response.status, 200);
    session ??= response.headers.get("mcp-session-id");
    return response.json();
  };
  await rpc("initialize", { protocolVersion: "2025-06-18" });
  const listed = await rpc("tools/list");
  const names = listed.result.tools.map(tool => tool.name);
  for (const name of ["example_echo", "example_note", "canvas_check", "generate_image"]) assert(names.includes(name), `${name} must remain available`);
  for (const name of ["game_use", "playable_check", "playable_add_node"]) assert(!names.includes(name), `${name} must be absent`);
  await rpc("tools/call", { name: "open_project", arguments: { project: project.id } });
  const echo = await rpc("tools/call", { name: "example_echo", arguments: { message: "Source-independent host" } });
  assert.deepEqual(echo.result.content, [{ type: "text", text: "Source-independent host" }]);
  const saved = await request(boardRoute);
  const note = await rpc("tools/call", { name: "example_note", arguments: { boardId: saved.board.id, nodeId: "runtime-tool-note", revision: saved.revision, text: "Saved by an actual module tool", done: false } });
  assert(!note.result.isError, JSON.stringify(note));
  assert((await request(boardRoute)).board.nodes.some(node => node.id === "runtime-tool-note" && node.data.value.text === "Saved by an actual module tool"));
  const rejected = await rpc("tools/call", { name: "game_use", arguments: {} });
  assert.equal(rejected.result.isError, true);

}

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
    const project = await request(running, "/projects", "POST", { name: "Independent notes", type: "general" });
    let boardRoute;
    if (nonGame) {
      const workspace = await request(running, `/projects/${project.id}/canvas/workspace`);
      boardRoute = `/projects/${project.id}/canvas/boards/${workspace.boards[0].id}`;
      const detail = await request(running, boardRoute);
      detail.board.nodes.push({ id: "restart-note", type: "custom", position: { x: 20, y: 30 }, data: { module: "example", kind: "note", value: { text: "Survives process restart", done: false } } });
      detail.board.editorLayout.nodes["restart-note"] = { x: 20, y: 30 };
      await request(running, boardRoute, "PUT", detail);
    }
    await request(running, "/settings/models/providers/meshy", "PUT", { apiKey: "identity-fixture-key" });
    await running.stop();
    running = await launch();
    const projects = await request(running, "/projects");
    assert.equal(projects[0]?.name, "Independent notes");
    if (boardRoute) {
      const detail = await request(running, boardRoute);
      assert(detail.board.nodes.some(node => node.id === "restart-note" && node.data.value.text === "Survives process restart"));
      assert.deepEqual(projects[0].workspaceManifest.modules, [{ id: "example", config: {} }]);
    }
    assert(projects[0].workspacePath.startsWith(path.join(await realpath(folder), "notes-state")), "Standalone startup must honor configured storage");
    assert.equal((await request(running, "/settings/models/providers/meshy")).configured, true);
  } finally { await running.stop(); }
}
