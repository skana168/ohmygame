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

- [Ticket 06](issues/06-isolate-game-preview-and-engines.md) is resolved: production merge `7a6dbf98`, validation merge `ee9c428a58604dd8626a0256ffab384fe8f937e8`. Actual Electron capability/IPC/agent-driver cleanup and canvas title/Markdown reload passed; fresh 112 tests and typecheck passed. Original baseline native fractional resize still fails; later native assertions, external engines/encoders and other-platform checks remain unverified. Desktop creation-dialog and generated-template verification remain overall gaps; see report.

- [Ticket 08](issues/08-isolate-publishing-and-community.md) resolved after conflict-free merge `c1885b30`; optional service construction/routes and UI guards preserve defaults, metadata, archives and local assets. Fresh 194 tests passed/23 private-cloud skips and typecheck passed; see report for inherited public/browser evidence and remaining manual gaps.

- [Ticket 05](issues/05-register-custom-canvas-nodes.md) resolved after conflict-free merge `4eda859f`; source node contracts/renderers and persisted companion tool verified. Fresh 246 affected tests, typecheck and 65-test byte-preservation regression passed (`bc205e80`). Original browser evidence retained; screenshot and Electron gaps remain in the report. Ticket07 unchanged; ticket10 awaits07.

- [Ticket 07](issues/07-isolate-interactive-stories.md) resolved at `046168bfa471edf95b2ef7d6389793e620f5c162`; 678 affected tests, typecheck and Node runtime passed. Legacy daemon-reopen/codebase/byte-preservation regression `02d5ad63102bf6fc695079ba0a202dd13ae515b4` passed (123 final app tests). Browser iframe start/reload is inherited; visual playback/Electron/platform/provider/private-cloud gaps remain explicit in the report. Ticket10 is ready for root scheduling and remains unclaimed.

- [Ticket 10](issues/10-compose-independent-applications.md) is resolved: Host
  merge `dc53a0cc`, integration fix/test `7729fee5`, preserved Renderer `2cfedfd3`
  and Desktop `d1153eed`. One combined fixture with 117 business/resource paths
  physically absent passed source/type/build/compiled Node/actual Electron
  dialog/custom-node edit/reload/full restart/shutdown. Default public checks
  passed (4354 tests, 41 skips), including lint. See the final report for exact
  exclusions and retained native resize/provider/platform/source-watch/browser
  limitations. Ticket 12 is ready, not started; full template remains incomplete.

- [Ticket 12](issues/12-export-standalone-template.md) resolved at `fd71bfaa3805b747beb782efe50e05d00d0921fc`;
  source-destination alias guard/regression `664b55ed8fd5e7618a891104dd667c317bcc44a4`. Fresh exporter/root
  boundary checks and independently installed core checks/build/Node Pi smoke passed.
  [Report](reports/12-export-standalone-template.md#integration-acceptance-2026-11-03)
  records artifact and inherited browser/source-watch/Electron limits. Ticket13
  is ready and unclaimed, not started; full template awaits13 plus review.

- [Ticket 13](issues/13-initialize-and-verify-new-applications.md) resolved at
  `c995495eaece13f32001e5607f0946c670e171ba`; repeatable acceptance fixture
  `ca118c8c3ed4494d0ac4639164e8910fcfa06ce0`. Fresh 8 public tests, types/lint/strict
  source audit and actual artifact Node/Pi/two-app restart isolation passed twice.
  [Report](reports/13-initialize-and-verify-new-applications.md#integration-acceptance-2026-11-03)
  separates inherited full checks/browser/source-watch/Electron from fresh evidence.
  All 13 tickets resolved; phase final-review-pending.

## Fog

Two-axis final review and worktree cleanup remain the root’s next steps. Whole
objective is not marked complete; parent spec unchanged. Native fractional resize
remains NONPASSING unchanged; provider/private/platform/signing limits retained.
