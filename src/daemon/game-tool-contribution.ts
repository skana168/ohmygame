import type { ProjectState } from "../shared/contracts.js";
import type {
  GameRuntimeAdapter,
  GameUseOpenTarget,
} from "../shared/playtest.js";
import type { ToolContribution } from "./tool-contributions.js";
import { gameCapabilityEnabled } from "../shared/project-runtime.js";
import { createGameUseTool } from "./playtest-tools.js";
import { gameRuntimeAvailable } from "./business-tools.js";

export function createGameToolContribution(
  project: ProjectState,
  playtest?: {
    driver: GameRuntimeAdapter;
    resolveOpenTarget: () => Promise<GameUseOpenTarget>;
  },
): ToolContribution {
  return {
    id: "game",
    tools:
      gameCapabilityEnabled(project) &&
      playtest &&
      gameRuntimeAvailable(project, playtest.driver)
        ? [
            createGameUseTool(playtest.driver, playtest.resolveOpenTarget, {
              bridge: project.type === "interactive-story" ? "reset" : "full",
            }),
          ]
        : [],
  };
}
