# 07: Make interactive stories an optional business module

**What to build:** Existing story users keep their editor and playable runtime, while non-story applications omit story-specific editing, runtime startup, instructions, and resources through explicit business-module composition.

**Blocked by:** 04 — Create and use a non-game workspace with the shared workbench.

Status: claimed

- [ ] Story editing, playable graph handling, runtime startup, templates, and related instructions are owned by an explicit story business capability.
- [ ] With the module enabled, existing story projects open, edit, validate, and run with their prior behavior and persisted content intact.
- [ ] With it disabled, story-only screens and execution operations are unavailable, and direct host entry points cannot bypass module selection.
- [ ] Story-only tools remain absent from disabled-workspace catalogs through the existing shared tool-selection boundary.
- [ ] Opening data that requires an unavailable story module yields a diagnostic without deleting or converting its saved content.
- [ ] General-purpose documents, tables, canvas, and media capabilities remain usable without story runtime dependencies at their business boundaries.
- [ ] Extend existing playable graph/runtime, story-project, tool-selection, and renderer coverage for enabled, disabled, legacy-project, and missing-module cases.
- [ ] Update relevant user and agent guidance, preserve both UI locales, and record focused checks plus manual story editor/playback validation.

**Context:** Preserve existing behavior rather than redesigning the story model. Final application build/resource exclusion is ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
