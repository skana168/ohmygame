# Ticket 13: initialize and verify applications

Status: claimed, pending merger. Implementation and generated application verification
are in progress; no overall delivery or whole-spec review completion is claimed.

Branch: `t3/initialize-verify-apps`.
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-1031fd5e`.
Starting HEAD `8661916f`; `git merge-base --is-ancestor 0e24caa2 HEAD` passed.
Read repository/contribution instructions, final spec, glossary/ADR, local tracker,
ticket 13, reports 10/11/12, actual exporter and identity/runtime implementations.
Applied requested TDD/tests/mocking and git-commit skills at approved public seams.

## Initial slices

- Public command: `bun run init:application DESTINATION DISPLAY_NAME PACKAGE_NAME DESKTOP_ID DATA_DIRECTORY`.
- Uses existing identity validation before export and ticket 12's selected exporter,
  retaining canonical-parent/symlink source refusal and atomic existing-dir refusal.
- Exported inventory permits the same command inside an independent template,
  without source links or dependencies installed, and omits unlisted local state.
  Package and frozen lock workspace names change together; source defaults/lock do not.
- Red: missing initializer (`/tmp/ohmytemplate-13-red.log`), after source frozen
  install (the initial attempt lacked dependencies and was not a behavioral red).
  Green: `/tmp/ohmytemplate-13-green.log`.
- Extended existing identity/export suite: 8 tests pass, including real Node
  initializer from generated app without dependencies, invalid fields, existing
  empty/populated destinations and direct/aliased nested source refusal. Second
  generation omits intentionally seeded `.env.local` and `.data` sentinel files.
  Log: `/tmp/ohmytemplate-13-boundaries.log`.
- First retained artifact: `/tmp/ohmytemplate-13-ohmyapp`, identity OhMyApp /
  ohmyapp / org.example.ohmyapp / .app-data. Generation passed; further checks below
  will establish acceptance. English/Chinese source and shipped guides updated.

No subagents, new checkout/worktree, push, PR, watch, source/global configuration
changes or destructive cleanup. No other ticket or execution-state edits.

## Resumed implementation and final ticket evidence (2026-11-03)

Status remains **claimed, pending root merger and whole-spec final review**.
This section supersedes the initial in-progress checkpoint above for ticket 13.
Worktree `/Users/yoyun/.t3/worktrees/ohmygame/t3-5d789b22`, branch
`t3/initialize-verify-apps-1`. Merged committed recovery head `d981668d` at
`608094a8`; checked and applied `/tmp/ohmytemplate-recovery-13/working.patch`.
Committed its optional real two-application runtime check as `fc20917b`.
`be14839a` clarifies configured browser storage in both shipped languages.
The prior worktree and all prior artifacts are preserved.

### Initializer and artifact

Copy-pastable command from the source root after its frozen install (choose a
nonexistent destination):

```sh
PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH bun run init:application /tmp/my-new-ohmyapp "OhMyApp" ohmyapp org.example.ohmyapp .app-data
```

Actual independently installed/built artifact:
`/tmp/ohmytemplate-13-resumed-ohmyapp`. Its identity is OhMyApp / ohmyapp /
org.example.ohmyapp / .app-data. Generated from the source with the exact command
above except destination `/tmp/ohmytemplate-13-resumed-ohmyapp`.
From that artifact, before the peer's dependency installation, ran:

```sh
PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH bun run init:application /tmp/ohmytemplate-13-resumed-peer-final OtherApp otherapp org.example.otherapp .peer-data
```

Both use their own package/lock workspace identity, application.json and storage;
no checkout or dependency links are needed. Audit traversed installed symlinks:
all resolve inside their own application (70 and 56 respectively), none outside.
Their 586-file shipped inventories exclude .git, secrets, local state, installed
modules, runtime/build output and executable game/application sources. Build and
runtime output was generated locally after export. LICENSE/NOTICE and retained
core/example/provider/media/plugin source remain in the exported contract.
Log `/tmp/ohmytemplate-13-artifact-audit.log`.
Root application.json, bun.lock and application-selection.ts are byte-unchanged
against `8661916f`; source package changes only add the initializer script.

Existing public identity/export suite passes **8 tests**, covering invalid identity
settings before output; empty and populated destination preservation; direct and
symlink-aliased source/nested refusal; real standalone initializer execution before
dependency installation; seeded .env.local/.data exclusion and distinct storage.
Logs `/tmp/ohmytemplate-13-resume-{install,focused,generate}.log`.
Inherited red/green evidence remains in the initial section; no new production
behavior was added in this continuation beyond the inherited implementation.

### Source checks

Bun **1.4.2**, Node **24.20.0**, requested PATH for every Bun command.
Actual frozen install and the entire required public sequence passed:
prepare:preinstalled-plugins, changelog:check, typecheck, lint, test,
build:renderer and test:node-runtime. Full suite: **353 files passed, 3 skipped;
4358 tests passed, 41 skipped**. Logs:
`/tmp/ohmytemplate-13-root-{plugins,changelog,typecheck,lint,tests,renderer,node}.log`.
Node covers the default game/story creation/upgrade/preview, archives, MCP,
extension hosts, configured independent identity restart and graceful shutdown.
Existing renderer chunk-size advisory remains. Syntax and git diff --check pass.
Expected private-cloud and platform skips are unverified, not passes.

### Generated application checks

From `/tmp/ohmytemplate-13-resumed-ohmyapp`, ran and passed:

```sh
bun install --frozen-lockfile
bun run prepare:preinstalled-plugins
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:node-runtime
node scripts/test-node-runtime.mjs --non-game --identity-peer /tmp/ohmytemplate-13-resumed-peer-final
```

Use the requested PATH as above. Peer independently ran frozen install, pinned
plugin preparation and build:host before the last command.
Logs `/tmp/ohmytemplate-13-app-{install,plugins,typecheck,lint,tests,build,node}.log`,
`/tmp/ohmytemplate-13-peer-final-{generate,install,plugins,build}.log`, and
`/tmp/ohmytemplate-13-app-isolation-prepared.log`.
Core tests: **4 files / 56 tests pass**. Strict selected source/type audit and
actual host/Electron/renderer compilation pass. Actual authenticated compiled
Node daemon rejects unauthorized access, exercises file reads/traversal rejection,
workspace defaults, custom canvas persistence/schema rejection, real example_echo
and example_note over external MCP, absent game tools/routes, image/audio/3D
provider configuration, native MCP/extensions, archive roundtrip and shutdown.
A deterministic local HTTP provider drives an actual Pi conversation with persisted
turns; this is not a mocked Pi implementation or a paid provider call.

Optional two-app acceptance starts both actual initialized daemons with configured
storage, no data/agent-directory overrides. Names/package names/desktop IDs and
resolved storage differ. Creating a project and provider configuration in OhMyApp
leaves OtherApp's projects/configuration unchanged. Full daemon restart retains
OhMyApp project, actual completed Pi history and provider configuration; OtherApp
remains unchanged. Both stop successfully.

### Browser source development and Electron

Default `bun run dev` was attempted but 43120 was already owned by an earlier
process. That process was preserved. For this fresh run only, changed the generated
artifact's renderer port to 43520 and Vite proxy to 43510, then ran:

```sh
PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH DAEMON_PORT=43510 OHMYGAME_DATA_DIR=/tmp/ohmytemplate-13-browser-data PI_CODING_AGENT_DIR=/tmp/ohmytemplate-13-browser-pi bun run dev
```

Opened its real source renderer at http://127.0.0.1:43520, title OhMyApp. Through
Projects → New project → New project… → Create, created `Resumed OhMyApp browser`
(project e7cc2219-cbcf-4c3a-8c5c-0082e4c788ff). General workspace, Canvas/Code/Assets,
no game/account/community navigation or model prerequisite. Seeded an example note
through the public canvas API, edited its actual rendered textarea to
`Resumed browser saved custom note`, then full page reload retained that value.
Touched only src/daemon/non-game-host.ts mtime: Node watch restarted PID 83599 to
92561. The public source daemon retained the browser-edited node and absent
business routes remained 404. Browser DOM inspection confirmed the same saved
value. Logs `/tmp/ohmytemplate-13-app-dev-isolated.log`,
`/tmp/ohmytemplate-13-browser-{api,persistence}.log`. Initial proxy connection
errors during daemon readiness/restart are recorded. Browser evidence is DOM/API,
not screenshot QA. Closed the owned browser tab and stopped only this run's dev
processes. Restored artifact default ports/package configuration afterward.

Actual Electron **43.3.0**, from the generated application, passed both commands:

```sh
OHMYGAME_SMOKE_DIRECTORY=/tmp/ohmytemplate-13-resumed-electron-final node scripts/test-web-game-runtime.mjs --non-game
OHMYGAME_SMOKE_DIRECTORY=/tmp/ohmytemplate-13-resumed-electron-final node scripts/test-web-game-runtime.mjs --non-game --reopen
```

Real production renderer and its owned authenticated daemon: creation dialog,
reusable iframe/sandbox and absent native game/account IPC, example custom-node
textarea editing/autosave/reload, two-board document title/Markdown editing,
tuning 404, save/quit cleanup. Second complete Electron/daemon launch retained
custom-node and document edits and shut down its owned processes. Logs
`/tmp/ohmytemplate-13-app-electron-final{,-reopen}.log`.
Evidence `/tmp/ohmytemplate-13-resumed-electron-final/` contains
non-game-preview.png, non-game-canvas-reopened.png, reopen.json and
shutdown-targets.json. Automated real DOM assertions passed; these captures have
not received a separate visual review in this continuation.

### Failed attempts and limits

- Initial Electron invocation ran before the concurrent host build completed and
  failed on missing dist/shared/application-selection.js, then missing shutdown
  targets. Final built-artifact runs above pass; first log retained at
  `/tmp/ohmytemplate-13-app-electron.log`.
- First peer `/tmp/ohmytemplate-13-resumed-peer` lacked pinned plugin preparation;
  startup failed on its missing index. Abrupt startup failure left a zero-length
  plugin credential key, so preparing and retrying that same peer failed with
  Invalid plugin credential key. Preserved this artifact unchanged and generated
  the fresh peer-final, following documented preparation before first start; final
  isolation run passes. This existing startup-failure recovery issue is not fixed
  or hidden by this ticket; logs app-isolation.log and app-isolation-final.log.
- Paid/live language/media services, private hosted cloud/OAuth, engine/encoder
  runs, other OSes and installers/signing/notarization remain unverified.
- Original fractional native game resize remains unchanged and **NONPASSING**
  (expected 549x309, observed 667x375), not rerun or weakened. Core Electron success
  does not constitute a full native game runtime pass.
- English/Chinese root sections and shipped initialization/setup/extension/check
  guides align; existing media/links retained. Both shipped guides now accurately
  distinguish configured storage from the baseline .data. No new UI strings.
  Source business modules/tools/nodes and existing Skills/MCP paths are documented;
  no npm CLI, arbitrary dynamic loading or additional domain product is promised.

Merged latest `refactor/ohmytemplate-integration` before this report: Already up
to date at `10628d36ca914f2d62d3a428abdb26cecbad4178`. No source changes from that
merge; no affected rerun needed. Last source/runtime changes were covered above;
later changes are bilingual documentation and this report/tracker only.
No execution-state/other-ticket edits, subagents, additional checkout/worktree,
push, PR, watch, destructive cleanup or removal. Ticket 13 stays claimed for root
merger. Whole-spec final review remains the root's next step and is not claimed
complete by these ticket-level checks.

## Integration acceptance (2026-11-03)

Ticket 13 is **resolved**; all 13 tickets are resolved, phase
**final-review-pending**. Earlier claimed/pending statements describe preserved
implementation checkpoints. The parent spec and whole-objective status are unchanged.
Two-axis review and worktree cleanup remain the root's next steps.

Integration checkout is `/Users/yoyun/ohmygame`, branch
`refactor/ohmytemplate-integration` (the supplied sharedroot combined these names).
Implementation `25fcadb308ab89dc4b4dea50a7b2a8a322343c97` merged conflict-free at
`c995495eaece13f32001e5607f0946c670e171ba`. No application integration defect found.

### Fresh merger evidence

Requested PATH, Bun 1.4.2, Node 24.20.0. Public identity/export/initializer suite:
8 tests passed (`/tmp/finalticket13-focused.log`). Root typecheck and lint passed
(`/tmp/finalticket13-typecheck.log`, `/tmp/finalticket13-lint-final.log`).
`node scripts/check-application-sources.mjs --non-game --typecheck` passed all
three targets: desktop 30 graph inputs/52 type files, daemon 239/248, renderer
287/284 (`/tmp/finalticket13-boundary.log`). Syntax and `git diff --check` passed.
An exploratory `--help` call actually ran the checker without non-game selection
and reported expected default-business exclusions; this is not an acceptance pass.

Actual retained artifact `/tmp/ohmytemplate-13-resumed-ohmyapp` was exercised with:

```sh
PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH node scripts/test-node-runtime.mjs --non-game --identity-peer /tmp/ohmytemplate-13-resumed-peer-final
```

First rerun passed its temporary compiled Node/Pi acceptance but failed the
persisted two-app phase because the prior run's custom provider display name
already existed (`/tmp/finalticket13-artifact.log`). Narrow test-helper correction
`ca118c8c3ed4494d0ac4639164e8910fcfa06ce0` appends the unique project ID to that
fixture name. Applied the same one-line helper change to the retained artifact,
without deleting data or rebuilding unchanged application code. Two consecutive
real runs then passed compiled daemon authentication/files/canvas/MCP/extensions,
real deterministic HTTP-provider Pi conversation, both configured identities and
storage isolation, provider/project isolation, full daemon restart/history and
graceful shutdown (`/tmp/finalticket13-artifact-repeat1.log`,
`/tmp/finalticket13-artifact-repeat2.log`). This repeated run is the regression
proof for the fixture collision; application/provider duplicate-name validation
was not relaxed. The original failed attempt is retained.

Fresh artifact audit checked all 586 inventory files exist without symlinks,
excluded game implementations and source secrets/local state are absent, package
and frozen-lock workspace identity are ohmyapp, and both shipped README files
match the integrated templates byte-for-byte. Root application.json, bun.lock and
application-selection.ts have no diff against `8661916f`. Initializer inspection
confirmed validation before output, atomic existing-directory refusal, canonical
source/alias protection and inventory-based independent reinitialization; the
8 public tests exercise these paths. Bilingual quickstart/extension sections align.

### Inherited evidence and retained limits

The implementation report above and actual retained logs supply full source
public checks (4358 passed/41 skipped), generated frozen install/preparation,
56 core tests/typecheck/lint/build, browser DOM create/edit/reload/source-watch
and full Electron/daemon restart. These were **not rerun** by the merger.
The merger inspected full-suite summary and final Electron restart/shutdown log;
no new browser or screenshot QA is claimed. Prior red/green, failed peer/plugin
startup and early Electron build-race evidence remain exactly as recorded above.
Native fractional resize remains **NONPASSING**, expected 549x309 vs observed
667x375, unchanged and not rerun. Live/paid providers, private cloud/OAuth, actual
engines/encoders, other platforms, installers/signing/notarization remain unverified.

No subagents, new worktrees, push, PR/watch, removal or destructive cleanup. All
worktrees and untracked `.codegraph/` preserved. Tracked root changes are limited
to the helper regression and ticket/report/map/execution-state updates.
