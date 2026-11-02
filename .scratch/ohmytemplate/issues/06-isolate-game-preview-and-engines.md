# 06: Make game playtesting and engine integrations optional

**What to build:** Game applications retain their existing playtesting and engine integrations, while applications without those capabilities do not create game drivers or windows or expose game-only controls. Reusable application preview infrastructure remains available independently.

**Blocked by:** 02 — Select business tools consistently across agent consumers; 03 — Create and reopen workspaces with a versioned module manifest.

Status: ready-for-agent

- [ ] Associate game target resolution, driver construction, session ownership, and game-window lifecycle with the enabled game capability.
- [ ] Enabled game workspaces preserve the existing game-use tool behavior and actual supported preview/engine integrations, including their environment and capability checks.
- [ ] Disabled game capabilities cannot start game drivers or windows through direct daemon or desktop entry points, and do not expose game-only preview/playtest controls.
- [ ] Engine-specific plugin contributions and instructions follow compatibility and selection without forcing engine packages or workflows on a non-game application.
- [ ] Preserve reusable web preview startup, proxying, and shutdown behavior for applications that select it independently of game playtesting.
- [ ] Closing workspaces, conversations, or the application cleans up owned drivers and preview resources as before.
- [ ] Extend existing preview, game-use, playtest-driver, and plugin integration coverage for enabled, disabled, unsupported-environment, and cleanup cases; do not claim new engine implementations.
- [ ] Run focused tests and type checking, exercise the relevant Electron/browser flows, and document supported capabilities and any remaining manual engine checks.

**Context:** App-wide resource preparation and final build exclusion are consolidated in ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
