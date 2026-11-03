# 03: Create and reopen workspaces with a versioned module manifest

**What to build:** Workspace creation and reopening use a validated, versioned declaration of enabled business modules and their configuration, with workspace-specific agent instructions. Existing OhMyGame projects remain openable through compatible loading behavior.

**Blocked by:** 01 — Unify tool contributions while preserving existing behavior.

Status: resolved

- [x] Public workspace creation and loading operations persist and return the intended module selection and configuration using a versioned manifest.
- [x] Validate manifest structure and module configuration against the appropriate schemas; reject unsupported versions, invalid configuration, and invalid module combinations with actionable diagnostics.
- [x] Only modules supplied by the application can be selected. A workspace declaration never loads arbitrary code or activates an unavailable module.
- [x] Missing modules are diagnosed without silently deleting or rewriting existing workspace files, canvas content, or assets.
- [x] Initialize workspace-specific agent instructions without overwriting user-authored instructions, and retain existing context-file scoping behavior.
- [x] Existing OhMyGame projects without the new manifest still open with their expected capabilities; do not silently reinterpret their project domain or lose data.
- [x] Extend existing project, workspace, agent-context, and migration integration coverage for create, save, reopen, invalid manifests, and legacy-project fixtures.
- [x] Document the public workspace contract and compatibility behavior, run focused tests and type checking, and record remaining validation needs.

**Context:** Reuse the source-registered module descriptors from ticket 01. Full non-game UI and per-workspace tool gating arrive in ticket 04, so this ticket does not depend on ticket 02. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Implementation evidence

Implementation and post-integration validation are recorded in
[the ticket 03 report](../reports/03-version-workspace-manifests.md).
Merger acceptance is recorded below.

## Answer

Merged `b27dd631e49461fa283fc75ae9d7cf8a1b3fcb39` into the integration branch
at `2fce6668d411b69066d80063aa44273c254b8a35`, conflict-free with no integration edits.
Reviewed version/configuration diagnostics, creation/reopen persistence, preservation
of user instructions and data, legacy compatibility, and ticket02 host flag behavior.
Root validation: 14 affected suites, **365 tests passed**; typecheck and
`git diff --check` passed. Full public checks were already reported by the
implementer; the merged tracked tree equals the implementation tip, so no broader
repeat was warranted. Manual browser/Electron, live-provider, and private-cloud
validation remain unperformed; prior full-suite skips remain as reported.

Tickets **04, 06, 08, and 09** are newly unblocked; root owns scheduling them.
No claim or implementation of those tickets, or workspace tool gating, is made.
See [the report](../reports/03-version-workspace-manifests.md) for details.
