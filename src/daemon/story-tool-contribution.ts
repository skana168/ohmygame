import {
  defineTool,
  type ToolDefinition as PiToolDefinition,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { ProjectState } from "../shared/contracts.js";
import type { ToolContribution } from "./tool-contributions.js";
import { storyCapabilityEnabled } from "../shared/project-runtime.js";
import { addPlayableNode } from "./playable-add-node.js";
import { validatePlayableProject } from "./playable-project.js";
import { PLAYABLE_PRESET_IDS, PLAYABLE_PRESETS } from "./playable-presets.js";

export function createStoryToolContribution(
  project: ProjectState,
): ToolContribution {
  return { id: "interactive-story", tools: createStoryTools(project) };
}

export function createStoryTools(project: ProjectState): PiToolDefinition[] {
  return storyCapabilityEnabled(project)
    ? [
        defineTool({
          name: "playable_add_node",
          label: "Add Node",
          description: [
            "Create a Playable Node from a Preset. Presets are starting points, not Node types: the starter source uses the Project Style and is yours to rewrite.",
            `Presets: ${PLAYABLE_PRESETS.map((preset) => `${preset.id} (${preset.label})`).join(", ")}.`,
            "The Node is added to graph.json with its starter Signals and placed on the canvas. Connect it with an edge afterwards, then edit the written files.",
          ].join("\n"),
          parameters: Type.Object({
            preset: Type.Union(
              PLAYABLE_PRESET_IDS.map((id) => Type.Literal(id)),
              { description: "Preset to start from" },
            ),
            id: Type.String({
              minLength: 1,
              maxLength: 60,
              description: "Node ID, used as the directory name under nodes/",
            }),
            title: Type.Optional(
              Type.String({
                minLength: 1,
                maxLength: 120,
                description: "Node title; defaults to the next Node N",
              }),
            ),
          }),
          execute: async (_toolCallId, input, signal) => {
            signal?.throwIfAborted();
            const result = await addPlayableNode(project.workspacePath, input);
            const signals = result.signals.length
              ? result.signals.join(", ")
              : "none";
            return {
              content: [
                {
                  type: "text",
                  text: [
                    `Added Node "${result.id}" (${result.title}) from the ${result.preset} Preset.`,
                    `Files: ${result.files.join(", ")}`,
                    `Starter Signals: ${signals}`,
                    result.brief,
                  ].join("\n"),
                },
              ],
              details: {
                playableNode: {
                  id: result.id,
                  preset: result.preset,
                  files: result.files,
                  signals: result.signals,
                },
              },
            };
          },
        }),
        defineTool({
          name: "playable_check",
          label: "Check Project",
          description: [
            "Validate the Playable Nodes project: graph.json against its schema and references, then check every Node's files and what they import the way the story's page loads them.",
            'Run it after changing the project and fix every issue it reports. Use mode "publish" before the user publishes; it also requires every Signal other than navigation ones to be connected and every source file to exist.',
          ].join("\n"),
          parameters: Type.Object({
            mode: Type.Optional(
              Type.Union([Type.Literal("draft"), Type.Literal("publish")], {
                description: "Validation strictness; defaults to draft",
              }),
            ),
          }),
          execute: async (_toolCallId, input, signal) => {
            signal?.throwIfAborted();
            const mode = input.mode ?? "draft";
            const result = await validatePlayableProject(
              project.workspacePath,
              mode,
            );
            const issues = result.issues.map(
              ({ phase, code, path: issuePath, message, surfaceId }) => ({
                phase,
                code,
                path: issuePath,
                message,
                ...(surfaceId ? { surfaceId } : {}),
              }),
            );
            const text = result.ok
              ? `The project passes ${mode} validation.`
              : [
                  `The project has ${issues.length} ${mode} validation ${issues.length === 1 ? "issue" : "issues"}:`,
                  ...issues.map(
                    (issue) =>
                      `- [${issue.phase}] ${issue.surfaceId ? `${issue.surfaceId} ` : ""}${issue.path}: ${issue.message} (${issue.code})`,
                  ),
                ].join("\n");
            return {
              content: [{ type: "text", text }],
              details: { playableCheck: { mode, ok: result.ok, issues } },
            };
          },
        }),
      ]
    : [];
}
