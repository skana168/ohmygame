import { ElectronPlaytestDriver } from "./playtest-driver.js";
import { GameRecorder, type GameRecordingFile } from "./game-recorder.js";
import {
  GAME_RECORDING_MAX_SECONDS,
  gameRecordingFileName,
  type GameRecordingSaved,
  type GameRecordingState,
} from "../shared/game-recording.js";
import {
  WebGamePlayerWindows,
  type WebGamePlayerTarget,
} from "./web-game-player.js";
import { AsyncTaskPool } from "./async-task-pool.js";
import { isNodeGraph } from "../shared/playable-graph-validation.js";
import type {
  NodeThumbnailResult,
  PlayableThumbnailSnapshot,
} from "../shared/playable-player-protocol.js";
import type { PlaytestWatchState } from "../shared/playtest.js";
import type {
  WebGamePlayerRequest,
  WebGamePreviewLayout,
} from "../shared/web-game-player.js";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BrowserWindow } from "electron";
import {
  createDesktopWindow,
  fitPlaytestContentSize,
  isValidPlaytestViewport,
} from "./window.js";
import type {
  DesktopBusinessContext,
  DesktopBusiness,
} from "./business-registration.js";

export function createGameDesktop(
  context: DesktopBusinessContext,
): DesktopBusiness {
  const playtestWindows = new Map<
    string,
    BrowserWindow | Promise<BrowserWindow>
  >();
  /** A Node that fails to start never reports back; its window gives up after this. */
  const NODE_THUMBNAIL_TIMEOUT_MS = 20_000;
  const CANCELLED_THUMBNAIL: NodeThumbnailResult = {
    captured: false,
    error: "The capture was cancelled.",
  };
  const nodeThumbnailCaptures = new AsyncTaskPool(2);
  const nodeThumbnailBatches = new Map<
    string,
    {
      projectId: string;
      controller: AbortController;
      requests: number;
      snapshot?: PlayableThumbnailSnapshot;
    }
  >();
  /** Hidden Node thumbnail windows by WebContents ID. */
  const nodeThumbnails = new Map<
    number,
    {
      window: BrowserWindow;
      finish: (result: NodeThumbnailResult) => void;
      snapshot?: PlayableThumbnailSnapshot;
    }
  >();
  /** Thumbnail windows run Node code, so they may only capture and report. */
  const NODE_THUMBNAIL_CHANNELS = new Set([
    "ohmygame:capture-page",
    "ohmygame:finish-node-thumbnail",
    "ohmygame:node-thumbnail-snapshot",
  ]);

  const rendererPage = (page: string) =>
    context.useBuiltRenderer
      ? pathToFileURL(path.join(context.moduleDirectory, "../renderer", page))
          .href
      : new URL(page, `${context.developmentRendererUrl}/`).href;
  const gameRecorder = new GameRecorder({
    hostUrl: rendererPage("game-recorder.html"),
    preloadPath: path.join(
      context.moduleDirectory,
      "game-recorder-preload.cjs",
    ),
    save: saveGameRecording,
    onSaving: (id) => {
      // Agents' recordings are not announced. A person can stop one that is still starting.
      if (gameRecordings.has(id) || gameRecordingStarts.has(id))
        publishGameRecording({ projectId: id, status: "saving" });
    },
  });
  // Construct the game driver only after an authorized agent actually uses it.
  let agentPlaytests: ElectronPlaytestDriver | undefined;
  const agentPlaytestDriver = () =>
    (agentPlaytests ??= new ElectronPlaytestDriver(
      (state) => {
        context.mainWindow?.webContents.send(
          "ohmygame:agent-playtest-state",
          state,
        );
      },
      undefined,
      gameRecorder,
    ));
  const webGamePlayers = new WebGamePlayerWindows(
    (state) => {
      context.mainWindow?.webContents.send(
        "ohmygame:web-game-player-state",
        state,
      );
    },
    rendererPage("web-game-host.html"),
    (projectId) => {
      if (gameRecorder.isRecording(projectId)) gameRecorder.stop(projectId);
      else
        void startGameRecording(projectId).catch((cause: unknown) => {
          publishGameRecording({
            projectId,
            status: "idle",
            error: cause instanceof Error ? cause.message : String(cause),
          });
        });
    },
  );
  /** People's recordings, by project; an agent's belong to its playtest session. */
  const gameRecordings = new Map<string, GameRecordingState>();
  const gameRecordingStarts = new Set<string>();
  context.handle(
    "ohmygame:prepare-node-thumbnails",
    (event, projectId: unknown, batchId: unknown, value: unknown) => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents
      )
        throw new Error("Invalid thumbnail source");
      const snapshot = value as PlayableThumbnailSnapshot | undefined;
      if (
        !validRouteId(projectId) ||
        !validRouteId(batchId) ||
        nodeThumbnailBatches.has(batchId) ||
        !snapshot ||
        typeof snapshot.version !== "string" ||
        (snapshot.web !== undefined && snapshot.web !== true) ||
        snapshot.definition?.version !== 1 ||
        typeof snapshot.definition.graphSignature !== "string" ||
        !isNodeGraph(snapshot.definition.graph) ||
        !isSceneHashes(snapshot.definition.hashes)
      ) {
        throw new Error("Invalid thumbnail snapshot");
      }
      nodeThumbnailBatches.set(batchId, {
        projectId,
        snapshot,
        controller: new AbortController(),
        requests: 0,
      });
    },
  );
  context.handle("ohmygame:node-thumbnail-snapshot", (event) => {
    const thumbnail = nodeThumbnails.get(event.sender.id);
    if (!thumbnail) throw new Error("Invalid thumbnail source");
    return thumbnail.snapshot;
  });
  context.handle(
    "ohmygame:capture-node-thumbnail",
    (
      event,
      projectId: unknown,
      nodeId: unknown,
      viewport: unknown,
      batchId: unknown,
    ) => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents
      )
        throw new Error("Invalid thumbnail source");
      if (
        !validRouteId(projectId) ||
        !validRouteId(nodeId) ||
        !isValidPlaytestViewport(viewport) ||
        !validRouteId(batchId)
      )
        throw new Error("Invalid thumbnail target");
      return scheduleNodeThumbnail(projectId, nodeId, viewport, batchId);
    },
  );
  context.handle(
    "ohmygame:cancel-node-thumbnails",
    (event, batchId: unknown) => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents ||
        !validRouteId(batchId)
      )
        throw new Error("Invalid thumbnail cancellation");
      const batch = nodeThumbnailBatches.get(batchId);
      batch?.controller.abort();
      if (batch && !batch.requests) nodeThumbnailBatches.delete(batchId);
    },
  );
  context.handle(
    "ohmygame:finish-node-thumbnail",
    (event, captured: unknown, error: unknown) => {
      nodeThumbnails
        .get(event.sender.id)
        ?.finish(
          captured === true
            ? { captured: true }
            : {
                captured: false,
                error:
                  typeof error === "string" && error
                    ? error.slice(0, 500)
                    : "The capture failed.",
              },
        );
    },
  );
  context.handle(
    "ohmygame:agent-playtest-state",
    (event): PlaytestWatchState => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents
      )
        throw new Error("Invalid Agent playtest source");
      return (
        agentPlaytests?.watchState() ?? { visible: false, activeSessions: 0 }
      );
    },
  );
  context.handle(
    "ohmygame:set-agent-playtest-visible",
    (event, visible: unknown): PlaytestWatchState => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents ||
        typeof visible !== "boolean"
      ) {
        throw new Error("Invalid Agent playtest visibility");
      }
      return (
        agentPlaytests?.setVisible(visible) ?? {
          visible: false,
          activeSessions: 0,
        }
      );
    },
  );
  context.handle(
    "ohmygame:web-game-player-state",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      return webGamePlayers.state(projectId);
    },
  );
  context.handle(
    "ohmygame:attach-web-game-preview",
    async (
      event,
      projectId: unknown,
      attachment: unknown,
      url: unknown,
      layout: unknown,
    ) => {
      requirePlayerSource(event.sender, projectId);
      await requireGameCapability(projectId);
      if (
        !validRouteId(attachment) ||
        typeof url !== "string" ||
        url.length > 4_000
      )
        throw new Error("Invalid game preview target");
      return webGamePlayers.attach(
        projectId,
        attachment,
        context.mainWindow!,
        url,
        requirePreviewLayout(layout),
        () => resolvePlayerTarget(projectId),
      );
    },
  );
  context.handle(
    "ohmygame:layout-web-game-preview",
    (event, projectId: unknown, attachment: unknown, layout: unknown) => {
      requirePlayerSource(event.sender, projectId);
      if (!validRouteId(attachment))
        throw new Error("Invalid game preview attachment");
      webGamePlayers.layout(
        projectId,
        attachment,
        requirePreviewLayout(layout),
      );
    },
  );
  context.handle(
    "ohmygame:detach-web-game-preview",
    (event, projectId: unknown, attachment: unknown) => {
      requirePlayerSource(event.sender, projectId);
      if (!validRouteId(attachment))
        throw new Error("Invalid game preview attachment");
      webGamePlayers.detach(projectId, attachment);
    },
  );
  context.handle(
    "ohmygame:capture-web-game-preview",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      return webGamePlayers.capture(projectId);
    },
  );
  context.handle(
    "ohmygame:open-web-game-player",
    async (event, projectId: unknown, request: unknown) => {
      requirePlayerSource(event.sender, projectId);
      await requireGameCapability(projectId);
      const input = request as Partial<WebGamePlayerRequest> | null;
      if (
        !input ||
        typeof input.path !== "string" ||
        input.path.length > 2_000 ||
        !isValidPlaytestViewport(input.viewport)
      ) {
        throw new Error("Invalid game player target");
      }
      return webGamePlayers.open(projectId, input as WebGamePlayerRequest, () =>
        resolvePlayerTarget(projectId),
      );
    },
  );
  context.handle(
    "ohmygame:close-web-game-player",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      webGamePlayers.closeProject(projectId);
    },
  );
  context.handle(
    "ohmygame:refresh-web-game-player",
    (event, projectId: unknown, reload: unknown = false) => {
      requirePlayerSource(event.sender, projectId);
      if (typeof reload !== "boolean")
        throw new Error("Invalid game player refresh");
      return webGamePlayers.refresh(
        projectId,
        () => resolvePlayerTarget(projectId),
        reload,
      );
    },
  );
  context.handle(
    "ohmygame:start-game-recording",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      return startGameRecording(projectId);
    },
  );
  context.handle(
    "ohmygame:stop-game-recording",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      gameRecorder.stop(projectId);
    },
  );
  context.handle(
    "ohmygame:game-recording-state",
    (event, projectId: unknown) => {
      requirePlayerSource(event.sender, projectId);
      return gameRecordings.get(projectId) ?? { projectId, status: "idle" };
    },
  );
  async function startGameRecording(projectId: string): Promise<void> {
    await requireGameCapability(projectId);
    // The button and the shortcut can both ask before the first has started.
    if (gameRecordingStarts.has(projectId)) return;
    gameRecordingStarts.add(projectId);
    let outcome: Promise<GameRecordingSaved>;
    try {
      const { contents, title } =
        await webGamePlayers.recordingTarget(projectId);
      ({ outcome } = await gameRecorder.start(projectId, contents, {
        title,
        maxSeconds: GAME_RECORDING_MAX_SECONDS,
      }));
    } catch (cause) {
      if (gameRecordings.has(projectId))
        publishGameRecording({ projectId, status: "idle" });
      throw cause;
    } finally {
      gameRecordingStarts.delete(projectId);
    }
    if (gameRecordings.get(projectId)?.status !== "saving") {
      publishGameRecording({
        projectId,
        status: "recording",
        startedAt: Date.now(),
        maxSeconds: GAME_RECORDING_MAX_SECONDS,
      });
    }
    webGamePlayers.setRecording(projectId, true);
    void outcome
      .then(
        (saved) => publishGameRecording({ projectId, status: "idle", saved }),
        (cause: unknown) =>
          publishGameRecording({
            projectId,
            status: "idle",
            error: cause instanceof Error ? cause.message : String(cause),
          }),
      )
      .finally(() => webGamePlayers.setRecording(projectId, false));
  }

  function publishGameRecording(state: GameRecordingState): void {
    if (state.status === "idle") gameRecordings.delete(state.projectId);
    else gameRecordings.set(state.projectId, state);
    context.mainWindow?.webContents.send(
      "ohmygame:game-recording-state",
      state,
    );
  }

  /** Recordings go to the Library, where the trimmer can cut them down. */
  async function saveGameRecording(
    file: GameRecordingFile,
  ): Promise<GameRecordingSaved> {
    if (!context.daemon) throw new Error("The game service is unavailable.");
    const name = gameRecordingFileName(file.title, new Date(), file.extension);
    const query = new URLSearchParams({
      name,
      mediaType: file.mediaType,
      duration: file.duration.toFixed(3),
    });
    const response = await fetch(
      `${context.daemon.runtime.url}/library/assets/upload?${query}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${context.daemon.runtime.token}`,
          "content-type": "application/octet-stream",
        },
        body: Readable.toWeb(createReadStream(file.path)) as ReadableStream,
        duplex: "half",
      } as RequestInit,
    );
    const asset = (await response.json().catch(() => undefined)) as
      { id?: string; error?: string; message?: string } | undefined;
    if (!response.ok || !asset?.id)
      throw new Error(
        asset?.message ??
          asset?.error ??
          "The recording could not be saved to the Library.",
      );
    context.mainWindow?.webContents.send("ohmygame:game-recording-saved");
    return {
      assetId: asset.id,
      name,
      duration: file.duration,
      bytes: file.bytes,
    };
  }

  function requirePlayerSource(
    sender: Electron.WebContents,
    projectId: unknown,
  ): asserts projectId is string {
    if (
      !context.mainWindow ||
      sender !== context.mainWindow.webContents ||
      !validRouteId(projectId) ||
      !context.daemon
    ) {
      throw new Error("Invalid game player source");
    }
  }

  function requirePreviewLayout(value: unknown): WebGamePreviewLayout {
    const layout = value as Partial<WebGamePreviewLayout> | null;
    const bounds = layout?.bounds;
    if (
      !bounds ||
      typeof layout.visible !== "boolean" ||
      ![bounds.x, bounds.y, bounds.width, bounds.height].every(
        (entry) => Number.isFinite(entry) && entry >= 0 && entry <= 32_768,
      )
    ) {
      throw new Error("Invalid game preview bounds");
    }
    return layout as WebGamePreviewLayout;
  }

  async function requireGameCapability(projectId: string): Promise<void> {
    if (!context.daemon) throw new Error("The game service is unavailable.");
    const response = await fetch(
      `${context.daemon.runtime.url}/projects/${encodeURIComponent(projectId)}/game-capability`,
      {
        headers: { authorization: `Bearer ${context.daemon.runtime.token}` },
      },
    );
    const result = (await response.json()) as { enabled?: boolean };
    if (!response.ok || result.enabled !== true)
      throw new Error(
        "The game capability is disabled or unavailable for this workspace.",
      );
  }

  async function resolvePlayerTarget(
    projectId: string,
  ): Promise<WebGamePlayerTarget> {
    if (!context.daemon) throw new Error("The game service is unavailable.");
    const headers = { authorization: `Bearer ${context.daemon.runtime.token}` };
    const projectUrl = `${context.daemon.runtime.url}/projects/${encodeURIComponent(projectId)}`;
    const current = await fetch(projectUrl, { headers });
    const project = (await current.json()) as {
      error?: string;
      message?: string;
    };
    if (!current.ok)
      throw new Error(
        project.message ?? project.error ?? "The project could not be loaded.",
      );
    const version = current.headers.get("x-workspace-version") ?? "0";
    const response = await fetch(`${projectUrl}/game/preview`, {
      method: "POST",
      headers: { ...headers, "x-workspace-version": version },
    });
    const result = (await response.json()) as {
      url?: string;
      title?: string;
      error?: string;
      message?: string;
    };
    if (!response.ok || !result.url || !result.title)
      throw new Error(
        result.message ?? result.error ?? "The game server could not start.",
      );
    return { url: result.url, title: result.title };
  }

  context.handle(
    "ohmygame:open-playtest",
    async (event, projectId: unknown, viewport: unknown) => {
      if (
        !context.mainWindow ||
        event.sender !== context.mainWindow.webContents
      )
        throw new Error("Invalid playtest source");
      if (
        !validRouteId(projectId) ||
        !isValidPlaytestViewport(viewport) ||
        !context.daemon
      )
        throw new Error("Invalid playtest target");
      await requireGameCapability(projectId);
      const size = fitPlaytestContentSize(viewport);
      const aspectRatio = viewport.width / viewport.height;
      const current = playtestWindows.get(projectId);
      if (current) {
        const existing = await current;
        if (!existing.isDestroyed()) {
          existing.setAspectRatio(aspectRatio);
          existing.setContentSize(size.width, size.height);
          existing.focus();
          return;
        }
        playtestWindows.delete(projectId);
      }
      const opening = createDesktopWindow({
        runtime: context.daemon.runtime,
        preloadPath: path.join(context.moduleDirectory, "preload.cjs"),
        rendererUrl: context.useBuiltRenderer
          ? undefined
          : context.developmentRendererUrl,
        rendererFile: context.useBuiltRenderer
          ? path.join(context.moduleDirectory, "../renderer/index.html")
          : undefined,
        rendererHash: `#/playtest/${encodeURIComponent(projectId)}`,
        nativeTitleBar: true,
        contentSize: size,
        aspectRatio,
        minWidth: Math.max(1, Math.round(size.width / 2)),
        minHeight: Math.max(1, Math.round(size.height / 2)),
      });
      playtestWindows.set(projectId, opening);
      try {
        const playtest = await opening;
        if (!context.mainWindow) {
          playtest.close();
          return;
        }
        playtestWindows.set(projectId, playtest);
        playtest.once("closed", () => {
          if (playtestWindows.get(projectId) === playtest)
            playtestWindows.delete(projectId);
        });
      } catch (error) {
        if (playtestWindows.get(projectId) === opening)
          playtestWindows.delete(projectId);
        throw error;
      }
    },
  );
  context.handle(
    "ohmygame:open-playable-node",
    async (event, projectId: unknown, nodeId: unknown) => {
      if (!validRouteId(projectId) || !validRouteId(nodeId))
        throw new Error("Invalid Node target");
      const playtest = await playtestWindows.get(projectId);
      if (
        !playtest ||
        playtest.isDestroyed() ||
        event.sender !== playtest.webContents
      )
        throw new Error("Invalid Node source");
      if (!context.mainWindow || context.mainWindow.isDestroyed()) return;
      context.mainWindow.webContents.send(
        "ohmygame:open-playable-node",
        projectId,
        nodeId,
      );
      if (context.mainWindow.isMinimized()) context.mainWindow.restore();
      context.mainWindow.focus();
    },
  );
  context.handle(
    "ohmygame:show-playtest-editor",
    async (event, projectId: unknown) => {
      if (!validRouteId(projectId))
        throw new Error("Invalid Playtest editor target");
      const playtest = await playtestWindows.get(projectId);
      if (
        !playtest ||
        playtest.isDestroyed() ||
        event.sender !== playtest.webContents
      )
        throw new Error("Invalid Playtest editor source");
      if (!context.mainWindow || context.mainWindow.isDestroyed()) return;
      context.mainWindow.webContents.send(
        "ohmygame:show-playtest-editor",
        projectId,
      );
      if (context.mainWindow.isMinimized()) context.mainWindow.restore();
      context.mainWindow.focus();
    },
  );
  async function scheduleNodeThumbnail(
    projectId: string,
    nodeId: string,
    viewport: { width: number; height: number },
    batchId: string,
  ): Promise<NodeThumbnailResult> {
    let batch = nodeThumbnailBatches.get(batchId);
    if (!batch) {
      batch = { projectId, controller: new AbortController(), requests: 0 };
      nodeThumbnailBatches.set(batchId, batch);
    } else if (batch.projectId !== projectId)
      throw new Error("Invalid thumbnail batch");
    batch.requests += 1;
    const signal = batch.controller.signal;
    return nodeThumbnailCaptures
      .run(async () => {
        await requireGameCapability(projectId);
        signal.throwIfAborted();
        return captureNodeThumbnail(
          projectId,
          nodeId,
          viewport,
          signal,
          batch.snapshot,
        );
      }, signal)
      .catch((cause: unknown): NodeThumbnailResult =>
        signal.aborted
          ? CANCELLED_THUMBNAIL
          : {
              captured: false,
              error: cause instanceof Error ? cause.message : String(cause),
            },
      )
      .then((result) => {
        // A cancelled capture says nothing about the Node; a failed one is kept for bug reports.
        if (!result.captured && !signal.aborted)
          console.warn(
            `Node thumbnail "${nodeId}" was not captured: ${result.error}`,
          );
        return result;
      })
      .finally(() => {
        batch.requests -= 1;
        if (!batch.requests) nodeThumbnailBatches.delete(batchId);
      });
  }

  /**
   * Runs one Node in a hidden window. The page stores its own screenshot, with
   * the hash of what it ran, and then reports whether that worked, or why not.
   */
  async function captureNodeThumbnail(
    projectId: string,
    nodeId: string,
    viewport: { width: number; height: number },
    signal: AbortSignal,
    snapshot?: PlayableThumbnailSnapshot,
  ): Promise<NodeThumbnailResult> {
    if (!context.daemon || !context.mainWindow || signal.aborted)
      return CANCELLED_THUMBNAIL;
    let finish!: (result: NodeThumbnailResult) => void;
    const finished = new Promise<NodeThumbnailResult>((resolve) => {
      finish = resolve;
    });
    const cancel = () => finish(CANCELLED_THUMBNAIL);
    signal.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(
      () =>
        finish({
          captured: false,
          error: `The Scene did not finish within ${NODE_THUMBNAIL_TIMEOUT_MS / 1000} seconds.`,
        }),
      NODE_THUMBNAIL_TIMEOUT_MS,
    );
    let thumbnailWindow: BrowserWindow | undefined;
    try {
      const opening = createDesktopWindow({
        runtime: context.daemon.runtime,
        preloadPath: path.join(context.moduleDirectory, "preload.cjs"),
        rendererUrl: context.useBuiltRenderer
          ? undefined
          : context.developmentRendererUrl,
        rendererFile: context.useBuiltRenderer
          ? path.join(context.moduleDirectory, "../renderer/index.html")
          : undefined,
        rendererHash: `#/thumbnail/${encodeURIComponent(projectId)}/${encodeURIComponent(nodeId)}`,
        contentSize: fitPlaytestContentSize(viewport),
        minWidth: 1,
        minHeight: 1,
        hidden: true,
        beforeLoad: (window) => {
          thumbnailWindow = window;
          const id = window.webContents.id;
          nodeThumbnails.set(id, { window, finish, snapshot });
          window.once("closed", () => {
            nodeThumbnails.delete(id);
            finish({ captured: false, error: "The capture window closed." });
          });
        },
      });
      return await Promise.race([opening.then(() => finished), finished]);
    } catch (cause) {
      return {
        captured: false,
        error: cause instanceof Error ? cause.message : String(cause),
      };
    } finally {
      signal.removeEventListener("abort", cancel);
      clearTimeout(timer);
      if (thumbnailWindow && !thumbnailWindow.isDestroyed())
        thumbnailWindow.destroy();
    }
  }

  /** Each Scene's content hash, by Node ID, as the editor's build reports them. */
  function isSceneHashes(value: unknown): value is Record<string, string> {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every(
        (hash) => typeof hash === "string" && /^[0-9a-f]{8,64}$/.test(hash),
      )
    );
  }

  return {
    handlePlaytestRequest: async (request, signal) => {
      if (request.operation === "open") {
        if (!validRouteId(request.projectId))
          throw new Error("A game workspace is required for playtesting.");
        await requireGameCapability(request.projectId);
        signal?.throwIfAborted();
        return agentPlaytestDriver().request(request, signal);
      }
      if (!agentPlaytests) {
        if (request.operation === "closeAll") return { operation: "closeAll" };
        throw new Error("The game playtest session is unavailable.");
      }
      return agentPlaytests.request(request, signal);
    },
    authorizeIpc(channel, sender) {
      if (
        nodeThumbnails.has(sender.id) &&
        !NODE_THUMBNAIL_CHANNELS.has(channel)
      )
        throw new Error("Invalid thumbnail request");
    },
    captureWindow(sender) {
      return nodeThumbnails.get(sender.id)?.window;
    },
    synchronize() {
      webGamePlayers.synchronize();
    },
    close() {
      webGamePlayers.close();
      agentPlaytests?.close();
      gameRecorder.close();
    },
    closeWindow() {
      webGamePlayers.close();
      for (const playtest of playtestWindows.values()) {
        void Promise.resolve(playtest).then(
          (window) => window.close(),
          () => {},
        );
      }
      playtestWindows.clear();
      for (const batch of nodeThumbnailBatches.values())
        batch.controller.abort();
      for (const thumbnail of nodeThumbnails.values())
        thumbnail.finish(CANCELLED_THUMBNAIL);
    },
  };
}
function validRouteId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    !value.includes("/")
  );
}
