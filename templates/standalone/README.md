# OhMyTemplate

An independent agent workbench derived from [OhMyGame](https://github.com/WhiteTowerAI/ohmygame).
Includes conversations, workspace files, a general canvas, provider and media configuration,
Skills/MCP plugins, and a compiled example module with a tool and editable canvas node.
Game, story, publishing, community and OhMyGame account services are excluded.
See [中文说明](README.zh-CN.md), [LICENSE](LICENSE), and [NOTICE](NOTICE).

## Initialize

This directory already runs as an application. To create another application,
run this local command here, even before installing dependencies:

```sh
bun run init:application /absolute/new-directory "OhMyApp" ohmyapp org.example.ohmyapp .app-data
cd /absolute/new-directory
```

Arguments are destination, display name, lowercase unscoped package name, reverse
DNS desktop ID, and data directory. The destination must not exist (empty directories
are refused) and must be outside this source tree, including symlink aliases.
Validation uses the same identity contract as startup, before output creation.
The package and frozen lock workspace name are aligned automatically. No npm CLI
publication, dynamic JavaScript modules, or new marketplace is involved.

## Setup

Install Node.js 22.19+ (including npm), Git, and Bun 1.4.2+.

```sh
bun install --frozen-lockfile
bun run prepare:preinstalled-plugins
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:node-runtime
bun run dev
```

Open http://127.0.0.1:43120. The source-watching Node daemon uses port 43110.
Stop other instances using those ports. Skip provider setup to enter the workbench;
no OhMyGame account, private repository, or credentials are needed to start.
Add your own language or media providers in Settings. Actual generation requires
network access and any credentials required by that provider. Plugin preparation
fetches a pinned public plugin from GitHub; retry the preparation command after a
network failure. No game examples are downloaded.

`bun run start` runs the compiled daemon. `bun run dev:desktop` runs Electron with
Vite; `bun run start:desktop` builds and opens the production renderer. Electron
manages its own authenticated daemon and port. `bun run test:desktop` exercises
creation, editing, save/reload and shutdown with the built renderer. For a persisted
restart check, set `OHMYGAME_SMOKE_DIRECTORY` to a new temporary directory for both
`node scripts/test-web-game-runtime.mjs --non-game` and the same command with `--reopen`.
Release packaging/signing is outside this baseline.

## Identity and extension

Prefer the initializer to set `application.json`, package.json and the lock workspace
name together. For later identity edits, keep all three aligned, run a frozen install,
and rebuild. Relative data paths resolve inside each application root for browser
Node development and inside its desktop profile for Electron. Absolute paths or
explicit shared overrides intentionally share storage; choose distinct paths/IDs.
The baseline is OhMyTemplate / ohmytemplate / org.example.ohmytemplate; use a unique
ID for your product. Browser data lives under `.data`; Electron uses its own profile.
`OHMYGAME_DATA_DIR` and `PI_CODING_AGENT_DIR` are optional explicit isolation overrides.
Do not commit data, provider credentials, `.runtime`, build output, or node_modules.
Separate browser origins isolate browser preferences across products.

Start with `src/modules/example/`, the example renderer registration in
`src/renderer/custom-canvas-node.tsx`, and the source selection in
`src/shared/application-composition.ts`. The example contributes a host tool and
schema-validated node; extend source contributions and rebuild all surfaces.
Workspace `workspace.json` and English agent guidance describe selected capabilities;
editing guidance never grants unavailable tools. Existing canvas files retain unknown
module data. New workspaces are supported; historical game-project import is not promised.
Use the included core tests, strict selected-graph typecheck, authenticated Node runtime
check, and Electron smoke when extending behavior. No game-only check is mandatory.

## Source modules, tools and nodes

Use the existing example as a complete vertical slice:

1. Define the module ID, config schema, English agent instructions and custom node
   schema in `src/modules/example/manifest.ts`. Select it in
   `src/shared/application-composition.ts` and the host assembly
   `src/daemon/non-game-host.ts`; unavailable modules cannot be enabled by instructions.
2. Follow `src/daemon/example-tools.ts` for a source-registered validated tool.
   Its `example_note` reads a board revision and creates/updates an `example/note`.
   Keep execution at the existing host tool boundary; rebuild and test invocation.
3. Follow `src/modules/example/note.tsx` and
   `src/renderer/custom-canvas-node.tsx` for node rendering. Register its
   schema and renderer together, then check create/edit/save/reload and invalid data.
   Add UI copy in both `src/renderer/locales/en.ts` and `zh-CN.ts`.

Restart source-watch development after changing source module selection; build both
host and renderer for production. Do not replace these compiled registrations with
arbitrary runtime JavaScript loading.

## Skills and MCP plugins

Use Settings → Plugins to install/manage existing plugin packages and their Skills
or MCP services. Settings → Connections also supports native MCP command/URL
connections. Configure the service's required credentials locally. The pinned
preinstalled plugin uses the same plugin host; no new marketplace is required.
English agent guidance is in `integrations/skills/`. A plugin supplies integrations,
not an arbitrary source business-module loader.

## Checks and current limits

Run the setup checks above after extension. `bun run build:host` also compiles the
Electron main/preload/bootstrap; `bun run build:renderer` builds its UI. The Node
runtime check uses a local deterministic model fixture for a real Pi conversation,
authenticated files/canvas/tool/provider APIs, MCP and restart/shutdown. It does not
make paid model or media calls. Actual language/image/audio/video/3D generation
requires a compatible configured provider, its normal credentials and network;
provider capabilities differ. Plugin/dependency preparation also needs network.
No private cloud, account quota or Supabase configuration is required here.

New workspaces are supported; historical game imports, game engines/playtesting,
hosted community/publishing, installers/signing/notarization and other-platform
runtime certification are outside this local delivery. The upstream native game
fractional resize failure remains nonpassing and is unrelated to the core smoke.
