# Ticket 04 implementation report

Status: claimed; implementation ready for merger review. Electron acceptance remains open.

## Checkout and commits

- Branch: `t3/open-non-game-workspaces`
- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-11cc4fcd`
- Implementation: `e0b044ced482f1b2fc4ec32df177a728a32bb3e3`
- Verified `50ac4e25` ancestry before editing; initial tracked tree was clean and no `.codegraph/` directory existed.
- After implementation, ran `git merge refactor/ohmytemplate-integration`: already up to date at `50ac4e255db8f4a254d37cd30426060454d4e92a`. Repeated type checking and the 15 affected suites afterwards.
- No checkout/worktree setup, subagents, push, PR, watch, destructive cleanup or edits to other tickets/execution state.

## Delivered behavior

The creation dialog offers **Workspace**, separately from General Game. It creates a `general` workspace with an explicit empty module manifest, a neutral default name, and Web preview initially disabled. It reopens with Chat, Canvas, Code and Assets. Game design navigation and composer game-design references are unavailable. Both locales include the new labels, and the shared table hint now says editable data.

`workspaceHasModule` and `canvasPolicy` centralize manifest selection and the existing legacy fallback. Invalid declarations fail closed for business tools. The shared Pi/coding-agent tool factory filters built-in and source-contributed module tools; host business flags remain an upper bound for built-ins. External MCP filters both bound catalogs and invocation. Its stdio launcher refreshes the bound catalog instead of returning cached application schemas, including after daemon restart and explicit workspace switching. Unbound discovery retains the application catalog and the launcher still avoids starting the app merely for initial discovery. Trusted application contributions must not deliberately re-register disabled built-in tools under another owner.

Generic canvases use multiple boards and ordinary reference documents without automatically selecting a main game document or offering its action. Agent prompts and canvas metadata use neutral guidance. Game-module workspaces retain main-document behavior and production-art guidance; Asset Canvas retains its single-board and document policies. Existing root/canvas instructions are preserved. Canvas schemas, file structure, revision checks, atomic writes and renderer draft handling remain on the existing paths. No cloud, publishing, story-runtime or preview implementation was extracted here; OhMyGame's other application actions remain present.

## Acceptance evidence

| Ticket criterion                             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creation, navigation and persisted selection | `project-create-dialog` selects Workspace and asserts the public request; `workspace-layout` asserts neutral panels and Canvas first. `game-design` creates via daemon API and restarts against the same persisted workspace. Browser creation/reopen passed.                                                                                                                                                               |
| Conversations and ordinary files             | Existing application-isolation conversation/restart test now uses an empty-module workspace with the scripted native session. File create/rename/delete/overwrite protection runs for both game and generic workspaces. Agent context-file scoping suites remain green. Pi tool definitions and coding-agent ToolBridge execute the selected example contribution; real provider-backed Pi conversation remains unverified. |
| Host catalogs and execution                  | `agent-tools` omits story tools and rejects direct bridge invocation while executing the selected example module. External MCP's four host-flag cases switch to an empty-module workspace, omit game/story/example/business tools, and reject their calls. Launcher test was observed red with cached schemas, then green with bound discovery and restart rebinding.                                                       |
| Persistence and semantic content             | Generic daemon flow saves/reopens two boards, a Markdown document, table, document/table/text nodes and editor dimensions; stale board writes return 409 and invalid document references return 404 without replacing saved content. Existing asset, table, layout, reference and generation suites remain green.                                                                                                           |
| Generic business policy                      | Red generic document test first exposed automatic main selection. It now asserts no main document, HTTP 409 on the game-main action, neutral canvas instructions and restart retention. Neutral prompt and navigation tests were also observed red before implementation.                                                                                                                                                   |
| Game and Asset Canvas compatibility          | Existing game-design, context, agent tool, legacy loading and full-suite regressions pass. Asset Canvas reference-document behavior is retained; game prompts retain main-document and production-asset guidance.                                                                                                                                                                                                           |
| Validation, conflicts and drafts             | Generic API assertions cover stale revisions and rejected references. Existing canvas board storage, close/save and document/table tests remain intact and pass; no draft/conflict algorithm was replaced.                                                                                                                                                                                                                  |
| Documentation and locales                    | Updated workspace manifest, canvas, coding-agent and external-agent guides. English and Chinese UI changes are paired; shipped agent guidance is English.                                                                                                                                                                                                                                                                   |
| Manual validation                            | Browser flow below passed. Electron UI, real providers/CLIs and private cloud remain unverified. Final ticket checkbox remains open.                                                                                                                                                                                                                                                                                        |

## Verification

Used Bun 1.4.2 through `/tmp/ohmytemplate-tools/node_modules/.bin`.
`bun install --frozen-lockfile` succeeded and `bun.lock` is unchanged.

- `bun run prepare:preinstalled-plugins`: passed, one prepared plugin.
- `bun run changelog:check`: passed.
- `bun run typecheck`: passed, repeated after the integration merge check.
- `bun run lint`: passed on the final implementation.
- `bun run test`: **352 files passed, 3 skipped; 4,267 tests passed, 41 skipped**. Skips are not claimed as executed; private publishing/cloud infrastructure remains unverified.
- `bun run build:renderer`: passed on final implementation, existing chunk-size warning.
- `bun run test:node-runtime`: passed on Node 24.20.0, including authenticated daemon startup, stories, preview, archive import/export, native MCP, extension hosts, configured independent application restart and shutdown.
- After integration merge check: **15 files / 388 tests passed**, no skips: `agent-tools`, `external-mcp`, `external-mcp-launcher`, `agent-prompts`, `game-design-context`, `game-design`, `workspace-layout`, `project-create-dialog`, `app`, `workspace-files-api`, `canvas-board-storage`, `canvas-close-save`, `agent-context-files`, `agent-runtime-session`, `agent-runtime-drivers`.
- New `workspace-policy.ts`: repository Prettier formatting applied. `git diff --check`: passed.

## Browser flow and remaining gaps

Ran this worktree's renderer on port 43424 and daemon on 43110, with isolated data at `/tmp/ohmytemplate-04-manual-data` and Pi settings at `/tmp/ohmytemplate-04-manual-pi`. Port 43220 was occupied, so that renderer was not used for validation. Skipped model onboarding, selected Workspace in the new-project dialog, created the neutral workspace, created a second board named Research, added a document, edited its Markdown, switched to Code and reopened the workspace in a fresh tab. The saved Markdown rendered after reopening; a read-only API inspection confirmed both boards, the document content and no main-document selection. No sign-in or model credential was needed for those flows.

Preview automation intermittently timed out while selecting/editing document controls. The alternate computer-use browser host reported unavailable. Subsequent preview interaction successfully edited Markdown and the reopen/read confirmed persistence. Document-title editing was not successfully performed. Screenshots show the neutral navigation, Code view and reopened saved Markdown:

- [Code view](04-open-non-game-workspaces-code.png)
- [Reopened canvas](04-open-non-game-workspaces-canvas.png)

No Electron UI run was performed: this frozen installation has no `node_modules/electron/dist/Electron.app` binary. Node runtime smoke checks do not substitute for Electron UI validation. Complete the affected creation, multi-board editing and reopen flow in Electron before closing the remaining acceptance item. No live language-model/media-provider request, installed third-party coding CLI session or private hosted-cloud validation was performed. Simulated session/bridge fixtures and the existing public suites provide the recorded automated evidence. Temporary data was preserved; owned browser tabs and development processes were closed.

## Recovery verification (2026-11-02)

- Current branch: `t3/open-non-game-workspaces-1`; current worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-8f4cbf6a`.
- Confirmed `5be4b4ed355f2a6b43c21cb2dab8d54aa29de6c1` is an ancestor before edits. No `.codegraph/` directory is present.
- Read this recovered report from the patch before applying it. `git apply --check /tmp/ohmytemplate-recovery-04/working.patch` passed, then applied that patch successfully. Original worktree remains intact.
- Reviewed inherited implementation and tests against ticket 04, the specification and ADR. Tracked source/test/docs match the prior implementation commit `e0b044ce`; the recovered untracked shared policy also matches that commit byte for byte. No further behavior changes were needed, so no new red-green cycle was required. The earlier red-green evidence above is inherited evidence.
- Fresh `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH bun install --frozen-lockfile` passed using Bun 1.4.2; `bun.lock` remains unchanged.
- Fresh `bun run typecheck` and `bun run lint` passed with that PATH.
- Fresh focused command passed: `bun run test -- test/agent-tools.test.ts test/external-mcp.test.ts test/external-mcp-launcher.test.ts test/agent-prompts.test.ts test/game-design-context.test.ts test/game-design.test.ts test/workspace-layout.test.ts test/project-create-dialog.test.tsx test/app.test.ts test/workspace-files-api.test.ts test/canvas-board-storage.test.ts test/canvas-close-save.test.ts test/agent-context-files.test.ts test/agent-runtime-session.test.ts test/agent-runtime-drivers.test.ts`: **15 files, 388 tests passed**, no skips. Test output included connection-refused diagnostics for localhost:3000, but all suites passed.
- `git diff --check` passed. Broad public checks were not repeated: the implementation is recovered unchanged and their final-implementation evidence remains recorded above.
- Inspected both recovered screenshots. They retain the prior browser run's actual evidence; no new browser run is claimed. Canvas screenshot SHA-256: `966ec7136473ca55de2b3b0f0db9cf15dfea063c89a32f6f408550d5037196a3`; Code screenshot: `3cce4258df8d12a810b6c4a988fd06e9700b688fd56862747c1b91c756d09371`.
- Confirmed `node_modules/electron/dist/Electron.app` is still absent. Electron creation/multi-board/edit/reopen, real provider/CLI and private-cloud validation remain unverified as detailed above. Document-title browser editing remains unverified.
- Merged latest local `refactor/ohmytemplate-integration` tip `5be4b4ed355f2a6b43c21cb2dab8d54aa29de6c1`: already up to date, no composition conflicts. Preview06 and account/provider09 were not implemented or altered. No other tickets or execution-state were edited.
- Ticket remains claimed for merger review; remaining manual acceptance stays open. This recovery commit contains implementation, tests, documentation, report and original screenshots.
