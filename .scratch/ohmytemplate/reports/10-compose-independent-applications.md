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

## Final progress checkpoint

- Final full suite:352 files passed,3 skipped; **4340 tests passed,41 skipped**,
  69.08s. Log:`/tmp/ohmytemplate-10-final-full.log`.
- Final typecheck, lint, default renderer build, new-file formatting and whitespace
  checks passed. Node startup and Electron evidence above remain applicable:
  no host behavior changed after those checks; the later changes were onboarding
  copy, Vite entry selection/type-reference ordering, docs and renderer tests.
- Progress commits:`6c90ad80` (composition defaults) and `5506aa59` (preparation,
  selected build entry pages, bilingual onboarding and evidence).
- `git merge refactor/ohmytemplate-integration` reported Already up to date against
  `25d8819889a0ca79356d37344821821c68eb0c24`; integration is an ancestor. No
  source changed in this synchronization, so no affected-check rerun was needed.
- Ticket remains **claimed/incomplete**, with every acceptance checkbox untouched.
  No other ticket or execution-state file was authored. No push/PR/watch,
  additional checkout/worktree, subagent or destructive cleanup was performed.
- This is a resumable progress checkpoint, **not completed ticket10 delivery**.
  Source dependency extraction and successful unavailable-game-source build/start
  remain mandatory before merger can resolve the ticket.

## Dependency extraction continuation (current implementation worktree)

Status remains **claimed/incomplete**. No acceptance checkbox is checked. This
continuation does not deliver the independent application assembly criterion.

Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-d9b8f7ee`.
Branch: `t3/extract-nongame-dependencies`.
Confirmed `25d88198` is an ancestor. Merged the requested progress commit
`fcc9ee96f84cadcf10241ded75b3b6525d3c7b91` with merge commit `29777c47`.
Read AGENTS, CONTRIBUTING, specification, glossary, accepted ADR, prior report,
TDD/tests/mocking and git-commit instructions. Used the already-approved public
API/tool/build/startup seams. No subagents, new checkout/worktree, push, PR,
watch, other ticket or execution-state edits.

### Implemented and committed slices

- `26170ce1`: core `agent-tools.ts` now accepts bound tool contributions without
  importing game/story implementations. `ohmygame-agent-tools.ts` owns the
  actual game/story implementation references and preserves shipped ordering,
  selection and invocation behavior. `business-tools.ts` no longer imports
  playable implementations. Existing game consumers explicitly use the game
  assembler; the existing example tool/persistence test uses the core factory.
- `0d82d730`: reusable `PreviewManager` accepts a story editing bridge from app
  assembly. Preview directory/script inspection moved out of `projects.ts` to
  neutral `preview-workspace.ts`, with compatibility re-exports. This removes
  the transitive preview -> projects -> story-template dependency. The actual
  application still supplies the original story bridge.
- `350125d8`: non-game Home placeholder and Ideas use neutral bilingual workspace
  copy. Non-game project navigation omits the game web-build/publish action.
  Later follow-up also prevents automatic selection of shipped game starters.

Each first graph/UI regression was observed failing before its implementation.
Core tool graph red/green logs: `/tmp/ohmytemplate-10-core-tools-{red,green}.log`.
Preview graph: `/tmp/ohmytemplate-10-preview-{red,green}.log`.
UI: `/tmp/ohmytemplate-10-neutral-ui-{red,green}.log`; export action additionally
`/tmp/ohmytemplate-10-neutral-shell-red.log`; starter selection
`/tmp/ohmytemplate-10-starter-{red,green}.log`.

### Retained executable checks, with their limits

`node scripts/check-application-sources.mjs --core` rejects resolved business
implementation imports across the complete core agent-tool and reusable-preview
graphs. It passes:49 and16 source inputs respectively. Shared persisted data and
protocol contracts remain available. Rejection covers story/game/playable/
playtest implementation files, publish implementations, account implementation
files and story resources as specified in the executable. No substitute game
implementations or source stripping were added.

Without `--core`, the same executable audits the actual daemon server, desktop
main and renderer main. **All three fail.** It reports required edges beyond the
original four: agent -> game-design-context; app -> game/story/publish/account
implementations; projects/examples/project-archive -> playable-codebase;
server -> playtest-driver; desktop -> driver/recorder/player; renderer -> auth,
quota, game/story editing/player/recording/publishing/community components.
Log: `/tmp/ohmytemplate-10-full-source-graph.log`. This is an executable graph
diagnostic, not a passing host typecheck/build/startup acceptance test.

Extended the existing Node runtime runner with `--non-game`, retaining the real
built authenticated daemon, archives, native MCP, extension hosts and independent
identity restart, and checking non-game defaults/custom canvas persistence in
place of the game story fixture. It rejects a default game build. It also fails
before readiness in the selected clean non-game build, as described below. Its
post-start non-game assertions have not all run successfully yet.

### Both-composition checks and clean-build startup failure

Bun1.4.2 with the requested PATH; Node24.20.0. Frozen install passed, lockfile
unchanged. Pinned plugin preparation and changelog check passed. Default
composition typecheck, lint, renderer build and Node runtime passed. Default full
suite:352 files passed,3 skipped;4345 tests passed,41 skipped (71.53s), log
`/tmp/ohmytemplate-10-extraction-full.log`. Focused tool/app regression:230 passed;
preview/projects:59 passed; story/tuning:34 passed; neutral renderer suites:59
passed. After the final starter follow-up, its21-test suite, typecheck, lint and
renderer build passed. The unchanged default Node runtime runner was rerun after
adding the alternate mode and passed. Formatting of new files and diff checks
passed. Private cloud tests retain their expected skips.

Disposable full source fixture (ordinary copy, not a checkout/worktree):
`/var/folders/cd/4754c7cd73g1twx1yj5hgql40000gn/T/ohmytemplate-10-extraction-fjh8fe6l`.
It selects non-game and links the installed node_modules; all implementation
source files remain present. Its host/renderer build passed and story resources
were skipped. Its selected full suite **failed**:28 files failed,324 passed,3
skipped;122 tests failed,4223 passed,41 skipped. Log:
`/tmp/ohmytemplate-10-selected-full.log`. These failures remain unresolved; many
existing tests assume default game composition. No tests were deleted, disabled,
or weakened to conceal this result. Selected graph audit also fails, log
`/tmp/ohmytemplate-10-selected-source-graph.log`.

Most critically, its compiled standalone daemon cannot start even with business
source files still present: eager `playable-presets` import tries to read omitted
`dist/daemon/assets/story-templates/blank/scene` and throws ENOENT before health or
authentication. Both direct startup and the retained `--non-game` runtime command
reproduce it. Logs:`/tmp/ohmytemplate-10-selected-startup-failed.log` and
`/tmp/ohmytemplate-10-selected-node-runtime.log`. Excluded story resources were
not copied back to manufacture a startup pass. Source development works with its
source resources present after mandatory core plugin preparation.

**Exactly which excluded modules were unavailable for a successful full host and
renderer build plus authenticated startup? None: no such successful run exists.**
Only the two extracted core graph builds pass with strict resolver rejection.
There is no passing full source-exclusion acceptance, and ticket10 cannot be
resolved. Selected host typechecking still includes business sources.

### Actual runtime exercise and remaining gaps

Default Electron43.3.0 capability smoke passed after extraction: real managed
authenticated daemon, non-game reusable iframe/control/IPC rejection, enabled game
native windows, agent driver ownership/cleanup, two-board canvas, title/Markdown
editing, autosave/reload and save/quit cleanup. Log:
`/tmp/ohmytemplate-10-extraction-desktop.log`; persisted smoke data:
`/tmp/ohmytemplate-10-extraction-desktop`. This is the default source composition
with API-created capability fixtures. It is not selected non-game Electron
startup; that remains blocked by the compiled daemon failure above.

Actual selected non-game source browser development completed provider-free
onboarding and created `Extraction browser workspace` through the real dialog.
The workspace displayed Canvas/Code/Assets without game/publish/export navigation.
An API-created example custom node rendered; typing in its real textarea
persisted the edit (confirmed through the public board API), and browser reload
rendered `Browser persisted example note`. Neutral Ideas were visible. An old
stored game starter was also observed; the follow-up adds a regression and
prevents automatic game starter selection, but that copied browser's existing
stored mention was not claimed cleared by this run. Snapshot capture twice timed
out, so this is DOM/interaction evidence, not screenshot visual QA. The owned
browser tab and development processes were stopped; fixture/data remain.

Remaining work is substantive: source-selected host/renderer/desktop provider and
route/component assembly; business policy extraction from projects/examples/
archives/agent guidance; selected TypeScript build roots; passing full unavailable
source/resource build and authenticated startup; resolving selected-suite
failures; selected Electron/custom-node restart and visual QA. Live paid providers,
private hosted services, other platforms and release packaging remain unverified.
Exporter12 and initializer13 were not implemented. No completion is claimed.

Final continuation checks: selected non-game typecheck, lint and renderer rebuild
passed after the starter follow-up (logs:`/tmp/ohmytemplate-10-selected-typecheck.log`,
`/tmp/ohmytemplate-10-selected-lint.log`,
`/tmp/ohmytemplate-10-selected-renderer-final.log`). These still run with all
business source implementations present. Final merge of
`refactor/ohmytemplate-integration` at `8e90a7f2c6544c1e2c44658bdeeb116f0ac2c8e1`
reported Already up to date; no source changed and no affected rerun was needed.
Continuation checkpoint:`d8678969` plus this evidence-only report update.
