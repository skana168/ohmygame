# Ticket 09 implementation report

Status: implemented; ticket remains claimed pending merger review.

- Branch: `t3/user-configured-providers`.
- Worktree: `/Users/yoyun/.t3/worktrees/ohmygame/t3-7294aa34`.
- Implementation: `f004a0eb88b368e628f2a06b034bf9e1fef0c995`.
- Starting HEAD and verified integration ancestor: `50ac4e255db8f4a254d37cd30426060454d4e92a`.
- Before reporting, ran `git merge --no-edit refactor/ohmytemplate-integration`;
  integration remained at `50ac4e25`, and Git reported already up to date.
- No additional checkout, worktree, subagent, push, PR, watch, or execution-state
  edit. No `.codegraph/` directory exists. Frozen install used Bun 1.4.2 from
  the supplied PATH; lockfile unchanged.

## Delivered behavior

`src/shared/application-services.ts` supplies the source-owned
`accountServicesEnabled` selection shared by renderer and daemon startup.
OhMyGame retains `true`. Independent applications set it to `false` and rebuild.
Embedded daemon hosts can override with `createApp({ accountServices: false })`;
their renderer selection must agree. This is separate from application identity,
workspace manifests, and the game/story tool selections from tickets 02/03/11.

Without account services, the daemon does not construct the cloud model client,
validate its URL, accept account tokens, include managed free-cloud providers in
catalogs, or register cloud session/quota/job/result routes. User providers,
model discovery, model selection, and media generators retain their existing
paths. Direct Hyper3D enablement no longer depends on saved cloud enablement
when cloud integration is absent, and its switch updates only its own setting.

The renderer skips Supabase client construction, session restoration and cloud
session synchronization even when Supabase configuration is present. Product
sign-in and account/billing entry points are unavailable; direct account links
show an English/Chinese configuration message. Hyper3D's independent settings
show its key form, API balance when connected, and model catalog, without a
free-account panel, daily quota, free grouping, or cloud wording. Provider OAuth
and coding-agent sign-in remain available because they belong to user providers.

Audio job preparation now distinguishes an explicitly selected provider with
missing credentials, a disabled provider, and an unavailable/unsupported model
operation. Diagnostics remain English for agent consumption. The generic
no-provider diagnostic and injected-generator behavior remain compatible.

Publishing/Community extraction belongs to ticket 08, and full resource/build
exclusion belongs to ticket 10. Their code is still included; this ticket does
not claim a finished standalone template or removal of every product endpoint.

## Acceptance evidence

- Optional account model/credential/quota integration: cloud API fixtures verify
  absent providers and 404 session/quota/jobs/results/model-settings routes in
  the independent composition. An invalid cloud URL is deliberately supplied:
  startup succeeds without constructing or contacting that service.
- Independent onboarding: daemon onboarding cases run in both compositions,
  including skip/reopen/restart and enabled/visible language-model completion.
  Browser setup reaches provider selection without a product login.
- User providers and all media categories: custom-media API fixtures run with
  both account modes and both game/story tools disabled. They exercise image
  protocols, video submit/poll/download, 3D operations, audio generation and
  persistence, capability catalogs, visibility and defaults. Audio key/catalog
  cases also run in both modes. No paid service is called.
- Diagnostics: public audio job regressions distinguish missing keys, disabled
  providers and unsupported operations. Existing media reference/operation
  validation remains covered in the doubled custom-media fixture.
- Agent availability and persistence: public turn tests retain every core media
  tool with no connected provider in both compositions. Existing scripted
  native-session persistence/isolation tests now run with both account modes
  and no game/story tools; real user/assistant history reloads across restart.
- Cancellation and paid-task recovery: public daemon jobs cancel provider
  polling, restart, retry the persisted task, and save its recovered GLB. Both
  compositions make exactly one simulated paid POST. Existing canvas recovery,
  provider workflow, cloud cancellation and agent cancellation tests also pass.
- Enabled defaults and identity isolation: existing cloud fixtures still cover
  sessions, quotas, direct/free selection, cancellation and account changes.
  Separate application storage fixtures prove credentials and conversations
  remain private across restart. No credential migration was added.
- Public setup and remaining checks are documented in `docs/custom-models.md`.
  Both new UI messages are translated in `en.ts` and `zh-CN.ts`.

## Red-green evidence

1. The independent daemon test failed because managed cloud providers were still
   advertised. Making the client optional and omitting its routes/catalogs made
   it pass; direct user-key Hyper3D models remain available.
2. The audio diagnostic test failed with the generic no-model message for a
   selected provider lacking credentials. Specific configuration/capability
   branches made both account-mode cases pass.
3. The renderer balance/settings test failed because a daily-quota panel was
   rendered without an account connection. Rendering it only for a supplied
   cloud connection made it pass, retaining the direct API balance.

Additional fixture parameterization and cancellation/restart cases extend
existing behavior; they are not claimed as newly discovered production defects.
An audio assertion initially used `result` instead of the public job's `run`
field, and onboarding parameterization accidentally captured an adjacent case;
these test-authoring errors were corrected before final checks.

## Checks

- `bun install --frozen-lockfile`: passed; lockfile unchanged.
- `bun run prepare:preinstalled-plugins`: passed, one pinned plugin prepared.
- `bun run changelog:check`: passed.
- `bun run typecheck` and `bun run lint`: passed after final changes.
- Full suite after production changes: 352 files passed, three skipped;
  **4,291 tests passed, 41 skipped**. Two paid-task recovery cases were added
  afterwards; the final four-suite acceptance run passed **73 tests**, including
  all 44 custom-media cases. No production change followed the full run.
- Prior final eight-suite rerun: no completion result was recovered; not counted as passing evidence.
- Renderer builds with account services disabled and enabled: passed. Existing
  large-chunk warnings remain. Default-enabled artifacts were rebuilt last.
- `bun run test:node-runtime`: passed, including actual Node daemon startup,
  authenticated APIs, story/preview, archives, MCP/extension hosts, independent
  identity restart, and graceful shutdown (local Node 24.20.0).
- New source file Prettier check and `git diff --check`: passed.

## Browser validation and gaps

Used isolated temporary daemon/Pi data, ports 43210/43220, account services off,
no game/story tools, and deliberately unused Supabase values. In English,
opened first-run model selection, opened/cancelled the OpenAI key flow, skipped
setup, and entered provider settings. In Chinese, replayed the connection step
and inspected provider settings. Direct account links showed the translated
unavailable message. Opened Hyper3D's key/model settings in both languages;
there was no account/quota panel. Resource inspection on the independent
Hyper3D page found no `/api/cloud/` or configured Supabase endpoint requests.
Installed local agent CLIs were discovered, but no real model/media call was
made. Both smoke processes and browser tabs were stopped, and source defaults
were restored before final checks.

Artifacts: [English providers](09-providers-en.png),
[Chinese providers](09-providers-zh-CN.png),
[Chinese onboarding](09-onboarding-zh-CN.png), and
[Chinese Hyper3D detail](09-hyper3d-zh-CN.png).
English detail screenshot capture repeatedly timed out in preview automation;
its rendered text was inspected successfully. Earlier provider-list captures
precede removal of the empty Account group heading; the Hyper3D capture shows
the final layout.

Remaining manual validation: real language-provider conversations, paid media
calls and provider credential/account access; live cancellation/restart behavior
at paid services; real Supabase/hosted cloud contracts; native Electron UI and
other platforms. Public cloud contract tests keep their existing private-service
skips. Browser smoke and deterministic fixtures do not establish those results.
Acceptance remains subject to merger review; no claim of live paid validation.


## Recovery verification (2026-11-02)

- Resumed in `/Users/yoyun/.t3/worktrees/ohmygame/t3-9f32fe5f` on
  `t3/run-configured-providers`; confirmed `5be4b4ed` is an ancestor before edits.
- `git apply --check /tmp/ohmytemplate-recovery-09/working.patch` passed,
  then applied the patch without conflicts. The original worktree was untouched.
- Reviewed the recovered report, ticket, source/test diff, and Chinese Hyper3D
  screenshot. Recovered implementation/test/docs files match `f004a0eb`
  (including the new application-services file). No additional behavior change
  was needed; the inherited red-green evidence above remains the implementation
  evidence. Screenshots are inherited evidence, not a new browser run.
- `PATH=/tmp/ohmytemplate-tools/node_modules/.bin:$PATH bun install --frozen-lockfile`
  passed using Bun 1.4.2; `bun.lock` unchanged.
- With that PATH, `bun run typecheck`, `bun run lint`, and `git diff --check`
  passed on the recovered tree.
- With that PATH, `bun run test -- test/app.test.ts test/cloud-models.test.ts test/custom-media-models.test.ts test/onboarding.test.ts test/provider-balance-settings.test.tsx test/provider-model-settings.test.ts`
  passed: **6 files, 200 tests**, 20.74 seconds. This includes both compositions,
  onboarding, credential isolation, media generation and paid-task recovery.
- Broad checks/builds and browser smoke were not repeated: recovered source
  matches the previously checked implementation, and the focused rerun verifies
  recovery. Prior full-suite/build/Node/browser evidence above is inherited and
  retains its stated limitations. No live credentials or native Electron checks
  were added; the remaining manual gaps above still apply.
- Latest integration ref before final reporting: `5be4b4ed355f2a6b43c21cb2dab8d54aa29de6c1`.
  Merge result is recorded in the final handoff. Ticket remains claimed for merger.
