# 02: Select business tools consistently across agent consumers

**What to build:** An application can enable or disable game and story tool contributions at host composition, and register a minimal non-game example tool through the same interface. A disabled business tool is neither advertised nor executable through host-controlled agent entry points.

**Blocked by:** 01 — Unify tool contributions while preserving existing behavior.

Status: resolved

- [x] Game and story tools are contributed by explicit source-registered business modules rather than unconditional mixed tool assembly.
- [x] With those modules enabled, existing tool names, inputs, and behavior remain compatible, including game tool availability checks.
- [x] With either module disabled, its tools are absent from the Pi, supported coding-agent, and external-MCP catalogs, and direct invocation through those entry points is rejected.
- [x] A minimal non-game example tool is discoverable and executes through the supported consumers using the existing tool execution contract.
- [x] Tool selection preserves planning restrictions, workspace isolation, cancellation, and cleanup; module selection cannot broaden planning permissions accidentally.
- [x] Existing Skills and MCP plugin contributions continue to work alongside source-registered business tools.
- [x] Extend existing catalog and invocation integration tests to cover enabled, disabled, and example-tool cases with deterministic fixtures.
- [x] Run focused affected tests and type checking, and document the resulting host configuration and verification evidence.

**Context:** This completes the first tool-boundary milestone. Use host composition configuration for this slice; workspace-manifest selection is connected in ticket 04. Removing every game dependency from the build is outside this ticket. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation evidence

Implemented in `t3/gate-business-tools` and merged into the integration branch. See [implementation report](../reports/02-select-business-tools.md) for host configuration, acceptance evidence, checks, integration merges and validation limits.

## Answer

Resolved by implementation `37f353482118ad3cc6217fd35670790f81892336`, merged conflict-free into
`refactor/ohmytemplate-integration` as `fbeb9975173204340c8688f2bf7359e9ce12f4c7`.
Host selection gates catalogs and invocation for Pi, coding-agent bridges and
external MCP; default game/story behavior, planning restrictions and plugin
composition remain intact. The opt-in non-game example executes through the
existing contracts. No integration code fixes were necessary.

Root verification: 151 tests passed in eight tool/external-MCP/runtime/Pi/plugin
suites; typecheck and `git diff --check` passed. Full required checks are recorded
in the [report](../reports/02-select-business-tools.md) and were not repeated
because the merge introduced no further code changes. Live-provider and installed
third-party CLI sessions remain unverified; no renderer interaction changed and
no UI evidence is claimed. Workspace manifest selection and game-free builds
remain outside this ticket.
