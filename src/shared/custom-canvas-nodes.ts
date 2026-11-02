import { EXAMPLE_WORKSPACE_MODULE } from "../modules/example/manifest.js";
import type { WorkspaceModuleDescriptor } from "./workspace-manifest.js";
import { Check, Errors } from "typebox/value";
import type { AssetCanvasNode } from "./contracts.js";

export type CustomCanvasNode = Extract<AssetCanvasNode, { type: "custom" }>;
export interface CanvasNodeContribution {
  module: string;
  kind: string;
  dataSchema: object;
}

/** Compiled source registrations, never imports from workspace files. */
export function collectCanvasNodeContributions(
  modules: readonly WorkspaceModuleDescriptor[],
): readonly CanvasNodeContribution[] {
  const identities = new Set<string>();
  return modules.flatMap((module) =>
    (module.canvasNodes ?? []).map((node) => {
      const identity = `${module.id}/${node.kind}`;
      if (identities.has(identity))
        throw new Error(`Duplicate canvas node contribution: ${identity}`);
      identities.add(identity);
      return { module: module.id, ...node };
    }),
  );
}

export const canvasNodeContributions = collectCanvasNodeContributions([
  EXAMPLE_WORKSPACE_MODULE,
]);

export function customCanvasNodeIssue(
  data: CustomCanvasNode["data"],
  contributions: readonly CanvasNodeContribution[] = canvasNodeContributions,
): string | undefined {
  const contribution = contributions.find(
    (entry) => entry.module === data.module && entry.kind === data.kind,
  );
  if (!contribution)
    return `Missing canvas module or node: ${data.module}/${data.kind}. Restore its source registration; saved data is preserved.`;
  if (!Check(contribution.dataSchema, data.value)) {
    return `Invalid ${data.module}/${data.kind} data: ${[...Errors(contribution.dataSchema, data.value)].map((issue) => `${issue.instancePath || "/"}: ${issue.message}`).join("; ")}`;
  }
  return undefined;
}
