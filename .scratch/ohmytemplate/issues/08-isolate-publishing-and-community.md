# 08: Make game publishing and community optional

**What to build:** Game publishing and community features operate only when the application supplies their business capabilities. A local workbench without them remains usable without those services or their UI.

**Blocked by:** 03 — Create and reopen workspaces with a versioned module manifest.

Status: ready-for-agent

- [ ] Associate game publishing and community service construction, routes, and UI entry points with explicit application business capabilities.
- [ ] With the capabilities enabled, existing OhMyGame publishing, deployment state, and community workflows preserve their public behavior.
- [ ] With them disabled, local startup and work do not require publishing/community endpoints, and relevant navigation and actions are not exposed.
- [ ] Direct requests to disabled publishing/community operations are unavailable or rejected explicitly; hiding UI alone is insufficient.
- [ ] Disabling these capabilities preserves existing project and deployment metadata rather than silently deleting user state.
- [ ] Keep reusable project export/import and local asset operations working independently of game publishing.
- [ ] Extend existing publishing-client, publish-dialog, daemon, and relevant archive integration tests using local service fixtures.
- [ ] Run focused checks and document changed capability behavior; identify private-cloud contract or staging checks that could not be performed without treating public-only tests as hosted-service verification.

**Context:** Account-specific free model services and provider independence are ticket 09. Final application assembly and build inputs are ticket 10. Follow the [parent specification](../spec.md), [glossary](../../../GLOSSARY.md), and [accepted ADR](../../../docs/adr/0001-extract-a-reusable-workbench.md).
