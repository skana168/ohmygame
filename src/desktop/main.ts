import { createDesktopBusiness, createDesktopAccount, rejectUnavailableDesktopCapabilities } from "./business-registration.js";
import identity from "../../application-identity.cjs";
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { rmdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, clipboard, dialog, ipcMain, Menu, nativeImage, nativeTheme, Notification, powerSaveBlocker, session, shell } from "electron";
import { clipboardFilePaths, loadClipboardFiles } from "./file-clipboard.js";
import { installExternalMcpLauncher, markExternalMcpApp } from "./external-mcp-install.js";
import { DaemonSupervisor } from "./daemon-supervisor.js";
import { setGlobalDispatcher } from "undici/index.js";
import { SYSTEM_PROXY_TARGET } from "../shared/network-settings.js";
import { createNetworkDispatcher } from "../daemon/proxy.js";
import { electronProxyConfig, prepareDesktopNetwork, proxyCredentials } from "./network.js";
import { loadEnvironmentFiles } from "../daemon/environment.js";
import { ignoreBrokenStdio } from "./stdio.js";
import { RotatingLogFile } from "./log-file.js";
import { createLogRedactor } from "../shared/log-redaction.js";
import { desktopDiagnosticsArchive } from "./diagnostics-export.js";
import { recordConsole, recordUncaughtErrors, rendererConsoleLines, runtimeStateLine, updateFailureLine } from "./console-log.js";
import { createDesktopWindow, waitForRenderer, windowsTitleBarOverlay } from "./window.js";
import { DesktopUpdatePreparationError, DesktopUpdater } from "./updater.js";
import { DesktopUpdateCheckScheduler } from "./update-check-scheduler.js";
import { RendererCloseRequest } from "./renderer-close.js";
import { AgentNotifications, waitingDotBitmap } from "./agent-notifications.js";
import { NotificationPermission } from "./notification-permission.js";
import type { AgentNoticesResponse } from "../shared/agent-notices.js";
import { parseAgentNotificationPreferences, parseAgentNotificationTarget, type AgentNotificationTarget } from "../shared/agent-notifications.js";
import { PROJECT_FILE_OPEN_MODES, type ProjectFileOpenMode } from "../shared/contracts.js";

ignoreBrokenStdio();

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDirectory, "../..");
loadEnvironmentFiles(repositoryRoot, app.isPackaged ? "production" : "development");
const application = identity.loadIdentity(repositoryRoot);
const legacyUserData = app.getPath("userData");
app.setName(application.name);
app.setPath("userData", legacyUserData);
// Set before logs, sessions, or the singleton lock use Electron storage.
if (application.name !== "OhMyGame" || application.desktopId !== "ai.ohmygame.desktop") {
  app.setPath("userData", path.join(app.getPath("appData"), application.desktopId));
}
const developmentRendererUrl = process.env.OHMYGAME_RENDERER_URL ?? "http://127.0.0.1:43120";
const useBuiltRenderer = app.isPackaged || process.argv.includes("--built-renderer");
let daemon: DaemonSupervisor | undefined;
const logDirectory = app.getPath("logs");
const redactLog = createLogRedactor();
const mainLog = new RotatingLogFile({ directory: logDirectory, name: "main", redact: redactLog });
const daemonLog = new RotatingLogFile({ directory: logDirectory, name: "daemon", redact: redactLog });
recordConsole(mainLog);
recordUncaughtErrors(mainLog);
mainLog.line(`${application.name} ${app.getVersion()} starting on ${process.platform} ${process.arch}`);
// Windows shows notifications only for the app ID of the installer's Start menu shortcut, the `appId` in electron-builder.yml.
if (process.platform === "win32") app.setAppUserModelId(application.desktopId);
let mainWindow: BrowserWindow | undefined;
function handle(channel: string, listener: Parameters<typeof ipcMain.handle>[1]): void {
  ipcMain.handle(channel, (event, ...args) => {
    business?.authorizeIpc(channel, event.sender);
    return listener(event, ...args);
  });
}
const business = createDesktopBusiness?.({
  get mainWindow() { return mainWindow; },
  get daemon() { return daemon; },
  moduleDirectory, useBuiltRenderer, developmentRendererUrl, handle,
});
let quitting = false;
let quitPending = false;
let restartPending = false;
let rendererClose: RendererCloseRequest | undefined;
let shutdown: Promise<void> | undefined;
let updater: DesktopUpdater | undefined;
let updateChecks: DesktopUpdateCheckScheduler | undefined;
const account = createDesktopAccount?.({ handle, mainWindow: () => mainWindow });
rejectUnavailableDesktopCapabilities(handle, { game: Boolean(business), account: Boolean(account) });
const windowMenuLabels = new Set(["File", "Edit", "View", "Window"]);
/** The conversation a clicked notification opens, kept until the main window takes it. */
let notificationTarget: AgentNotificationTarget | undefined;
const notificationPermission = new NotificationPermission({
  platform: process.platform,
  packaged: app.isPackaged,
  openExternal: (url) => shell.openExternal(url),
  log: (message) => console.warn(message),
});
const agentNotifications = new AgentNotifications({
  notices: async (after) => {
    if (!daemon) return undefined;
    const { url, token } = daemon.runtime;
    const response = await fetch(`${url}/agent-notices?after=${after}`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok ? await response.json() as AgentNoticesResponse : undefined;
  },
  focused: () => Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible() && mainWindow.isFocused()),
  permission: () => notificationPermission.status(),
  show: (options, onClick) => {
    if (!Notification.isSupported()) return undefined;
    const notification = new Notification(options);
    notification.on("click", onClick);
    // macOS refuses notifications from an unsigned app, such as Electron in development.
    notification.on("failed", (_event, error) => console.warn(`Could not show a notification: ${error}`));
    // Accepted is not shown: the system still drops it when its settings allow no banners.
    notification.on("show", () => console.log("Notification accepted by the system"));
    notification.show();
    return notification;
  },
  showWaiting: (count, description) => {
    waiting = { count, description };
    if (process.platform === "win32") showWaitingOverlay();
    else app.setBadgeCount(count);
  },
  requestAttention: () => {
    if (process.platform === "darwin") app.dock?.bounce("informational");
    else if (mainWindow && !mainWindow.isDestroyed()) mainWindow.flashFrame(true);
  },
  log: (message) => console.log(message),
  open: (target) => {
    notificationTarget = target;
    if (!mainWindow || mainWindow.isDestroyed()) {
      // The new window takes the target once its page has loaded.
      if (daemon && !quitting) openMainWindow().catch((error) => console.error(error));
      return;
    }
    mainWindow.webContents.send("ohmygame:notification-target");
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  },
});

/** What waits for the user, kept so a new main window gets its taskbar overlay too. */
let waiting = { count: 0, description: "" };
let waitingOverlay: Electron.NativeImage | undefined;

/** Windows has no count on taskbar buttons, so a dot on the main window's button marks that something waits. */
function showWaitingOverlay(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  waitingOverlay ??= nativeImage.createFromBitmap(waitingDotBitmap(), { width: 16, height: 16 });
  mainWindow.setOverlayIcon(waiting.count ? waitingOverlay : null, waiting.count ? waiting.description : "");
}

/** Removes the record that tells `ohmygame-mcp` the app is already running. */
let clearExternalMcpApp: (() => Promise<void>) | undefined;

async function stopServices(): Promise<void> {
  updateChecks?.stop();
  agentNotifications.stop();
  business?.close();
  await Promise.all([daemon?.stop(), account?.close()]);
  await clearExternalMcpApp?.().catch(() => undefined);
  await Promise.all([daemonLog.close(), mainLog.close()]);
}

function prepareShutdown(forUpdate = false): Promise<void> {
  shutdown ??= (async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        await rendererClose?.request();
      } catch (cause) {
        if (forUpdate) throw new DesktopUpdatePreparationError("save", cause instanceof Error ? cause.message : String(cause));
        throw cause;
      }
    }
    quitting = true;
    try {
      await stopServices();
    } catch (cause) {
      console.error("Could not stop desktop services", cause);
      if (forUpdate) {
        quitting = false;
        throw new DesktopUpdatePreparationError("shutdown", cause instanceof Error ? cause.message : String(cause));
      }
    }
  })().catch((cause) => { shutdown = undefined; throw cause; });
  return shutdown;
}

ipcMain.on("ohmygame:ready-to-close", (event, id: unknown, error: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents || typeof id !== "number" ||
      (error !== undefined && typeof error !== "string")) return;
  rendererClose?.complete(id, error);
});

async function openProjectFile(filePath: string, mode: ProjectFileOpenMode): Promise<void> {
  if (mode === "reveal") {
    shell.showItemInFolder(filePath);
    return;
  }
  if (mode === "default") {
    const error = await shell.openPath(filePath);
    if (error) throw new Error(error);
    return;
  }
  if (process.platform === "darwin") {
    const application = mode === "vscode" ? "Visual Studio Code" : mode === "zed" ? "Zed" : "TextEdit";
    await executeFile("/usr/bin/open", ["-a", application, filePath]);
    return;
  }
  if (mode === "text-editor") {
    if (process.platform !== "win32") throw new Error("A system text editor is not available on this platform");
    await executeFile("notepad.exe", [filePath]);
    return;
  }
  const target = new URL(`${mode}://file`);
  target.pathname = filePath.replaceAll("\\", "/");
  await shell.openExternal(target.toString());
}

function executeFile(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(command, args, (error) => error ? reject(error) : resolve());
  });
}

// Provider authorization and ordinary HTTPS links belong to the reusable shell.
handle("ohmygame:open-external", async (event, url: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents || typeof url !== "string") throw new Error("Invalid external URL");
  let target: URL;
  try { target = new URL(url); } catch { throw new Error("Invalid external URL"); }
  if (target.protocol !== "https:") throw new Error("Invalid external URL");
  await shell.openExternal(target.href);
});
handle("ohmygame:clipboard-files", async (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid clipboard source");
  const paths = await clipboardFilePaths(clipboard);
  const files = await loadClipboardFiles(paths);
  if (paths.length && !files.length) throw new Error("The copied folder does not contain any files.");
  return files;
});
handle("ohmygame:paste-native", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid clipboard source");
  event.sender.paste();
});
handle("ohmygame:set-appearance", (event, appearance: unknown) => {
  const senderWindow = BrowserWindow.fromWebContents(event.sender);
  if (!senderWindow || senderWindow.isDestroyed()) throw new Error("Invalid appearance source");
  if (appearance !== "system" && appearance !== "light" && appearance !== "dark") {
    throw new Error("Invalid appearance");
  }
  nativeTheme.themeSource = appearance;
  if (process.platform === "win32" && senderWindow === mainWindow) {
    senderWindow.setTitleBarOverlay(windowsTitleBarOverlay(nativeTheme.shouldUseDarkColors));
  }
});
handle("ohmygame:popup-window-menu", (event, label: unknown, x: unknown, y: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents || typeof label !== "string" ||
      !windowMenuLabels.has(label) || typeof x !== "number" || !Number.isFinite(x) ||
      typeof y !== "number" || !Number.isFinite(y)) {
    throw new Error("Invalid window menu request");
  }
  const item = Menu.getApplicationMenu()?.items.find((candidate) => candidate.label.replaceAll("&", "") === label);
  if (!item?.submenu) throw new Error(`Window menu is not available: ${label}`);
  item.submenu.popup({ window: mainWindow, x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) });
});
handle("ohmygame:browse-plugin-directory", async (event, pluginId: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid browse source");
  if (!validPluginId(pluginId) || !daemon) throw new Error("Invalid plugin");
  const response = await fetch(`${daemon.runtime.url}/plugins/${encodeURIComponent(pluginId)}/directory`, {
    headers: { authorization: `Bearer ${daemon.runtime.token}` },
  });
  if (!response.ok) throw new Error("Plugin directory is not available");
  const result = await response.json() as { path?: unknown };
  if (typeof result.path !== "string" || !path.isAbsolute(result.path)) throw new Error("Invalid plugin directory");
  const error = await shell.openPath(result.path);
  if (error) throw new Error(error);
});
handle("ohmygame:open-project-file", async (event, projectId: unknown, filePath: unknown, mode: unknown = "default") => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid file open source");
  if (!validRouteId(projectId) || typeof filePath !== "string" || !filePath || filePath.length > 1_000 ||
    typeof mode !== "string" || !PROJECT_FILE_OPEN_MODES.includes(mode as ProjectFileOpenMode) || !daemon) {
    throw new Error("Invalid project file");
  }
  const response = await fetch(`${daemon.runtime.url}/projects/${encodeURIComponent(projectId)}/files/location?path=${encodeURIComponent(filePath)}`, {
    headers: { authorization: `Bearer ${daemon.runtime.token}` },
  });
  if (!response.ok) throw new Error("Project file is not available");
  const result = await response.json() as { path?: unknown };
  if (typeof result.path !== "string" || !path.isAbsolute(result.path)) throw new Error("Invalid project file path");
  await openProjectFile(result.path, mode as ProjectFileOpenMode);
});
handle("ohmygame:reveal-plugin-skill", async (event, pluginId: unknown, skillId: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid browse source");
  if (!validPluginId(pluginId) || typeof skillId !== "string" || !skillId || skillId.length > 1_000 || !daemon) {
    throw new Error("Invalid Plugin Skill");
  }
  const response = await fetch(`${daemon.runtime.url}/plugins/${encodeURIComponent(pluginId)}/skill-file?id=${encodeURIComponent(skillId)}`, {
    headers: { authorization: `Bearer ${daemon.runtime.token}` },
  });
  if (!response.ok) throw new Error("Plugin Skill is not available");
  const result = await response.json() as { path?: unknown };
  if (typeof result.path !== "string" || !path.isAbsolute(result.path)) throw new Error("Invalid Plugin Skill path");
  shell.showItemInFolder(result.path);
});
// Removes a project from OhMyGame. The daemon moves the files of a project in
// its own storage aside and says where; they go to the Trash from there, so
// removing never deletes what the person made.
handle("ohmygame:remove-project", async (event, projectId: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid project source");
  if (!validRouteId(projectId) || !daemon) throw new Error("Invalid project");
  const response = await fetch(`${daemon.runtime.url}/projects/${encodeURIComponent(projectId)}?keep=1`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${daemon.runtime.token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => undefined) as { error?: unknown } | undefined;
    throw new Error(typeof body?.error === "string" ? body.error : "The project could not be removed");
  }
  const result = await response.json() as { movedTo?: unknown };
  if (result.movedTo === undefined) return;
  if (typeof result.movedTo !== "string" || !path.isAbsolute(result.movedTo)) throw new Error("Invalid removed project folder");
  try {
    await shell.trashItem(result.movedTo);
  } catch {
    throw new Error(`The project was removed, but its files could not be moved to the Trash. They are in ${result.movedTo}`);
  }
  await rmdir(path.dirname(result.movedTo)).catch(() => {});
});
handle("ohmygame:open-logs-directory", async (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid logs folder source");
  mkdirSync(logDirectory, { recursive: true, mode: 0o700 });
  const error = await shell.openPath(logDirectory);
  if (error) throw new Error(error);
});
handle("ohmygame:export-diagnostics", async (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid diagnostics source");
  return desktopDiagnosticsArchive({ logDirectory, logs: [mainLog, daemonLog], service: () => daemon?.state(), redact: redactLog });
});
handle("ohmygame:select-plugin-directory", async (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid directory selection source");
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"] });
  return result.canceled ? undefined : result.filePaths[0];
});
handle("ohmygame:select-project-directory", async (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid directory selection source");
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select project workspace",
    buttonLabel: "Use this folder",
    properties: ["openDirectory", "createDirectory"],
  });
  return result.canceled ? undefined : result.filePaths[0];
});
handle("ohmygame:capture-page", async (event, rectangle: unknown) => {
  const window = mainWindow && event.sender === mainWindow.webContents
    ? mainWindow
    : business?.captureWindow(event.sender);
  if (!window) throw new Error("Invalid capture source");
  const bounds = captureBounds(rectangle, window.getContentBounds());
  return window.webContents.capturePage(bounds).then((image) => image.toPNG());
});
handle("ohmygame:runtime-state", (event) => {
  if (!BrowserWindow.fromWebContents(event.sender) || !daemon) throw new Error("Invalid background service source");
  return daemon.state();
});
handle("ohmygame:restart-runtime", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents || !daemon || quitting) throw new Error("Invalid background service source");
  return daemon.restart();
});

handle("ohmygame:notification-preferences", (event, value: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  const preferences = parseAgentNotificationPreferences(value);
  if (!preferences) throw new Error("Invalid notification preferences");
  agentNotifications.setPreferences(preferences);
});
handle("ohmygame:notification-view", (event, value: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  const view = parseAgentNotificationTarget(value);
  if (view === undefined) throw new Error("Invalid conversation");
  agentNotifications.setView(view);
});
handle("ohmygame:take-notification-target", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  const target = notificationTarget;
  notificationTarget = undefined;
  return target;
});
handle("ohmygame:notification-permission", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  return notificationPermission.status();
});
handle("ohmygame:request-notification-permission", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  return notificationPermission.request();
});
handle("ohmygame:notification-prompt-sent", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  return notificationPermission.requestOncePerLaunch();
});
handle("ohmygame:open-notification-settings", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid notification source");
  return notificationPermission.openSettings();
});
handle("ohmygame:update-state", () => updater?.state() ?? null);
handle("ohmygame:check-for-update", () => (updateChecks ? updateChecks.manual() : updater?.check()));
handle("ohmygame:download-update", () => updater?.download());
handle("ohmygame:install-update", () => updater?.install());
// Settings → General: the main window says when an agent is working and the person wants no sleep.
let keepAwakeBlocker: number | undefined;
function setKeepAwake(enabled: boolean): void {
  if (enabled && keepAwakeBlocker === undefined) keepAwakeBlocker = powerSaveBlocker.start("prevent-app-suspension");
  else if (!enabled && keepAwakeBlocker !== undefined) {
    powerSaveBlocker.stop(keepAwakeBlocker);
    keepAwakeBlocker = undefined;
  }
}
handle("ohmygame:set-keep-awake", (event, enabled: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid keep-awake source");
  setKeepAwake(enabled === true);
});
handle("ohmygame:focus-window", (event) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents) throw new Error("Invalid focus source");
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});
handle("ohmygame:set-automatic-updates", (event, enabled: unknown) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid update source");
  if (typeof enabled !== "boolean") throw new Error("Invalid automatic update setting");
  updater?.setAutomatic(enabled);
});
handle("ohmygame:restart-app", (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) throw new Error("Invalid restart source");
  if (quitting) return;
  restartPending = true;
  app.quit();
});

// On macOS, closing the last window keeps the app and its services running
// until Quit, and clicking the Dock icon opens the main window again.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (!daemon || mainWindow || quitting) return;
  openMainWindow().catch((error) => {
    console.error(error);
    dialog.showErrorBox(`${application.name} could not open a window`, error instanceof Error ? error.message : String(error));
  });
});
app.on("before-quit", (event) => {
  if (quitting || !daemon) return;
  event.preventDefault();
  if (quitPending) return;
  quitPending = true;
  void prepareShutdown().then(() => {
    if (restartPending) app.relaunch();
    app.quit();
  }).catch(() => { quitPending = false; restartPending = false; });
});

try {
  await app.whenReady();
  nativeTheme.themeSource = "system";
  const rendererOrigin = useBuiltRenderer ? "null" : new URL(developmentRendererUrl).origin;
  const dataDirectory = identity.dataDirectory(application, repositoryRoot, process.env, app.getPath("userData"));
  const systemProxySession = session.fromPartition("ohmygame-system-proxy", { cache: false });
  await systemProxySession.setProxy({ mode: "system" });
  const network = await prepareDesktopNetwork({
    dataDirectory,
    environment: app.isPackaged ? await packagedEnvironment() : { ...process.env },
    resolveProxy: (url) => systemProxySession.resolveProxy(url),
  });
  // Main uses the same local bypasses; preserve the original environment for daemon policy resolution.
  setGlobalDispatcher(createNetworkDispatcher(network.active));
  const proxyConfig = electronProxyConfig(network.active);
  const startupSessions = [session.defaultSession, session.fromPartition("electron-updater", { cache: false })];
  app.on("login", (event, _contents, _request, authInfo, callback) => {
    if (!authInfo.isProxy) return;
    const credentials = proxyCredentials(network.active, authInfo.host, authInfo.port);
    if (!credentials) return;
    event.preventDefault();
    callback(credentials.username, credentials.password);
  });
  app.on("session-created", (createdSession) => {
    void createdSession.setProxy(proxyConfig).catch((error) => console.warn("Could not configure session proxy", error));
  });
  await Promise.all(startupSessions.map((startupSession) => startupSession.setProxy(proxyConfig)));
  // A missing launcher only leaves external agents unable to connect; the app still starts.
  const externalMcpLauncher = await installExternalMcpLauncher({
    binDirectory: path.join(app.getPath("userData"), "bin"),
    executable: process.execPath,
    entry: path.join(moduleDirectory, "external-mcp-main.js"),
    dataDirectory,
    ...(app.isPackaged ? {} : { appPath: repositoryRoot }),
  }).catch((error) => { console.warn("Could not install the OhMyGame MCP launcher", error); return undefined; });
  clearExternalMcpApp = await markExternalMcpApp(dataDirectory).catch(() => undefined);
  daemon = new DaemonSupervisor({
    daemonEntry: path.join(moduleDirectory, "../daemon/server.js"),
    dataDirectory,
    token: randomBytes(32).toString("base64url"),
    allowedOrigins: [rendererOrigin],
    piAgentDirectory: process.env.PI_CODING_AGENT_DIR ?? ((process.env.OHMYGAME_DATA_DIR || application.dataDirectory !== ".data") ? path.join(dataDirectory, "pi-agent") : path.join(app.getPath("userData"), "pi-agent")),
    bundledPluginsDirectory: app.isPackaged ? path.join(process.resourcesPath, "plugins") : undefined,
    pluginUiDirectory: app.isPackaged ? path.join(process.resourcesPath, "plugin-ui") : undefined,
    preinstalledPluginsDirectory: app.isPackaged
      ? path.join(process.resourcesPath, "preinstalled-plugins")
      : path.join(repositoryRoot, ".runtime", "preinstalled-plugins"),
    examplesDirectory: app.isPackaged
      ? path.join(process.resourcesPath, "examples")
      : path.join(repositoryRoot, ".runtime", "examples"),
    ...(externalMcpLauncher ? { externalMcpLauncher } : {}),
    externalSkillDirectory: app.isPackaged
      ? path.join(process.resourcesPath, "integrations", "skills", "ohmygame-studio")
      : path.join(repositoryRoot, "integrations", "skills", "ohmygame-studio"),
    runtimeBin: app.isPackaged
      ? process.platform === "win32"
        ? path.join(process.resourcesPath, "runtime", "node")
        : path.join(process.resourcesPath, "runtime", "node", "bin")
      : undefined,
    environment: network.environment,
    resolveSystemProxy: async () => {
      // A separate system-configured session keeps detection independent of a manual app proxy.
      await systemProxySession.forceReloadProxyConfig();
      return systemProxySession.resolveProxy(SYSTEM_PROXY_TARGET);
    },
    development: !useBuiltRenderer,
    healthTimeoutMs: 60_000,
    log: daemonLog,
    logDirectory,
    handlePlaytestRequest: business?.handlePlaytestRequest,
    onState: (state) => {
      mainLog.line(runtimeStateLine(state));
      if (state.status !== "ready") {
        business?.close();
      }
      for (const window of BrowserWindow.getAllWindows()) {
        if (!window.isDestroyed()) window.webContents.send("ohmygame:runtime-state", state);
      }
    },
  });
  await daemon.start();
  agentNotifications.start();
  updater = new DesktopUpdater(app.getVersion(), () => prepareShutdown(true));

  if (!useBuiltRenderer) await waitForRenderer(developmentRendererUrl);
  updater.subscribe((state) => mainWindow?.webContents.send("ohmygame:update-state", state));
  // The same failure is published again with every other change to the update state.
  let updateFailure: string | undefined;
  updater.subscribe((state) => {
    const failure = updateFailureLine(state);
    if (failure && failure !== updateFailure) mainLog.line(failure);
    updateFailure = failure;
  });
  await openMainWindow();
  if (app.isPackaged) {
    updateChecks = new DesktopUpdateCheckScheduler(updater);
    updateChecks.start();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(error);
  if (app.isReady()) dialog.showErrorBox(`${application.name} could not start`, message);
  await stopServices();
  app.exit(1);
}

async function openMainWindow(): Promise<void> {
  if (!daemon) throw new Error("The daemon is not running");
  // beforeLoad runs before the first await, so a second activate sees mainWindow already set.
  await createDesktopWindow({
    runtime: daemon.runtime,
    preloadPath: path.join(moduleDirectory, "preload.cjs"),
    rendererUrl: useBuiltRenderer ? undefined : developmentRendererUrl,
    rendererFile: useBuiltRenderer ? path.join(moduleDirectory, "../renderer/index.html") : undefined,
    sidebarVibrancy: true,
    integratedMenuBar: true,
    beforeLoad: (window) => {
      mainWindow = window;
      if (process.platform === "win32") showWaitingOverlay();
      window.webContents.on("console-message", (details) => {
        for (const line of rendererConsoleLines(details)) mainLog.line(line);
      });
      window.on("show", () => {
        business?.synchronize();
        updateChecks?.onFocus();
      });
      window.on("focus", () => {
        updateChecks?.onFocus();
        if (process.platform !== "darwin") window.flashFrame(false);
        agentNotifications.focusChanged();
      });
      window.on("hide", () => business?.synchronize());
      window.on("minimize", () => business?.synchronize());
      window.on("restore", () => business?.synchronize());
      window.on("resize", () => business?.synchronize());
      const close = new RendererCloseRequest(
        (id) => window.webContents.send("ohmygame:prepare-close", id),
        (id, error) => { if (!window.isDestroyed()) window.webContents.send("ohmygame:cancel-close", id, error); },
      );
      rendererClose = close;
      let allowClose = false;
      window.on("close", (event) => {
        if (quitting || allowClose) return;
        event.preventDefault();
        void close.request().then(() => {
          if (quitPending || quitting || allowClose || window.isDestroyed()) return;
          allowClose = true;
          window.close();
        }).catch(() => {});
      });
      window.once("closed", () => {
        if (mainWindow === window) {
          mainWindow = undefined;
          rendererClose = undefined;
          agentNotifications.setView(null);
          setKeepAwake(false);
        }
        business?.closeWindow();
      });
    },
  });
}

async function packagedEnvironment(): Promise<NodeJS.ProcessEnv> {
  const environment = { ...process.env };
  // esbuild spawns a native binary, which cannot run from inside app.asar.
  environment.ESBUILD_BINARY_PATH ??= packagedEsbuildBinary();
  if (!environment.CLOUD_API_URL && !environment.PUBLISH_API_URL) {
    const config = JSON.parse(readFileSync(path.join(process.resourcesPath, "desktop-config.json"), "utf8")) as {
      cloudApiUrl?: unknown;
      publishApiUrl?: unknown;
    };
    const cloudApiUrl = typeof config.cloudApiUrl === "string" && config.cloudApiUrl
      ? config.cloudApiUrl
      : typeof config.publishApiUrl === "string" && config.publishApiUrl ? config.publishApiUrl : undefined;
    if (cloudApiUrl) {
      environment.CLOUD_API_URL = cloudApiUrl;
    }
  }
  return environment;
}

function captureBounds(value: unknown, content: Electron.Rectangle): Electron.Rectangle {
  if (!value || typeof value !== "object") throw new Error("Invalid capture bounds");
  const candidate = value as Partial<Electron.Rectangle>;
  const numbers = [candidate.x, candidate.y, candidate.width, candidate.height];
  if (!numbers.every((number) => typeof number === "number" && Number.isFinite(number))) {
    throw new Error("Invalid capture bounds");
  }
  const bounds = {
    x: Math.max(0, Math.round(candidate.x!)),
    y: Math.max(0, Math.round(candidate.y!)),
    width: Math.round(candidate.width!),
    height: Math.round(candidate.height!),
  };
  if (bounds.width < 1 || bounds.height < 1 || bounds.width > 4096 || bounds.height > 4096 ||
      bounds.x + bounds.width > content.width || bounds.y + bounds.height > content.height) {
    throw new Error("Invalid capture bounds");
  }
  return bounds;
}

/** `publisher/name`, encoded into the route. */
function validPluginId(value: unknown): value is string {
  return typeof value === "string" && /^[^/]{1,200}\/[^/]{1,200}$/.test(value);
}

function validRouteId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && !value.includes("/");
}

function packagedEsbuildBinary(): string {
  // Resolve the platform package from esbuild's own directory, as esbuild does, because packaging
  // may nest it when another dependency brings a different esbuild version.
  const esbuildPackage = createRequire(import.meta.url).resolve("esbuild/package.json");
  const platformPackage = createRequire(esbuildPackage).resolve(`@esbuild/${process.platform}-${process.arch}/package.json`);
  const packageDirectory = path.dirname(platformPackage)
    .replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
  return path.join(packageDirectory, process.platform === "win32" ? "esbuild.exe" : path.join("bin", "esbuild"));
}
