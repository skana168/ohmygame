# 01: Unify tool contributions while preserving existing behavior

**What to build:** Application developers can contribute agent tools through one source-registered composition boundary while existing OhMyGame users continue using the same tools. Introduce this boundary alongside the existing interfaces, migrate existing consumers, and retain compatibility until subsequent tickets remove the remaining business-specific assembly.

**Blocked by:** None (can start immediately).

Status: claimed

- [ ] Introduce source-registered contribution descriptors sufficient to identify a business module and its tools, without requiring a workspace manifest or dynamic code loading.
- [ ] Existing host-contributed tools remain discoverable and executable by Pi, supported coding-agent bridges, and external MCP clients through the shared contribution boundary.
- [ ] Existing tool names, input schemas, results, and consumer-specific built-in tools remain compatible; reuse the existing ToolBridge rather than adding another transport.
- [ ] Planning restrictions, invalid-input handling, cancellation, sequential execution where required, workspace isolation, and session cleanup preserve their observable behavior.
- [ ] Duplicate tool registrations fail explicitly rather than silently overriding an existing tool.
- [ ] Existing OhMyGame projects and enabled tools continue working with the default composition. This ticket does not yet promise module disabling or a game-free build.
- [ ] Extend the existing agent-tools, agent-runtime, and external-MCP integration tests at catalog and invocation boundaries, using deterministic local fixtures.
- [ ] Run focused affected tests and type checking, and record commands, results, skipped checks, and any compatibility concerns.

**Context:** This is the compatibility prefactor for the extraction. Prefer an additive interface and incremental consumer migration to a broad directory move. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
