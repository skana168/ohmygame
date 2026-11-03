import type { BrowserWindow, ipcMain, WebContents } from "electron";
import type { DaemonSupervisor } from "./daemon-supervisor.js";
import type { StartDaemonOptions } from "./daemon-process.js";

export interface DesktopBusinessContext {
  readonly mainWindow: BrowserWindow | undefined;
  readonly daemon: DaemonSupervisor | undefined;
  moduleDirectory: string;
  useBuiltRenderer: boolean;
  developmentRendererUrl: string;
  handle(channel: string, listener: Parameters<typeof ipcMain.handle>[1]): void;
}

export interface DesktopBusiness {
  handlePlaytestRequest: NonNullable<
    StartDaemonOptions["handlePlaytestRequest"]
  >;
  authorizeIpc(channel: string, sender: WebContents): void;
  captureWindow(sender: WebContents): BrowserWindow | undefined;
  synchronize(): void;
  close(): void;
  closeWindow(): void;
}

export let createDesktopBusiness:
  ((context: DesktopBusinessContext) => DesktopBusiness) | undefined;

export function registerDesktopBusiness(
  factory: NonNullable<typeof createDesktopBusiness>,
): void {
  if (createDesktopBusiness)
    throw new Error("Desktop business contribution already registered");
  createDesktopBusiness = factory;
}

export interface DesktopAccountContext {
  handle: DesktopBusinessContext["handle"];
  mainWindow(): BrowserWindow | undefined;
}
export let createDesktopAccount:
  ((context: DesktopAccountContext) => { close(): Promise<void> }) | undefined;
export function registerDesktopAccount(
  factory: NonNullable<typeof createDesktopAccount>,
): void {
  if (createDesktopAccount)
    throw new Error("Desktop account contribution already registered");
  createDesktopAccount = factory;
}

/** Absent contributions reject IPC at the host boundary, including direct calls. */
export function rejectUnavailableDesktopCapabilities(
  handle: DesktopBusinessContext["handle"],
  available: { game: boolean; account: boolean },
): void {
  const groups = [
    {
      enabled: available.game,
      capability: "game",
      channels: [
        "prepare-node-thumbnails",
        "node-thumbnail-snapshot",
        "capture-node-thumbnail",
        "cancel-node-thumbnails",
        "finish-node-thumbnail",
        "agent-playtest-state",
        "set-agent-playtest-visible",
        "web-game-player-state",
        "attach-web-game-preview",
        "layout-web-game-preview",
        "detach-web-game-preview",
        "capture-web-game-preview",
        "open-web-game-player",
        "close-web-game-player",
        "refresh-web-game-player",
        "start-game-recording",
        "stop-game-recording",
        "game-recording-state",
        "open-playtest",
        "open-playable-node",
        "show-playtest-editor",
      ],
    },
    {
      enabled: available.account,
      capability: "account",
      channels: [
        "open-auth-url",
        "take-auth-callback",
        "auth-callback-url",
        "cancel-auth",
      ],
    },
  ];
  for (const group of groups) {
    if (group.enabled) continue;
    for (const channel of group.channels) {
      handle(`ohmygame:${channel}`, () => {
        throw new Error(
          `The ${group.capability} capability is unavailable in this application.`,
        );
      });
    }
  }
}
