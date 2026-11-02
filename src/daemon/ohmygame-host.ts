import { storyWebEditorBridge } from "./story-web-bundle.js";
import { GameTuning, GameTuningError } from "./game-tuning.js";
import { registerStoryWebRoutes } from "./story-web-routes.js";
import { isWebStory } from "./story-web-project.js";
import { OwnedPlaytestDriver } from "./owned-playtest.js";
import { createGameUseTool } from "./playtest-tools.js";
import { ArtifactBuilder, PublishError } from "./publish/archive.js";
import { RemotePublisher, RemotePublishError } from "./publish/client.js";
import { registerCommunityRoutes } from "./publish/community-routes.js";
import { LocalPublisher } from "./publish/local.js";
import { CloudModelsClient } from "./cloud-models.js";
import {
  buildPlayableProject,
  validatePlayableProject,
} from "./playable-project.js";
import {
  createNodeCodebase,
  createPlayableStarterCodebase,
  NodeCodebaseConflictError,
  NodeCodebaseError,
  openNodeCodebaseDetail,
  writeNodeCodebase,
} from "./playable-codebase.js";
import { addPlayableNode } from "./playable-add-node.js";
import { PLAYABLE_PRESETS } from "./playable-presets.js";
import {
  listPlayableThumbnails,
  PlayableThumbnailError,
  readGraphNodeIds,
  readPlayableCover,
  readPlayableThumbnail,
  writePlayableThumbnail,
} from "./playable-thumbnails.js";
import { createAgentTools } from "./ohmygame-agent-tools.js";
import { ProcessPlaytestDriver } from "./playtest-driver.js";
import {
  AGENT_INSTRUCTIONS,
  changeNodeCodebase,
  ensureNodeCodebaseContract,
} from "./playable-codebase.js";

export const ohmygameHost = {
  get storyWebEditorBridge() {
    return storyWebEditorBridge;
  },
  get GameTuning() {
    return GameTuning;
  },
  get GameTuningError() {
    return GameTuningError;
  },
  get registerStoryWebRoutes() {
    return registerStoryWebRoutes;
  },
  get isWebStory() {
    return isWebStory;
  },
  get OwnedPlaytestDriver() {
    return OwnedPlaytestDriver;
  },
  get createGameUseTool() {
    return createGameUseTool;
  },
  get ArtifactBuilder() {
    return ArtifactBuilder;
  },
  get PublishError() {
    return PublishError;
  },
  get RemotePublisher() {
    return RemotePublisher;
  },
  get RemotePublishError() {
    return RemotePublishError;
  },
  get registerCommunityRoutes() {
    return registerCommunityRoutes;
  },
  get LocalPublisher() {
    return LocalPublisher;
  },
  get CloudModelsClient() {
    return CloudModelsClient;
  },
  get buildPlayableProject() {
    return buildPlayableProject;
  },
  get validatePlayableProject() {
    return validatePlayableProject;
  },
  get createNodeCodebase() {
    return createNodeCodebase;
  },
  get createPlayableStarterCodebase() {
    return createPlayableStarterCodebase;
  },
  get NodeCodebaseConflictError() {
    return NodeCodebaseConflictError;
  },
  get NodeCodebaseError() {
    return NodeCodebaseError;
  },
  get openNodeCodebaseDetail() {
    return openNodeCodebaseDetail;
  },
  get writeNodeCodebase() {
    return writeNodeCodebase;
  },
  get addPlayableNode() {
    return addPlayableNode;
  },
  get PLAYABLE_PRESETS() {
    return PLAYABLE_PRESETS;
  },
  get listPlayableThumbnails() {
    return listPlayableThumbnails;
  },
  get PlayableThumbnailError() {
    return PlayableThumbnailError;
  },
  get readGraphNodeIds() {
    return readGraphNodeIds;
  },
  get readPlayableCover() {
    return readPlayableCover;
  },
  get readPlayableThumbnail() {
    return readPlayableThumbnail;
  },
  get writePlayableThumbnail() {
    return writePlayableThumbnail;
  },
  get createAgentTools() {
    return createAgentTools;
  },
  get ProcessPlaytestDriver() {
    return ProcessPlaytestDriver;
  },
  get AGENT_INSTRUCTIONS() {
    return AGENT_INSTRUCTIONS;
  },
  get changeNodeCodebase() {
    return changeNodeCodebase;
  },
  get ensureNodeCodebaseContract() {
    return ensureNodeCodebaseContract;
  },
};
