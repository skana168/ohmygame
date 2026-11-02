# 04: Create and use a non-game workspace with the shared workbench

**What to build:** Users can create and reopen a non-game workspace, converse with the agent, edit workspace files, and use the general-purpose infinite canvas. Its tools follow the workspace manifest, and its canvas is not governed by game-design policies.

**Blocked by:** 02 — Select business tools consistently across agent consumers; 03 — Create and reopen workspaces with a versioned module manifest.

Status: claimed

- [ ] Provide a usable creation and navigation flow for a non-game workspace with persisted module selection and clear domain-neutral labels.
- [ ] Pi conversations and ordinary file operations work in that workspace with the existing workspace isolation and context behavior.
- [ ] Connect workspace manifest selection to the host-contributed catalogs and execution checks for Pi, supported coding agents, and external MCP.
- [ ] General-purpose boards, documents, tables, assets, semantic content, and layout retain the existing persistence structure and save/reopen behavior.
- [ ] Game-specific main-document requirements, board restrictions, and agent instructions are supplied by business policy and do not apply to the generic workspace.
- [ ] OhMyGame retains its existing game and asset-canvas policies where applicable, including legacy-project behavior.
- [ ] Preserve current canvas schema validation, concurrent-edit conflict handling, and user drafts when validation fails.
- [ ] Extend daemon workspace/canvas and renderer integration coverage for the complete non-game flow and existing game policy cases; add new UI text in both locales and keep agent instructions in English.
- [ ] Run focused tests and type checking, exercise the affected browser flow, and record Electron validation performed or still required.

**Context:** Keep game preview, story runtime, publishing, and cloud service extraction in their own tickets. A working non-game workspace at this stage does not imply a game-free build. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
