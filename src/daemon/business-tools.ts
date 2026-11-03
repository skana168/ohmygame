import type { ProjectState } from "../shared/contracts.js";
import type { GameRuntimeAdapter } from "../shared/playtest.js";
import { buildsWebPreview, supportsWebPreview } from "../shared/project-runtime.js";

/** Host selection; workspace declarations further restrict game availability. */
export interface BusinessToolSelection {
  game?: boolean;
  story?: boolean;
}

/** Preserve the shipped adapter's project and environment constraints. */
export function gameRuntimeAvailable(project: ProjectState, driver?: GameRuntimeAdapter): boolean {
  return !!driver?.available &&
    (driver.capabilities.projectTypes.includes(project.type) || buildsWebPreview(project)) &&
    (project.type !== "general" || supportsWebPreview(project));
}
