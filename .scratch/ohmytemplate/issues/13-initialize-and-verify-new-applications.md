# 13: Initialize a new application with aligned setup guides

**What to build:** A developer runs one local initialization command to generate a separately named workbench application, then follows aligned English and Chinese instructions to build, start, and extend it through the included non-game example.

**Blocked by:** 12 — Export a standalone buildable workbench template.

Status: claimed

- [ ] Provide a local initialization script that accepts destination, application name, package name, desktop application ID, and data-directory configuration using the existing template identity mechanism.
- [ ] Validate inputs before generating an unusable application, and reject an existing destination without changing its contents, including when it is empty.
- [ ] Produce a self-contained application from the exported template without copying source checkout secrets, local state, or excluded game modules.
- [ ] Run initialization into a fresh temporary destination and verify the generated identity, desktop metadata, and data isolation from OhMyGame and a differently named generated application.
- [ ] Follow the documented install, type/build, daemon startup, and browser development steps using the generated project alone; exercise relevant Electron startup and workbench flows.
- [ ] Demonstrate the generated application's example tool invocation and custom-node create/edit/save/reload workflow, plus independent provider/media configuration.
- [ ] Align English and Chinese README sections, examples, media, and links for initialization, prerequisites, model setup, development, extension, validation, and current limits. State provider credential/network requirements accurately.
- [ ] Document adding a source-registered business module, tool, and custom node, and using the existing Skills/MCP plugin path, without promising dynamic module loading or an npm CLI.
- [ ] Run the required public verification sequence for the final integrated source change and applicable generated-project checks. Preserve existing regression coverage and record skips, credential/private-cloud constraints, platform limitations, and outstanding manual work explicitly.
- [ ] Declare overall template delivery complete only after required generated-application and relevant browser/Electron validation succeeds; distinguish an initialization script that works from an application that has been fully verified.

**Context:** This is the final generated-application delivery slice, not a standalone documentation-only or test-only task. Do not change or close the parent specification as part of publishing this ticket. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
