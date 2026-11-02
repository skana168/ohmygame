# 10: Compose complete applications and retire legacy business assembly

**What to build:** Developers can select a coherent OhMyGame or non-game application composition that governs the daemon, renderer, desktop integration, plugins, shipped instructions, resource preparation, and build inputs. The non-game composition builds and starts without excluded game modules.

**Blocked by:** 05 — Register and persist a custom non-game canvas node; 06 — Make game playtesting and engine integrations optional; 07 — Make interactive stories an optional business module; 08 — Make game publishing and community optional; 09 — Run the workbench with user-configured model and media providers.

Status: ready-for-agent

- [ ] Supply explicit OhMyGame and non-game compositions using the module boundaries established by the preceding tickets, including the example non-game node and tool.
- [ ] Navigation, project creation options, daemon/desktop services, plugin compatibility, and agent instructions agree on the selected application capabilities.
- [ ] Non-game resource preparation does not fetch or build excluded game examples, engine packages, story runtimes, or other game-only resources.
- [ ] The non-game build does not import required implementations or resources from excluded game modules; validate by building and starting with those modules unavailable, not merely hidden at runtime.
- [ ] Retain reusable previews, plugin hosting, general-purpose canvas, provider configuration, and media operations required by the selected composition.
- [ ] Migrate remaining consumers from legacy project-type/tool/business switches, then remove obsolete assembly only after no consumer requires it. Keep supported OhMyGame persisted-project compatibility.
- [ ] Run composition-level daemon, tool, renderer, and startup regression coverage for both applications, including missing-module diagnostics and data preservation.
- [ ] Complete required public checks for the integrated change and exercise affected browser and Electron flows; record unavailable platform/private-service checks and remaining risks.
- [ ] Update existing architecture/setup guidance and both UI locales without unrelated directory or formatting cleanup.

**Context:** This is the contract/cleanup step after additive module extraction, not permission to replace the preceding slices with one broad rewrite. Application identity is independently delivered by ticket 11, then combined during template export. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Comments

Ticket 07 merged and resolved; all blocking tickets are resolved. Ready for root scheduling.
The ticket 07 merger has not claimed or started this ticket.
