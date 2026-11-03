# Ticket 10 desktop extraction subslice

Desktop source extraction is implemented and its native boundary is verified.
Ticket 10 remains incomplete. The selected end-to-end command still fails on a
cross-target daemon assertion; this report does not claim full application
source exclusion or all-target acceptance.

## Recovery and ownership

- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-f2f9c7e2`.
- Branch: `t3/desktop-optional-game-boundary`.
- Recovery merge: `6fd5abef`, merging assigned head
  `810e0d66a311d28903ac1567da4f981e4a0fac14`. Both `3fd26989` and
  `ba371b5d` are ancestors. `git apply --check` and application of
  `/tmp/ohmytemplate-recovery-10-desktop/working.patch` succeeded; that patch
  contained the previous desktop report only. Original worktree preserved.
- Retry checkpoints: `18b7e98b` (actual absent-source TypeScript emit regression),
  `ca841d41` (selected custom-node smoke fixture correction and check ordering).
- Latest `refactor/ohmytemplate-integration` was merged before reporting; it was
  still `3fd26989e0571385966bbb1e027f5ff694aca584`, already up to date.
- No other agent, checkout/worktree, push, PR or watch was created. No daemon,
  renderer, Vite, shared composition, host audit script, main ticket-10 report,
  ticket or execution-state edits were made in this retry. Broad files in the
  recovery merge are inherited committed history, not new cross-target edits.
- Bun 1.4.2 frozen install passed with the requested PATH. Lockfile unchanged.
  Node 24.20.0 and Electron 43.3.0 were used.

## Implementation retained and verified

The inherited `7339faf4`, `a40c1559`, and `810e0d66` move the real native player,
recorder, driver, story/playtest windows, thumbnail queues, and lifecycle into
`game-contribution.ts`; optional OAuth assembly lives in
`account-contribution.ts`. OhMyGame registers these in `ohmygame-main.ts`.
`bootstrap.cts` loads the source-selected entry before optional native services.
Core main retains managed daemon hosting, lifecycle/save/quit, updates,
notifications, logs/diagnostics, recovery, clipboard/files and sandboxed preload.
Absent contributions reject direct game/account IPC and do not advertise native
playtesting. Provider HTTPS authorization remains in the core shell. Shared
persisted/protocol contracts remain available. No substitute shell, no-op game
module, source stripping, required-import disabling or type suppression is used.

The existing esbuild exclusion regression remains passing. The previous report's
red evidence (`/tmp/desktop-exclusion-red.log`) shows original core main failing
when driver/recorder/player implementations are unavailable; its green evidence
and inherited Electron logs were inspected before the retry.

The new retained packaging regression copies real source into an ordinary
fixture, omits native game/player/driver/recorder/OhMyGame/account/OAuth sources,
omits daemon/renderer business prefixes and story-web, and runs the real
TypeScript compiler against `src/desktop/tsconfig.core.json`. It checks that
bootstrap, core main, preload and external MCP entry emit, that native business
files do not emit, and that the game contribution source is actually absent.
This passes without modifying imports or compiler error settings. Initial fixture
failure was a missing selection union annotation in the fixture; the fixture now
uses the existing source-owned selection contract.

## Fresh verification

- Focused desktop packaging/preload/close/daemon-process: 34 passed, one existing
  Windows-only skip before adding the emit case. Packaging with the added case:
  seven passed. `/tmp/desktop-retry-emit-test.log`.
- Full default suite: **4349 passed, 41 skipped; 352 files passed, 3 skipped**.
  `/tmp/desktop-retry-full-tests.log`. No original test or assertion was deleted,
  skipped or weakened. Private-service skips remain unverified.
- Pinned plugin preparation, changelog, typecheck, lint, default host build and
  renderer build passed. Logs: `/tmp/desktop-retry-{plugins,changelog,typecheck,lint,host-build,renderer-build}.log`.
- Default Node runtime passed actual authenticated daemon, stories/upgrade/preview,
  export/import, native MCP, extension hosts, independent identity restart and
  graceful shutdown. `/tmp/desktop-retry-node-runtime.log`.
- Final default Electron capability smoke passed real source-selected bootstrap,
  native game windows and agent driver ownership/cleanup, reusable preview, IPC
  rejection, two-board canvas, title/Markdown edits, autosave/reload and save/quit
  daemon cleanup. `/tmp/desktop-retry-default-smoke-final.log`.
- Final core-only Electron smoke passed the same reusable shell/preview/canvas
  flow without registered native game/account contributions, including cleanup.
  `/tmp/desktop-retry-core-smoke-final.log`. This deliberately uses the current
  default daemon and renderer, so it is mixed-target evidence.
- Script syntax and `git diff --check` passed. No UI strings were added.

The first fresh smoke attempt lacked mandatory prepared plugins and failed
startup. Preparing pinned plugins fixed that setup failure; its lingering owned
Electron process was stopped. Only the later successful runs above are passes.

## Selected non-game native absence and remaining blocker

Persistent ordinary fixture (not a Git checkout/worktree):
`/var/folders/cd/4754c7cd73g1twx1yj5hgql40000gn/T/ohmytemplate-desktop-selected-hwlw4vxd`.
It copies this retry's current source/build, omits native business files from
**both src/desktop and dist/desktop**, selects non-game in source/emitted metadata,
compiles the real core desktop roots, and builds the selected renderer. Installed
dependencies and prepared plugins are linked. The current compiled daemon and its
real story resources are retained explicitly; daemon/renderer business source
absence is not established by this runtime fixture.

Core compilation and selected renderer build passed:
`/tmp/desktop-retry-selected-core-build.log`,
`/tmp/desktop-retry-selected-renderer.log`.
Actual `node scripts/test-web-game-runtime.mjs --non-game` loaded the real
bootstrap without the native game/account entries, started the managed daemon,
rendered the reusable iframe, rejected direct native game/account IPC, and cleaned
up preview. It then passed two-board title/Markdown editing, autosave/reload and
**custom example node editing, autosave and reload**. These success markers are in
`/tmp/desktop-retry-selected-smoke.log`.

The previously unexecuted selected smoke fixture wrongly assigned fixed dimensions
to a custom node; the persisted contract forbids those dimensions. The fixture now
uses its supported position-only layout. All original persistence assertions are
retained. The tuning-route assertion was moved after desktop persistence checks,
without changing its expected status.

The complete selected command is still **nonpassing**: the current daemon returns
409 for `/projects/:id/tuning`, while selected non-game expects that unavailable
route to return 404. It fails after the desktop/custom-node checks. The wrapper
then also reports missing `shutdown-targets.json` because the run did not reach
its success checkpoint. Selected successful save/quit verification is therefore
not claimed. The selected renderer also still asks for agent-playtest state;
core correctly rejects it rather than supplying a fake idle state.

Root integration must wire selected host build roots to the core desktop roots
(or equivalent explicit roots), combine host/renderer extraction, build fresh
outputs with all excluded implementations/resources absent, and rerun selected
Node/Electron startup and shutdown. The host's previously observed eager story
resource startup dependency is not repaired or disproved by retaining actual
resources in this desktop fixture. No full unavailable-source application build
or runtime is claimed here.

The original baseline fractional resize assertion and native resize fixture are
unchanged and were not rerun. The required baseline remains **nonpassing**
(expected 549x309, observed 667x375); a transient pass recorded by the previous
attempt does not resolve that baseline or establish later playback/fullscreen
checks. Other OSes, release installers/signing, actual engine integrations,
recording encoders, live providers and private hosted services remain unverified.
