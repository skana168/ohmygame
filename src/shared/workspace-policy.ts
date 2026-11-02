import type { ProjectState } from "./contracts.js";

type Workspace = Pick<ProjectState, "type"> &
  Partial<Pick<ProjectState, "workspaceManifest" | "workspaceDiagnostics">>;

/** Invalid declarations fail closed; absent declarations retain historical capabilities. */
export function workspaceHasModule(project: Workspace, id: string): boolean {
  if (project.workspaceDiagnostics?.length) return false;
  if (project.workspaceManifest)
    return project.workspaceManifest.modules.some((entry) => entry.id === id);
  return id === "game"
    ? project.type !== "asset-canvas"
    : id === "interactive-story" && project.type === "interactive-story";
}

/** Business rules layered over the shared canvas file contract. */
export function canvasPolicy(project: Workspace) {
  return {
    gameDesign:
      project.type !== "asset-canvas" && workspaceHasModule(project, "game"),
    singleBoard: project.type === "asset-canvas",
  };
}
