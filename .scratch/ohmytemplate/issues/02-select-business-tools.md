# 02: Select business tools consistently across agent consumers

**What to build:** An application can enable or disable game and story tool contributions at host composition, and register a minimal non-game example tool through the same interface. A disabled business tool is neither advertised nor executable through host-controlled agent entry points.

**Blocked by:** 01 — Unify tool contributions while preserving existing behavior.

Status: ready-for-agent

- [ ] Game and story tools are contributed by explicit source-registered business modules rather than unconditional mixed tool assembly.
- [ ] With those modules enabled, existing tool names, inputs, and behavior remain compatible, including game tool availability checks.
- [ ] With either module disabled, its tools are absent from the Pi, supported coding-agent, and external-MCP catalogs, and direct invocation through those entry points is rejected.
- [ ] A minimal non-game example tool is discoverable and executes through the supported consumers using the existing tool execution contract.
- [ ] Tool selection preserves planning restrictions, workspace isolation, cancellation, and cleanup; module selection cannot broaden planning permissions accidentally.
- [ ] Existing Skills and MCP plugin contributions continue to work alongside source-registered business tools.
- [ ] Extend existing catalog and invocation integration tests to cover enabled, disabled, and example-tool cases with deterministic fixtures.
- [ ] Run focused affected tests and type checking, and document the resulting host configuration and verification evidence.

**Context:** This completes the first tool-boundary milestone. Use host composition configuration for this slice; workspace-manifest selection is connected in ticket 04. Removing every game dependency from the build is outside this ticket. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
