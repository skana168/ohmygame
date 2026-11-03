import { access, lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import type { ProjectState } from "../shared/contracts.js";
import type { ProjectPreviewSettings } from "../shared/preview-settings.js";

export class ProjectWorkspaceError extends Error {}

export interface PreviewWorkspaceStatus {
  mode?: "script" | "static" | "command";
  runnable: boolean;
  error?: string;
}

/** Resolve the configured directory and inspect its preview script in one place. */
export async function resolvePreviewWorkspace(
  project: Pick<
    ProjectState,
    | "workspacePath"
    | "startupDirectory"
    | "startupScript"
    | keyof ProjectPreviewSettings
  >,
): Promise<
  PreviewWorkspaceStatus & { absolutePath: string; relativePath: string }
> {
  const directory = await resolveStartupDirectory(
    project.workspacePath,
    project.startupDirectory ?? ".",
  );
  if (project.previewMode === "command")
    return {
      ...directory,
      runnable: !!project.previewCommand?.trim(),
      mode: "command" as const,
    };
  const script = await previewWorkspaceStatus(
    directory.absolutePath,
    project.startupScript ?? "dev",
  );
  if (
    project.previewMode === "static" ||
    ((project.previewMode ?? "auto") === "auto" &&
      !script.runnable &&
      (await exists(path.join(directory.absolutePath, "index.html"))))
  ) {
    const runnable = await exists(
      path.join(directory.absolutePath, "index.html"),
    );
    return {
      ...directory,
      runnable,
      mode: "static" as const,
      ...(!runnable
        ? { error: "This folder has no index.html to preview." }
        : {}),
    };
  }
  return { ...directory, ...script, mode: "script" as const };
}

export async function previewWorkspaceStatus(
  workspacePath: string,
  startupScript = "dev",
): Promise<PreviewWorkspaceStatus> {
  const script = normalizeStartupScript(startupScript) ?? "dev";
  const label = script === "dev" ? "dev script" : `${script} script`;
  try {
    const packageJson = JSON.parse(
      await readFile(path.join(workspacePath, "package.json"), "utf8"),
    ) as {
      scripts?: Record<string, unknown>;
    };
    const command = packageJson.scripts?.[script];
    if (typeof command !== "string" || !command.trim()) {
      return {
        runnable: false,
        error: `This folder has no ${label} that starts a preview server.`,
      };
    }
    if (isNonServerDevCommand(command)) {
      return {
        runnable: false,
        error: `This folder's ${label} runs a non-server task: ${command.trim()}`,
      };
    }
    return { runnable: true };
  } catch {
    return {
      runnable: false,
      error: `This folder has no package.json ${label} that starts a preview server.`,
    };
  }
}

function isNonServerDevCommand(command: string): boolean {
  // Inspect launchers and task names, not words inside server options or paths.
  const tokens =
    command.match(/&&|\|\||[;|]|(?:[^\s;&|"']+|"(?:\\.|[^"\\])*"|'[^']*')+/g) ??
    [];
  let start = 0;
  for (let end = 0; end <= tokens.length; end++) {
    if (end < tokens.length && !/^(?:&&|\|\||[;|])$/.test(tokens[end]!))
      continue;
    const words = tokens
      .slice(start, end)
      .map((word) => word.replace(/^(["'])(.*)\1$/, "$2").toLowerCase());
    start = end + 1;
    if (/^(?:env|cross-env|cross-env-shell)$/.test(words[0] ?? ""))
      words.shift();
    while (/^[a-z_]\w*=/.test(words[0] ?? "")) words.shift();
    if (/^(?:npm|pnpm|yarn|bun|npx|bunx)$/.test(words[0] ?? "")) {
      words.shift();
      while (/^(?:--yes|-y|--no-install|--silent|-s)$/.test(words[0] ?? ""))
        words.shift();
      if (/^(?:run|exec|x)$/.test(words[0] ?? "")) words.shift();
    }
    const launcher = path.posix.basename(words[0] ?? "");
    if (
      /^(?:build|check|eslint|fmt|format|lint|prettier|test|typecheck|electron(?:-forge|-vite|-builder)?|tauri|godot4?)$/.test(
        launcher,
      )
    )
      return true;
    if (
      /^(?:vite|next|nuxt|astro|svelte-kit|react-scripts)$/.test(launcher) &&
      /^(?:build|check|lint|test|typecheck)$/.test(words[1] ?? "")
    )
      return true;
  }
  return false;
}

export async function resolveStartupDirectory(
  workspacePath: string,
  input: string,
): Promise<{ absolutePath: string; relativePath: string }> {
  if (!isValidStartupDirectory(input)) {
    throw new ProjectWorkspaceError(
      "Startup directory must be a relative path inside the project workspace",
    );
  }
  let workspaceRoot: string;
  try {
    workspaceRoot = await realpath(workspacePath);
  } catch {
    throw new ProjectWorkspaceError("The project workspace is not available");
  }
  const configured = normalizeStartupDirectory(input) ?? ".";
  const candidate = path.resolve(workspaceRoot, configured);
  if (!pathContains(workspaceRoot, candidate)) {
    throw new ProjectWorkspaceError(
      "Startup directory must be inside the project workspace",
    );
  }
  let absolutePath: string;
  try {
    absolutePath = await realpath(candidate);
  } catch {
    throw new ProjectWorkspaceError("Startup directory does not exist");
  }
  if (!pathContains(workspaceRoot, absolutePath)) {
    throw new ProjectWorkspaceError(
      "Startup directory must be inside the project workspace",
    );
  }
  if (!(await lstat(absolutePath)).isDirectory()) {
    throw new ProjectWorkspaceError("Startup directory must be a folder");
  }
  const relativePath = path
    .relative(workspaceRoot, absolutePath)
    .replaceAll(path.sep, "/");
  return { absolutePath, relativePath: relativePath || "." };
}

export function isValidStartupDirectory(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    trimmed === "" ||
    trimmed === "." ||
    normalizeStartupDirectory(trimmed) !== undefined
  );
}

export function normalizeStartupDirectory(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized || normalized === ".") return undefined;
  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized))
    return undefined;
  const parts = normalized.split("/");
  if (parts.some((part) => !part || part === "." || part === ".."))
    return undefined;
  return parts.join("/");
}

export function normalizeStartupScript(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9:._-]*$/.test(normalized)
    ? normalized
    : undefined;
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function pathContains(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}
