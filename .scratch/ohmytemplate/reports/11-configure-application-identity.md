# Ticket 11 implementation evidence

Status: claimed — root merger owns resolution.

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

- Full persisted conversation-history isolation across two separately configured
  running applications is not newly demonstrated. Empty conversations are
  intentionally in-memory; the regression verifies their isolation while live.
  Existing session persistence coverage remains in the public suite. This is why
  the ticket's broad isolation acceptance box stays unchecked for merger review.
- No signed installer, notarization, Windows runtime/notification check, or actual
  unsigned macOS packaging was run. Builder configuration/schema and packaging
  regressions pass; release/platform validation remains manual.
- Private publishing/cloud contracts and other environment-dependent tests retain
  their existing skips. No real providers or credentials were needed.
- Explicitly sharing data/Pi overrides shares state by design. Separate browser
  origins are needed for complete browser-origin isolation. Artwork, domain tools,
  protocol IDs and hosted services remain product-specific and outside this ticket.
