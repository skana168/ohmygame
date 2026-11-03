# Workbench applications

Shared language for extracting OhMyGame's reusable workbench and building applications in other domains.

## Language

**Application**:
A workbench product with its own identity and selection of domain capabilities. OhMyGame is the game application; OhMyTemplate is the working name for the reusable starting point.

**Workspace**:
A user's working collection of files, canvas content, and assets within an application.
_Avoid_: Game folder when referring to workspaces across domains.

**Core**:
The shared workbench capabilities needed across domains, including agent conversations, workspace files, canvas editing, model access, media generation, and plugin hosting.

**Business module**:
An optional set of capabilities for a particular domain, such as game playtesting, engine integration, interactive stories, or game publishing.
_Avoid_: Plugin when referring to a business module as a whole.

**Plugin**:
An installable package of agent skills, MCP services, or integrations that contributes capabilities to an application.
