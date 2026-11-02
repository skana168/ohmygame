# 09: Run the workbench with user-configured model and media providers

**What to build:** Users can start the shared workbench, configure providers, converse with the agent, and generate supported media without signing into OhMyGame or relying on its free quotas or private model services.

**Blocked by:** 03 — Create and reopen workspaces with a versioned module manifest.

Status: resolved

- [x] Separate OhMyGame account-specific cloud model/credential/quota integration from core provider configuration and model discovery.
- [x] A composition without the account service starts and presents a usable provider setup flow without requiring OhMyGame login or private endpoints.
- [x] Configured providers supply language models and supported image, audio, video, and 3D operations independently of game modules.
- [x] Missing credentials, disabled providers, and unsupported generation operations produce specific configuration/capability diagnostics rather than being reported as missing game modules.
- [x] Preserve capability-based tool availability, existing provider selection, generation persistence, cancellation, and paid-task recovery behavior where supported.
- [x] With account services enabled, OhMyGame retains its existing cloud-model behavior; do not migrate or expose credentials between application identities.
- [x] Extend provider settings, model catalog, media-tool, and cloud integration fixtures to verify both compositions without requiring real paid calls in the regression suite.
- [x] Document provider setup and remaining credential-dependent manual checks; record focused tests, type checking, and affected onboarding/provider UI validation in both locales.

**Context:** Independent startup does not imply offline model execution or credential-free media generation. Publishing/community extraction is ticket 08, and app-wide build/resource composition is ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).


## Implementation evidence

Recovered and verified on `t3/run-configured-providers`; status remains claimed for merger
review. See [the implementation report](../reports/09-run-with-user-configured-providers.md)
for per-criterion API/UI evidence, red-green slices, public checks and screenshots.
The checked implementation criteria do not claim live provider/cloud or native
Electron validation; those credential/platform-dependent checks remain open in
the report.

## Answer

Merged only ticket 09 from `t3/run-configured-providers` at `6f0addc43173d6ff532020720911b11855f51dba`
(worktree `/Users/yoyun/.t3/worktrees/ohmygame/t3-9f32fe5f`) into
`refactor/ohmytemplate-integration` at `7fe9d5e008ec8436d2b5a2e28de72a4175380e8e` without conflicts or
integration edits. All ticket criteria are satisfied by the reviewed implementation,
deterministic fixtures and recorded English/Chinese UI evidence.

Fresh root verification: 21 affected suites, 482 tests passed; Bun 1.4.2 typecheck, lint and git diff --check passed. Both account compositions retain configured
provider/model discovery, conversation persistence and supported media execution
without game/story tools. Account-off mode omits private model account routes and
Supabase initialization/sign-in; the default remains enabled. Existing cancellation
and paid-task recovery tests remain intact, with the new dual-composition restart
fixture confirming exactly one simulated paid submission. No real paid call is
required for this regression proof.

See [the report](../reports/09-run-with-user-configured-providers.md#merger-verification-2026-11-02)
for exact commands and inherited evidence limits. Real providers/private cloud,
native Electron and other platforms remain manual gaps. Publishing/community
and full application composition remain tickets 08/10. Tickets 04/06 and the
08 queue are unchanged; `.codegraph/`, all worktrees and defaults are preserved.
