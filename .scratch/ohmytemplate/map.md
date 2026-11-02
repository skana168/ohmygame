# OhMyTemplate execution map

## Notes

Execution details are recorded in [execution-state.json](execution-state.json).

## Decisions-so-far

- [Ticket 01](issues/01-unify-tool-contributions.md) is resolved: shared tool
  contributions merged at `9f6dc3c732ba4b305f2b7a92133c3b2b3f675367`;
  root affected tests and typecheck passed. Tickets 02 and 03 are unblocked.

- [Ticket 11](issues/11-configure-application-identity.md) is resolved: identity
  configuration merged at `75d14f6fe6c6b27d7ba12a32b1cf38d1180f0178`;
  persisted history isolation proved by `4007afd40168fed9690acf6a62dc368bd6baa4de`
  through daemon/agent execution and restart. See its report for platform limits.

- [Ticket 02](issues/02-select-business-tools.md) is resolved: host business-tool
  selection merged at `fbeb9975173204340c8688f2bf7359e9ce12f4c7`; 151 focused tests and
  typecheck passed. See its report for full-check evidence and manual limits.

- [Ticket 03](issues/03-version-workspace-manifests.md) is resolved: versioned
  workspace manifests merged at `2fce6668d411b69066d80063aa44273c254b8a35`;
  365 affected tests and typecheck passed with no integration edits. Tickets
  04, 06, 08 and 09 are newly unblocked; root retains scheduling ownership.
  See its report for preserved validation limits and the ticket04 gating boundary.

- [Ticket 09](issues/09-run-with-user-configured-providers.md) is resolved:
  optional account services merged at `7fe9d5e008ec8436d2b5a2e28de72a4175380e8e`;
  482 tests in 21 affected suites, typecheck, lint and diff checks passed freshly.
  Default account behavior and deterministic cancellation/paid-task recovery remain.
  See its report for inherited UI evidence and live-provider/Electron/platform gaps.
  Tickets 04/06 and the ticket 08 queue retain their prior state.

- [Ticket 04](issues/04-open-non-game-workspaces.md) resolved at `366f0dab`; 392 merged-root tests and typecheck passed. Generic tools/canvas retain independent account configuration. Tickets05/07 ready; Electron overall validation and browser title editing remain unverified.

- [Ticket 06](issues/06-isolate-game-preview-and-engines.md) merged at `7a6dbf98` but remains claimed. Shared workspace policy and reusable preview navigation integrated; browser flow passed. Electron resize timeout reproduces with baseline player, later native smoke and desktop capability flow remain unverified; see report for exact automated evidence.

## Fog

Remaining tickets retain their existing scope and status. Full template extraction
is not yet complete.
