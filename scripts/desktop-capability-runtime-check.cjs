// Real application/daemon/preload smoke, independent of the native resize smoke.
const { app, BrowserWindow, BaseWindow, webContents } = require("electron");
const assert = require("node:assert/strict");
const { mkdir, readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
const directory = process.argv[2];
const nonGame = process.argv.includes("--non-game");
const coreDesktop = nonGame || process.argv.includes("--core-desktop");
process.env.OHMYGAME_DATA_DIR = path.join(directory, "data");
process.env.PI_CODING_AGENT_DIR = path.join(directory, "pi");
app.setPath("userData", path.join(directory, "profile"));
app.setPath("logs", path.join(directory, "logs"));
process.argv.push("--built-renderer");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function eventually(predicate, label) {
  const end = Date.now() + 30000;
  while (!(await predicate())) {
    if (Date.now() > end) throw new Error(`Timed out: ${label}`);
    await sleep(50);
  }
}
const deadline = setTimeout(() => {
  console.error("Capability smoke timed out");
  app.exit(2);
}, 120000);
(async () => {
  if (nonGame) {
    const { applicationCompositionId } = require(
      path.join(root, "dist/shared/application-selection.js"),
    );
    assert.equal(
      applicationCompositionId,
      "non-game",
      "Non-game smoke requires the selected non-game build",
    );
  }
  // Sentry bootstrap must run synchronously before Electron's ready event.
  if (coreDesktop && !nonGame)
    await import(pathToFileURL(path.join(root, "dist/desktop/main.js")).href);
  else require(path.join(root, "dist/desktop/bootstrap.cjs"));
  await mkdir(directory, { recursive: true });
  let editor;
  await eventually(() => {
    editor = BrowserWindow.getAllWindows().find((w) =>
      w.webContents.getURL().includes("/renderer/index.html"),
    );
    return editor && !editor.webContents.isLoading();
  }, "application window");
  const js = (source) => editor.webContents.executeJavaScript(source, true);
  await eventually(() => js("!!window.ohMyGameDesktop"), "sandboxed preload");
  const runtime = await js("window.ohMyGameDesktop.runtime");
  async function api(route, method = "GET", body) {
    const response = await fetch(runtime.daemonUrl + route, {
      method,
      headers: {
        authorization: `Bearer ${runtime.token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const value = await response.json();
    assert.ok(
      response.ok,
      `${method} ${route}: ${response.status} ${JSON.stringify(value)}`,
    );
    return value;
  }
  await api("/settings/onboarding", "PUT", {
    status: "skipped",
    step: "connect",
  });
  const notes = await api("/projects", "POST", {
    name: "Desktop capability notes",
    type: "general",
    ...(nonGame ? {} : { workspaceManifest: { version: 1, modules: [] } }),
  });
  const game = coreDesktop
    ? undefined
    : await api("/projects", "POST", {
        name: "Desktop enabled game",
        type: "general",
        workspaceManifest: {
          version: 1,
          modules: [{ id: "game", config: {} }],
        },
      });
  for (const project of [notes, game].filter(Boolean)) {
    await writeFile(
      path.join(project.workspacePath, "index.html"),
      "<!doctype html><h1>Reusable desktop preview</h1><script>window.smokeReady = true</script>",
    );
    await api(`/projects/${project.id}/settings/run`, "PUT", {
      previewMode: "static",
      startupDirectory: ".",
      startupScript: "dev",
      previewPath: "/",
      previewViewport: "fit",
      webPreviewEnabled: true,
    });
  }
  await editor.webContents.reload();
  await eventually(() => !editor.webContents.isLoading(), "onboarding reload");
  await js(`location.hash = '#/projects/${notes.id}/design'`);
  await eventually(
    () => js(`document.body.innerText.includes('Desktop capability notes')`),
    "non-game workspace",
  );
  console.log("DOM", await js("document.body.innerText"));
  const started = await api(`/projects/${notes.id}/preview?reuse=1`, "POST");
  assert.match(
    await (await fetch(started.url)).text(),
    /Reusable desktop preview/,
  );
  // Select the rendered Preview navigation, rather than injecting an iframe.
  await js(
    `(() => { const b = [...document.querySelectorAll('button')].find(b => ['Preview', '预览'].includes(b.textContent.trim())); if (!b) throw Error('Missing Preview navigation'); b.click(); })()`,
  );
  await eventually(
    () =>
      editor.webContents.mainFrame.frames.some((frame) =>
        frame.url.startsWith(started.url),
      ),
    "reusable iframe",
  );
  const frame = editor.webContents.mainFrame.frames.find((frame) =>
    frame.url.startsWith(started.url),
  );
  assert.equal(await frame.executeJavaScript("window.smokeReady"), true);
  assert.equal(
    await frame.executeJavaScript("typeof window.ohMyGameDesktop"),
    "undefined",
  );
  const controls = await js(
    `Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent.trim(), title: b.title, label: b.getAttribute('aria-label') }))`,
  );
  console.log("NON_GAME_CONTROLS", JSON.stringify(controls));
  assert.equal(
    await js(
      `document.querySelectorAll('.preview-play-button,.preview-record-button,.preview-tuning-button,.preview-agent-watch-button').length`,
    ),
    0,
    "No game controls",
  );
  await eventually(
    () =>
      js(
        `(() => { const f = document.querySelector('iframe.preview-frame'); const r = f?.getBoundingClientRect(); return r?.width > 100 && r?.height > 100 && !f.closest('[hidden]'); })()`,
      ),
    "visible reusable iframe layout",
  );
  await frame.executeJavaScript(
    "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
  );
  await sleep(250);
  await writeFile(
    path.join(directory, "non-game-preview.png"),
    (await editor.webContents.capturePage()).toPNG(),
  );
  const count = BaseWindow.getAllWindows().length;
  const id = JSON.stringify(notes.id),
    viewport = "{width:640,height:480}";
  for (const invocation of [
    `webGamePlayer.open(${id},{path:'/',viewport:${viewport}})`,
    `webGamePlayer.preview.attach(${id},'unauthorized',${JSON.stringify(started.url)},{bounds:{x:0,y:0,width:640,height:480},visible:true})`,
    `webGamePlayer.recording.start(${id})`,
    `openPlaytest(${id},${viewport})`,
  ]) {
    const error = await js(
      `window.ohMyGameDesktop.${invocation}.then(() => null, e => e.message)`,
    );
    assert.match(error ?? "", /game capability/i, invocation);
    assert.equal(
      BaseWindow.getAllWindows().length,
      count,
      "Rejected IPC creates no window",
    );
  }
  assert.deepEqual(await api(`/projects/${notes.id}/game-capability`), {
    enabled: false,
  });
  const tuning = await fetch(
    `${runtime.daemonUrl}/projects/${notes.id}/tuning`,
    { headers: { authorization: `Bearer ${runtime.token}` } },
  );
  assert.equal(tuning.status, nonGame ? 404 : 409);
  console.log("Non-game iframe, controls, direct IPC denial passed");
  if (!coreDesktop) {
    // External MCP crosses the daemon-to-desktop driver transport as real agents do.
    await api("/settings/external-agents", "PUT", { enabled: true });
    const endpoint = JSON.parse(
      await readFile(
        path.join(process.env.OHMYGAME_DATA_DIR, "external-mcp/endpoint.json"),
        "utf8",
      ),
    );
    let session,
      sequence = 0;
    async function rpc(method, params) {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${endpoint.token}`,
          "content-type": "application/json",
          ...(session ? { "mcp-session-id": session } : {}),
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: ++sequence,
          method,
          params,
        }),
      });
      session ??= response.headers.get("mcp-session-id");
      assert.ok(response.ok, await response.clone().text());
      const answer = await response.json();
      assert.equal(answer.error, undefined, JSON.stringify(answer));
      return answer.result;
    }
    await rpc("initialize", { protocolVersion: "2025-06-18" });
    const call = (name, args) => rpc("tools/call", { name, arguments: args });
    await call("open_project", { project: notes.id });
    assert.ok(
      !(await rpc("tools/list")).tools.some((t) => t.name === "game_use"),
    );
    const rejected = await call("game_use", { operation: "open" });
    assert.equal(rejected.isError, true, JSON.stringify(rejected));
    assert.equal(
      (await js("window.ohMyGameDesktop.agentPlaytests.state()"))
        .activeSessions,
      0,
    );
    assert.equal(BaseWindow.getAllWindows().length, count);
    await call("open_project", { project: game.id });
    assert.ok(
      (await rpc("tools/list")).tools.some((t) => t.name === "game_use"),
    );
    const opened = await call("game_use", {
      operation: "open",
      viewport: { width: 640, height: 480 },
    });
    assert.ok(!opened.isError, JSON.stringify(opened));
    assert.equal(
      (await js("window.ohMyGameDesktop.agentPlaytests.state()"))
        .activeSessions,
      1,
    );
    // Switching the bound workspace releases the old workspace's owned session.
    await call("open_project", { project: notes.id });
    await eventually(
      async () =>
        (await js("window.ohMyGameDesktop.agentPlaytests.state()"))
          .activeSessions === 0,
      "external owner cleanup",
    );
    assert.equal(
      BaseWindow.getAllWindows().length,
      count,
      "Workspace switch destroys owned driver window",
    );
    await fetch(endpoint.url, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${endpoint.token}`,
        "mcp-session-id": session,
      },
    });
    console.log(
      "Agent tool selection, real desktop driver and workspace owner cleanup passed",
    );

    await js(
      `window.ohMyGameDesktop.webGamePlayer.open(${JSON.stringify(game.id)},{path:'/',viewport:${viewport}})`,
    );
    assert.equal(
      (
        await js(
          `window.ohMyGameDesktop.webGamePlayer.state(${JSON.stringify(game.id)})`,
        )
      ).open,
      true,
    );
    const native = webContents
      .getAllWebContents()
      .find((c) => c.getURL().endsWith("/web-game-host.html"));
    assert.ok(native, "Enabled game creates native player");
    await eventually(
      () => native.mainFrame.frames.length > 0,
      "enabled game frame",
    );
    assert.equal(
      await native.mainFrame.frames[0].executeJavaScript("window.smokeReady"),
      true,
    );
    await js(
      `window.ohMyGameDesktop.webGamePlayer.close(${JSON.stringify(game.id)})`,
    );
    await eventually(() => native.isDestroyed(), "owned player cleanup");
    await api(`/projects/${notes.id}/preview`, "DELETE");
    await assert.rejects(
      fetch(started.url, { signal: AbortSignal.timeout(1000) }),
    );
    console.log(
      "Enabled game IPC and owned native player/preview cleanup passed",
    );
  } else {
    const denied = await js(
      `window.ohMyGameDesktop.agentPlaytests.state().then(() => null, e => e.message)`,
    );
    assert.match(denied, /game capability is unavailable in this application/);
    const accountDenied = await js(
      `window.ohMyGameDesktop.auth.callbackUrl().then(() => null, e => e.message)`,
    );
    assert.match(
      accountDenied,
      /account capability is unavailable in this application/,
    );
    await api(`/projects/${notes.id}/preview`, "DELETE");
    await assert.rejects(
      fetch(started.url, { signal: AbortSignal.timeout(1000) }),
    );
    console.log(
      "Absent native game/account contributions reject direct IPC; reusable preview cleanup passed",
    );
  }
  // Supplemental ticket04 persistence flow in the actual desktop renderer.
  const canvas = `/projects/${notes.id}/canvas`;
  await api(`${canvas}/workspace`);
  const doc = await api(`${canvas}/documents`, "POST", {
    title: "Desktop initial title",
  });
  await api(`${canvas}/boards`, "POST", { name: "Desktop research" });
  const workspace = await api(`${canvas}/workspace`);
  assert.equal(workspace.boards.length, 2);
  const boardId = workspace.boards[1].id;
  const boardRoute = `${canvas}/boards/${boardId}`;
  const board = await api(boardRoute);
  board.board.nodes.push({
    id: "desktop-notes",
    type: "document",
    position: { x: 50, y: 70 },
    data: { documentId: doc.document.id },
  });
  board.board.editorLayout.nodes["desktop-notes"] = {
    x: 50,
    y: 70,
    width: 500,
    height: 350,
  };
  if (nonGame) {
    board.board.nodes.push({
      id: "example-note",
      type: "custom",
      position: { x: 600, y: 70 },
      data: {
        module: "example",
        kind: "note",
        value: { text: "Desktop custom note", done: false },
      },
    });
    board.board.editorLayout.nodes["example-note"] = {
      x: 600,
      y: 70,
      width: 320,
      height: 220,
    };
  }
  await api(boardRoute, "PUT", board);
  await js(
    `localStorage.setItem('canvas-active:${notes.id}', '${boardId}'); location.hash = '#/projects/${notes.id}/design'`,
  );
  editor.webContents.reload();
  await eventually(
    () => js(`!!document.querySelector('.design-document-node')`),
    "desktop document rendering",
  );
  await js(
    `document.querySelector('.design-document-node button[aria-label="编辑 Markdown"], .design-document-node button[aria-label="Edit Markdown"]').click()`,
  );
  await eventually(
    () => js(`!!document.querySelector('.design-document-node input')`),
    "title editor",
  );
  await js(`(() => {
    const input = document.querySelector('.design-document-node input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Desktop renamed title');
    input.dispatchEvent(new Event('input', {bubbles:true})); input.dispatchEvent(new Event('change', {bubbles:true})); input.blur();
    const area = document.querySelector('.design-document-node textarea');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(area, '# Desktop persisted Markdown');
    area.dispatchEvent(new Event('input', {bubbles:true})); area.dispatchEvent(new Event('change', {bubbles:true})); area.blur();
  })()`);
  await eventually(async () => {
    const saved = await api(`${canvas}?documentId=${doc.document.id}`);
    return (
      saved.document.title === "Desktop renamed title" &&
      saved.document.markdown === "# Desktop persisted Markdown"
    );
  }, "renderer title and Markdown autosave");
  editor.webContents.reload();
  await eventually(
    () =>
      js(
        `document.body.innerText.includes('Desktop renamed title') && document.body.innerText.includes('Desktop persisted Markdown')`,
      ),
    "desktop reopen",
  );
  if (nonGame) {
    await eventually(
      () => js(`!!document.querySelector('.react-flow__node-custom textarea')`),
      "custom example node",
    );
    await js(`(() => {
      const area = document.querySelector('.react-flow__node-custom textarea');
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(area, 'Desktop persisted custom note');
      area.dispatchEvent(new Event('input', {bubbles:true})); area.dispatchEvent(new Event('change', {bubbles:true})); area.blur();
    })()`);
    await eventually(
      async () =>
        (await api(boardRoute)).board.nodes.find((n) => n.id === "example-note")
          ?.data.value.text === "Desktop persisted custom note",
      "custom node autosave",
    );
    editor.webContents.reload();
    await eventually(
      () =>
        js(
          `document.querySelector('.react-flow__node-custom textarea')?.value === 'Desktop persisted custom note'`,
        ),
      "custom node reopen",
    );
    console.log(
      "Selected non-game custom example node editing, autosave and reload passed",
    );
  }
  assert.equal((await api(`${canvas}/workspace`)).mainDocumentId, undefined);
  assert.equal((await api(`${canvas}/workspace`)).boards.length, 2);
  await writeFile(
    path.join(directory, "non-game-canvas-reopened.png"),
    (await editor.webContents.capturePage()).toPNG(),
  );
  console.log(
    "Desktop two-board canvas, renderer title/Markdown edit, autosave and reload passed (API-created fixtures)",
  );
  await writeFile(
    path.join(directory, "shutdown-targets.json"),
    JSON.stringify([
      runtime.daemonUrl,
      ...(game ? [(await api(`/projects/${game.id}`)).preview.url] : []),
    ]),
  );
  console.log(
    JSON.stringify({
      result: "passed",
      electron: process.versions.electron,
      directory,
    }),
  );
  clearTimeout(deadline);
  // Use the real application shutdown/save handshake, not app.exit, on success.
  app.quit();
})().catch((error) => {
  console.error(error);
  clearTimeout(deadline);
  process.exitCode = 1;
  app.quit();
  setTimeout(() => app.exit(1), 10000).unref();
});
