# Ticket 10 implementation progress

Status: claimed, incomplete; pending implementation and merger. No acceptance
checkboxes are changed by this progress report.

Prepared worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-16786657`.
Branch: `t3/compose-independent-applications`.
Confirmed `21dbedbd` is an ancestor before editing. No additional checkout,
worktree, subagent, push, PR, or cleanup was created/performed.

## First vertical slice

Added explicit `ohmygame` and `non-game` source composition definitions with a
validated source-owned selection in `config/application-composition.json`.
Default remains OhMyGame. Daemon composition selects available workspace
modules, business tool gates and account/publishing/community services together.
The non-game selection registers the shipped example tools and module, creates
general workspaces with that module by default, and writes its English guidance.
Renderer creation entry points and type choices use the selected defaults.
Embedded daemon options remain available for existing callers and tests.

The public daemon regression first failed: `composition: "non-game"` still
created a `web-game` project with the game manifest. After implementation it
passes: general workspace, example manifest/guidance, disabled game/story,
account/community routes absent, available core project type, and reopened
manifest. Log evidence: `/tmp/ohmytemplate-10-{red,green}.log`.

Frozen install passed with Bun 1.4.2 and the user-supplied PATH; lock unchanged.
Initial typecheck passed before JSON selection/renderer default follow-up.
Further checks are recorded below as completed.

## Outstanding work (not acceptance evidence)

This slice does **not** establish complete application extraction. Core daemon,
renderer and desktop files still statically import game/story/publishing
implementations; host tsc includes the full source tree. Preparation/build scripts
still prepare game resources unconditionally. A deleted-source build/start test
has not passed. The composition object must not be represented as an independent
export/build until those imports and build inputs are migrated.

Remaining: actual source dependency extraction and obsolete assembly removal;
resource/build selection; complete dual-composition tool/provider/plugin/canvas
and persistence regressions; full public checks including lint and Node startup;
actual relevant browser/Electron flows. Prior reports' manual/provider/private
cloud/platform limitations remain unchanged. Tickets 12/13 are not implemented.
