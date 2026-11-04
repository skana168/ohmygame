# OhMyTemplate

**面向 AI 工作台应用的本地优先开发底座。**

基于 Pi 智能体运行时、鉴权本地守护进程、无限画布、可扩展工具和多模型媒体生成，
快速构建自己的 OhMyApp。OhMyTemplate 从
[OhMyGame](https://github.com/WhiteTowerAI/ohmygame)
提取通用架构，产出可独立运行的应用模板。

[English](README.md) · **简体中文** · [应用指南](templates/standalone/README.zh-CN.md) · [Apache 2.0](LICENSE)

模板实现目前位于
[`refactor/ohmytemplate-integration`](https://github.com/skana168/ohmygame/tree/refactor/ohmytemplate-integration)
分支。当前源码仓库同时保留原有 OhMyGame 组装和通用非游戏组装。
直接运行源码默认启动 OhMyGame；通过初始化或导出命令获得独立工作台。

## 包含的能力

- **智能体运行时：** Pi 对话、流式响应、工作区文件工具、模型选择、会话持久化，
  以及现有编码智能体集成。
- **本地服务与桌面外壳：** Fastify HTTP/SSE 服务、鉴权本地访问、Electron 生命周期，
  以及浏览器开发模式。
- **无限画布：** 文档、文本、表格、图像、音频、视频、3D 资产与自定义节点，
  内容保存在普通工作区文件中。
- **工作区契约：** 版本化模块清单、`AGENTS.md` 指令、JSON Schema 校验，
  并保留不可用模块的数据。
- **可扩展业务工具：** Pi、编码智能体桥接和外部 MCP 共享源码注册工具，
  支持输入校验与取消。
- **模型与媒体：** 自行配置语言、图像、音频、视频及 3D 提供商，
  工具可用性随提供商能力变化。
- **完整扩展示例：** 编译业务模块，包含 `example_echo`、`example_note`
  和可编辑自定义画布节点。
- **Skills 与 MCP：** 复用现有插件主机和 MCP 连接集成外部能力。

游戏试玩、引擎集成、互动故事、发布、社区和 OhMyGame 账号服务作为可选业务能力保留，
独立产物排除这些能力的实现与资源。实际生成仍需要兼容的提供商、正常凭据及网络。

## 快速开始

安装 **Git**、**Node.js 22.19+**（含 npm）和 **Bun 1.4.2+**。

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

打开 **http://127.0.0.1:43120**。监听源码变化的本地服务使用 **43110** 端口；
如端口被占用，请先停止其他实例。插件准备会从 GitHub 获取固定版本公开包并核对校验和。

### 首次运行

可以跳过模型设置直接进入工作台，需要 AI 执行时再到设置中配置语言和媒体提供商。
生成应用启动不需要 OhMyGame 账号、Supabase 配置或私有云仓库。

在生成应用中执行 `bun run dev:desktop` 进入桌面开发模式。
`bun run start:desktop` 构建并打开生产界面。Electron 管理自己的鉴权服务及端口。

## 应用身份与模板导出

初始化命令依次接收五个位置参数：

```sh
bun run init:application DESTINATION DISPLAY_NAME PACKAGE_NAME DESKTOP_ID DATA_DIRECTORY
```

它会同步设置 `application.json`、包元数据和锁文件工作区名称。
请使用唯一的小写包名和反向 DNS 桌面 ID。目标目录必须不存在（空目录也会拒绝），
且位于源码树之外，包括符号链接别名。导出应用同样包含初始化命令，
可在安装依赖之前继续创建新应用。

若要导出默认 OhMyTemplate，而不是直接为新应用命名：

```sh
bun run export:template /absolute/new-template-directory
```

产物包含自己的源码、构建配置、依赖锁文件、示例模块、许可证和中英文说明。
不会复制指向原仓库的链接、已安装依赖、凭据、本地数据、缓存或 Git 元数据。

相对数据路径在浏览器开发时基于应用根目录，在 Electron 中基于应用桌面配置目录。
不同桌面 ID 与存储路径可隔离应用；显式共享路径会有意共享数据。
不同浏览器来源可隔离浏览器偏好设置。

## 架构

React 界面通过 HTTP 和 SSE 与本地 Fastify 服务通信。
服务负责智能体执行、工作区、提供商、资产及工具分发；Electron 负责桌面生命周期
和托管服务。各层通过共享契约连接，可选业务行为由源码选择的贡献接口提供。

```text
src/
  daemon/       智能体会话、工作区 API、提供商、工具、插件主机
  desktop/      Electron 外壳及托管服务生命周期
  renderer/     React 工作台、画布、设置、编译节点渲染器
  shared/       契约、Schema、工作区策略、应用组装
  modules/      源码注册业务模块与示例模块
scripts/        构建、导出、初始化及运行验证
templates/standalone/  生成应用的说明与支持文件
```

工作区包含版本化 `workspace.json`、根目录智能体指令、`canvas/` 中的 JSON/Markdown
文档及 Schema，以及项目相对路径资产。智能体指令指导行为，
实际可用工具由主机选择的模块决定。

## 扩展自己的领域

1. 从[示例模块](src/modules/example/manifest.ts)开始，定义模块 ID、配置 Schema、
   英文智能体指令及节点数据 Schema。
2. 通过[现有工具贡献接口](src/daemon/example-tools.ts)注册工具，
   在应用组装及非游戏主机中选择模块。
3. 参考[示例便签](src/modules/example/note.tsx)添加编译节点渲染器，
   检查创建、编辑、保存重载及模块缺失时的数据保留。
4. 界面文案同时加入中英文语言文件；修改源码注册后重新构建主机与界面。

业务模块从源码编译，安装式外部集成复用现有 Skills/MCP 插件路径。
完整说明见[应用指南](templates/standalone/README.zh-CN.md)、
[工作区契约](docs/workspace-manifests.md)、[画布契约](docs/canvas-agent.md)
和[插件指南](docs/plugins.md)。

## 开发与验证

在生成应用中执行：

```sh
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:node-runtime
bun run test:desktop
```

Node 运行检查通过本地确定性模型服务 fixture，验证鉴权服务及真实 Pi 对话。
桌面检查覆盖所选 Electron 应用，不代表付费服务或所有平台都已认证。
持久化重启检查见[生成应用指南](templates/standalone/README.zh-CN.md)；
源码仓库完整验证步骤和贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

源码中的 OhMyGame 组装保留现有游戏项目兼容性。
独立模板支持新工作区；历史游戏项目导入、托管发布/社区、发行安装包/签名及
跨平台运行认证不属于模板基线范围。

## 文档与来源

- [文档索引](docs/README.md)
- [运行时与应用组装](docs/runtime.md)
- [提供商与模型](docs/custom-models.md)
- [领域术语](GLOSSARY.md)与[架构决策](docs/adr/0001-extract-a-reusable-workbench.md)
- [上游 OhMyGame](https://github.com/WhiteTowerAI/ohmygame)

基于 WhiteTowerAI 及其贡献者的 OhMyGame 开发，保留上游署名及
[Apache License 2.0](LICENSE)。其他声明见 [NOTICE](templates/standalone/NOTICE)，
安全问题报告流程见 [SECURITY.md](SECURITY.md)。
