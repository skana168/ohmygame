import { applicationCompositionId } from "./application-selection.js";
import { EXAMPLE_WORKSPACE_MODULE } from "../modules/example/manifest.js";
import {
  OHMYGAME_WORKSPACE_MODULES,
  type WorkspaceManifest,
  type WorkspaceModuleDescriptor,
} from "./workspace-manifest.js";
import type { ProjectType } from "./contracts.js";

export type ApplicationCompositionId = "ohmygame" | "non-game";

export interface ApplicationComposition {
  id: ApplicationCompositionId;
  modules: readonly WorkspaceModuleDescriptor[];
  projectTypes: readonly ProjectType[];
  defaultProjectType: ProjectType;
  defaultManifest?: WorkspaceManifest;
  game: boolean;
  story: boolean;
  accountServices: boolean;
  publishing: boolean;
  community: boolean;
}

export const applicationCompositions: Record<
  ApplicationCompositionId,
  ApplicationComposition
> = {
  ohmygame: {
    id: "ohmygame",
    modules: OHMYGAME_WORKSPACE_MODULES,
    projectTypes: [
      "web-game",
      "interactive-story",
      "asset-canvas",
      "godot-game",
      "general",
    ],
    defaultProjectType: "web-game",
    game: true,
    story: true,
    accountServices: true,
    publishing: true,
    community: true,
  },
  "non-game": {
    id: "non-game",
    modules: [EXAMPLE_WORKSPACE_MODULE],
    projectTypes: ["general", "asset-canvas"],
    defaultProjectType: "general",
    defaultManifest: { version: 1, modules: [{ id: "example", config: {} }] },
    game: false,
    story: false,
    accountServices: false,
    publishing: false,
    community: false,
  },
};

// Source-owned selection shared by the renderer, daemon, desktop and build scripts.
// Applications select their composition here before building.
export const applicationComposition =
  applicationCompositions[applicationCompositionId];
