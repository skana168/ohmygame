# Ticket 03 implementation report

Status: implementation complete; ticket remains claimed pending merger review.

- Branch: `t3/workspace-manifest-validation`
- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-8f350c20`
- Implementation commit: `ebbd8a11`
- Tested integration merge: `e9de3dd8` (includes integration `c8ab8d60`, ticket 11 identity and ticket 02 tool selection).
- Initial integration prerequisite `7ea3c608` was confirmed as an ancestor before edits.
- Applied `/tmp/ohmytemplate-recovery-03/working.patch` after a clean applicability check. The original worktree and recovery files were left intact. No extra checkout, subagent, push, or PR was created.

## Delivered contract

`POST /projects` accepts `workspaceManifest`; project responses and `GET /projects`
return the declaration. Fresh creation persists root `workspace.json` with version 1,
module IDs and configurations. Application-supplied descriptors define configuration
JSON Schemas, requirements, conflicts, and optional agent guidance. Declarations do
not import code. Examples and plugin projects finalize their manifest after their
starter files, preserving starter instructions. Root instructions use exclusive
creation and do not overwrite user-authored files.

The loader diagnoses unsupported/malformed declarations and unavailable modules
while retaining the registration and all existing workspace files. Pre-manifest
OhMyGame projects retain inferred game/story capabilities and their original type
without writing a manifest. Unavailable inferred legacy modules are diagnosed
without erasing that selection. Duplicate/import loading retains declarations.
Workspace metadata no longer counts as source output for automatic preview startup.

The public contract and compatibility details are documented in
[workspace-manifests.md](../../../docs/workspace-manifests.md), linked from the docs index.

## Acceptance evidence

| Criterion                                                      | Evidence                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public create/load persist selection and configuration         | `test/app.test.ts`: explicit manifest through creation, rename and daemon restart; custom `notes` configuration through restart. `test/examples.test.ts`: explicit declaration retained during example copy. Existing project/archive coverage checks duplication and export/import.          |
| Structure, versions, schemas and module combinations validated | Public API cases reject version 2/99, malformed module arrays, unknown game config, arbitrary path IDs, duplicate IDs, missing story dependency, invalid custom language and a conflicting custom module. Errors identify the relevant field/module.                                          |
| Only application-supplied modules selectable                   | `./arbitrary.js` rejected as unavailable; custom modules only accepted when supplied through `workspaceModules`. No dynamic loader exists in the manifest path.                                                                                                                               |
| Missing modules and errors preserve user data                  | API restart fixtures retain exact manifest, instructions, canvas and asset bytes for missing modules, version 99 and broken JSON. Invalid creation leaves notes and registration untouched. Plugin adoption with an invalid persisted manifest does not even initialize `ohmygame.json`.      |
| Instructions initialized without overwriting; scoping retained | Fresh root instructions and custom module guidance asserted through API-created workspaces. Adopted story user instructions remain byte-identical. Existing `agent-context-files.test.ts` passes workspace/global versus sibling/repository scoping checks.                                   |
| Historical OhMyGame compatibility                              | Adopted pre-manifest story remains story with game + story selection across daemon restart and no manifest written. `project-loading.test.ts` checks unavailable inferred game modules retain type, selection and user rules. Existing legacy project, canvas migration and story tests pass. |
| Existing coverage extended without losing assertions           | Extended app, example, project-loading, project, workspace-file and archive suites. File-list assertions now include the two new contract files; provenance finds its named asset rather than assuming the first file. Existing preview checkpoint regression retained and passes.            |
| Documentation and validation recorded                          | Contract guide, checks below, and remaining validation listed here.                                                                                                                                                                                                                           |

## Red-green work after recovery

Inherited code was run and inspected rather than assumed valid. The inherited
rename test had accidentally replaced a response with an assertion result; this
was repaired. Fresh-file expectations were updated for the new contract.

Observed red-to-green slices at the approved daemon/persistence seams:

1. Example creation ignored an explicit empty module selection; forwarded the declaration through the example path.
2. Reopening an already registered external folder bypassed validation; validated before early return.
3. Legacy game selection with an application missing `game` had no diagnostic; retained inferred selection and added an availability diagnostic.
4. Invalid persisted manifests reached plugin adoption after `ohmygame.json` was written; moved persisted validation before adoption.
5. An explicit replacement declaration was silently ignored for a registered folder; reject replacement before early return, comparing values independently of object key ordering.
6. Existing waiting-preview checkpoint test failed because generated root metadata looked like source output; exclude `workspace.json` and `AGENTS.md` from source detection. Existing preview startup tests still pass.

## Checks

Bun 1.4.2 was supplied using the requested PATH. `bun install --frozen-lockfile`
succeeded; the lockfile is unchanged.

The complete public sequence passed on identity-integrated commit `c7789149`:

- `bun run prepare:preinstalled-plugins`
- `bun run changelog:check`
- `bun run typecheck`
- `bun run lint`
- `bun run test`: **352 files passed, 3 skipped; 4,254 tests passed, 41 skipped**.
- `bun run build:renderer`
- `bun run test:node-runtime`: actual daemon startup, authenticated API, story creation/upgrade/preview, export/import, MCP/extension hosts and graceful shutdown passed.

After merging latest integration `c8ab8d60` into `e9de3dd8`, reran:

- Type checking and lint: passed.
- Fourteen affected suites: **365 tests passed** (`app`, `examples`, `project-loading`, `projects`, `workspace-files-api`, `project-archive`, `preview`, `preview-checkpoints`, `agent-context-files`, `canvas-migration`, `agent-tools`, `external-mcp`, `agent-runtime-session`, `agent-runtime-drivers`).
- Renderer build and Node runtime checks: passed again.
- `git diff --check`: passed.

The only merge conflicts were adjacent imports and AppOptions declarations in
`app.ts`; both workspace manifest and business tool selection options were retained.
Execution state and other ticket changes entered solely through integration merges;
this implementation did not edit those files directly.

## Remaining boundaries and validation

- No manual browser or Electron interaction was performed; this ticket changes daemon/persistence contracts, with runtime smoke coverage above. Full product manual validation remains for the integration owner.
- The full suite's 41 skipped tests were not represented as executed; live model/provider calls and private hosted publishing verification were not performed.
- Manifest validation/persistence does not itself wire per-workspace selection into tool catalogs or non-game renderer policy. Tool availability remains the host composition boundary from ticket 02; renderer/policy work belongs to ticket 04 and integration wiring. This report does not claim the complete extraction is delivered.
- No manifest-update endpoint or live file-change reload is introduced. Explicit file repair is loaded on daemon restart, as documented.
