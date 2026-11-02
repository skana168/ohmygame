# 09: Run the workbench with user-configured model and media providers

**What to build:** Users can start the shared workbench, configure providers, converse with the agent, and generate supported media without signing into OhMyGame or relying on its free quotas or private model services.

**Blocked by:** 03 — Create and reopen workspaces with a versioned module manifest.

Status: ready-for-agent

- [ ] Separate OhMyGame account-specific cloud model/credential/quota integration from core provider configuration and model discovery.
- [ ] A composition without the account service starts and presents a usable provider setup flow without requiring OhMyGame login or private endpoints.
- [ ] Configured providers supply language models and supported image, audio, video, and 3D operations independently of game modules.
- [ ] Missing credentials, disabled providers, and unsupported generation operations produce specific configuration/capability diagnostics rather than being reported as missing game modules.
- [ ] Preserve capability-based tool availability, existing provider selection, generation persistence, cancellation, and paid-task recovery behavior where supported.
- [ ] With account services enabled, OhMyGame retains its existing cloud-model behavior; do not migrate or expose credentials between application identities.
- [ ] Extend provider settings, model catalog, media-tool, and cloud integration fixtures to verify both compositions without requiring real paid calls in the regression suite.
- [ ] Document provider setup and remaining credential-dependent manual checks; record focused tests, type checking, and affected onboarding/provider UI validation in both locales.

**Context:** Independent startup does not imply offline model execution or credential-free media generation. Publishing/community extraction is ticket 08, and app-wide build/resource composition is ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
