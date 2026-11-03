import { updateCustomCanvasNode } from "./canvas-workspace.js";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { ProjectState } from "../shared/contracts.js";
import type { ToolContribution } from "./tool-contributions.js";

/** Minimal opt-in, non-game source module with a persisted canvas note. */
export function createExampleToolContribution(
  project: ProjectState,
): ToolContribution {
  return {
    id: "example",
    tools: [
      defineTool({
        name: "example_note",
        label: "Save Example Note",
        description: "Create or update an example/note custom canvas node. Read the board first and pass its current revision. Preserves unrelated nodes; stale revisions are rejected.",
        parameters: Type.Object({
          boardId: Type.String({ pattern: "^[a-zA-Z0-9_-]{1,100}$" }),
          nodeId: Type.String({ minLength: 1, maxLength: 120 }),
          revision: Type.String({ minLength: 1 }),
          text: Type.String({ maxLength: 4000 }),
          done: Type.Boolean(),
        }),
        execute: async (_id, input, signal) => {
          const detail = await updateCustomCanvasNode(project, { ...input, data: { module: "example", kind: "note", value: { text: input.text, done: input.done } } }, signal);
          return { content: [{ type: "text", text: `Saved note ${input.nodeId} in board ${input.boardId}.` }], details: { boardId: input.boardId, nodeId: input.nodeId, revision: detail.revision } };
        },
      }),
      defineTool({
        name: "example_echo",
        label: "Echo Message",
        description:
          "Return a message in the current workspace. A minimal business tool example.",
        parameters: Type.Object({
          message: Type.String({ minLength: 1, maxLength: 1000 }),
        }),
        execute: async (_id, input, signal) => {
          signal?.throwIfAborted();
          return {
            content: [{ type: "text", text: input.message }],
            details: { workspaceId: project.id },
          };
        },
      }),
    ],
  };
}
