# 01: Unify tool contributions while preserving existing behavior

**What to build:** Application developers can contribute agent tools through one source-registered composition boundary while existing OhMyGame users continue using the same tools. Introduce this boundary alongside the existing interfaces, migrate existing consumers, and retain compatibility until subsequent tickets remove the remaining business-specific assembly.

**Blocked by:** None (can start immediately).

Status: resolved

- [x] Introduce source-registered contribution descriptors sufficient to identify a business module and its tools, without requiring a workspace manifest or dynamic code loading.
- [x] Existing host-contributed tools remain discoverable and executable by Pi, supported coding-agent bridges, and external MCP clients through the shared contribution boundary.
- [x] Existing tool names, input schemas, results, and consumer-specific built-in tools remain compatible; reuse the existing ToolBridge rather than adding another transport.
- [x] Planning restrictions, invalid-input handling, cancellation, sequential execution where required, workspace isolation, and session cleanup preserve their observable behavior.
- [x] Duplicate tool registrations fail explicitly rather than silently overriding an existing tool.
- [x] Existing OhMyGame projects and enabled tools continue working with the default composition. This ticket does not yet promise module disabling or a game-free build.
- [x] Extend the existing agent-tools, agent-runtime, and external-MCP integration tests at catalog and invocation boundaries, using deterministic local fixtures.
- [x] Run focused affected tests and type checking, and record commands, results, skipped checks, and any compatibility concerns.

**Context:** This is the compatibility prefactor for the extraction. Prefer an additive interface and incremental consumer migration to a broad directory move. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation evidence

Implemented on `t3/unify-tool-contributions`. Merged into `refactor/ohmytemplate-integration`. See [the evidence report](../reports/01-unify-tool-contributions.md)
for red-green results, acceptance evidence, full checks, integration ancestry,
and skipped/manual validation. Module gating and the shipped example remain
outside this ticket.

## Answer

Merged implementation `abb87643581ee38f6c5dc8e7899b7d7e056f022b` from
`t3/unify-tool-contributions` with merge commit
`9f6dc3c732ba4b305f2b7a92133c3b2b3f675367`. The delta was inspected for
integration conflicts and obvious regressions; the merge was conflict-free.
The acceptance criteria hold with the implementation report and root checks.
Default composition and consumer execution/lifecycle behavior remain compatible.

Root verification used Bun 1.4.2 with
`PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`:

- `bun install --frozen-lockfile`: passed; no tracked dependency changes.
- `bun run test -- test/agent-tools.test.ts test/agent-runtime-units.test.ts test/agent-runtime-session.test.ts test/agent-runtime-drivers.test.ts test/external-mcp.test.ts test/extension-hosts.test.ts`:
  passed, 173 tests passed, 1 conditional skip, 6 files passed.
- `bun run typecheck`: passed.
- `git diff --check`: passed.

The full public sequence was not repeated by the merger; its passing results
and conditional skips are recorded in the implementation report. Manual
browser/Electron, live agent CLI and private-cloud verification remain unrun
as documented there. Tickets 02 and 03 are newly unblocked and remain
`ready-for-agent`. Ticket 11 and all worktrees are preserved.
