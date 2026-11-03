# 11: Configure independent application identity and data storage

**What to build:** Developers can configure the application name, package name, desktop application ID, and data directory so that separately named workbench applications build and run without mixing their persisted state.

**Blocked by:** None (can start immediately).

Status: resolved

- [x] Provide explicit identity configuration consumed by application display, package/build metadata, desktop identity, and daemon/desktop data-directory selection.
- [x] Validate unsupported or invalid identity settings with clear errors rather than producing a partly renamed application.
- [x] Preserve OhMyGame's existing default identity and data locations so existing users retain access to their projects, settings, and credentials.
- [x] Two applications configured with distinct identities and data directories do not read or overwrite each other's projects, provider settings, sessions, or credentials.
- [x] Browser and Electron development use the configured application identity and storage; daemon startup honors the chosen configuration consistently.
- [x] Packaging/build configuration accepts the independent desktop identity without requiring unrelated hosted release or signing setup to demonstrate local development.
- [x] Extend existing startup, desktop configuration/packaging, and storage integration coverage using temporary directories; verify visible naming where applicable.
- [x] Document configuration and run focused tests and type checking, plus relevant browser/Electron startup checks, recording any packaging/platform limitations.

**Context:** This slice has no genuine dependency on module extraction and must not require the initialization script. The script later supplies these settings rather than implementing a second identity mechanism. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation evidence

See [the ticket report](../reports/11-configure-application-identity.md) for implementation, validation, and platform limits.

## Answer

Merged `c748f7b8d1c2e706a0d9fd9e8799fda4344585d2` conflict-free at
`75d14f6fe6c6b27d7ba12a32b1cf38d1180f0178`. Follow-up regression
`4007afd40168fed9690acf6a62dc368bd6baa4de` closes the persisted-history gap:
a deterministic native agent turn through the daemon API persists both user
and assistant messages; a fresh app reloads the same conversation ID, title,
and history. A second identity with its own project on the same workspace
cannot list or read that session, before or after restart. No production fix
was needed; OhMyGame defaults remain unchanged.

Focused identity/app/native-session/desktop-close/packaging suites: 143 passed.
The final title-persistence assertion also passed its focused rerun. Typecheck,
lint, and diff whitespace checks passed. Signed installers, notarization,
Windows runtime/notifications, unsigned macOS packaging, native-window visual
inspection, and live-provider/private-cloud checks remain outside this local
proof; see the report. No new full-suite/build/platform rerun is claimed.
