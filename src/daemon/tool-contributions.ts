import type { ToolDefinition } from "@earendil-works/pi-coding-agent";

/** A source-registered module's tools, already bound to the current workspace/session. */
export interface ToolContribution<T extends { name: string } = ToolDefinition> {
  id: string;
  tools: readonly T[];
}

/** Compose without changing schemas, handlers, ordering, or execution ownership. */
export function composeToolContributions<T extends { name: string }>(
  contributions: readonly ToolContribution<T>[],
): T[] {
  const owners = new Map<string, string>();
  const tools: T[] = [];
  for (const contribution of contributions) {
    for (const tool of contribution.tools) {
      const owner = owners.get(tool.name);
      if (owner !== undefined) {
        throw new Error(
          `Duplicate tool ${tool.name} contributed by ${owner} and ${contribution.id}`,
        );
      }
      owners.set(tool.name, contribution.id);
      tools.push(tool);
    }
  }
  return tools;
}
