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
Tool catalog gating and module-dependent renderer policy are separate boundaries;
a manifest alone does not implement those policies.

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
