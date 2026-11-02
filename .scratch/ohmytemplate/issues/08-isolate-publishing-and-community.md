# 08: Make game publishing and community optional

**What to build:** Game publishing and community features operate only when the application supplies their business capabilities. A local workbench without them remains usable without those services or their UI.

**Blocked by:** 03 — Create and reopen workspaces with a versioned module manifest.

Status: claimed

- [x] Associate game publishing and community service construction, routes, and UI entry points with explicit application business capabilities.
- [x] With the capabilities enabled, existing OhMyGame publishing, deployment state, and community workflows preserve their public behavior.
- [x] With them disabled, local startup and work do not require publishing/community endpoints, and relevant navigation and actions are not exposed.
- [x] Direct requests to disabled publishing/community operations are unavailable or rejected explicitly; hiding UI alone is insufficient.
- [x] Disabling these capabilities preserves existing project and deployment metadata rather than silently deleting user state.
- [x] Keep reusable project export/import and local asset operations working independently of game publishing.
- [x] Extend existing publishing-client, publish-dialog, daemon, and relevant archive integration tests using local service fixtures.
- [x] Run focused checks and document changed capability behavior; identify private-cloud contract or staging checks that could not be performed without treating public-only tests as hosted-service verification.

**Context:** Account-specific free model services and provider independence are ticket 09. Final application assembly and build inputs are ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).

## Comments

Implementation and public verification completed in the isolated ticket 08 branch. Remains claimed pending serial merger. See [implementation report](../reports/08-isolate-publishing-and-community.md) for evidence, integration base, browser observations, and private-cloud/Electron/platform gaps.
