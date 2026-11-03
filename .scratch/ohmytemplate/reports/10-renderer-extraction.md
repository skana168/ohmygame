# Ticket 10 renderer extraction retry

Scope: renderer contribution selection and renderer build/interaction evidence only.
The renderer subslice is verified below; this report does not resolve ticket 10.

## Recovery and integration

- Branch: `t3/extract-optional-renderer-contributions`.
- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-4523cbea`.
- Started from integration checkpoint `3fd26989e0571385966bbb1e027f5ff694aca584`.
- Merged assigned previous committed head
  `95497583194354c196a2fc6d8e321eb0b3392013` with a normal merge.
  That history includes `ba371b5d` and the earlier renderer implementation.
- Ran `git apply --check` and applied
  `/tmp/ohmytemplate-recovery-10-renderer/working.patch` after the merge.
  Previous worktree `/Users/yoyun/.t3/worktrees/ohmygame/t3-3120277a`
  and recovery patch were preserved.
- Verified `3fd26989`, `ba371b5d`, and the assigned previous head are ancestors.
- Final integration merge of `refactor/ohmytemplate-integration` reported
  Already up to date at `3fd26989e0571385966bbb1e027f5ff694aca584`.
- New implementation/evidence checkpoints: `afe348fc`, `7fc767ee`, `f00d76f1`.
  The report commit follows these; final handback supplies its SHA.

## Verified renderer boundary

Inherited code was inspected and tested rather than treated as complete because
it had been committed. Production Vite selects `core-contributions.ts` for the
non-game composition; the default OhMyGame assembly retains its real account,
quota, game playback/recording, story, publishing and community implementations.
The non-game contribution object supplies no optional capabilities. It does not
substitute for the application shell or implement fake game services.

The renderer composition fixture now makes a separate source copy, omitting
business renderer implementations entirely, and changes only that copy's
source-owned application selection to non-game. It uses the real `vite.config.ts`
and real production build. No import stripping, required-import suppression,
type suppression or replacement application shell is used. A parsed-module
check additionally rejects excluded implementations.

Unavailable renderer source families: `auth`, `account-provider-details`,
`account-settings`, `cloud-quota`, `pending-publish`, `sign-in-dialog`,
`playable-*`, `story-*`, `game-*`, `web-game-*`, `playtest`,
`node-thumbnail-page`, `community-*`, `publish-dialog`, `games`,
`desktop-game-preview`, `use-web-game-player`, and `business-contributions`.
Shared persisted contracts and the optional account context remain available.
This is renderer-source exclusion, not full host/desktop/resource exclusion.

The esbuild graph assertion retains the real application, project shell,
coding workspace, canvas workspace, asset nodes, model settings, plugins,
onboarding, library, project creation, provider models, connections, agent
timeline, coding agent settings and example custom note renderer. The strict
production Vite graph also confirms core contribution selection, both workspaces
and the example note. Native game-host and recorder entry pages are not copied
into the fixture; the real selected configuration builds successfully without them.

## Behavior and checks

Toolchain: Bun 1.4.2 via `/tmp/ohmytemplate-tools/node_modules/.bin`, Node 24.20.0.
`bun install --frozen-lockfile` passed; lockfile unchanged.

- Renderer composition: 2 tests passed, including production Vite build with
  business UI sources physically absent.
- In that absent-source fixture, unchanged core DOM interaction suites passed:
  4 files / 56 tests (`asset-canvas-serialize`, `canvas-table-node`,
  `canvas-markdown`, `editor-canvas-viewport`). This includes real React custom
  note rendering, edit, serialization, unmount/reopen, missing-module diagnostics
  and preserved payloads. It is DOM interaction evidence, not a live browser or
  Electron walkthrough or daemon persistence proof.
- Default focused renderer suites: 7 files / 155 tests passed, including saved
  game preview behavior when its contribution is absent, project-shell checkpoint
  and navigation flows, onboarding, sidebar and provider balance settings.
- Default production `build:renderer` passed, retaining the game entry pages.
  Vite reports the existing large-chunk advisory.
- Plugin preparation, changelog check, typecheck, lint, formatting of the extended
  renderer fixture, and `git diff --check` passed.
- `test:node-runtime` passed: host/story build, authenticated daemon startup,
  story creation/upgrade/preview, project export/import, native MCP, extension
  hosts, configured independent application restart and graceful shutdown.
  This is default runtime evidence with business sources present.
- Full default suite: 353 files passed / 3 skipped; 4,350 tests passed /
  41 skipped (356 files / 4,391 tests total). No failing suite remained.

The first full run passed 4,339 tests / 41 skipped but failed loading
`access.test.ts` because a `.vitest-cache` entry disappeared. The nested fixture
had shared the parent cache through its node_modules symlink. The fixture now
sets a private `--fsModuleCachePath`; original tests were not deleted, skipped,
weakened or retried internally. The final full rerun is recorded above.

Default game-only test fixtures continue running under the default composition.
The selected absent-source runtime check runs the unchanged core suites rather
than requiring intentionally disabled story/game/account workflows. The existing
41 default skips remain intact; they do not establish private-cloud acceptance.

Logs:

- `/tmp/ohmytemplate-renderer-exclusion.log`
- `/tmp/ohmytemplate-renderer-focused.log`
- `/tmp/ohmytemplate-renderer-default-tests-final.log`
- `/tmp/ohmytemplate-renderer-default-build.log`
- `/tmp/ohmytemplate-renderer-node.log`
- `/tmp/ohmytemplate-renderer-plugins.log`

Source fixtures and their `core-behavior.log` files are preserved beneath the
system temporary directory with prefix `ohmytemplate-renderer-`.

## Exact remaining gaps

Root must combine the host and desktop targets and validate all excluded source
and resource families together, then build/start the complete selected app.
This renderer fixture deliberately retains host/desktop source and shared file
contracts; its passing build cannot stand in for that combined acceptance.
A fresh selected non-game live browser/Electron walkthrough with actual daemon
save/restart, visual QA, real model/media providers, private cloud/OAuth, other
platforms and release packaging were not run in this subslice. Earlier main10
runtime notes are historical evidence, not fresh verification here. Template
export/initialization belongs to subsequent tickets. Main10 report, ticket and
execution-state were not edited during this retry.

## Root integration verification

- Merged `t3/extract-optional-renderer-contributions` at
  `0950e1e9075807f4abecef48784ee4ff0e0bbda3` from worktree
  `/Users/yoyun/.t3/worktrees/ohmygame/t3-4523cbea` into
  `refactor/ohmytemplate-integration` with conventional merge commit
  `2cfedfd3f232bb34623904e2f16f086f3545bff5`. No conflicts or integration
  corrections; shared `ba371b5d` foundation remains an ancestor.
- Inspected actual default business contributions and source-selected empty
  optional contribution assembly: default uses real account/game/story/publishing/
  community implementations; core supplies no fake or noop game providers.
- Fresh Bun 1.4.2 validation using
  `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`: 10 focused renderer
  suites / 190 tests passed (`renderer-composition`, `asset-canvas-serialize`,
  `canvas-table-node`, `canvas-markdown`, `editor-canvas-viewport`,
  `coding-workspace`, `project-shell-checkpoints`, `onboarding-renderer`,
  `app-sidebar`, `provider-balance-settings`). Renderer composition includes
  the renderer-scoped esbuild graph plus real production Vite compilation with
  excluded business UI sources physically absent and nested unchanged core
  interaction suites (4 files / 56 tests). No source/import suppression or
  replacement shell is used.
- Fresh typecheck, default `build:renderer`, and `git diff --check` passed.
  Default build retains game entry pages and reports the existing chunk-size
  advisory. Logs: `/tmp/ohmytemplate-renderer-merge-tests.log`,
  `/tmp/ohmytemplate-renderer-merge-typecheck.log`,
  `/tmp/ohmytemplate-renderer-merge-build.log`.
- Full public checks, Node runtime and manual browser/Electron flows were not
  repeated during this merge; earlier evidence above is inherited. This proves
  renderer exclusion only, with no daemon/desktop exclusion claim.
- Ticket10 stays CLAIMED and every parent acceptance checkbox remains pending
  combined proof; host and desktop work is still ongoing. Tickets12/13 and other
  execution-state metadata are unchanged. Root tracked tree was clean after
  merge; untracked `.codegraph/` is preserved.
