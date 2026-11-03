import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Check, Errors } from "typebox/value";
import {
  WORKSPACE_MANIFEST_FILE,
  WORKSPACE_MANIFEST_SCHEMA,
  type WorkspaceModuleDescriptor,
  type WorkspaceManifest,
} from "../shared/workspace-manifest.js";

export async function readWorkspaceManifest(
  workspace: string,
): Promise<WorkspaceManifest | undefined> {
  try {
    return JSON.parse(
      await readFile(path.join(workspace, WORKSPACE_MANIFEST_FILE), "utf8"),
    );
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw cause;
  }
}

export async function writeWorkspaceManifest(
  workspace: string,
  manifest: WorkspaceManifest,
): Promise<void> {
  await writeFile(
    path.join(workspace, WORKSPACE_MANIFEST_FILE),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx" },
  );
}

export function validateWorkspaceManifest(
  value: unknown,
  modules: readonly WorkspaceModuleDescriptor[],
): WorkspaceManifest {
  if (!Check(WORKSPACE_MANIFEST_SCHEMA, value)) {
    throw new Error(
      `workspace.json: ${[...Errors(WORKSPACE_MANIFEST_SCHEMA, value)].map((issue) => `${issue.instancePath || "/"}: ${issue.message}`).join("; ")}`,
    );
  }
  const manifest = value as WorkspaceManifest;
  const selected = new Set<string>();
  for (const entry of manifest.modules) {
    if (selected.has(entry.id))
      throw new Error(`workspace.json: Duplicate module ${entry.id}`);
    selected.add(entry.id);
    const descriptor = modules.find((module) => module.id === entry.id);
    if (!descriptor)
      throw new Error(
        `workspace.json: Module ${entry.id} is unavailable in this application; restore the module or explicitly change the declaration`,
      );
    if (!Check(descriptor.configSchema, entry.config)) {
      throw new Error(
        `workspace.json: Invalid configuration for ${entry.id}: ${[...Errors(descriptor.configSchema, entry.config)].map((issue) => `${issue.instancePath || "/"}: ${issue.message}`).join("; ")}`,
      );
    }
  }
  for (const entry of manifest.modules) {
    const descriptor = modules.find((module) => module.id === entry.id)!;
    for (const dependency of descriptor.requires ?? [])
      if (!selected.has(dependency))
        throw new Error(
          `workspace.json: Module ${entry.id} requires ${dependency}`,
        );
    for (const conflict of descriptor.conflicts ?? [])
      if (selected.has(conflict))
        throw new Error(
          `workspace.json: Module ${entry.id} conflicts with ${conflict}`,
        );
  }
  return structuredClone(manifest);
}
