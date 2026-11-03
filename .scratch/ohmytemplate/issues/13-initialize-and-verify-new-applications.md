# 13: Initialize a new application with aligned setup guides

**What to build:** A developer runs one local initialization command to generate a separately named workbench application, then follows aligned English and Chinese instructions to build, start, and extend it through the included non-game example.

**Blocked by:** 12 — Export a standalone buildable workbench template.

Status: resolved

- [x] Provide a local initialization script that accepts destination, application name, package name, desktop application ID, and data-directory configuration using the existing template identity mechanism.
- [x] Validate inputs before generating an unusable application, and reject an existing destination without changing its contents, including when it is empty.
- [x] Produce a self-contained application from the exported template without copying source checkout secrets, local state, or excluded game modules.
- [x] Run initialization into a fresh temporary destination and verify the generated identity, desktop metadata, and data isolation from OhMyGame and a differently named generated application.
- [x] Follow the documented install, type/build, daemon startup, and browser development steps using the generated project alone; exercise relevant Electron startup and workbench flows.
- [x] Demonstrate the generated application's example tool invocation and custom-node create/edit/save/reload workflow, plus independent provider/media configuration.
- [x] Align English and Chinese README sections, examples, media, and links for initialization, prerequisites, model setup, development, extension, validation, and current limits. State provider credential/network requirements accurately.
- [x] Document adding a source-registered business module, tool, and custom node, and using the existing Skills/MCP plugin path, without promising dynamic module loading or an npm CLI.
- [x] Run the required public verification sequence for the final integrated source change and applicable generated-project checks. Preserve existing regression coverage and record skips, credential/private-cloud constraints, platform limitations, and outstanding manual work explicitly.
- [x] Declare overall template delivery complete only after required generated-application and relevant browser/Electron validation succeeds; distinguish an initialization script that works from an application that has been fully verified.

**Context:** This is the final generated-application delivery slice, not a standalone documentation-only or test-only task. Do not change or close the parent specification as part of publishing this ticket. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation evidence

Ticket-level implementation and generated-app checks are recorded in [report 13](../reports/13-initialize-and-verify-new-applications.md), including failed attempts and remaining platform/provider limits. Merged and verified for ticket-level acceptance; whole-spec final review is still required.

## Answer

Resolved after conflict-free merge `c995495eaece13f32001e5607f0946c670e171ba` of implementation
`25fcadb308ab89dc4b4dea50a7b2a8a322343c97`. Narrow acceptance-helper fix
`ca118c8c3ed4494d0ac4639164e8910fcfa06ce0` makes persisted two-app checks repeatable by naming each local
provider fixture after its project; no application behavior changed.

Fresh merged-root checks: 8 public initializer/export/identity tests, typecheck,
lint, strict non-game daemon/renderer/desktop source and type audit, script syntax
and diff checks passed. The actual initialized artifact
`/tmp/ohmytemplate-13-resumed-ohmyapp` passed the compiled Node/Pi/two-identity
isolation/restart check twice after that fix, preserving existing app data.
586-file inventory, package/lock identity and aligned bilingual guides checked.
Source application identity, root lock and default composition remain unchanged.

Full source public checks (4358 tests passed, 41 skipped), generated frozen
install/build/core 56 tests, browser/source-watch and full Electron restart are
inherited implementation evidence, not rerun by this merger. See
[report 13](../reports/13-initialize-and-verify-new-applications.md#integration-acceptance-2026-11-03)
for exact fresh/inherited results and failed attempts. Native fractional resize
remains NONPASSING unchanged; paid/provider/private/platform/signing limits remain.
All 13 tickets are resolved; phase is final-review-pending. Two-axis whole-spec
review and worktree cleanup remain the root's next steps. Parent spec unchanged;
whole objective is not marked complete.
