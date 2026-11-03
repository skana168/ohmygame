# OhMyTemplate

An independent agent workbench derived from [OhMyGame](https://github.com/WhiteTowerAI/ohmygame).
Includes conversations, workspace files, a general canvas, provider and media configuration,
Skills/MCP plugins, and a compiled example module with a tool and editable canvas node.
Game, story, publishing, community and OhMyGame account services are excluded.
See [中文说明](README.zh-CN.md), [LICENSE](LICENSE), and [NOTICE](NOTICE).

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

Edit `application.json` to set display name, package name, desktop ID, and relative
data directory, then rebuild. Keep package.json's name aligned for distribution.
The baseline is OhMyTemplate / ohmytemplate / org.example.ohmytemplate; use a unique
ID for your product. Browser data lives under `.data`; Electron uses its own profile.
`OHMYGAME_DATA_DIR` and `PI_CODING_AGENT_DIR` are optional explicit isolation overrides.
Do not commit data, provider credentials, `.runtime`, build output, or node_modules.
Separate browser origins isolate browser preferences across products.

Start with `src/modules/example/`, the example renderer registration in
`src/renderer/core-contributions.ts`, and the source selection in
`src/shared/application-composition.ts`. The example contributes a host tool and
schema-validated node; extend source contributions and rebuild all surfaces.
Workspace `workspace.json` and English agent guidance describe selected capabilities;
editing guidance never grants unavailable tools. Existing canvas files retain unknown
module data. New workspaces are supported; historical game-project import is not promised.
Use the included core tests, strict selected-graph typecheck, authenticated Node runtime
check, and Electron smoke when extending behavior. No game-only check is mandatory.
