# 07: Make interactive stories an optional business module

**What to build:** Existing story users keep their editor and playable runtime, while non-story applications omit story-specific editing, runtime startup, instructions, and resources through explicit business-module composition.

**Blocked by:** 04 — Create and use a non-game workspace with the shared workbench.

Status: resolved

- [x] Story editing, playable graph handling, runtime startup, templates, and related instructions are owned by an explicit story business capability.
- [x] With the module enabled, existing story projects open, edit, validate, and run with their prior behavior and persisted content intact.
- [x] With it disabled, story-only screens and execution operations are unavailable, and direct host entry points cannot bypass module selection.
- [x] Story-only tools remain absent from disabled-workspace catalogs through the existing shared tool-selection boundary.
- [x] Opening data that requires an unavailable story module yields a diagnostic without deleting or converting its saved content.
- [x] General-purpose documents, tables, canvas, and media capabilities remain usable without story runtime dependencies at their business boundaries.
- [x] Extend existing playable graph/runtime, story-project, tool-selection, and renderer coverage for enabled, disabled, legacy-project, and missing-module cases.
- [x] Update relevant user and agent guidance, preserve both UI locales, and record focused checks plus manual story editor/playback validation.

**Context:** Preserve existing behavior rather than redesigning the story model. Final application build/resource exclusion is ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation handoff

Implementation merged and reviewed. See [implementation report](../reports/07-isolate-interactive-stories.md) for checks and outstanding manual/platform verification. Full application resource exclusion remains ticket 10.

## Answer

Merged `t3/isolate-interactive-stories-1` at `38cc1b6942116268bc0bd5c11056d1d2c32b0973`
with conflict-free merge `046168bfa471edf95b2ef7d6389793e620f5c162`. No production integration corrections were needed.
Existing module/custom-node/preview/account/publishing composition remains intact.

Fresh merged-root checks with Bun 1.4.2: 52 affected story/playable/daemon/tool/renderer/canvas suites,
678 tests passed; typecheck and Node runtime checks passed. Supplemental regression
`02d5ad63102bf6fc695079ba0a202dd13ae515b4` extends the existing preset case to reopen a legacy story after daemon
shutdown, compare its complete saved codebase, load its runtime definition, validate it,
and confirm graph/Scene bytes remain unchanged; final app suite 123 tests and typecheck passed.

Disabled host/workspace/missing-module routes, editor fallback, runtime startup and tool
catalog/invocation guards are covered, alongside enabled legacy behavior and generic canvas/media
fixtures. See the [report](../reports/07-isolate-interactive-stories.md) for evidence and limits.
Inherited browser observations establish editor controls, runtime iframe startup and saved Scene
reload only. Visual/audio playback, Electron story interaction, other platforms, real providers
and private-cloud contracts remain unverified; no such success is claimed. Deterministic runtime
behavior and persisted daemon reopen provide the complementary functional evidence for this slice.
Full exclusion of story imports/resources remains ticket 10, now ready and unclaimed by this merger.
