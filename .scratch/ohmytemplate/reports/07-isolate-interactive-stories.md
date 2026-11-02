# 07: Optional interactive stories implementation

Status: claimed; implementation ready for merger review.

## Recovery and integration

- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-f8850f6b`.
- Branch: `t3/isolate-interactive-stories-1` (prepared branch retained).
- Verified `c3225477` is an ancestor before edits. Current integration is `0dd48a3ade764a78ca48c392dc3bb7b99f2b6365`; `git merge refactor/ohmytemplate-integration` reports already up to date.
- Inspected `/tmp/ohmytemplate-recovery-07/working.patch`. Full `git apply --check` failed only for locale context changed by ticket 05. Applied all other hunks and adapted both locale additions, preserving custom-node translations. Original recovery worktree was untouched.
- Removed an unused recovered export option. No execution-state or other ticket edits, lockfile changes, push, PR, or new worktree.

## Behavior

The existing source module registry, workspace policy, and `businessTools.story` selection now control story editor panels, agent guidance, templates/examples, graph/codebase/validation/thumbnail APIs, upgrades, library-media operations, preview startup and game execution entry points. Responses expose effective story availability and a preservation diagnostic. Story tools keep their shared catalog boundary. The existing independent game playtesting flag remains independent of story authoring.

Unavailable stories retain graph, sources, instructions, schemas and runtime. Archive import avoids refreshing unavailable story contracts; forced shared Library deletion cannot rewrite those stories. Shared canvas/files/media remain available. English and Chinese diagnostic text are aligned; agent guidance is English. Final build/resource exclusion belongs to ticket 10.

## Verification

- Read CONTRIBUTING, local tracker, glossary, accepted ADR, TDD skill plus tests/mocking references, and git-commit skill. Used the approved daemon/tool and complementary renderer/runtime seams.
- `bun install --frozen-lockfile`: passed with Bun 1.4.2 using `/tmp/ohmytemplate-tools/node_modules/.bin` on PATH; lockfile unchanged.
- Recovery focused tests: 7 files / 232 tests passed.
- Red/green: added direct PreviewManager startup rejection for a story whose workspace excludes the story module. Against pre-change preview implementation it failed (promise resolved); restored implementation passed. Both ensureStarted and explicit start reject without changing saved page content.
- `bun run prepare:preinstalled-plugins`: passed (1 pinned plugin).
- `bun run changelog:check`: passed.
- `bun run typecheck`: passed, including final runtime test.
- `bun run lint`: passed.
- `bun run test`: 352 files passed, 3 skipped; 4,337 tests passed, 41 skipped. Existing happy-dom iframe connection/disabled-loading diagnostics occur in the passing suite.
- `bun run build:renderer`: passed; existing chunk-size warning.
- `bun run test:node-runtime`: passed on Node 24.20.0: authenticated daemon startup, story creation/upgrade/preview, archive export/import, native MCP, extension hosts, independent application restart and shutdown.
- Final affected regression rerun: 5 files / 214 tests passed.
- `git diff --check`: passed.

## Manual checks and limits

Browser development used isolated `/tmp/story07-manual-data` and `/tmp/story07-manual-pi`, without provider credentials. Completed onboarding without a model, created an Interactive Story, selected Story, added a Blank Scene, opened the Scene editor and clicked Play; a local story runtime iframe started. Reloaded the application and confirmed the saved Node 1 Scene remained on the story graph. Snapshot automation timed out twice (`Preview automation snapshot timed out after 15000ms`), so no screenshot or visual rendering claim is supplied. DOM observations establish editor controls and runtime iframe startup, not full visual/audio playback quality.

Outstanding: full visual/browser playback interaction and detailed save/reload editing walkthrough; Electron desktop playtesting/window lifecycle; Windows/Linux platform runs and Windows installer cases; real model/media provider generation; private-cloud publishing contract/staging verification (private repository unavailable). Public fixture tests cover module-disabled host/workspace/source registry cases, preservation, renderer fallback, generic canvas access, enabled story/runtime behavior and shared tool selection. Full bundle/resource exclusion is explicitly deferred to ticket 10.
