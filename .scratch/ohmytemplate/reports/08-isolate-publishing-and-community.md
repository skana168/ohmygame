# Ticket 08 implementation report

Status: resolved after serial integration.

## Scope and composition

- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-bde12462`.
- Branch: `t3/isolate-publishing-community`.
- Verified `5be4b4ed` is an ancestor before editing.
- Merged integration through `e83e93a9b8426ba84bb75a265243adc31fa5bdf6`, including tickets 04, 06, and 09. Import conflicts retained both capability selections and concurrent workspace/preview policy changes. No authored changes to other tickets, the map, or execution-state files; their integration changes are preserved by the merges.
- Source-owned `publishingEnabled` and `communityEnabled` defaults in `src/shared/application-services.ts` remain true for OhMyGame. Daemon embeddings can override them through `createApp({ publishing, community })`. Renderer defaults and daemon settings must agree in application assembly.
- Uses ticket 09's existing `accountServices` option and `accountServicesEnabled`; no second account toggle or provider isolation implementation.
- Both business services disabled: no local/remote publisher construction, no community routes, explicit 404 rejection of direct publish calls before builds or metadata writes. Either capability can be selected independently.
- Renderer gates sidebar, account-menu, Home, command-menu and publication-detail community links; community deep links show Home. Publishing gates dialog mounting, conversation commands, pending sign-in resume, and publish menu action. The web-build export menu remains available using existing translated labels.
- Saved publication metadata is retained; no migration/deletion is introduced. Local library assets and editable project export/import remain independent. Source/resource exclusion remains ticket 10's responsibility.
- No new UI strings; existing en/zh-CN entries are reused. No agent instruction changes.

## Evidence

TDD used the approved public daemon API and complementary renderer/startup seams. The first disabled-community request failed with 502 (outbound service attempt) before implementation, then passed with 404. Disabled dialog and command-menu tests also failed before their guards were added, then passed. Existing fixtures exercise enabled client behavior and saved game/deployment IDs without the private cloud service.

Focused suites cover daemon rejection, saved deployment metadata at disabled startup and after rejected publishing, independent community selection, library asset materialization with capabilities on/off, archive export/import with account/publishing/community all disabled, publish dialog suppression, command-menu suppression, and community deep-link fallback. Existing publishing-client assertions now check exact saved game/deployment request paths.

Dependencies installed with `bun install --frozen-lockfile` using Bun 1.4.2 from `/tmp/ohmytemplate-tools/node_modules/.bin`; lockfile unchanged.

## Manual browser flow

Used an isolated daemon data directory `/tmp/ohmytemplate08-browser` and Pi directory `/tmp/ohmytemplate08-browser-pi`, with all three source-owned service flags temporarily false. Completed onboarding by skipping AI setup, reached Home with Home/Projects/Library/Plugins/Settings and no Community navigation, opened a saved community URL and observed Home, created `Ticket 08 local workspace`, and opened its export menu. It contained only `Export web build`, with no publishing action. Default source flags were restored to true afterward. Browser tab and both development processes were closed.

Screenshot capture failed twice with `Preview automation snapshot timed out after 15000ms`; browser DOM evaluation remained available and supplied the observations above. No screenshot artifact is claimed. The final command-menu guard was verified by its renderer regression test after this browser flow.

## Verification and gaps

The required public sequence passed after the first integration merge: plugin preparation, changelog, typecheck, lint, full tests (352 files passed, 3 skipped; 4,307 tests passed, 41 skipped), renderer build, and Node runtime check. Node 24.20.0 exercised authenticated daemon startup, preview, project export/import and independent application restart.

Final verification after merging integration through `e83e93a9`:

- `bun run prepare:preinstalled-plugins`: passed.
- `bun run changelog:check`: passed.
- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `bun run test`: passed; 352 files passed, 3 skipped; 4,320 tests passed, 41 skipped.
- `bun run build:renderer`: passed.
- `bun run test:node-runtime`: passed.
- Focused final daemon/archive/client/dialog/route/command-menu run: 6 files and 194 tests passed, including the subsequently strengthened disabled asset and archive fixtures.
- `git diff --check`: passed.

Logs are under `/tmp/ticket08-merged-*.log` in this environment. The extra final fixture changes affect tests only and were covered by the focused run; the full-suite count above precedes the additional enabled/disabled asset parameterization.

Private `ohmygame-cloud` contract cases in `test/publish.test.ts` are unavailable/skipped in this public checkout; hosted publishing, real OAuth, remote deployment/listing and staging remain unverified. Public local/client fixtures are not hosted-service verification. Electron native-window flow was not exercised; browser smoke and Node runtime checks do not establish desktop UI behavior. Windows/Linux manual flows were not exercised on this macOS host. No model credentials or real provider calls were used. Existing happy-dom tests emit localhost:3000 connection diagnostics while passing; these do not represent cloud verification.

## Serial merger verification

- Shared root: `/Users/yoyun/ohmygame`, branch `refactor/ohmytemplate-integration`.
- Implementation branch: `t3/isolate-publishing-community`; SHA `ff8cf6cae14bdc6fd2c2d23d05d93366769d2aee`; worktree `/Users/yoyun/.t3/worktrees/ohmygame/t3-bde12462`.
- Conflict-free conventional merge: `c1885b30c9180fd1a0c71ad283dc2b7bf5773391`. No integration edits needed; merged 04/06/09/11 composition and defaults retained.
- Inspected constructor suppression when both services are disabled, independent route selection, direct publish rejection before build/metadata writes, and matching source-owned renderer guards. Defaults remain enabled; archive/local asset fixtures and saved deployment metadata pass.
- Fresh exact command with `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH` (Bun 1.4.2): `bun run test -- test/publish.test.ts test/publish-client.test.ts test/publish-dialog.test.tsx test/app.test.ts test/project-archive.test.ts test/renderer-routes.test.ts test/command-menu.test.tsx`: 6 files passed, 1 skipped; 194 tests passed, 23 skipped. Log: `/tmp/ticket08-root-tests.log`.
- Same PATH: `bun run typecheck`: passed; log `/tmp/ticket08-root-typecheck.log`. `git diff --check`: passed.
- Full suite/build/lint/plugin/Node checks and browser observations above are inherited implementation evidence, not fresh merger runs. No full rerun solely for elapsed time. No browser/Electron session was run by the merger; private-cloud contract and hosted/staging/OAuth/deployment verification remain unavailable, and native UI/other-platform/live-provider gaps remain as stated above.
- Ticket 08 resolved. Tickets 05/06 validation status and ticket 07 scheduling were not changed. All worktrees and untracked `.codegraph/` retained; no push or PR.
