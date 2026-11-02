# Ticket 10 implementation progress

Status: claimed, incomplete; pending implementation and merger. No acceptance
checkboxes are changed by this progress report.

Prepared worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-16786657`.
Branch: `t3/compose-independent-applications`.
Confirmed `21dbedbd` is an ancestor before editing. No additional checkout,
worktree, subagent, push, PR, or cleanup was created/performed.

## First vertical slice

Added explicit `ohmygame` and `non-game` source composition definitions with a
source-owned selection in `src/shared/application-selection.ts`.
Default remains OhMyGame. Daemon composition selects available workspace
modules, business tool gates and account/publishing/community services together.
The non-game selection registers the shipped example tools and module, creates
general workspaces with that module by default, and writes its English guidance.
Renderer creation entry points and type choices use the selected defaults.
Embedded daemon options remain available for existing callers and tests.

The public daemon regression first failed: `composition: "non-game"` still
created a `web-game` project with the game manifest. After implementation it
passes: general workspace, example manifest/guidance, disabled game/story,
account/community routes absent, available core project type, and reopened
manifest. Log evidence: `/tmp/ohmytemplate-10-{red,green}.log`.

Frozen install passed with Bun 1.4.2 and the user-supplied PATH; lock unchanged.
Initial typecheck passed before source-selection/renderer default follow-up.
Further checks are recorded below as completed.

## Outstanding work (not acceptance evidence)

This slice does **not** establish complete application extraction. Core daemon,
renderer and desktop files still statically import game/story/publishing
implementations; host tsc includes the full source tree. Preparation/build scripts
still prepare game resources unconditionally. A deleted-source build/start test
has not passed. The composition object must not be represented as an independent
export/build until those imports and build inputs are migrated.

Remaining: actual source dependency extraction and obsolete assembly removal;
resource/build selection; complete dual-composition tool/provider/plugin/canvas
and persistence regressions; full public checks including lint and Node startup;
actual relevant browser/Electron flows. Prior reports' manual/provider/private
cloud/platform limitations remain unchanged. Tickets 12/13 are not implemented.

## Preparation and UI follow-up

The final selector is compiled TypeScript rather than a runtime JSON requirement.
This keeps copied/packaged daemon startup independent of an extra configuration
file. Desktop packaging now includes the compiled source module descriptors.
The existing game example and story preparation bodies moved unchanged into
`prepare-game-examples.ts` and `build-story-resources.mjs`; their public command
entry points select them only for the game composition. The non-game renderer
omits native game host/recorder HTML entry points. These changes do not remove
required business imports from the main renderer/host graphs.

Extended the existing examples suite with a disposable preparation fixture that
contains only composition metadata and the two preparation entry points. It has
no game compiler, story bundle, example implementation, resource locks, runtime
cache, or game assets. The test failed before the entry-point migration, then
passed under Node: both commands skip, and neither dist nor .runtime is created.
Logs: `/tmp/ohmytemplate-10-preparation-{red,green}.log`. This is preparation
exclusion evidence only, not a deleted-source application build/start pass.

Actual non-game browser startup exposed game-specific onboarding copy. Extended
the existing renderer suite: neutral welcome text failed first, then passed after
adding composition-selected English/Chinese welcome/start/import text. Both
locales are updated; agent instructions remain English. Existing runtime guide
now documents selection and its current source-extraction limitation.

## Checks and actual runtime evidence

All Bun commands use the requested PATH and Bun1.4.2. Node is24.20.0.

- Frozen install, pinned plugin preparation, changelog check and lint passed.
- Final typecheck passed. An intermediate Vite change accidentally placed an
  import before the triple-slash Vitest reference and failed type checking;
  restoring the reference to the first line fixed it. No type suppression added.
- Initial three-suite run:160 tests passed. Final focused app/examples/onboarding/
  creation-dialog run: four files,211 tests passed.
- First full suite (before the final onboarding copy and Vite selection follow-up):
  352 files passed,3 skipped;4339 tests passed,41 skipped. A final full run is
  recorded below when complete. Existing fixture ECONNREFUSED/iframe diagnostics
  appeared without failing this first run.
- Default renderer builds passed before and after UI follow-up (existing chunk
  warnings). `test:node-runtime` passed: real host/story build, authenticated
  daemon startup, preview, story creation/upgrade, import/export, native MCP,
  extension hosts, copied independent identity restart and graceful shutdown.
- New-file Prettier checks and `git diff --check` passed.

Actual Electron43.3.0 `node scripts/test-web-game-runtime.mjs --capabilities`
passed using built default host/renderer and isolated persisted smoke data at
`/tmp/ohmytemplate-10-desktop-smoke`. It exercised the real managed daemon,
non-game reusable iframe and absent game controls, direct game IPC rejection,
enabled game native windows, agent driver ownership/cleanup, two-board canvas,
renderer title/Markdown edits, autosave/reload and save/quit daemon cleanup.
This uses API-created workspace fixtures, not the non-game source selection.
The unchanged baseline fractional resize smoke was not rerun or weakened.

A disposable full source copy at `/tmp/ohmytemplate-10-non-game-fixture` selects
non-game. Its host and renderer build passed with **all game sources present**;
story resource preparation skipped. Actual browser development on43510/43520
completed provider-free onboarding and created `Composition browser notes`
through the real creation dialog. It opened Canvas/Code/Assets with no game
navigation, and no account/community navigation. Creation yielded the selected
Workspace type. Browser text inspection also found remaining game-oriented Home
placeholder/Ideas content and an Export web build action; coherent navigation/
guidance cleanup is therefore still incomplete. Onboarding neutral-copy changes
were tested in the renderer suite afterward, not revalidated in this copied
browser run. Snapshot capture timed out; DOM interaction is not screenshot QA.
The owned browser tab and both server processes were stopped; fixture/data remain.

## Failed source-exclusion acceptance (explicit)

Ran an esbuild integration graph check from the non-game disposable copy with
resolution of playable-project, story-web-bundle and game-tuning implementations
rejected as unavailable. It FAILED, as expected from the outstanding coupling.
Concrete paths include `app.ts -> game-tuning`, `business-tools.ts ->
playable-project`, `preview.ts -> story-web-bundle`, and `publish/archive.ts ->
playable-project`. Log: `/tmp/ohmytemplate-10-excluded-graph.log`.
No successful deleted-source host/renderer build or startup is claimed. This is
an unmet central acceptance criterion, and this branch must not resolve ticket10
or be treated as the completed reusable assembly boundary. Actual removal of
those dependencies remains necessary; no no-op game substitutes were introduced.

Remaining overall gaps retain the prior reports' exact scope: desktop UI custom
node editing/full restart and creation beyond the newly exercised browser dialog;
visual playback and unchanged baseline fractional native resize failure; live
providers/paid calls/private cloud, other platforms and release packaging.
The successful capability smoke does not establish those results.
