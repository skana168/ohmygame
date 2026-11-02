# 05: Source-registered custom canvas nodes

Status: implementation complete; ticket remains claimed for root merger.

## Delivered

- A generic `custom` envelope carries stable node ID, module/kind identity, and
  domain `value`. New domains register descriptors and compiled components;
  they do not add core union members or rendering-switch branches per domain.
- `WorkspaceModuleDescriptor.canvasNodes` supplies kind and payload JSON Schema.
  Source composition collects contracts with duplicate identity detection.
  Canvas initialization emits payload schemas under `canvas/schemas/custom/`.
- The shipped example module has an `example/note` contract, editable compiled
  renderer, translated text and Done controls, English module instructions, and
  the existing contribution boundary's `example_note` companion tool.
- The tool creates or updates persisted notes using the shared board lock,
  revision checks and atomic writer. Schema-invalid input, stale revisions,
  cancellation, disabled modules and conflicting node identities fail before
  persistence. Existing planning/tool selection restrictions still apply.
- Changed custom payloads are validated on editor saves. Invalid agent file edits
  are diagnosed by `canvas_check` and the renderer. Missing/disabled modules show
  a clear placeholder; original payloads survive reading, moving, unrelated
  saves and restoration. Generic nodes and existing merge/draft code are retained.
- Extended existing agent-tool, external-MCP, canvas-schema, renderer serialization,
  and daemon canvas persistence behavior tests. Extended `docs/canvas-agent.md`.

## Integration and scope

Started at verified integration ancestor `e83e93a9b8426ba84bb75a265243adc31fa5bdf6`.
Implementation commit: `5cfb13f5`.
Merged `refactor/ohmytemplate-integration` at
`ddd570cac04c86077f0411725af1f78289b77fe6`, producing merge commit `4a8cd66f`.
The merge retained ticket 08 application service selection/policies and ticket 06
runtime checks. No independent execution-state or other-ticket edits were made;
changes to those files arrived only through the required integration merge.
No push, PR, new worktree, subagent, or destructive cleanup was performed.

## Verification

Bun 1.4.2 was selected with
`PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`. Frozen installation passed
and `bun.lock` is unchanged.

Focused tests covered persisted companion-tool creation and stale revision
rejection through ToolBridge; real external MCP invocation and tool selection;
schema envelopes; renderer/serialization and disable/restore; daemon save/reopen,
invalid file preservation, missing module diagnostics, disabled-module write
rejection, unrelated node preservation, and restoration. The final focused
canvas persistence run passed 65 tests.

Post-integration public checks all passed:

- `bun run prepare:preinstalled-plugins` (reused the pinned prepared plugin).
- `bun run changelog:check`.
- `bun run typecheck`.
- `bun run lint`.
- `bun run test`: 352 files passed, 3 skipped; 4,324 tests passed, 41 skipped.
  Skips retain the repository's existing environment/private-infrastructure limits.
- `bun run build:renderer` (existing large-chunk advisory only).
- `bun run test:node-runtime`: Node 24.20.0 startup, authenticated API, story
  create/upgrade/preview, archive operations, native MCP, extension hosts,
  independently configured application restart and graceful shutdown passed.
- New source files checked/formatted with repository Prettier; `git diff --check`
  passed. No lockfile changes.

Initial full-suite failures identified additive external-MCP catalog expectations;
these were updated and the suite now invokes the persisted note tool as well.
A subsequent diagnostic wording expectation was corrected after adding explicit
workspace-module diagnostics. These failures are not reported as passing runs.

## Browser evidence and manual limits

Used an isolated temporary daemon configured with `EXAMPLE_WORKSPACE_MODULE`,
`createExampleToolContribution`, disabled game/story tools and account services,
and a Vite browser renderer. Data was under
`/tmp/ohmytemplate-node-browser-GOU77y`; no repository application-service defaults
were changed. Created the note through its actual companion tool before opening
its normal workspace canvas.

At project `a25c6a5f-810b-4b1c-bde2-2e001171297a`, node `browser-note`:

1. Browser rendered `Browser seed` in the Example note field.
2. Preview input actions replaced it with `Browser edited and reopened` and
   checked Done. The page reported Saved.
3. A full navigation with a distinct query reopened the workspace; the text and
   checked state remained, and Saved was present.
4. Temporarily changed the saved envelope's module to `temporarily-missing`.
   Reopening displayed `Restore module temporarily-missing/note to edit this
node. Saved data is preserved.` and no editor.
5. Restored the exact saved board file. Reopening rendered the edited text and
   checked state again, with no alert. The temporary Preview tab was closed.

Preview accessibility snapshots timed out twice (`Preview automation snapshot
timed out after 15000ms`), so no screenshot was captured. The CUA fallback
reported `The browser access host is unavailable`. Preview's direct input actions
and read-only DOM observations nevertheless completed the functional browser
flow. This establishes interaction/persistence, not a full visual review.

Electron editing/save/reopen was not exercised for this ticket. Desktop window
layout, close-guard behavior with the new controls, and screenshot review remain
manual validation for the root merger. Real model calls and private cloud
publishing were not required or verified. No claim is made for ticket 07 story
isolation or the independent template exporter.

## Handoff

Branch: `t3/register-custom-canvas-nodes`.
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-fbcf8cfa`.
Implementation and integration are committed; this report and the assigned
acceptance checklist are committed separately. The final commit SHA is supplied
in the agent handoff. Only the root merger should resolve the claimed ticket.

## Root merge verification

Merged worker head `87409523cf39f2bcf1568a599ee8212f97b04659` from branch
`t3/register-custom-canvas-nodes`, worktree
`/Users/yoyun/.t3/worktrees/ohmygame/t3-fbcf8cfa`, into
`refactor/ohmytemplate-integration` at
`4eda859f760561a9049792fc630c05d931d1198a` without conflicts or production fixes.
Reviewed complete contribution contracts and normal persistence/tool selection.
Fresh 13 affected suites / 246 tests and typecheck passed using Bun 1.4.2.
The combined run emitted localhost:3000 connection-refused stderr from renderer
fixtures but exited successfully with all tests passing.

Regression commit `bc205e806503f13ad09b05a64baeb9ea147b234a` extends the existing
custom-node persistence case to assert exact board bytes after rejected invalid
saves, reads with missing/disabled modules, and rejected disabled-module edits.
Existing assertions verify domain payload preservation during unrelated saves
and restoration. Final game-design run: 65 passed; diff check passed.

Ticket 05 resolved with its documented manual validation needs. Original browser
evidence above is preserved verbatim; merger performed no new browser/Electron
checks. Electron custom-node edit/save/reopen and screenshot/visual review remain
unverified. Worker full public sequence is inherited, not freshly repeated.
Ticket 07 and dependent ticket 10 were neither changed nor started.
Root tracked tree was clean after implementation/regression commits; only the
pre-existing untracked `.codegraph/` remains. Worktrees were preserved.
