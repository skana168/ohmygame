# Ticket 11 implementation evidence

Status: resolved — merged and persisted-history gap verified.

Branch: `t3/configure-application-identity`.
Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-3de9a0ab`.
Starting integration commit `cbe42c3d386f58778b37aef53104f2ece4f72ac4` was confirmed
as HEAD before editing. No `.codegraph/` exists. Merged integration through
`0abe9d5f334ec26e6da16cdf48658614e25effef` (including the changed dev tool/plugin
architecture); no separate worktree, initializer, or tool composition changes.

## Implementation and acceptance evidence

- `application.json` explicitly supplies display name, package name, desktop ID,
  and storage path. One validated loader is shared by daemon startup, Electron,
  Vite, and electron-builder. Unknown settings and missing/invalid fields fail
  with field-specific errors. Configuration is source-owned, not an environment
  rename layered on a differently named build.
- Vite supplies the browser title and renderer identity. Sidebar, onboarding,
  agent settings, and both languages' translated labels use that name. Renderer
  preference/draft/sign-in keys are namespaced by package name; default keys and
  default Supabase session storage stay compatible.
- Electron retains the existing default profile path before setting the display
  name. Independent desktop IDs select separate profiles. Configured storage is
  writable outside the app archive; desktop launches pass the selected data and
  Pi directories to the managed daemon. Explicit desktop data overrides now also
  isolate the default Pi credentials directory. Explicit `PI_CODING_AGENT_DIR`
  remains an intentional override.
- Defaults remain `OhMyGame`, `ohmygame`, `ai.ohmygame.desktop`, checkout `.data/`,
  and Electron's existing profile `data/` and `pi-agent/` directories.
- Packaging commands select `electron-builder.config.mjs`. Product name, app ID,
  packaged package metadata, artifact names, and shipped identity configuration
  follow the chosen identity. Local packaging omits the update feed when absent.
  Actual electron-builder config loading and schema validation succeeded without
  release/signing credentials. Source package metadata and the lockfile remain
  unchanged except for the three package command arguments.
- The public daemon API regression uses distinct configured temporary storage:
  projects, live conversations, and provider credentials are invisible to the
  other application; projects and credentials survive restart. The copied-build
  Node startup regression uses a separately named application and a relative
  configured directory, and verifies project/credential reload through HTTP.
- `docs/runtime.md` documents settings, validation, storage precedence and
  portability, compatibility, browser-origin limits, and local packaging.

## Red-green evidence

The first configuration-loading test failed because the identity entry point did
not exist, then passed after implementation. The packaging slice failed because
the configured builder entry point did not exist, then passed after wiring it.
Validation and independent/default storage cases extend that boundary. The
startup regression initially exposed missing prepared resources in its copied
fixture and macOS realpath normalization; both fixture defects were corrected.
The first full suite exposed the existing Electron boundary stub's missing
`setName`/`setPath`; all nine desktop-close cases passed after updating that stub.

## Checks

Commands use `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH` (Bun 1.4.2).

- Frozen dependency installation: passed; lockfile unchanged.
- Pinned plugin preparation: passed (one preinstalled plugin).
- Changelog check: passed.
- Type checking and lint: passed.
- Focused identity/API/packaging/preferences tests: passed (107 tests before the
  fourth identity case); final identity/i18n/desktop-close selection: 24 passed.
- Full suite before integrating other tickets: 352 files passed, three skipped;
  4,237 tests passed, 41 skipped. After merging the current integration code:
  352 files passed, three skipped; 4,240 tests passed, 41 skipped. The integrated
  Node runtime rerun also passed, including independent application restart.
- Renderer build: passed for defaults and the independent smoke identity; existing
  chunk-size warnings remain. Default artifacts rebuilt after smoke testing.
- Node runtime: passed, including copied independent application startup/restart.
- `git diff --check`: passed.

## Browser and Electron smoke checks

Temporarily configured `Identity Smoke` / `identity-smoke` /
`org.example.identity-smoke`, with isolated temporary data; restored default
configuration afterwards. Vite served on port 43220 and a standalone daemon on
43110. Browser title was `Identity Smoke`; the rendered heading was
`Welcome to Identity Smoke`; health/onboarding requests returned 200. See
[the browser capture](11-configure-application-identity-browser.png).
Initial browser requests preceded daemon startup and returned 502; reloading
once the daemon was ready produced the welcome screen above.

Built-renderer Electron development on macOS arm64 reached managed service ready
(generation 1); logs identified `Identity Smoke 0.0.0-beta.5.0`. The inherited
`ELECTRON_RUN_AS_NODE` flag had to be removed from the launch environment. No
native-window visual inspection was performed. All smoke processes and the
browser tab were stopped.

## Remaining validation and limits

- Persisted-history isolation is now demonstrated by the merger regression below.
- No signed installer, notarization, Windows runtime/notification check, or actual
  unsigned macOS packaging was run. Builder configuration/schema and packaging
  regressions pass; release/platform validation remains manual.
- Private publishing/cloud contracts and other environment-dependent tests retain
  their existing skips. No real providers or credentials were needed.
- Explicitly sharing data/Pi overrides shares state by design. Separate browser
  origins are needed for complete browser-origin isolation. Artwork, domain tools,
  protocol IDs and hosted services remain product-specific and outside this ticket.

## Merger verification (2026-11-02)

- Implementation `c748f7b8d1c2e706a0d9fd9e8799fda4344585d2` merged without
  conflicts as `75d14f6fe6c6b27d7ba12a32b1cf38d1180f0178`.
- Regression commit `4007afd40168fed9690acf6a62dc368bd6baa4de` extends the
  existing `test/app.test.ts` identity case at the approved daemon/agent seam.
  It uses the existing version-3 session fixture format and native-session
  scripted driver pattern. POST turns executes a deterministic NativeCodingSession
  and writes real persisted user/assistant history; GET conversation observes it.
  A fresh app without the injected adapter reloads the same ID, renamed title,
  message count, and both message texts. The second identity registers the same
  external workspace under its own storage and cannot list or read the foreign
  session, including after its own restart. Its registration does not overwrite
  the first identity's persisted history. No provider credentials are required.
- Initial regression failure was a fixture mismatch: opening a not-yet-persisted
  pending session directly generated a different ID. Production uses
  ConversationManager.open to retain its pending manager. The fixture now seeds
  its session header with the API-created ID before agent execution. No production
  correction or production red-green cycle was needed.
- Root checks with Bun 1.4.2: `bun run test -- test/application-identity.test.ts
  test/app.test.ts test/agent-runtime-session.test.ts test/desktop-close.test.ts
  test/desktop-runtime-packaging.test.ts` passed all 143 tests in five files.
  Final title-persistence assertion rerun with `test/app.test.ts -t
  'independently configured'`: 1 passed, 90 intentionally filtered out.
  `bun run typecheck`, `bun run lint`, and `git diff --check` passed.
- Earlier full-suite, renderer, Node startup, browser, and Electron smoke evidence
  above is from the implementation report, not a new merger rerun. Installer,
  platform, native-window inspection, and live-provider/cloud limits remain as
  recorded above. No initializer/template work was added.
