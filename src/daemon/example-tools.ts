import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { ProjectState } from "../shared/contracts.js";
import type { ToolContribution } from "./tool-contributions.js";

/** Minimal opt-in, non-game source module. It performs no workspace I/O. */
export function createExampleToolContribution(
  project: ProjectState,
): ToolContribution {
  return {
    id: "example",
    tools: [
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
