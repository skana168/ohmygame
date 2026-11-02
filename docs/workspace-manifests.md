# Workspace manifests

`POST /projects` accepts an optional `workspaceManifest`. `GET /projects` and
project responses return the validated declaration as `workspaceManifest`.
The workspace stores it in root `workspace.json`, separately from registration
metadata and the existing `canvas/` structure:

```json
{
  "version": 1,
  "modules": [{ "id": "game", "config": {} }]
}
```

Version 1 requires an object containing only `version` and `modules`. Each module
entry requires `id` and an object `config`. The schema is exported as
`WORKSPACE_MANIFEST_SCHEMA` from `src/shared/workspace-manifest.ts`.
Unknown versions, duplicate module IDs, unavailable modules, invalid configuration,
missing dependencies, and conflicting modules produce actionable errors.
Creation returns HTTP 400 for an invalid declaration before initializing files.

The application supplies `createApp({ workspaceModules })` descriptors from
source. Each descriptor has an ID and JSON Schema for configuration, and may
supply `requires`, `conflicts`, and English `agentInstructions`. Workspace JSON
cannot import code or install modules. IDs should match the corresponding tool
contribution owners. The default OhMyGame descriptors are `game` and
`interactive-story`; the latter requires `game`. Both currently accept only an
empty configuration object. Core capabilities do not need a module entry.
Module selection controls host-contributed tools in Pi, supported coding-agent
bridges, and bound external MCP sessions. Host `businessTools` flags remain an
upper bound: a manifest cannot enable a tool disabled by the application. Source
contribution IDs identify their owning modules; select those IDs to expose their
tools. Before binding a workspace, external MCP advertises the application catalog;
after `open_project`, `tools/list` reflects that workspace. Direct calls to tools
outside the selection fail. Invalid declarations disable business tools while
retaining files and diagnostics.

Fresh workspaces, including example and plugin project creation, receive a
manifest. An explicit declaration takes precedence over fresh-workspace defaults.
Without one, OhMyGame selects `game` for game/general projects,
`game` plus `interactive-story` for stories, and no modules for Asset Canvas.
Fresh defaults include only application-supplied modules and are validated for
dependencies. Root `AGENTS.md` is initialized only if absent, with workspace and
selected module guidance. Example/plugin instructions and user-authored
instructions are retained. Existing context-file scoping remains unchanged.

Adopting a folder with `workspace.json` validates and retains its declaration;
creation cannot replace an existing declaration with another selection. A
nonempty historical folder without a manifest retains its project type and uses
the equivalent OhMyGame selection in memory, with `workspaceManifestLegacy: true`.
Loading does not write a manifest or replace its instructions. Historical stories
retain story capability; other game/general projects retain game capability, and
Asset Canvas retains no business modules.

On daemon restart, an invalid manifest or unavailable module leaves the project
registration visible with `workspaceDiagnostics`. Legacy declarations also report
unavailable inferred modules while retaining their original inferred selection.
The loader does not repair or rewrite the manifest, canvas, assets, or instructions.
Restore the required application module or explicitly repair `workspace.json`, then
restart the daemon. No module-selection update endpoint is introduced here;
project rename and other metadata updates leave the declaration unchanged.

## Non-game workspaces

Choose **Workspace** in the new-project dialog to create a general-purpose
workspace with `{"version":1,"modules":[]}`. It opens with Chat, Canvas, Code and
Assets, without game design navigation. General Game remains a separate choice
with its existing game defaults. The API equivalent is `POST /projects` with
`type: "general"` and the empty declaration. A fresh non-game workspace starts
with Web preview disabled; preview and publishing implementations remain part of
the OhMyGame application.

Non-game canvases support multiple boards, ordinary Markdown documents, typed
tables, semantic references, assets and editor layouts in the existing `canvas/`
structure. No document is automatically selected as a main game design document,
and the main-game-document action is unavailable. Agent guidance treats documents
as references rather than requiring game design, gameplay or production art.
Game-module workspaces retain game design guidance and main-document behavior;
Asset Canvas retains its single-board policy. Historical workspaces keep the
same inferred policies. Schema validation, revision conflicts and renderer draft
preservation use the same paths in every workspace.

Existing root and canvas `AGENTS.md` files are preserved. A previously authored
instruction can still contain domain-specific guidance; selecting modules does
not rewrite user instructions. Restart to load deliberate manifest repairs or
changes; the creation API does not replace an existing declaration.
