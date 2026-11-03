# OhMyTemplate

**A local-first foundation for AI workbench applications.**

Build your own OhMyApp with a Pi-based agent runtime, an authenticated local
daemon, an infinite canvas, extensible tools, and multi-model media generation.
OhMyTemplate extracts the reusable architecture of
[OhMyGame](https://github.com/WhiteTowerAI/ohmygame) into an independently runnable
application template.

**English** · [简体中文](README.zh-CN.md) · [Application guide](templates/standalone/README.md) · [Apache 2.0](LICENSE)

The template implementation currently lives on the
[`refactor/ohmytemplate-integration`](https://github.com/skana168/ohmygame/tree/refactor/ohmytemplate-integration)
branch. This source repository contains both the original OhMyGame composition
and the reusable non-game composition. The source checkout defaults to OhMyGame;
initialize or export an application to use the independent workbench.

## What is included

- **Agent runtime:** Pi conversations, streamed responses, workspace file tools,
  model selection, session persistence, and existing coding-agent integrations.
- **Local daemon and desktop shell:** Fastify HTTP/SSE services, authenticated
  local access, Electron lifecycle, and browser development.
- **Infinite canvas:** documents, text, tables, images, audio, video, 3D assets,
  and custom nodes backed by ordinary workspace files.
- **Workspace contracts:** a versioned module manifest, `AGENTS.md` instructions,
  JSON Schema validation, and preservation of data from unavailable modules.
- **Extensible business tools:** source-registered contributions shared across Pi,
  coding-agent bridges, and external MCP, with input validation and cancellation.
- **Providers and media:** user-configured language, image, audio, video, and 3D
  providers, with capability-based tool availability.
- **An extension example:** a compiled business module with `example_echo`,
  `example_note`, and an editable custom canvas node.
- **Skills and MCP:** the existing plugin host and MCP connections for external
  integrations.

Game playtesting, engine integrations, interactive stories, publishing, community,
and OhMyGame account services remain optional business capabilities. Independent
outputs exclude their implementations and resources. Actual generation still
requires a compatible provider, its normal credentials, and network access.

## Quick start

Install **Git**, **Node.js 22.19+** with npm, and **Bun 1.4.2+**.

```sh
git clone --branch refactor/ohmytemplate-integration https://github.com/skana168/ohmygame.git ohmytemplate
cd ohmytemplate
bun install --frozen-lockfile

bun run init:application ../OhMyApp "OhMyApp" ohmyapp org.example.ohmyapp .app-data
cd ../OhMyApp
bun install --frozen-lockfile
bun run prepare:preinstalled-plugins
bun run dev
```

Open **http://127.0.0.1:43120**. The source-watching daemon uses port **43110**;
stop another instance if either port is occupied. Plugin preparation fetches a
pinned public package from GitHub and verifies its checksum.

### First run

You can skip model setup and enter the workbench immediately. Configure your own
language and media providers in Settings when you need AI execution. The generated
application does not require an OhMyGame account, Supabase configuration, or a
private cloud repository.

For desktop development, run `bun run dev:desktop` in the generated application.
`bun run start:desktop` builds and opens its production renderer. Electron owns
its authenticated daemon and selects its own service port.

## Application identity and template export

The initializer accepts five positional arguments:

```sh
bun run init:application DESTINATION DISPLAY_NAME PACKAGE_NAME DESKTOP_ID DATA_DIRECTORY
```

It configures `application.json`, package metadata, and the lockfile workspace
name together. Choose a unique lowercase package name and reverse-DNS desktop ID.
The destination must not exist, including as an empty directory, and must be
outside the source tree, including symlink aliases. The initializer is also
included in exported applications and can run there before dependency installation.

To export the baseline OhMyTemplate instead of naming a new application:

```sh
bun run export:template /absolute/new-template-directory
```

Outputs contain their own source, build configuration, dependency lock, example
module, licenses, and English/Chinese instructions. They exclude source-checkout
links, installed dependencies, credentials, local data, caches, and Git metadata.

Relative data paths resolve within the application root for browser development
and within its desktop profile for Electron. Distinct desktop IDs and storage
paths keep applications separate. Explicit shared paths intentionally share data;
separate browser origins isolate browser preferences.

## Architecture

The React renderer communicates with the local Fastify daemon over HTTP and SSE.
The daemon owns agent execution, workspaces, providers, assets, and tool dispatch.
Electron owns desktop lifecycle and the managed daemon. Shared contracts connect
these surfaces; source-selected contributions provide optional business behavior.

```text
src/
  daemon/       Agent sessions, workspace APIs, providers, tools, plugin hosts
  desktop/      Electron shell and managed daemon lifecycle
  renderer/     React workbench, canvas, settings, compiled node renderers
  shared/       Contracts, schemas, workspace policy, application composition
  modules/      Source-registered business modules and the example module
scripts/        Build, export, initialization, and runtime verification
templates/standalone/  Generated-application instructions and support files
```

Workspace files include a versioned `workspace.json`, root agent instructions,
`canvas/` JSON/Markdown documents and schemas, and project-relative assets.
Agent instructions guide behavior; the host's selected modules determine which
tools are actually available.

## Add your own domain

1. Start with [the example module](src/modules/example/manifest.ts). Define its
   module ID, configuration schema, English agent guidance, and node data schema.
2. Register tools through [the existing tool contribution path](src/daemon/example-tools.ts),
   then select the module in the application composition and non-game host.
3. Add the compiled node renderer alongside [the example note](src/modules/example/note.tsx).
   Validate create/edit/save/reload and preservation when the module is absent.
4. Add user-facing text to both English and Chinese locales. Rebuild the host and
   renderer after changing source registrations.

Business modules are compiled from source. Use the existing Skills/MCP plugin
path for installable external integrations. See the complete
[application guide](templates/standalone/README.md),
[workspace contract](docs/workspace-manifests.md),
[canvas contract](docs/canvas-agent.md), and
[plugin guide](docs/plugins.md).

## Development and verification

In a generated application:

```sh
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:node-runtime
bun run test:desktop
```

The Node runtime check exercises the authenticated daemon and a real Pi turn
using a deterministic local model-service fixture. Desktop checks cover the
selected Electron application; they do not certify paid providers or all platforms.
See the [generated application guide](templates/standalone/README.md) for persisted
restart checks, and [CONTRIBUTING.md](CONTRIBUTING.md) for the source repository's
full verification sequence and contribution workflow.

The source OhMyGame composition retains existing game-project compatibility.
Independent templates support new workspaces; importing historical game projects,
hosted publishing/community, release installers/signing, and cross-platform runtime
certification are outside the template baseline.

## Documentation and attribution

- [Documentation map](docs/README.md)
- [Runtime and composition](docs/runtime.md)
- [Providers and models](docs/custom-models.md)
- [Domain vocabulary](GLOSSARY.md) and [architecture decision](docs/adr/0001-extract-a-reusable-workbench.md)
- [Upstream OhMyGame](https://github.com/WhiteTowerAI/ohmygame)

Derived from OhMyGame by WhiteTowerAI and its contributors. This repository
retains upstream attribution and the [Apache License 2.0](LICENSE).
See [NOTICE](templates/standalone/NOTICE) for additional notices and [SECURITY.md](SECURITY.md) for
security reporting.
