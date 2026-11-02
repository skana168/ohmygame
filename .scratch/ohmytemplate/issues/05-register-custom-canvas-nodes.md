# 05: Register and persist a custom non-game canvas node

**What to build:** A source-registered business module contributes a custom node type, its data schema, its renderer, and a companion tool. Users can interact with the node and reopen their workspace without losing its content.

**Blocked by:** 04 — Create and use a non-game workspace with the shared workbench.

Status: claimed

- [ ] Provide a module contribution interface for node identity, data validation, and compiled renderer components alongside the existing general-purpose nodes.
- [ ] Extend the minimal non-game module with one demonstrable custom node and a tool that operates on its persisted domain data, using the established tool boundary.
- [ ] Users can add or otherwise create the example node, render and edit it, save it, and reopen it with stable identity and preserved content.
- [ ] Agent edits and companion-tool output are validated against the registered node contract and become visible through the normal canvas workflow.
- [ ] Invalid custom-node data produces an actionable diagnostic without silently discarding existing saved content or unrelated nodes.
- [ ] Disabling or removing the node module produces a clear missing-module or unknown-node diagnostic and preserves its data; restoring the module allows the existing node to render again.
- [ ] Existing node validation, rendering, persistence, and concurrent-edit behavior remain compatible.
- [ ] Extend existing canvas API and renderer tests for validation, tool interaction, save/reload, missing/restored modules, and unchanged general-purpose nodes.
- [ ] Document how the example contributes its node and tool; verify the relevant browser flow, translated UI text, and English agent instructions, and record focused checks and Electron validation needs.

**Context:** Renderer contributions compile with the application; dynamic JavaScript loading and a second full domain product are outside scope. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
