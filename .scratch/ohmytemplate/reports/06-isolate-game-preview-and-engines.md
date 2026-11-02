# Ticket 06 implementation and recovery report

Status: implemented with manual validation gaps; ticket remains claimed for merger.

## Recovery and scope

- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-f92edbee`
- Branch: `t3/isolate-game-preview-engines`
- Required ancestor: `5be4b4ed355f2a6b43c21cb2dab8d54aa29de6c1`, confirmed before editing.
- `/tmp/ohmytemplate-recovery-06/working.patch` passed `git apply --check` and
  applied cleanly. It contained 30 tracked file changes and no ticket-06 report
  or screenshots. The original worktree was not changed.
- Recovered implementation reviewed against the ticket, manifest and runtime
  contracts, engine plugin dispatch, desktop IPC, renderer controls, and tests.
- Implementation commit: `adc4bbbe`. Integration tip
  `7fe9d5e008ec8436d2b5a2e28de72a4175380e8e` merged in `084a14d9` without
  conflicts, preserving provider09's application options and adjacent imports.

## Behavior and evidence

Game capability follows host selection, registered application modules, valid
workspace declarations, and the legacy compatible default. Invalid workspaces
fail closed. Agent-owned drivers are created only for enabled, supported
workspaces and carry workspace identity to desktop authorization. Existing
conversation/external-MCP ownership and shutdown cleanup remains in place.

Daemon game preview and tuning endpoints reject disabled selection. Desktop
player, recording, story playtest, thumbnail, and agent open entry points check
the daemon before creating game windows or a driver. Renderer game player,
recording, tuning, watch, and story playtest controls follow the same capability.
Non-game desktop preview uses the reusable iframe rather than a native game
player. English and Chinese preview-setting labels are aligned.

Engine plugins and shipped game workflow skills follow host/workspace selection
across native tools, commands, panels, MCP services, skills, type discovery,
explicit selection and invocation. Asset helper plugins remain available.
Compatibility, grants, environment support, and existing adapter limitations are
retained. No Unity, Unreal, Cocos, or other new engine adapter is claimed.

Reusable preview start, proxy fetch, and explicit stop are exercised through the
public daemon API for workspace-disabled, host-disabled, and unavailable-module
cases. Existing preview process/proxy/lifecycle, owned-driver cleanup, external
MCP release, and desktop cancellation tests remain passing.

A newly found gap was fixed with red-green at the approved daemon seam:
`retains host game restrictions in project update events` failed because the
`project.renamed` event lacked `gameCapability: false`. Both rename and run-setting
update events now carry the same effective capability as HTTP project responses.
The regression test passes for both event paths. Initial fixture corrections
used PATCH for rename and the complete run-settings request contract before
observing the behavioral red failure.

## Checks

All Bun commands used `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`;
Bun reported version 1.4.2. `bun install --frozen-lockfile` passed, with no
lockfile change.

Recovered-tree checks (before the small event fix and integration merge):

- `bun run prepare:preinstalled-plugins`: passed (one pinned plugin prepared).
- `bun run changelog:check`: passed.
- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `bun run test -- test/app.test.ts test/agent-tools.test.ts test/desktop-close.test.ts test/plugin-runtime.test.ts test/project-plugins.test.ts test/coding-workspace.test.ts test/project-settings-dialog.test.tsx test/node-thumbnail-page.test.tsx test/playable-playtest-controls.test.tsx test/preview.test.ts test/playtest-driver.test.ts test/owned-playtest.test.ts test/external-mcp.test.ts`: 13 files, 268 tests passed.
- `bun run test -- test/browser-game-player.test.ts test/web-game-player.test.ts test/desktop-game-preview.test.tsx test/desktop-playtest-driver.test.ts test/playtest-tools.test.ts test/preview-lifecycle.test.ts test/preview-proxy.test.ts test/preview-static.test.ts test/playable-editor-playtest.test.tsx`: nine files, 132 tests passed.
- `bun run test`: 352 files passed, three skipped; 4268 tests passed,
  41 skipped. It started before the event regression was added; this is not
  represented as a full-suite run of the final commit. Expected fixture
  connection-refused messages and MaxListeners warnings were printed.
- `bun run build:renderer`: passed.
- `bun run test:node-runtime`: passed, including host/story build,
  authenticated daemon startup, preview, import/export, native MCP, extension
  hosts, independent application restart and graceful shutdown on Node 24.20.0.

New edit and merged-tree checks:

- Targeted event regression: observed red missing capability, then green
  (one passed; 106 unrelated tests filtered).
- Type checking passed after the event fix and again after integration merge.
- `bun run test -- test/app.test.ts test/agent-tools.test.ts test/plugin-runtime.test.ts test/project-plugins.test.ts test/desktop-close.test.ts`:
  five files, 164 tests passed after integration merge, including the new event test.
- `bun run lint` and `git diff --check`: passed after integration merge.

Raw run logs are under `/tmp/ohmytemplate-06-*.log` in this environment; the
counts and limitations above are the durable evidence. Broad checks were not
repeated solely for elapsed time after the narrow event fix; its affected daemon
seam and the merged composition were verified again.

## Manual/runtime gaps

- Real Electron smoke attempted with `node scripts/test-web-game-runtime.mjs`
  after the successful host/renderer builds. It failed at
  `scripts/web-game-runtime-check.cjs:101`: the fractional landscape resize
  did not reach `innerWidth === 549 && innerHeight === 309` before timeout.
  Earlier window creation, iframe save preservation, isolation, and the first
  landscape resize assertions were reached successfully. Later fullscreen,
  playback and cleanup assertions in that script remain unverified in this run.
  This script exercises the existing native player directly, not the new IPC
  authorization path (the latter is covered by desktop-close tests).
- Shared browser `preview_status` reported unavailable. An attempted blank-tab
  open was rejected as an invalid preview URL; no browser tab or screenshot was
  created. Actual browser navigation and visual inspection of non-game preview
  controls remain to be done. Renderer behavior is covered by existing component
  tests, not represented as manual UI evidence.
- Actual Godot export and Unity/Unreal/Cocos external installations, credentials,
  engine launch workflows, and recording encoders were not manually exercised.
- Full application build/resource exclusion belongs to ticket 10. This slice
  does not remove engine source imports/packages from the full build or change
  global preparation. No other ticket or execution-state file was edited.

Final integration synchronization: `4f39f31f970948d2053911210abe776349310e55`
merged in `48b5a54c`. This second merge only inherited provider09's report,
resolved-ticket, map and execution-state updates; this worker did not author
changes to those files. No application code changed after the merged-tree checks.
Final working-tree and whitespace checks passed; integration is an ancestor.

## Serial root integration (2026-11-02)

- Merged after ticket04, from `a271265672a4177d737d745238c819679835c8ff`
  (`t3/isolate-game-preview-engines`, `/Users/yoyun/.t3/worktrees/ohmygame/t3-f92edbee`)
  at `7a6dbf9804aa29f1ca586437ad58bc9c2831dd32`.
- Resolved daemon owner conflicts in favor of capability/environment checks and
  project-bound owners. Retained both tool tests and combined documentation.
  `gameCapabilityEnabled` delegates module/legacy/invalid-manifest semantics to
  ticket04's `workspaceHasModule`, adding host and daemon-response restrictions.
  Independent accountServices, source contribution ownership, game/asset canvas
  policy and direct IPC authorization remain intact.
- Actual isolated browser work exposed an integration defect: ticket04's panel
  filter removed reusable preview navigation even when web preview was enabled.
  Existing renderer navigation coverage was extended and observed red (missing
  preview panel), then green. Restored the optional panel after Canvas and used
  the existing translated Preview label; game controls remain capability guarded.
  An additional daemon compatibility assertion verifies asset canvases do not
  gain game ownership. That assertion passed before policy consolidation and is
  compatibility coverage, not claimed as a red-green defect.

Fresh merged-root evidence (Bun 1.4.2 PATH as above):

- 34 affected suites / 658 tests passed, no skips, after capability consolidation.
  Command covered the union of ticket04's 15 suites and ticket06's 22 suites
  listed above. Log: `/tmp/ohmytemplate-merge06-tests.log`.
- Full suite after consolidation, before the navigation fix: 352 files passed,
  three skipped; 4312 tests passed, 41 skipped. This is explicitly not a full-suite
  run of the final navigation edit. Log: `/tmp/ohmytemplate-merge06-full-tests.log`.
- After navigation fix: workspace-layout, coding-workspace,
  project-settings-dialog, desktop-close, app and agent-tools: six suites /
  189 tests passed. Log: `/tmp/ohmytemplate-merge06-final-tests.log`.
- Final typecheck, lint, renderer build and diff checks passed. An intermediate
  typecheck caught a missing label-helper import; it was corrected to use
  `gameCapabilityEnabled`, then final typecheck and browser rendering passed.
  Logs: `/tmp/ohmytemplate-merge06-final-{types,lint,build-renderer}.log`.
- Plugin preparation and changelog check passed. Host build passed. Node runtime
  initially failed because prepared plugin index was absent; after plugin
  preparation, the complete `bun run test:node-runtime` retry passed on Node
  24.20.0. Logs: `/tmp/ohmytemplate-merge06-{prepare,changelog,build-host,node,node-retry}.log`.
  Node/host checks preceded the renderer-only navigation edit; no host code changed
  afterward. Existing fixture connection-refused and MaxListeners warnings remain.

Actual browser validation used isolated daemon43516/renderer43526, accountServices
false, data `/tmp/ohmytemplate-merge-browser-data`, Pi settings
`/tmp/ohmytemplate-merge-browser-pi`. Opened the API-created empty-module workspace,
Canvas, Code, project settings and restored Preview tab. Settings displayed
Preview defaults and reusable restart/stop/open-browser actions. Preview used an
iframe; Play, Record, agent-watch and tuning controls were absent. Navigating to
that iframe's URL displayed `Reusable non-game preview`. No screenshot was
obtained: both snapshot attempts timed out; DOM/browser interaction evidence is
recorded without claiming visual screenshot QA. Existing picker tooltip still
says “Pick an element in the game”; neutralizing that inherited copy is not
claimed here. Owned tab and isolated server were closed; data preserved.

Actual Electron failure investigation:

- Installed the declared Electron43.3.0 binary with `node node_modules/electron/install.js`
  (cached installation, no dependency/lockfile changes). Fresh root host/renderer
  builds followed by `node scripts/test-web-game-runtime.mjs` reproduced the
  exact line101 fractional landscape timeout. Log:
  `/tmp/ohmytemplate-merge06-electron.log`. Later assertions did not run.
- Baseline diagnostic used `git show 4f39f31f:src/desktop/web-game-player.ts`,
  transpiled to `/tmp/ohmytemplate-baseline-player.mjs`, with the existing fixture
  copied to `/tmp/ohmytemplate-baseline-runtime-check.cjs`. Only import/root paths
  and a catch printing observed dimensions changed; assertions were unchanged.
  The baseline player, host HTML/renderer, proxy and fixture are unchanged by this
  integration. Baseline run with the same Electron binary also failed at line101:
  observed width667/height375, DPR2, expected width549/height309. Log:
  `/tmp/ohmytemplate-baseline-electron.log`. The first diagnostic launch needed
  NODE_PATH for Electron's module resolution; the corrected launch reproduced
  the resize failure. Temporary diagnostic files/data were preserved.
- Evidence supports a pre-existing runtime/environment failure, not a change in
  ticket06's native player. No unrelated player redesign or weakened assertion
  was made. Failed smoke is not passing evidence.

Status remains **claimed**, merged but not resolved: actual desktop capability
navigation/authorization flow and completion of native smoke (including later
fullscreen/playback/cleanup) remain unverified. External engines/recording and
other platform checks remain as above. Ticket04's Electron creation/edit/reopen
validation is still mandatory for overall template delivery. Browser document
 title editing remains unverified. Ticket08 and all existing worktrees/recovery
snapshots were left untouched.
