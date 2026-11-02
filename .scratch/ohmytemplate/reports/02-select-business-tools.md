# Ticket 02 implementation report

Status: implemented; ticket remains claimed for the merger.

## Checkout and integration

- Branch: `t3/gate-business-tools`.
- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-b36ec637`.
- Confirmed `7ea3c608` was HEAD and an ancestor before edits; initial checkout was clean.
- Applied `/tmp/ohmytemplate-recovery-02/working.patch` after `git apply --check`; original checkout and recovery patch remain intact.
- Implementation commit: `b00a249c`.
- Merged integration including ticket 11 (`75d14f6f`) with merge commit `b78de3aa`; no conflicts. Then merged latest integration `4ad52459` (persisted identity session-history evidence). Latest integration `7af139c7` adds only execution tracking and is also merged; final report commit follows these merges.

## Behavior and acceptance evidence

- `src/daemon/business-tools.ts` contributes game and story tools separately through the existing `ToolContribution` contract. `createApp({ businessTools: { game: false, story: false } })` selects them at host composition; omitted flags preserve both defaults.
- Compared recovered story handlers and game availability predicate with the original code. Names, schemas, results, project/runtime availability and story-specific game bridge remain compatible. Story handlers additionally check cancellation before filesystem work.
- Shared selection reaches both Pi and native coding sessions through `conversationAgentTools`, and both the external MCP schema catalog and project-bound execution factory. Disabled game selection avoids creating agent playtest owners. Existing cleanup ownership and scheduling are unchanged.
- Existing `agent-tools` tests exercise web/general runtime availability and story creation/validation. Added selection cases cover game disabled, story disabled, and both disabled; tools are absent and ToolBridge direct calls fail. External MCP HTTP integration covers all four selections and rejects disabled calls.
- Shipped opt-in `createExampleToolContribution(project)` implements `example_echo` with ordinary TypeBox inputs, text output, workspace details and cancellation. Tests execute it directly through the Pi tool contract, through the native ToolBridge, and through external MCP HTTP. Invalid input and cancelled calls fail, separate workspace bindings stay distinct, and planning does not advertise or execute it.
- Existing plugin installation tests now run with both business modules disabled, including Skills/MCP package validation and workspace path/symlink isolation. Existing external MCP plugin tests, Pi extension tests, and native driver/session tests retain coverage of plugin dispatch, planning, cancellation and cleanup.
- Host configuration and example usage are documented in `docs/coding-agents.md`. Workspace manifests are outside this ticket. Trusted source contributions can still register arbitrary names; application authors must not deliberately re-register disabled module tools.

## Recovery and test loop

Inherited changes were reviewed rather than treated as verified. Initial recovered boundary suites passed 33 tests. Temporarily removing both selection gates made the disabled-tool regression fail because `game_use` remained advertised; restoring the gates returned it to green. This was a sensitivity check of inherited behavior, not a claim that inherited code was originally developed test-first. Extended existing tests to explicitly verify independent example workspace binding and Skills/MCP installation with business modules disabled.

## Verification

Used Bun 1.4.2 through `/tmp/ohmytemplate-tools/node_modules/.bin`; `bun install --frozen-lockfile` succeeded and the lockfile is unchanged.

- `bun run prepare:preinstalled-plugins`: passed (one prepared plugin).
- `bun run changelog:check`: passed.
- After integration merge, `bun run typecheck` and `bun run lint`: passed; typecheck repeated after the final test extension.
- After merge, focused tool/external-MCP/native-session/native-driver/app/identity run: 216 tests passed in six files. The initial focused command included the nonexistent `test/plugin-capabilities.test.ts` path contributed no tests; actual plugin coverage was run separately below.
- After latest identity-test integration: app/identity/tool/Pi/plugin boundaries passed **134 tests in six files**; typecheck passed again. The subsequent `7af139c7` merge contains only execution tracking and needs no code revalidation.
- Final `agent-tools`, `external-mcp`, `pi-agent`, `plugin-runtime`: 39 tests passed in four files.
- After merge, `bun run build:renderer`: passed (existing chunk-size warning).
- After merge, `bun run test:node-runtime`: passed on Node 24.20.0, including authenticated API, stories, previews, export/import, native MCP, extension hosts, independent configured application restart and graceful shutdown.
- New TypeScript module formatting: Prettier check passed. `git diff --check`: passed.
- Full suite after identity merge: **352 files passed, 3 skipped; 4,245 tests passed, 41 skipped** (100.50 seconds). An earlier full run overlapped the identity merge and reported missing `__APP_NAME__` constants from its old loaded configuration; that mixed-tree run is not treated as final evidence.

## Outstanding validation

The final integration update changes identity tests and tracker evidence only; affected app/identity/tool suites and type checking were rerun after that merge. No tracker files from other tickets or execution-state were edited directly; their changes came exclusively from integration merges.

No live model-provider or installed third-party coding CLI session was run; deterministic bridge/driver fixtures cover those transports. No browser/Electron UI interaction was needed for this host-only selection change. This ticket does not claim a game-free build, workspace-manifest selection, custom canvas nodes or independent template completion. Remote cloud checks requiring private services remain subject to the suite's documented skips.
