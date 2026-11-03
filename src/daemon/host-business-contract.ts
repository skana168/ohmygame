import type { FastifyInstance } from "fastify";
import type {
  ProjectState,
  CommunityGame,
  PublishResult,
  MediaModelCatalog,
  Model3DModel,
  ProviderSummary,
} from "../shared/contracts.js";
import type { RuntimeEventBus } from "../shared/events.js";
import type {
  GameRuntimeAdapter,
  GameUseOpenTarget,
} from "../shared/playtest.js";
import type {
  GameTuningScalar,
  GameTuningState,
} from "../shared/game-tuning.js";
import type {
  NodeCodebase,
  NodeCodebaseDetail,
  NodeCodebaseUpdate,
} from "../shared/playable-codebase.js";
import type {
  CloudCatalog,
  CloudConnectionState,
  CloudGenerationJob,
  CloudQuotaSnapshot,
} from "../shared/cloud-models.js";
import type { Model3DGenerationInput, Model3DGenerator } from "./model3d.js";
import type {
  CommunityGameStats,
  CommunityGamesQuery,
  CommunityProfile,
} from "../shared/publish-v1.js";
import type { AgentManager } from "./agent.js";
import type { AssetLibrary } from "./asset-library.js";
import type { CheckpointStore } from "./checkpoints.js";
import type { ProjectManager } from "./projects.js";
import type { ProjectWrites } from "./project-writes.js";
import type { createAgentTools } from "./agent-tools.js";
import type { BusinessToolSelection } from "./business-tools.js";
import type { ToolDefinition } from "@earendil-works/pi-coding-agent";

type Project = Pick<ProjectState, "id" | "workspacePath">;
type CoreArguments = Parameters<typeof createAgentTools>;

export interface GameTuning {
  /** What the file says now, with the changes not saved yet. */
  state(project: Project): Promise<GameTuningState>;
  /** Reads the file again and passes on what changed. */
  refresh(project: Project): Promise<void>;
  /** Changes values without saving them; null goes back to what is saved. */
  setDraft(
    project: Project,
    changes: Record<string, GameTuningScalar | null>,
  ): Promise<GameTuningState>;
  /**
   * Writes the draft to the file, through `write` so it can become an undoable
   * change. A value moved while this ran stays a draft.
   */
  save<R>(
    project: Project,
    write: (operation: () => Promise<void>) => Promise<R>,
  ): Promise<R>;
  setConnected(project: Project, connected: boolean): void;
  forget(project: Project): void;
}

export interface CloudModelsClient extends Model3DGenerator {
  setSession(
    input: {
      accessToken: string;
      userId: string;
    } | null,
  ): Promise<void>;
  refresh(force?: boolean): Promise<void>;
  quotas(): Promise<CloudQuotaSnapshot | null>;
  hasProvider(providerId: string): boolean;
  /**
   * Return the currently known provider state without starting or awaiting a
   * network request. Settings pages use this snapshot so a slow cloud service
   * cannot hold the whole provider list hostage.
   */
  providersSnapshot(isEnabled: (id: string) => boolean): ProviderSummary[];
  connection(provider: string): CloudConnectionState;
  /** Like providersSnapshot, but for the cloud model settings panel. */
  catalogSnapshot(): CloudCatalog;
  catalog(): Promise<MediaModelCatalog<Model3DModel>>;
  jobs(): Promise<CloudGenerationJob[]>;
  result(id: string, signal?: AbortSignal): Promise<Buffer>;
  generate(
    input: Model3DGenerationInput,
    signal?: AbortSignal,
  ): Promise<{
    bytes: Buffer<ArrayBufferLike>;
    mediaType: "model/gltf-binary";
    requestId: string;
  }>;
}

export interface ArtifactBuilder {
  create(project: ProjectState, cover?: Buffer): Promise<Buffer>;
  /** The game as it would publish, without the size limit, for hosting elsewhere. */
  build(project: ProjectState): Promise<Buffer>;
  close(): Promise<void>;
}

export interface RemotePublisher {
  publish(
    project: ProjectState,
    artifact: Buffer,
    accessToken: string,
    metadata: {
      title: string;
      description?: string;
    },
  ): Promise<PublishResult>;
  community(
    metrics?: boolean,
    accessToken?: string,
    options?: CommunityGamesQuery,
  ): Promise<CommunityGame[]>;
  communityGame(
    gameId: string,
    metrics?: boolean,
    accessToken?: string,
  ): Promise<CommunityGame>;
  communityGameCover(
    gameId: string,
    deploymentId: string,
    accessToken?: string,
  ): Promise<Buffer>;
  profile(authorId: string, accessToken?: string): Promise<CommunityProfile>;
  myGames(accessToken: string): Promise<CommunityProfile>;
  updateCommunityGame(
    gameId: string,
    accessToken: string,
    metadata: {
      title: string;
      description?: string;
    },
  ): Promise<void>;
  setLike(
    gameId: string,
    accessToken: string | undefined,
    liked: boolean,
  ): Promise<CommunityGameStats>;
  unpublish(gameId: string, accessToken: string): Promise<void>;
}

export interface RemotePublisherOptions {
  apiUrl: string;
  fetch?: typeof fetch;
  visitorTokenFile?: string;
}

export interface LocalPublisher {
  publish(
    project: ProjectState,
    artifact: Buffer,
    accessToken: string,
    metadata: {
      title: string;
      description?: string;
    },
  ): Promise<PublishResult>;
  community(
    metrics?: boolean,
    accessToken?: string,
    options?: CommunityGamesQuery,
  ): Promise<CommunityGame[]>;
  communityGame(
    gameId: string,
    metrics?: boolean,
    accessToken?: string,
  ): Promise<CommunityGame>;
  profile(authorId: string, accessToken?: string): Promise<CommunityProfile>;
  myGames(accessToken: string): Promise<CommunityProfile>;
  unpublish(gameId: string, accessToken: string): Promise<void>;
  updateCommunityGame(
    gameId: string,
    accessToken: string,
    metadata: {
      title: string;
      description?: string;
    },
  ): Promise<void>;
  setLike(
    gameId: string,
    accessToken: string | undefined,
    liked: boolean,
  ): Promise<CommunityGameStats>;
  communityGameCover(
    gameId: string,
    deploymentId: string,
    accessToken?: string,
  ): Promise<Buffer>;
  close(): Promise<void>;
}

/** The optional application services core consumes. Implementations satisfy this
 * contract; selecting a host never requires importing an absent implementation. */
export interface HostBusiness {
  registerStoryProjectRoutes: (
    app: FastifyInstance,
    options: {
      projects: ProjectManager;
      storyEnabled: (project: ProjectState) => boolean;
      storyHostEnabled: boolean;
      storyUnavailable: string;
    },
  ) => void;
  registerStoryWebRoutes: (
    app: FastifyInstance,
    options: {
      projects: ProjectManager;
      enabled: (project: ProjectState) => boolean;
      agents: AgentManager;
      writes: ProjectWrites;
      checkpoints: CheckpointStore;
      snapshot: (project: ProjectState) => Promise<string>;
      library: AssetLibrary;
      events: RuntimeEventBus;
      busy: (id: string) => boolean;
    },
  ) => void;
  storyWebEditorBridge: () => Promise<string>;
  GameTuning: new (options: {
    /** Gives the running game every value it should use. */
    push: (project: Project, values: Record<string, GameTuningScalar>) => void;
    publish: (project: Project, state: GameTuningState) => void;
  }) => GameTuning;
  GameTuningError: new (...args: ConstructorParameters<typeof Error>) => Error;
  OwnedPlaytestDriver: new (
    driver: GameRuntimeAdapter,
    projectId?: string,
  ) => GameRuntimeAdapter & { cleanup(): Promise<void>; close(): void };
  ProcessPlaytestDriver: new () => GameRuntimeAdapter & { close(): void };
  createGameUseTool: (
    driver: GameRuntimeAdapter,
    resolve: () => Promise<GameUseOpenTarget>,
  ) => ToolDefinition;
  ArtifactBuilder: new () => ArtifactBuilder;
  PublishError: new (
    message: string,
    statusCode?: number,
  ) => Error & { statusCode: number };
  RemotePublishError: new (
    message: string,
    statusCode?: number,
    code?: string,
  ) => Error & { statusCode: number };
  RemotePublisher: new (options: RemotePublisherOptions) => RemotePublisher;
  LocalPublisher: new () => LocalPublisher;
  registerCommunityRoutes: (
    app: FastifyInstance,
    publisher: RemotePublisher | LocalPublisher,
    projects: ProjectManager,
  ) => void;
  CloudModelsClient: new (
    apiUrl: string,
    request?: typeof fetch,
    wait?: (milliseconds: number, signal: AbortSignal) => Promise<unknown>,
  ) => CloudModelsClient;
  isWebStory: (workspacePath: string) => Promise<boolean>;
  createNodeCodebase: (
    workspacePath: string,
    codebase: NodeCodebase,
  ) => Promise<void>;
  createPlayableStarterCodebase: (
    title: string,
    viewport: { width: number; height: number },
  ) => NodeCodebase;
  NodeCodebaseError: new (
    ...args: ConstructorParameters<typeof Error>
  ) => Error;
  readPlayableCover: (workspacePath: string) => Promise<Buffer | undefined>;
  createAgentTools: (
    project: CoreArguments[0],
    tools: CoreArguments[1],
    projects: CoreArguments[2],
    ask?: CoreArguments[3],
    install?: CoreArguments[4],
    playtest?: {
      driver: GameRuntimeAdapter;
      resolveOpenTarget: () => Promise<GameUseOpenTarget>;
    },
    search?: CoreArguments[5],
    canvas?: CoreArguments[6],
    contributions?: CoreArguments[7],
    selection?: BusinessToolSelection,
  ) => ReturnType<typeof createAgentTools>;
  AGENT_INSTRUCTIONS: string;
  changeNodeCodebase: (
    workspacePath: string,
    change: (
      codebase: NodeCodebaseDetail,
    ) =>
      | (NodeCodebaseUpdate & {
          files?: Record<string, string>;
          missingFiles?: Record<string, string>;
          missingFileCopies?: Record<string, string>;
        })
      | undefined
      | Promise<
          | (NodeCodebaseUpdate & {
              files?: Record<string, string>;
              missingFiles?: Record<string, string>;
              missingFileCopies?: Record<string, string>;
            })
          | undefined
        >,
  ) => Promise<void>;
  ensureNodeCodebaseContract: (workspacePath: string) => Promise<void>;
}
