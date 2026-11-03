# Ticket 12: standalone template export evidence

Status: claimed; locally verified implementation, awaiting merger. Ticket 13 is
unchanged. No other ticket or execution-state file was edited.

Branch: `t3/export-standalone-template`.
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-1505f79c`.
Implementation HEAD: `b473cce814e4bb97c18d220a2d268b2400e299b8`;
this report and ticket acceptance annotations are a subsequent evidence commit.
Progress commits: `0a30e567`, `b0e2e4f3`, `c418e292`, `b473cce8`.

`git merge-base --is-ancestor adba8c2e HEAD` passed. The requested spelling
`10adba8c2e` is not a Git object: ticket 10's final recorded revision is
`adba8c2e`. `git merge refactor/ohmytemplate-integration` reported Already up to
date, most recently before handoff; integration is `ef2353ca99d5e9ea5c0364dc93775564a41475ee`.
No merge changed source or required an additional affected-check run.
Read AGENTS, CONTRIBUTING, specification, glossary/ADR, tracker, ticket 12,
final combined ticket 10 report/exclusion inventory, Host/Renderer/Desktop and
identity reports, and the actual combined fixture. Applied TDD/tests/mocking,
git-commit and skill-writing guidance at the already approved seams.

## Deliverable and reproduction

Actual independent, installed and built artifact:
**`/tmp/ohmytemplate-12-verified`** (canonical macOS path
`/private/tmp/ohmytemplate-12-verified`). It can be opened directly and uses no
source checkout links. Earlier experimental exports are preserved, but only this
final artifact has the complete corrected verification below.

From this source checkout, after its frozen install:

```sh
PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH bun run export:template /absolute/new-directory
```

The directory must not exist and must be outside the source checkout. This is an
export command and baseline identity, not the ticket 13 naming initializer.

The exporter reuses `application-source-boundary.mjs`, `hostAssemblyPlugin` and
the existing strict selected TypeScript program. Executable graphs cover daemon,
workers, Electron bootstrap/main/preload/external MCP, renderer, Vite config,
pinned-plugin preparation and the selected core tests. Type-only dependencies
ship actual compiler-emitted declarations, not dormant business implementations
or invented game stubs. All diagnostics fail export. The source-watch host seam
re-exports the real existing non-game host, matching compilation selection.

The complete existing selected core remains: Pi conversations, files, general
canvas/document/table/media nodes, example tool/custom node, provider and media
configuration, Skills/MCP and native plugin hosts, browser and Electron. There
is no alternate tiny application. The 117-path ticket 10 exclusion policy remains
the shared implementation/resource boundary; graph selection additionally avoids
unreachable source and resources. Source-only business contracts remain available
as declarations where needed by core protocol types.

Baseline identity is OhMyTemplate / ohmytemplate / org.example.ohmytemplate, with
clean relative storage. Root `application.json`, source selector and `bun.lock`
are unchanged; root defaults remain OhMyGame. The output has its own package
scripts and lockfile. Only the lockfile workspace name changes in the export;
no dependency version, integrity, patch, or root lock changes were needed.
Apache LICENSE, source NOTICE, original source headers, font OFL files, pinned
plugin NOTICE/assets and dependency patches are retained. English/Chinese baseline
README setup/extension guidance is aligned. External-agent settings link to a
shipped short English workbench skill at the existing compatibility directory.
No new UI text was introduced.

Export copies no .git/.scratch/.env, user credentials/data, node_modules, prepared
.runtime, output/cache, game plugin trees, game examples, story/scene resources,
or private cloud repositories. Installation/preparation/build verification then
creates ordinary local dependencies, runtime resources and build output. Smoke
user data lives outside the artifact under the isolated paths below.

Final audit `/tmp/ohmytemplate-12-verified-independence.log`:
525 source/resource/contract files, including 22 generated declaration files;
zero source symlinks, excluded source paths, or source-checkout path strings.
`node_modules` is an ordinary directory under the export; all 70 installed
symlinks resolve inside that export, zero outside it. Frozen install preserved
exactly the source lock with the workspace-name adjustment. No external
node_modules symlink supplied independent proof; normal Bun installation cache
was permitted and used.

## Independent commands and results

Bun 1.4.2 on the requested PATH, Node 24.20.0, Electron 43.3.0; macOS arm64.
All commands below ran with cwd `/tmp/ohmytemplate-12-verified` and only its files
and installed dependencies. No old dist tree or prepared plugin cache was copied.

```sh
bun install --frozen-lockfile
bun run prepare:preinstalled-plugins
bun run typecheck
bun run lint
bun run test
bun run build
node scripts/test-node-runtime.mjs --non-game
OHMYGAME_SMOKE_DIRECTORY=/tmp/ohmytemplate-12-verified-electron node scripts/test-web-game-runtime.mjs --non-game
OHMYGAME_SMOKE_DIRECTORY=/tmp/ohmytemplate-12-verified-electron node scripts/test-web-game-runtime.mjs --non-game --reopen
```

All passed. Logs are `/tmp/ohmytemplate-12-verified-{export,install,plugins,typecheck,lint,tests,build,node,electron,electron-reopen}.log`.
Install: 781 packages, frozen lock. One pinned public plugin prepared from its
locked public source with checksum verification. Strict selected source/type
checks: Host 239 graph inputs / 248 source files; Renderer 287 / 281; Desktop
30 / 52. Host build also strictly checks/emits worker roots and core Electron.
Core tests: 4 files / 56 passed; no omitted-game test is mandatory. Lint passed;
only the unused-private-member rule is off for compiler-emitted declaration
files, with an explanation in the output .oxlintrc.json. Executable core lint
and all selected compiler diagnostics remain enabled. Renderer retains the
existing chunk-size advisory.

The actual authenticated compiled Node check rejects unauthenticated requests,
exercises files/traversal protection, non-game defaults/manifest diagnostics,
custom canvas persistence and invalid-input preservation, real example tool
invocation over external MCP, absent game tools/routes, provider/media setup,
archives, native MCP and extension hosts, identity/storage restart and graceful
shutdown. It now configures a local deterministic OpenAI-compatible HTTP provider
through the public provider API, runs a **real Pi turn**, and reads completed
persisted history containing `Independent workbench conversation verified.`.
Only the external model service is simulated; no conversation/agent manager is
replaced. No paid generation or OhMyGame account is needed.

Direct documented startup also passed:

```sh
DAEMON_PORT=0 OHMYGAME_DAEMON_TOKEN=template-start-smoke \
OHMYGAME_DATA_DIR=/tmp/ohmytemplate-12-start-data \
PI_CODING_AGENT_DIR=/tmp/ohmytemplate-12-start-pi bun run start
```

`/tmp/ohmytemplate-12-verified-start{,-proof}.log`: bound a fresh loopback port,
unauthenticated projects 401, authenticated health/projects 200 with empty data.
Stopped the process and verified the URL no longer answers.

## Browser and source-watch proof

Ran the actual documented `bun run dev` from the final artifact with
`OHMYGAME_DATA_DIR=/tmp/ohmytemplate-12-verified-browser-data` and
`PI_CODING_AGENT_DIR=/tmp/ohmytemplate-12-verified-browser-pi`.
Vite 43120 and Node/tsx --watch 43110 started. A browser opened the real source
renderer, title OhMyTemplate, completed provider-free onboarding and used the
creation dialog for `Verified standalone browser`. General workspace with
example module; no game/account/community/publishing prerequisite/navigation.

In that browser, used Add node → Document, edited title to `Verified browser
title`, Markdown to `# Independent browser\nSaved from the exported application.`,
and edited the actual example textarea to `Verified browser custom-node edit`.
The example node was initially seeded through the public canvas API. Autosave,
explicit full browser reload and rendered/persisted values passed. The title is
rendered after reload; document editing input is naturally hidden then. Verified
file creation/read/rename/list through the public files API. Configured Meshy
through the source daemon and checked game/account/community routes remain 404.

Touched only the exported `src/daemon/non-game-host.ts` mtime: the watcher logged
restart from PID 47875 to 49616 and rebound 43110. Public API then reloaded the
edited custom node, document title/Markdown and provider configuration. This
closes the compiled-only host-binding gap. No source-checkout imports were
restored. The not-yet-used empty conversation is regenerated after source restart;
real completed conversation persistence is separately checked by the Node/Pi test.

Logs: `/tmp/ohmytemplate-12-verified-dev.log`, `-source-api.log`,
`-browser-persistence.log`, `-files.log`. Vite briefly returned expected proxy
connection errors during initial daemon/plugin readiness and watcher restart;
requests worked once ready. Preview snapshot calls timed out, so browser evidence
is DOM interaction plus API persistence, not screenshot QA. The owned browser tab
and dev processes were stopped; data and logs are preserved.

## Actual Electron proof

Both final selected Electron commands above passed with its own authenticated
compiled daemon and production UI. Creation dialog creates a general workspace;
reusable preview and sandbox/absent game/account IPC rejection work. Real
custom-node textarea editing/autosave/reload, two-board document title/Markdown
editing, retained tuning 404, save/quit and owned-process shutdown pass. A second
full Electron+daemon process launch reopens the persisted custom node and document
and again shuts down owned processes. This is actual Electron, not a mocked app.

Evidence: `/tmp/ohmytemplate-12-verified-electron/non-game-{preview,canvas-reopened}.png`,
`reopen.json`, and shutdown targets. Canvas capture was visually inspected:
document is visible; the custom node is partly beyond the viewport, while its
editing/restart assertions execute against the actual DOM. No full native game
window/resize claim is made. No installer or signing command was run.

## Source regressions and red-green checkpoints

Root frozen install, pinned-plugin preparation, changelog check, strict typecheck,
lint, full public suite, renderer build and Node runtime passed. Root full run
was repeated after selected-contract/provider-check changes: **353 files passed,
3 skipped; 4355 tests passed, 41 skipped** (74.24s). Default Node still exercises
story creation/upgrade/preview, archive, native MCP/extensions and independent
identity restart. Logs `/tmp/ohmytemplate-12-root-{install,plugins,changelog,typecheck,lint,tests,renderer,node}.log`
and later `/tmp/ohmytemplate-12-final-root-{typecheck,lint,tests,node}.log`.
Final exporter/config/license changes reran the affected five identity/export
checks (all passed, 9.59s), independent complete workflow above, and root lint /
typecheck (`/tmp/ohmytemplate-12-final-root-{lint2,typecheck2}.log`). Root renderer
production source did not change after its passing build. New-file formatting
and `git diff --check` passed.

Export regression first failed on missing command, then passed with a real
standalone directory and safe overwrite refusal. Subsequent real export runs
caught invalid changelog syntax, omitted Vite changelog dependency, missing font
license siblings, and declaration-only lint warnings. These were corrected, not
hidden. Type-only dormant game source is now absent and its real declarations
retain required protocol typing. Intermediate failing artifact logs remain;
only the final `verified` artifact/results above are acceptance evidence.

## Limits and handoff

All local ticket 12 acceptance criteria are demonstrated; status remains claimed
until merger. Ticket 13's broad initializer/naming workflow is not implemented.
Live paid generation, private cloud/OAuth, actual engine/encoder runs, other
platforms, installer packaging/signing/notarization remain unverified. Normal
provider credentials/network are still required for actual generation. Public
private-cloud/platform skips are unchanged.

The original native fractional-resize baseline remains **NONPASSING**, unchanged
(expected 549x309, observed 667x375); it was not rerun or weakened. Later native
game playback/fullscreen assertions are not covered by this export task. None of
these limitations is represented as passing. No subagents, new worktrees/checkout
setup, push/PR/watch, removal or destructive cleanup was performed. Existing
verification scripts retain their normal disposal of their own temporary fixtures.
