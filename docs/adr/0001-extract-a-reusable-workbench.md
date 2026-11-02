---
status: accepted
---

# Extract the reusable workbench within OhMyGame first

Extract reusable boundaries inside OhMyGame while preserving its existing behavior, then export an independent application template, provisionally named OhMyTemplate. Keeping the game application working provides a real consumer for the new boundaries before other applications depend on them.

The core retains Pi agent sessions, the local daemon, workspace files, the infinite canvas and its JSON contracts, model providers, media generation, and plugin hosting. Game playtesting, engine integrations, interactive stories, game publishing, and community features become optional business modules. Retain Electron and browser development support.

For the first version, register business modules in source and reuse the existing MCP plugin path for external tools. Arbitrary dynamically loaded JavaScript modules are outside this version's scope.

Workspaces will use a versioned manifest to declare enabled modules and configuration, root AGENTS.md instructions, and JSON Schema validation for persisted data. Retain the existing canvas/ file structure. Host configuration determines tool availability; agent instructions describe how to use those tools.

The refactored OhMyGame must continue opening existing projects. The exported template initially supports newly created workspaces without promising migration of historical OhMyGame projects.

The template starts with user-configured model providers and does not require an OhMyGame account, free model quotas, community services, or private cloud services. Those integrations remain in the OhMyGame application layer.

Business modules can register custom canvas node types, data schemas, and renderer components alongside the existing general-purpose nodes. The first version compiles these contributions from source.

Deliver an independent template directory and a local initialization script that sets the application name, package name, desktop application ID, and data directory. Include a minimal non-game business module demonstrating the extension path; publishing an npm CLI is outside the first version.

These are agreed design boundaries, not implemented capabilities.

## Proposed implementation sequence

1. Introduce source-registered tool providers and a shared tool catalog at the daemon composition boundary. Extract game and story tools from the mixed agent tool factory, and reuse the existing ToolBridge for consumers. Preserve tool names and existing OhMyGame behavior.
2. Separate workspace capabilities from game project types. Introduce the versioned workspace manifest and preserve the ability to open existing OhMyGame projects. Move game-specific canvas instructions, main-document rules, and board restrictions into business policy.
3. Introduce canvas node contributions across validation and rendering. Keep the existing general-purpose nodes and file structure; prove the extension boundary with a minimal non-game node and tool.
4. Isolate game previews, engine integrations, interactive stories, publishing, community, and account-specific cloud services. Keep reusable preview infrastructure where needed by applications, and update renderer navigation and build preparation to follow the selected application modules.
5. Export the independent template, add the local initialization script, and write aligned English and Chinese README instructions. Replace product-specific branding and identifiers through explicit configuration.

The initial implementation milestone is the tool registration and composition boundary in step 1. It does not claim that game dependencies have already been removed from the complete build. Directory moves follow working boundaries rather than preceding them.

## Acceptance criteria

- Existing OhMyGame projects still open, and existing game tools remain usable with their modules enabled.
- With game modules disabled, game and story tools are absent from the tool catalogs exposed to Pi, coding agents, and external MCP clients. A minimal non-game tool is discoverable and executable through the supported paths.
- Tool registration preserves existing planning restrictions, cancellation, execution behavior, and workspace isolation. Duplicate tool names fail explicitly.
- A non-game workspace supports conversations, file operations, canvas persistence, schema validation, and media generation with configured providers. No OhMyGame account or private cloud service is required.
- A custom node survives save and reload with schema validation and its registered renderer. Missing modules produce an explicit diagnostic and preserve existing workspace data.
- Initialization produces a separately named application with distinct desktop identity and data storage. It rejects an existing destination rather than overwriting it.
- Verify the affected boundaries with focused tests during implementation, then run the public checks documented in CONTRIBUTING.md. Exercise the relevant Electron and browser flows before declaring the template complete; record unavailable checks and remaining manual validation.
