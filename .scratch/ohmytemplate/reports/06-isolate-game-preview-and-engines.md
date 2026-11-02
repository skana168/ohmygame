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
