# OhMyTemplate: Extract a reusable agent workbench from OhMyGame

Status: ready-for-agent

## Problem Statement

An application developer wants to reuse OhMyGame's agent workbench to build products in domains other than games. The existing application already supplies Pi sessions, a local daemon, an infinite canvas, persisted JSON contracts, model providers, media generation, and plugin hosting. However, game concepts also appear in project types, tool construction, canvas policies, navigation, preview ownership, build preparation, and cloud integrations.

Removing engine plugin packages alone does not produce an independent application. A reusable starting point must expose explicit business-module boundaries, preserve the working OhMyGame application, and allow a newly named application to start without OhMyGame accounts, private services, or game modules.

## Solution

Extract a reusable core inside OhMyGame first, keeping OhMyGame as a working consumer. Register business modules from source, retain the existing plugin path for Skills and MCP services, and make game capabilities optional. Export an independent template, provisionally named OhMyTemplate, with a local initialization script and a minimal non-game business module.

The template retains Electron and browser development support. Its default workbench provides agent conversations, workspace file operations, an infinite canvas with general-purpose nodes, model configuration, media generation, and plugin hosting. Workspaces use a versioned manifest, agent instructions, and JSON Schema contracts. A business module can contribute tools and custom canvas nodes without changing core registries for each new domain.

## User Stories

1. As an application developer, I want to initialize a new application from the template, so that I can build a workbench for a domain other than games.
2. As an application developer, I want to set the application name, so that the generated product has its own identity.
3. As an application developer, I want to set the package name and desktop application ID, so that the generated application can be developed and packaged independently.
4. As an application developer, I want separate application data storage, so that my new application does not overwrite OhMyGame or another generated application's state.
5. As an application developer, I want initialization to reject an existing destination, so that it preserves existing files.
6. As an application developer, I want a clean, self-contained template, so that development does not depend on the original OhMyGame checkout or its local state.
7. As an application developer, I want aligned English and Chinese setup instructions, so that I can reproduce initialization, configuration, development, and verification.
8. As an application developer, I want a minimal non-game module example, so that I can learn the supported extension path from working code.
9. As an application developer, I want core services separated from business modules, so that a domain change does not require rewriting the agent runtime or canvas.
10. As an application developer, I want to register a business module from source, so that its contributions are explicit and compiled with the application.
11. As an application developer, I want to disable game modules, so that game tools and workflows do not remain active in a non-game application.
12. As an application developer, I want invalid module combinations to produce actionable diagnostics, so that configuration errors are visible before their capabilities are used.
13. As a workspace user, I want module selection and configuration recorded in a versioned manifest, so that the workspace's intended capabilities are explicit and validated.
14. As a workspace user, I want workspace-specific agent instructions, so that the agent follows the conventions of my application and work.
15. As a workspace user, I want host configuration to control tool availability, so that instructions alone cannot activate tools from an unavailable module.
16. As a workspace user, I want persisted workspace data validated against JSON Schema, so that invalid edits produce understandable errors.
17. As a workspace user, I want existing canvas files and assets retained when a module is unavailable, so that module configuration changes do not destroy my work.
18. As a workspace user, I want to converse with a Pi-based agent, so that I can perform domain work through the shared runtime.
19. As a workspace user, I want agent file operations scoped to my workspace, so that modularization preserves existing isolation behavior.
20. As a workspace user, I want to select configured model providers, so that I can use my preferred language and media services.
21. As a workspace user, I want the template to start without an OhMyGame account, so that I can use it independently of that product.
22. As a workspace user, I want image, audio, video, and 3D generation capabilities retained where supported by configured providers, so that media creation remains available outside game projects.
23. As a workspace user, I want clear provider configuration and capability errors, so that missing credentials or unavailable operations are distinguishable from module failures.
24. As an application developer, I want a shared catalog for source-registered agent tools, so that tool definitions do not diverge across supported agent entry points.
25. As an application developer, I want Pi, supported coding agents, and external MCP clients to honor the same module selection, so that disabling a capability is consistent across consumers.
26. As an application developer, I want tools to declare validated inputs and execute with the existing cancellation and execution behavior, so that custom tools integrate with current runtime guarantees.
27. As a workspace user, I want planning mode to retain its existing tool restrictions, so that module registration does not expose disallowed actions during planning.
28. As an application developer, I want duplicate tool registrations rejected explicitly, so that one module cannot silently replace another tool.
29. As an application developer, I want to continue using Skills and MCP plugins, so that existing external integrations remain useful alongside source-registered business modules.
30. As a workspace user, I want general-purpose canvas nodes and their content to persist across reloads, so that the extracted core preserves the existing file-based editing workflow.
31. As a workspace user, I want concurrent canvas and agent edits to retain existing validation and conflict handling, so that extraction does not silently lose changes.
32. As an application developer, I want to register a custom node type, its data schema, and renderer, so that my application can represent its own domain concepts.
33. As a workspace user, I want custom nodes to render and survive save and reload, so that business extensions behave like integrated canvas content.
34. As a workspace user, I want missing node modules diagnosed without deleting their persisted data, so that I can restore the module and recover my work.
35. As an application developer, I want game-specific document and board rules supplied by business modules, so that generic workspaces do not inherit game-design constraints.
36. As an existing OhMyGame user, I want my projects to remain openable after refactoring, so that template extraction does not interrupt current work.
37. As an existing OhMyGame user, I want game tools, engine integrations, interactive stories, and publishing to remain usable with their modules enabled, so that extraction preserves the game application.
38. As an application developer, I want navigation and startup preparation to follow the selected application modules, so that a non-game product does not expose game-only screens or prepare excluded game resources.
39. As an application developer, I want browser development and Electron development to remain supported, so that the template preserves the existing development options.
40. As an application developer, I want a generated application to build and start with its own configuration, so that initialization proves independence beyond renaming source files.

## Implementation Decisions

- Extract boundaries inside OhMyGame before exporting the independent template. Preserve existing application behavior while introducing the new forms alongside existing consumers and migrating them incrementally.
- Keep Pi sessions, daemon hosting, workspace files, general-purpose canvas editing, model adapters, media generation, and plugin hosting in the core.
- Treat game playtesting, engine integrations, interactive stories, game publishing, community features, and OhMyGame account-specific cloud services as application-level business capabilities.
- Retain reusable preview infrastructure when needed by applications; isolate game-specific player behavior, target selection, drivers, and lifecycle ownership within the game capability.
- Register business modules from source in the first version. Continue using the existing Skills and MCP plugin model for installable external capabilities. Do not conflate a source-registered business module with an installable plugin.
- Have the application select the available modules and the workspace manifest declare its enabled modules and configuration. Workspace declarations may use available modules but do not dynamically load arbitrary code. Report unavailable modules and invalid configuration explicitly.
- Use a versioned workspace manifest with validation. Keep agent instructions separate from executable capability selection: the host determines availability and the instructions guide use.
- Preserve the existing canvas persistence structure and separate semantic content from layout. Move game-specific instructions, main-document policy, and board restrictions into the relevant business module.
- Preserve opening of existing OhMyGame projects through compatible loading behavior. The independent template initially supports new workspaces; it does not promise historical OhMyGame project import.
- Introduce a common source-registered tool contribution boundary at daemon composition. Tool contributions describe their names, inputs, and execution behavior; consumers receive the appropriate catalog for the current workspace and mode.
- Reuse the existing ToolBridge and tool execution contracts rather than introducing a parallel transport protocol. Preserve consumer-specific built-in tools and established mode restrictions while sharing the host-contributed tool catalog.
- Preserve existing OhMyGame tool names, input behavior, cancellation, sequential execution where required, workspace scope, and cleanup behavior. Reject duplicate tool names rather than silently overriding definitions.
- Register custom canvas nodes through module contributions that supply node identity, data validation, and renderer components. Compile renderer contributions with the application in the first version.
- Preserve persisted data when a module or node type is unavailable, and surface a diagnostic. Module absence must not cause silent deletion or rewriting of unrecognized business data.
- Keep media providers and generation operations usable independently of game modules. Preserve capability-based availability and diagnostics; retaining an operation does not imply every provider supports it.
- Default the exported template to user-configured providers. Starting the workbench must not require an OhMyGame account, free quotas, a community endpoint, or private cloud services. Actual generation may still require provider credentials and network access.
- Make application identity, desktop identity, and data storage explicit initialization settings. Produce an independent template directory and a local initialization script with safe destination handling.
- Include a minimal non-game business module contributing a tool and custom node to demonstrate the complete extension path. It is an example, not a second fully featured domain product.
- Keep application navigation, shipped instructions, prepared resources, and build inputs aligned with module selection. Exclude game-only resources from the exported default template while retaining them for OhMyGame.
- Retain Electron and browser development support. Keep English and Chinese README instructions aligned, translate new UI text in both supported locales, and keep instructions sent to agents in English.
- Avoid a directory-only rewrite as the first milestone. Establish and verify boundaries before relocating their implementations.

## Testing Decisions

- The user approved the existing daemon public API and agent tool invocation boundaries as the primary verification seams. Add complementary canvas rendering/save-reload checks and initialization/build/startup checks where those public daemon boundaries cannot demonstrate the behavior.
- Test observable behavior rather than registry internals, object layouts, exact function organization, or snapshots of implementation details. Prefer existing test setup and the highest useful public boundary; add new seams only when existing ones cannot establish the behavior.
- Verify module selection through exposed tool catalogs and actual tool invocation. With game modules enabled, existing tools remain callable. With them disabled, game and story tools are absent and cannot be invoked through host-controlled entry points. A non-game example tool is discoverable and executable through the supported consumers.
- Verify Pi, coding-agent bridges, and external MCP behavior using their existing catalog and invocation integration patterns. Reuse deterministic local adapters and fixtures rather than requiring real model calls in the main regression suite.
- Verify planning restrictions, schema-invalid tool input, duplicate registration, cancellation, sequential execution where required, workspace isolation, and resource cleanup at the relevant existing execution boundaries.
- Verify workspace creation, manifest validation, reopening, file operations, and existing-project compatibility through daemon APIs and persisted fixtures. Cover unsupported manifest versions and unavailable modules with explicit diagnostics and preservation of user files.
- Verify general-purpose canvas persistence and existing conflict behavior remain intact. For the custom example node, exercise validation, rendering, save, reload, and missing-module behavior; confirm invalid data is diagnosed without silently discarding the saved content.
- Verify game-specific board and document policies still apply to the game application and are not imposed on the non-game workspace.
- Verify provider configuration and media capability selection using the existing provider and tool integration fixtures. Confirm configured operations remain available without a game module and account-specific cloud services are not prerequisites for startup.
- Verify initialization into a temporary destination, invalid settings, refusal to overwrite an existing destination, distinct identities and storage, and an output that does not depend on the source checkout or its private/local state.
- Build and start a generated application through its documented workflow. Smoke-test daemon startup and browser development, and exercise the relevant Electron startup, navigation, and custom-node flow before final delivery. Record platform or credential constraints rather than representing skipped checks as passing.
- Existing prior art includes the agent-tools, agent-runtime-session, agent-runtime-drivers, external-mcp, canvas-api, canvas-migration, asset-canvas-document, canvas-table, game-design, plugin-capabilities, provider-model-settings, tools, and Node runtime startup suites. Extend relevant existing suites before creating new ones.
- Run focused tests during each implementation slice and the repository's required public verification sequence before completion: pinned plugin preparation, changelog checks, type checking, the full test suite, renderer build, and Node runtime checks. Manually exercise changed browser and Electron behavior. Cloud publishing regressions that require private infrastructure must be reported as unverified when that infrastructure is unavailable.

## Out of Scope

- Arbitrary dynamically loaded JavaScript business modules, a new plugin marketplace, or a new tool transport protocol.
- A published npm initialization CLI.
- A complete new domain product such as OhMyApp; the non-game module is deliberately minimal.
- Historical OhMyGame project import or migration guarantees in the independent template. This does not relax existing-project compatibility inside OhMyGame.
- Replacing Pi, the local daemon architecture, the existing canvas persistence model, or the supported model-provider system.
- Removing media generation merely because it is currently used for games.
- Redesigning the entire interface, unrelated formatting cleanup, or introducing unrelated infrastructure changes.
- Delivering new engine adapters or hosted publishing services.
- Deleting existing regression coverage without identifying preserved behavior or an explicitly discontinued feature. Existing OhMyGame game behavior remains supported by this extraction.

## Further Notes

The specification consolidates the nine decisions accepted during the design interview. Its terminology follows the [workbench glossary](../../GLOSSARY.md), and its boundaries follow the [accepted extraction ADR](../../docs/adr/0001-extract-a-reusable-workbench.md).

Deliver the work in independently verifiable slices. The expected progression is tool contribution and composition, workspace capabilities and compatibility, custom canvas nodes, optional business and cloud integrations, then independent template initialization and documentation. Ticket decomposition must identify actual blocking dependencies and use expand-and-contract steps where changing shared contracts would otherwise break intermediate builds.

The first implementation milestone establishes a shared tool contribution boundary and proves game-module selection plus execution of a minimal non-game tool through supported consumers. Completing that milestone does not yet establish removal of all game dependencies from the full application build.

This specification is ready for ticket decomposition. It records intended behavior and does not claim that extraction, template generation, or runtime verification has already been implemented. Exact module API types and manifest field names are implementation details to settle while delivering the specified behavior.
