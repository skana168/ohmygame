# 05: Register and persist a custom non-game canvas node

**What to build:** A source-registered business module contributes a custom node type, its data schema, its renderer, and a companion tool. Users can interact with the node and reopen their workspace without losing its content.

**Blocked by:** 04 — Create and use a non-game workspace with the shared workbench.

Status: resolved

- [x] Provide a module contribution interface for node identity, data validation, and compiled renderer components alongside the existing general-purpose nodes.
- [x] Extend the minimal non-game module with one demonstrable custom node and a tool that operates on its persisted domain data, using the established tool boundary.
- [x] Users can add or otherwise create the example node, render and edit it, save it, and reopen it with stable identity and preserved content.
- [x] Agent edits and companion-tool output are validated against the registered node contract and become visible through the normal canvas workflow.
- [x] Invalid custom-node data produces an actionable diagnostic without silently discarding existing saved content or unrelated nodes.
- [x] Disabling or removing the node module produces a clear missing-module or unknown-node diagnostic and preserves its data; restoring the module allows the existing node to render again.
- [x] Existing node validation, rendering, persistence, and concurrent-edit behavior remain compatible.
- [x] Extend existing canvas API and renderer tests for validation, tool interaction, save/reload, missing/restored modules, and unchanged general-purpose nodes.
- [x] Document how the example contributes its node and tool; verify the relevant browser flow, translated UI text, and English agent instructions, and record focused checks and Electron validation needs.

**Context:** Renderer contributions compile with the application; dynamic JavaScript loading and a second full domain product are outside scope. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation handoff

Implemented and verified in the isolated custom-node worktree. Status remains
claimed for the root merger. Evidence, public checks, browser flow, and Electron
limits are recorded in [the implementation report](../reports/05-register-custom-canvas-nodes.md).

## Answer

Merged `t3/register-custom-canvas-nodes` at `87409523cf39f2bcf1568a599ee8212f97b04659`
from `/Users/yoyun/.t3/worktrees/ohmygame/t3-fbcf8cfa` into
`refactor/ohmytemplate-integration` with conflict-free merge
`4eda859f760561a9049792fc630c05d931d1198a`.

Reviewed identity/schema/compiled renderer contributions, public companion-tool
persistence and workspace selection, edit/save/reopen, invalid-data diagnostics,
missing/restored modules, and unchanged core draft/conflict paths. New domain
nodes use registrations rather than per-domain core union/switch edits.
Fresh affected canvas API, renderer, tool, migration, storage, draft and conflict
checks: 13 suites / 246 tests passed; Bun 1.4.2 typecheck passed. Additional
byte-preservation assertions committed as `bc205e806503f13ad09b05a64baeb9ea147b234a`;
the final game-design suite passed 65 tests. `git diff --check` passed.

Original browser interaction evidence and worker full-public-check results remain
in the report; neither was rerun by the merger. Screenshot capture and Electron
custom-node editing/save/reopen remain unverified as documented. These are
recorded validation needs, not claimed passing manual checks. Ticket 05 criteria
are met; ticket 07 remains under its current owner and ticket 10 awaits 07.
