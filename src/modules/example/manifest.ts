import type { WorkspaceModuleDescriptor } from "../../shared/workspace-manifest.js";

/** Opt in from application composition; this descriptor never enables game services. */
export const EXAMPLE_WORKSPACE_MODULE: WorkspaceModuleDescriptor = {
  id: "example",
  configSchema: { type: "object", additionalProperties: false, properties: {} },
  agentInstructions:
    "Use example_note to create or update example/note custom canvas nodes. Read the board and pass its current revision. The payload is {text: string (up to 4000 characters), done: boolean}. Preserve unknown custom nodes and their data. Run canvas_check after editing canvas JSON.",
  canvasNodes: [
    {
      kind: "note",
      dataSchema: {
        type: "object",
        additionalProperties: false,
        required: ["text", "done"],
        properties: {
          text: { type: "string", maxLength: 4000 },
          done: { type: "boolean" },
        },
      },
    },
  ],
};
