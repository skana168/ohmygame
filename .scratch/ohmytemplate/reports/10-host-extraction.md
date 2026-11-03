Current root integration status: ticket 10 is resolved after the combined
all-target physical-absence proof. See the [final root report](10-compose-independent-applications.md)
and the final integration section below. Earlier incomplete statements are
historical subslice checkpoints; template export/initialization remains pending.

# Ticket 10 host subslice

Only the host subslice is complete. This report does not resolve ticket 10 or
claim full application source exclusion. Renderer and desktop belong to the
concurrent targets.

## Recovery and scope

Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-0470e7fe`.
Branch: `t3/host-source-boundaries`.
Verified `3fd26989` is an ancestor. Merged assigned previous committed head
`52ca66de673ec42c90139bf319d1ebe15c8b3399` (including `ba371b5d` and earlier
progress), then successfully ran `git apply --check` and applied
`/tmp/ohmytemplate-recovery-10-host/working.patch`. The original worktree and
recovery files are preserved. The recovery patch adds scene-template resources
to the strict excluded set; no exclusion was relaxed.

Inherited implementation was inspected and exercised, rather than assumed
complete after its provider quota ended. Its source-selected `non-game-host`
exports an absent optional provider; it does not supply dummy game functions.
Core agent tools, workspace/project handling, examples, archives, routes and
server startup consume the optional application provider. OhMyGame retains the
real provider and story route/tool implementations. No new renderer, desktop,
Vite, main ticket/report, execution-state, locale or lockfile edits were authored in
this retry (historical and latest integration changes arrived through merges).

## Retry changes

- Defined structural service contracts in `host-business-contract.ts`, removing
  the remaining type dependency from the non-game provider to `ohmygame-host`.
  Cloud provider consumers and community route composition use these contracts;
  the default implementation is checked against them without casts, suppressed
  diagnostics, or disabled required imports.
- Added selected-host TypeScript checking before non-game compilation, using
  the same optional-provider source resolution as the build. Every transitive
  type input is also checked against the strict exclusion list. Ordinary
  required imports still use TypeScript resolution.
- Extended the physically unavailable-source fixture to include its genuine
  TypeScript config and identity declaration. It builds a fresh output tree;
  no old game `dist` output or story resources are copied in.
- Extended the compiled authenticated Node runtime exercise with core workspace
  file reads, traversal rejection, unavailable-module manifest rejection, and
  schema-invalid custom-node invocation that preserves the board and revision.
  Existing game checks remain unchanged and run in their original default mode.

The red/green sequence exposed the former implementation-derived contract and
then missing fixture config/identity declarations. These were fixed with real
contracts and fixture inputs. No test was deleted, skipped, or weakened.

## Fresh evidence

Environment: Bun 1.4.2 with
`PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH`; Node 24.20.0, macOS arm64.
`bun install --frozen-lockfile` passed; lockfile unchanged.

`node scripts/test-non-game-host.mjs` passed. Log:
`/tmp/ohmytemplate-host-unavailable-merged.log`.
Fresh fixture:
`/var/folders/cd/4754c7cd73g1twx1yj5hgql40000gn/T/ohmytemplate-host-unavailable-u7i35Y`.
Its `evidence/unavailable-sources.json` enumerates all 113 physically absent
business implementation/resource files. The excluded set includes game,
playtest, playable and story implementations, story-web, both story/scene
resource template trees, publishing implementations, account cloud models,
OhMyGame host assembly, and the specified renderer account/business sources.
Shared persisted/protocol contracts remain available.

In that fixture:

- Full server source audit: 239 inputs, no excluded implementation.
- Selected host TypeScript check: 252 source files, no excluded type input.
- Compiled host: 241 source inputs including extension-host and managed-daemon
  process entry points; no story resources prepared.
- Real compiled Node daemon: unauthenticated request rejected; authenticated
  health/projects API works. Default general/example workspace creation,
  capability absence, workspace instructions/file access, traversal and manifest
  validation, custom-node save/reload, external MCP example tools and schema
  rejection, forbidden game invocation, archive export/import, native MCP,
  extension host execution, independent application identity/data directory,
  process restart/custom-node persistence and graceful shutdown all passed.

Default OhMyGame checks before the final renderer integration merge:

- Pinned plugin preparation, changelog check, full typecheck and lint passed.
- Full original suite: 352 files passed, 3 skipped; 4,345 tests passed,
  41 skipped. Log: `/tmp/ohmytemplate-host-default-tests.log`.
- `bun run test:node-runtime` passed, including default host build, real story
  creation/upgrade/preview, archives, native MCP, extension hosts and independent
  restart. Log: `/tmp/ohmytemplate-host-default-node.log`.
- New supported files formatted; `git diff --check` passed.

Existing private-cloud/platform fixture skips remain. Selected non-game runtime
uses non-game assertions instead of requiring intentionally disabled story
features; the original game suite and Node story assertions still pass. No
selected full-suite pass is claimed: many existing tests intentionally assume
the default OhMyGame application. The actual selected compiled runtime checks
exercise relevant retained core behavior.

## Integration and exact remaining gaps

Merged latest `refactor/ohmytemplate-integration` before final reporting, through
`ad0d38f45b71d7fb042e17e0a6a243564fd80824`. The renderer merge had one documentation
conflict; both host and renderer guidance were retained, and obsolete statements
about the host typecheck were corrected. Retry checkpoints: `f700e963`
(independent contracts and selected typechecking), `7c8f3b73` (stronger compiled
runtime checks), followed by integration and report/audit checkpoints.

The audit now selects the merged renderer's real `core-contributions` provider,
matching Vite, and excludes its newly isolated business/account entry files too.
`node scripts/check-application-sources.mjs --non-game` passes host (239 inputs)
and renderer (287 inputs), but still fails desktop: `playtest-driver`,
`game-recorder`, and `web-game-player` remain required by desktop main. Log:
`/tmp/ohmytemplate-host-all-target-final.log`. Target-specific checking does not
weaken final all-target acceptance. Root must merge all targets and rerun the
combined unavailable-source build/startup acceptance before closing ticket 10.

The selected host unavailable-source fixture was rerun after this merge with the
expanded 113-file exclusion list. Final affected verification passed: 147 tests in the
renderer composition, daemon app and agent-tool suites, full typecheck/lint and
default renderer build (with its existing large-chunk warning). Their logs are `/tmp/ohmytemplate-host-after-merge.log`
and `/tmp/ohmytemplate-host-default-renderer-merged.log`. The pre-merge complete
default suite is recorded above; no post-merge complete-suite rerun is claimed.

This subslice verifies compiled host execution; source-watch development,
selected renderer/Electron startup and custom-node visual interaction, exported
application initialization/packaging, live paid providers, private cloud,
signing and other operating systems are not established here. No browser or
Electron visual claim is made by this host report.


## Final combined root integration (2026-11-03)

Host merge `dc53a0cc` and integration fix/test `7729fee5` combine this subslice
with real Host, Renderer and Desktop contributions. The combined 117-path
physical-absence fixture passes all-target source/type audits, preparation,
fresh host/core-desktop/Vite builds, authenticated compiled Node runtime and
actual selected Electron creation/custom-node edit/reload/full process restart/
shutdown. Tuning returns the retained 404 through true omitted route registration.
See [the final root report](10-compose-independent-applications.md) and
[exact exclusions](10-excluded-sources.json) for commands, counts, logs and limits.
Earlier subslice-only and 409-blocker statements are historical checkpoints.
The native fractional resize baseline remains nonpassing and unchanged; export/
initialization, standalone browser/source-watch and platform/provider/private-
service verification remain required before full template delivery.
