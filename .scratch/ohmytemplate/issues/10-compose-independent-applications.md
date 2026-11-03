# 10: Compose complete applications and retire legacy business assembly

**What to build:** Developers can select a coherent OhMyGame or non-game application composition that governs the daemon, renderer, desktop integration, plugins, shipped instructions, resource preparation, and build inputs. The non-game composition builds and starts without excluded game modules.

**Blocked by:** 05 — Register and persist a custom non-game canvas node; 06 — Make game playtesting and engine integrations optional; 07 — Make interactive stories an optional business module; 08 — Make game publishing and community optional; 09 — Run the workbench with user-configured model and media providers.

Status: resolved

- [x] Supply explicit OhMyGame and non-game compositions using the module boundaries established by the preceding tickets, including the example non-game node and tool.
- [x] Navigation, project creation options, daemon/desktop services, plugin compatibility, and agent instructions agree on the selected application capabilities.
- [x] Non-game resource preparation does not fetch or build excluded game examples, engine packages, story runtimes, or other game-only resources.
- [x] The non-game build does not import required implementations or resources from excluded game modules; validate by building and starting with those modules unavailable, not merely hidden at runtime.
- [x] Retain reusable previews, plugin hosting, general-purpose canvas, provider configuration, and media operations required by the selected composition.
- [x] Migrate remaining consumers from legacy project-type/tool/business switches, then remove obsolete assembly only after no consumer requires it. Keep supported OhMyGame persisted-project compatibility.
- [x] Run composition-level daemon, tool, renderer, and startup regression coverage for both applications, including missing-module diagnostics and data preservation.
- [x] Complete required public checks for the integrated change and exercise affected browser and Electron flows; record unavailable platform/private-service checks and remaining risks.
- [x] Update existing architecture/setup guidance and both UI locales without unrelated directory or formatting cleanup.

**Context:** This is the contract/cleanup step after additive module extraction, not permission to replace the preceding slices with one broad rewrite. Application identity is independently delivered by ticket 11, then combined during template export. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Comments

Ticket 07 merged and resolved; all blocking tickets are resolved. Ready for root scheduling.
The ticket 07 merger has not claimed or started this ticket.

## Answer

Resolved the source composition milestone after combining actual Host, Renderer
and Desktop extraction in one physical-absence fixture. Host head
`f7e81efb04c7397da4d0ab14f41c840f71096589` merged at
`dc53a0cc08da7e3deac5d11e2eed770572cee38c`; Renderer merge `2cfedfd3`, Desktop
merge `d1153eed` and shared foundation `ba371b5d` are preserved. Integration
fix/test `7729fee515bd6d1f9dd2337d8c2606e8d397fc6a` wires selected Desktop
emission, omits non-game tuning routes and extracts reusable plugin archive
preparation while retaining default compatibility.

`PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH node scripts/test-non-game-host.mjs --application`
passed with all [117 excluded paths](../reports/10-excluded-sources.json) physically
absent together: all-target source/type audits, selected preparation/builds,
authenticated compiled Node daemon/core tools/files/canvas/provider setup/plugins/
archives/MCP/restart and real selected Electron dialog/custom-node edit/reload/
full process restart/shutdown. Tuning remains asserted 404. Required default
public commands all passed, including lint: 353 passed files / 4354 passed tests,
41 retained skips; default Node and Electron capability smokes passed.

[Final report](../reports/10-compose-independent-applications.md) records exact
commands, exclusions, fixture/log paths, regressions and limits. The original
native fractional resize baseline remains nonpassing (549x309 expected,
667x375 observed), unchanged and not rerun. No full native game smoke is claimed.
Standalone source-watch/browser and generated-application validation remain
required in 12/13; engines/paid providers/private cloud/other platforms retain
explicit limits. Ticket 12 is ready but not started; full template delivery is
not claimed.
