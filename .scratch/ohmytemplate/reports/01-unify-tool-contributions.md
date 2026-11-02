# Ticket 01 implementation evidence

Status: implemented; ticket remains claimed for the root merger.

Branch: `t3/unify-tool-contributions`
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-24fee26d`
Starting HEAD: `cbe42c3d386f58778b37aef53104f2ece4f72ac4`.
Confirmed that commit is an ancestor before editing. No `.codegraph/` exists,
so discovery used normal source reads and rg. No checkout/worktree was created.

## Changes and acceptance evidence

- Added source-registered `ToolContribution` descriptors (`id`, `tools`) and
  duplicate-rejecting `composeToolContributions`. Definitions retain their
  original handlers and schemas. The default factory composes core, story and
  game contributions, preserving catalog order and availability conditions.
- Added the additive `createApp({ toolContributions })` source composition hook;
  existing callers of `createAgentTools` remain compatible. Pi and coding agents
  share application/native-plugin composition. External MCP discovers source
  contributions from its catalog and invokes them using the existing ToolBridge.
- Existing consumer-specific file/shell and conversation tools retain their
  filtering. Planning selection, schema validation, cancellation, sequential
  execution, workspace/session ownership and cleanup remain with their existing
  consumers. A duplicate failure during native bridge construction closes its
  plugin session and removes its private folder.
- Extended agent-tools coverage with a workspace-bound source tool that is
  discoverable in normal mode, excluded in planning, executable, and rejected on
  duplicate contribution. Extended the runtime bridge test to reject duplicates;
  existing Claude Code/Codex/OpenCode protocol fixtures now use source-composed
  tools for their catalog, invocation, invalid-input and planning coverage.
- Extended the existing daemon external-MCP test to register, list and invoke a
  source tool through authenticated project selection. Added a collision test
  against external MCP's own `get_project`. Existing MCP tests retain project
  isolation, invalid-input, cancellation, serialized calls and release coverage.
- Default game/story tools remain covered by agent-tools, game-design, daemon,
  external-MCP and Node startup regressions. No module gating, shipped example,
  manifest, dependency, transport or dynamic-loading API was introduced.
- Documented the source hook and schema-only catalog construction in
  `docs/coding-agents.md`. No UI text or README behavior changed.

## Red-green evidence

1. Runtime duplicate test failed because ToolBridge did not throw; passed after
   introducing duplicate-rejecting composition in bridge construction.
2. Source contribution agent-tools test failed because `business_echo` was absent;
   passed after adding the additive composition input to the default factory.
3. Daemon external-MCP catalog/invocation test failed because `business_echo` was
   absent; passed after wiring source contributions and catalog-based dispatch.
4. External-MCP session-tool collision test failed because the fixture resolved;
   passed after composing its session and application catalogs with duplicate
   validation. The test tools are deterministic fixtures, not a shipped example.

## Commands and results

Every Bun command used `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`.
Bun: 1.4.2. Node runtime smoke used Node 24.20.0.

- `bun install --frozen-lockfile`: passed; lockfile unchanged.
- `bun run prepare:preinstalled-plugins`: passed, one pinned plugin prepared.
- `bun run changelog:check`: passed.
- `bun run typecheck`: passed (including final affected-change rerun).
- `bun run lint`: passed (including final affected-change rerun).
- `bun run test -- test/agent-tools.test.ts test/agent-runtime-units.test.ts test/agent-runtime-session.test.ts test/agent-runtime-drivers.test.ts test/external-mcp.test.ts test/extension-hosts.test.ts`:
  173 passed, 1 skipped, 6 files passed.
- `bun run test`: 4,235 passed, 41 skipped; 351 files passed, 3 skipped;
  exit 0, 92.57 seconds. Localhost port 3000 connection-refused diagnostics
  appeared without failing the suite.
- Final rerun after native duplicate cleanup and external dispatch adjustments:
  `bun run test -- test/external-mcp.test.ts test/agent-runtime-drivers.test.ts test/extension-hosts.test.ts`:
  97 passed, 1 skipped; 3 files passed.
- `bun run build:renderer`: passed; existing large-chunk warning reported.
- `bun run test:node-runtime`: passed, rerun after final native cleanup change;
  verifies host build, authenticated daemon startup, story creation/upgrade/preview,
  export/import, native MCP runtime, extension hosts and graceful shutdown.
- `bunx --bun --no-install prettier --check src/daemon/tool-contributions.ts`:
  passed. `git diff --check`: passed.
- `git merge --no-edit refactor/ohmytemplate-integration`: already up to date.
  Latest local integration tip remained
  `cbe42c3d386f58778b37aef53104f2ece4f72ac4`; ancestry confirmed.

## Risks and skipped/manual validation

- The public suite retains its conditional skips (41 tests, including private
  cloud contract coverage); hosted publishing and real paid provider calls were
  not verified. No private cloud dependency is required for this seam.
- Browser/Electron interactive flows and live agent CLIs were not manually
  exercised. No renderer or desktop interaction changed; deterministic protocol
  fixtures and Node startup are the available automated evidence.
- The source hook must construct schemas without workspace I/O for the external
  catalog placeholder and defer operations to execution. This is documented.
- Default module composition is unchanged. Disabling modules and the minimal
  non-game application example belong to ticket 02, not this compatibility seam.
- No push, PR, execution-state change or ticket resolution was performed.
