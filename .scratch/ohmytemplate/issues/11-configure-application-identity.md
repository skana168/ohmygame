# 11: Configure independent application identity and data storage

**What to build:** Developers can configure the application name, package name, desktop application ID, and data directory so that separately named workbench applications build and run without mixing their persisted state.

**Blocked by:** None (can start immediately).

Status: claimed

- [ ] Provide explicit identity configuration consumed by application display, package/build metadata, desktop identity, and daemon/desktop data-directory selection.
- [ ] Validate unsupported or invalid identity settings with clear errors rather than producing a partly renamed application.
- [ ] Preserve OhMyGame's existing default identity and data locations so existing users retain access to their projects, settings, and credentials.
- [ ] Two applications configured with distinct identities and data directories do not read or overwrite each other's projects, provider settings, sessions, or credentials.
- [ ] Browser and Electron development use the configured application identity and storage; daemon startup honors the chosen configuration consistently.
- [ ] Packaging/build configuration accepts the independent desktop identity without requiring unrelated hosted release or signing setup to demonstrate local development.
- [ ] Extend existing startup, desktop configuration/packaging, and storage integration coverage using temporary directories; verify visible naming where applicable.
- [ ] Document configuration and run focused tests and type checking, plus relevant browser/Electron startup checks, recording any packaging/platform limitations.

**Context:** This slice has no genuine dependency on module extraction and must not require the initialization script. The script later supplies these settings rather than implementing a second identity mechanism. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
