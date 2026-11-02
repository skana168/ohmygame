# 06: Make game playtesting and engine integrations optional

**What to build:** Game applications retain their existing playtesting and engine integrations, while applications without those capabilities do not create game drivers or windows or expose game-only controls. Reusable application preview infrastructure remains available independently.

**Blocked by:** 02 — Select business tools consistently across agent consumers; 03 — Create and reopen workspaces with a versioned module manifest.

Status: claimed

- [x] Associate game target resolution, driver construction, session ownership, and game-window lifecycle with the enabled game capability.
- [x] Enabled game workspaces preserve the existing game-use tool behavior and actual supported preview/engine integrations, including their environment and capability checks.
- [x] Disabled game capabilities cannot start game drivers or windows through direct daemon or desktop entry points, and do not expose game-only preview/playtest controls.
- [x] Engine-specific plugin contributions and instructions follow compatibility and selection without forcing engine packages or workflows on a non-game application.
- [x] Preserve reusable web preview startup, proxying, and shutdown behavior for applications that select it independently of game playtesting.
- [x] Closing workspaces, conversations, or the application cleans up owned drivers and preview resources as before.
- [x] Extend existing preview, game-use, playtest-driver, and plugin integration coverage for enabled, disabled, unsupported-environment, and cleanup cases; do not claim new engine implementations.
- [x] Run focused tests and type checking, exercise the relevant Electron/browser flows, and document supported capabilities and any remaining manual engine checks.

**Context:** App-wide resource preparation and final build exclusion are consolidated in ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Comments

- 2026-11-02: Recovered the prior uncommitted implementation with `git apply --check`
  followed by `git apply`; required base `5be4b4ed` confirmed as an ancestor.
  Implementation and automated criteria verified; remains claimed for merger.
  See [implementation report](../reports/06-isolate-game-preview-and-engines.md)
  for exact checks, red-green event correction, Electron failure, and remaining
  browser/engine manual validation. The final manual-validation criterion remains
  unchecked; no new engine implementation or full-build exclusion is claimed.

## Integration result

Merged at `7a6dbf9804aa29f1ca586437ad58bc9c2831dd32` after ticket04, with
shared workspace policy and a red-green reusable preview navigation correction.
34 suites / 658 tests passed; full pre-navigation-fix run passed 4312 tests
(41 skipped), then six affected suites / 189 tests passed. Final typecheck,
lint and renderer build passed; Node runtime passed after preparing plugins.
Browser non-game preview flow exercised. Electron fractional resize failure
reproduces with baseline player code; later smoke assertions and actual desktop
capability UI flow remain unverified. Status stays claimed and final acceptance
item stays unchecked. See report for precise run order and retained evidence.


## Desktop acceptance completion (2026-11-02)

The focused actual Electron application/daemon/preload flow passed on Electron
43.3.0, including non-game iframe usability, absent game controls, direct IPC
rejection without windows, real enabled game player and agent driver, workspace
owner cleanup and application shutdown. Supplemental desktop canvas title and
Markdown editing/reopen passed with API-created two-board fixtures. See the
[report](../reports/06-isolate-game-preview-and-engines.md#focused-desktop-acceptance-completion-2026-11-02)
for commands, screenshots and limits. The original native resize smoke remains
unchanged and its baseline failure is not represented as passing. Final criterion
is now evidenced; status remains claimed for root merger.
