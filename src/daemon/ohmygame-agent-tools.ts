import type {
  GameRuntimeAdapter,
  GameUseOpenTarget,
} from "../shared/playtest.js";
import { workspaceHasModule } from "../shared/workspace-policy.js";
import { createAgentTools as createCoreAgentTools } from "./agent-tools.js";
import { createGameToolContribution } from "./game-tool-contribution.js";
import { createStoryToolContribution } from "./story-tool-contribution.js";
import type { BusinessToolSelection } from "./business-tools.js";

export {
  activePiToolNames,
  planningPiToolNames,
  projectPiToolNames,
} from "./agent-tools.js";
export type {
  AskQuestionnaire,
  InstallPlugin,
  SearchWeb,
} from "./agent-tools.js";

type CoreArguments = Parameters<typeof createCoreAgentTools>;

/** OhMyGame owns its implementation references and preserves the shipped catalog order. */
export function createAgentTools(
  project: CoreArguments[0],
  tools: CoreArguments[1],
  projects: CoreArguments[2],
  askQuestionnaire?: CoreArguments[3],
  installPlugin?: CoreArguments[4],
  playtest?: {
    driver: GameRuntimeAdapter;
    resolveOpenTarget: () => Promise<GameUseOpenTarget>;
  },
  searchWeb?: CoreArguments[5],
  canvasStore?: CoreArguments[6],
  contributions: NonNullable<CoreArguments[7]> = [],
  selection: BusinessToolSelection = {},
) {
  return createCoreAgentTools(
    project,
    tools,
    projects,
    askQuestionnaire,
    installPlugin,
    searchWeb,
    canvasStore,
    contributions,
    {
      beforeCanvas:
        selection.story === false ||
        !workspaceHasModule(project, "interactive-story")
          ? []
          : [createStoryToolContribution(project)],
      afterCanvas:
        selection.game === false || !workspaceHasModule(project, "game")
          ? []
          : [createGameToolContribution(project, playtest)],
    },
  );
}
