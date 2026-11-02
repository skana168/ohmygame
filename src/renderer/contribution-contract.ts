import type { ComponentType, ReactNode } from "react";
import type {
  ProjectState,
  ProviderSummary,
  PromptContext,
  PromptImage,
  PromptReference,
} from "../shared/contracts.js";
import type {
  CloudConnectionState,
  CloudQuota,
} from "../shared/cloud-models.js";
import type { GameTuningState } from "../shared/game-tuning.js";
import type {
  DesktopWebGamePreviewBridge,
  WebGamePlayerBridge,
  WebGamePlayerRequest,
  WebGamePlayerState,
} from "../shared/web-game-player.js";
import type { AppNavigationTarget } from "./routes.js";
import type { PanelNodes } from "./panel-layout.js";
import type { ChatContextChip } from "./chat-reference.js";

export interface PublishDetails {
  title: string;
  description: string;
}
export type StoryView = "story" | "design" | "canvas" | "code" | "assets";
export interface StoryPanels {
  nodes: Record<StoryView, PanelNodes>;
  visible: ReadonlySet<StoryView>;
  onShow: (view: StoryView) => void;
}

/** Something the next chat message carries besides the open Node. */
export interface PlayableChatAttachment {
  chip: ChatContextChip;
  context: PromptContext;
}

/**
 * What the Playable editor contributes to the next chat message: the Node
 * (Scene) open in its Workbench, the elements picked or drawn on in that
 * preview, media added from it, and a moment marked in its background video.
 * Picks, the drawing, and the moment share one screenshot.
 */
export interface PlayableChatState {
  surface?: {
    /** Identifies the Node, so a removed chip comes back for another one. */
    key: string;
    chip: ChatContextChip;
    context: PromptContext;
    references: PromptReference[];
  };
  attachments: PlayableChatAttachment[];
  /** A screenshot of the preview, at the marked moment, with the picks outlined and the drawing on it. */
  capture: () => Promise<PromptImage | undefined>;
  removeAttachment: (key: string) => void;
  clearAttachments: () => void;
}

export interface StoryWorkspaceProps {
  project: ProjectState;
  onProjectUpdated?: (project: ProjectState) => void;
  publishing: boolean;
  workspaceRevision?: number;
  openFileRequest?: { path: string; id: number };
  /** A Playtest navigation request to show the Story map. */
  showStoryMap?: boolean;
  onStoryMapShown?: () => void;
  onPublish: (details: PublishDetails) => Promise<boolean>;
  publishDialog?: "open" | "success";
  onClosePublish: () => void;
  /** Receives what the open Workbench adds to the next chat message. */
  onChatContextChange?: (state: PlayableChatState | undefined) => void;
  /** Puts a request in the chat prompt. */
  onAskAgent?: (text: string) => void;
  onDesignSaveReady?: (save: (() => Promise<void>) | undefined) => void;
  onDesignContextChange?: (context: PromptContext | undefined) => void;
  /** Sends a request to the AI now, with the open Node as context. */
  onSendToAgent?: (text: string, contexts: PromptContext[]) => Promise<boolean>;
  /** The design document the next message references, by its workspace path. */
  referencedDocument?: string;
  /** References a design document in the next message, or stops referencing it. */
  onReferenceDocument?: (
    document: { id: string; title: string } | undefined,
  ) => void;
  /** Quotes text picked in the design document into the next message. */
  onQuoteDocument?: (text: string) => void;
  /**
   * The panels the views render into. Without them (in tests), the story
   * renders in place.
   */
  panels?: StoryPanels;
}

export interface RendererContributions {
  account?: {
    AuthProvider: ComponentType<{ children: ReactNode }>;
    AccountSettings: ComponentType;
    accountCloudState: (
      cloud: CloudConnectionState | undefined,
      userId: string | undefined,
    ) => CloudConnectionState | undefined;
    cloudQuotaSummary: (cloud?: CloudConnectionState) => string;
    canAffordCloudModel: (
      cloud: CloudConnectionState,
      estimatedCredits?: number,
    ) => boolean;
    CloudQuotaDetails: ComponentType<{ quota: CloudQuota }>;
    CloudQuotaStatus: ComponentType<{
      cloud: CloudConnectionState;
      estimatedCredits?: number;
      onSignIn: () => void;
    }>;
    FreeCloudAccount: ComponentType<{
      provider?: ProviderSummary;
      refreshing: boolean;
      onRefresh: () => void;
    }>;
    FreeCloudProviderDetail: ComponentType<{
      provider: ProviderSummary;
      onBack: () => void;
    }>;
    rememberPendingPublish: (
      storage: Storage,
      projectId: string,
      details: PublishDetails,
      now?: number,
    ) => void;
    takePendingPublish: (
      storage: Storage,
      projectId: string,
      now?: number,
    ) => PublishDetails | undefined;
    forgetPendingPublish: (storage: Storage) => void;
  };
  game?: {
    GameRecordButton: ComponentType<{
      projectId: string;
      gameRunning: boolean;
    }>;
    GameRecordingNotices: ComponentType;
    onGameRecordingSaved: (listener: () => void) => () => void;
    GameTuningPanel: ComponentType<{
      projectId: string;
      previewReady: boolean;
      announced?: GameTuningState;
      revision: number;
      onAskAgent?: (text: string) => void;
      onClose: () => void;
    }>;
    useWebGamePlayer: (
      projectId: string | undefined,
      url: string | undefined,
      revision?: number,
      path?: string,
    ) => WebGamePlayerState & {
      pending: boolean;
      checking: boolean;
      suspended: boolean;
      play: (request: WebGamePlayerRequest) => Promise<void>;
      close: () => Promise<void>;
      reload: () => Promise<void>;
    };
    DesktopGamePreview: ComponentType<{
      bridge: DesktopWebGamePreviewBridge;
      projectId: string;
      url: string;
      refresh: WebGamePlayerBridge["refresh"];
      reload: number;
      visible: boolean;
      onReady: (element: HTMLElement) => void;
    }>;
  };
  story?: {
    PlayableEditorWorkspace: ComponentType<StoryWorkspaceProps>;
    usePlaytestAskRequests: (
      projectId: string | undefined,
      onAsk: (text: string) => void,
    ) => void;
    PlaytestPage: ComponentType<{ projectId: string }>;
    NodeThumbnailPage: ComponentType<{ projectId: string; nodeId: string }>;
  };
  publishing?: {
    PublishDialog: ComponentType<{
      project: ProjectState;
      publishing: boolean;
      onClose: () => void;
      justPublished?: boolean;
      initialEditing?: boolean;
      coverAccessToken?: string;
      profileUrl?: string;
      available?: boolean;
      onPublish: (details: PublishDetails) => Promise<boolean>;
    }>;
  };
  community?: {
    GamesPage: ComponentType<{
      onNavigate: (page: AppNavigationTarget) => void;
      onOhMyGame: (gameId: string) => void;
    }>;
    GamePlayer: ComponentType<{
      gameId: string;
      onBack: () => void;
      onNavigate: (page: AppNavigationTarget) => void;
      onOhMyGame: (gameId: string) => void;
    }>;
    CommunityProfilePage: ComponentType<{
      authorId: string;
      onNavigate: (page: AppNavigationTarget) => void;
      onBack: () => void;
      onOpenGame: (gameId: string) => void;
    }>;
  };
}
