# 12: Export a standalone buildable workbench template

**What to build:** Developers receive an independent template directory containing the shared workbench and minimal non-game module. It installs, builds, and starts outside the OhMyGame checkout with its own identity and no excluded game or private-cloud dependencies.

**Blocked by:** 10 — Compose complete applications and retire legacy business assembly; 11 — Configure independent application identity and data storage.

Status: claimed

- [ ] Produce a clean standalone template directory with the selected core, compiled non-game example, dependency/build configuration, and required licensed resources/notices.
- [ ] Exclude game-only modules and resource preparation, local credentials, application data, generated caches, source-repository metadata, and environment-specific state.
- [ ] Template installation and build do not require the source checkout, parent workspace paths, local symlinks into OhMyGame, private cloud repositories, or OhMyGame accounts.
- [ ] The exported application uses the configurable identity and data mechanism from ticket 11 and can coexist with OhMyGame.
- [ ] In an independent temporary location, install dependencies, run applicable type/build checks, and start the daemon and browser development workflow using only exported files.
- [ ] Verify an exported workspace can use conversations with a deterministic fixture or configured provider, file operations, general-purpose canvas, example tool/node save-reload, and provider/media configuration without game modules.
- [ ] Exercise Electron startup for the exported application, or explicitly record an environment limitation and the outstanding manual validation; do not call the complete template verified while that validation remains outstanding.
- [ ] Include usable baseline setup and extension guidance, keeping English and Chinese README content aligned; ticket 13 adds the final initialization walkthrough.
- [ ] Run relevant source-application regressions and export/startup checks; record commands, outcomes, and remaining provider/platform validation needs.

**Context:** The template initially supports new workspaces and does not promise historical OhMyGame project import. A published npm CLI and a full OhMyApp product are outside scope. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
