# OhMyTemplate

从 [OhMyGame](https://github.com/WhiteTowerAI/ohmygame) 提取的独立智能体工作台。
保留对话、工作区文件、通用画布、模型及媒体提供商配置、Skills/MCP 插件，
以及包含工具与可编辑画布节点的编译示例模块。不包含游戏、故事、发布、社区及
OhMyGame 账号服务。参阅 [English](README.md)、[LICENSE](LICENSE) 和 [NOTICE](NOTICE)。

## 初始化

当前目录已经是可运行的应用。若需创建另一个应用，可在此运行本地命令，
无需先安装依赖：

```sh
bun run init:application /absolute/new-directory "OhMyApp" ohmyapp org.example.ohmyapp .app-data
cd /absolute/new-directory
```

参数依次为目标目录、显示名称、小写非作用域包名、反向 DNS 桌面 ID 和数据目录。
目标必须不存在（空目录也会拒绝），且位于当前源码树之外，包括符号链接别名。
生成前使用与启动相同的身份契约验证；自动同步包名与冻结锁文件工作区名称。
不涉及 npm CLI 发布、动态 JavaScript 模块或新市场。

## 安装

安装 Node.js 22.19+（含 npm）、Git 和 Bun 1.4.2+。

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

打开 http://127.0.0.1:43120，监听源码变化的 Node 服务使用 43110 端口。
请先停止占用端口的其他实例。可跳过提供商设置进入工作台；启动不需要
OhMyGame 账号、私有仓库或凭据。在设置中添加语言及媒体提供商；实际生成需要
网络和该提供商要求的凭据。插件准备从 GitHub 获取固定版本的公开插件，网络
失败后重新运行准备命令即可，不会下载游戏示例。

`bun run start` 启动编译后的服务；`bun run dev:desktop` 使用 Vite 启动 Electron；
`bun run start:desktop` 构建并启动生产界面。Electron 管理自己的鉴权服务和端口。
`bun run test:desktop` 在构建后检查创建、编辑、保存重载与关闭。
要检查进程重启，请将 `OHMYGAME_SMOKE_DIRECTORY` 设为新的临时目录，先运行
`node scripts/test-web-game-runtime.mjs --non-game`，再以相同目录增加 `--reopen` 运行。
本基线不包含发行打包与签名流程。

## 身份与扩展

优先使用初始化命令同步设置 `application.json`、package.json 和锁文件工作区名称。
后续手动修改身份时保持三者一致，执行冻结安装并重新构建。相对数据路径在浏览器
Node 开发中基于各自应用根目录，在 Electron 中基于各自桌面配置目录。
绝对路径或显式共享覆盖值会有意共享存储；请使用不同路径与 ID。基线为 OhMyTemplate / ohmytemplate /
org.example.ohmytemplate；产品应使用唯一 ID。浏览器开发数据位于 `.data`，
Electron 使用独立配置目录。可通过 `OHMYGAME_DATA_DIR` 和 `PI_CODING_AGENT_DIR`
显式隔离数据。不要提交数据、提供商凭据、`.runtime`、构建产物及 node_modules。
不同浏览器来源可隔离不同产品的浏览器偏好。

从 `src/modules/example/`、`src/renderer/custom-canvas-node.tsx` 的示例渲染注册和
`src/shared/application-composition.ts` 的源码选择开始。示例提供主机工具与经过
Schema 验证的节点；扩展源码贡献后重新构建全部界面。工作区的 `workspace.json`
及英文智能体指令描述所选能力，修改指令不会授予不可用工具。画布保留未知模块
数据。支持新工作区，不承诺导入历史游戏项目。扩展后运行核心测试、严格所选源码
图类型检查、鉴权 Node 运行检查及 Electron 冒烟检查；无需运行游戏专用检查。

## 源码模块、工具与节点

以现有示例为完整纵向参考：

1. 在 `src/modules/example/manifest.ts` 定义模块 ID、配置 Schema、英文智能体指令
   和自定义节点 Schema。在 `src/shared/application-composition.ts` 及主机组装
   `src/daemon/non-game-host.ts` 中选择模块；指令不能启用不可用模块。
2. 参考 `src/daemon/example-tools.ts` 注册经过验证的源码工具。
   `example_note` 读取画板版本并创建/更新 `example/note`。保留现有主机工具执行边界，
   重新构建并测试实际调用。
3. 参考 `src/modules/example/note.tsx` 与 `src/renderer/custom-canvas-node.tsx`
   实现节点渲染，同时注册 Schema 和渲染器，检查创建、编辑、保存重载及非法数据。
   界面文案同时加入 `src/renderer/locales/en.ts` 和 `zh-CN.ts`。

修改源码模块选择后重启源码监听开发；生产模式同时构建主机与界面。
不要将编译注册替换为任意运行时 JavaScript 加载。

## Skills 与 MCP 插件

通过设置 → 插件安装和管理现有插件包及其 Skills 或 MCP 服务。
设置 → 连接也支持原生 MCP 命令/URL 连接。请在本地配置服务要求的凭据。
预装固定版本插件复用相同插件主机，无需新市场。
英文智能体指令位于 `integrations/skills/`。插件提供集成能力，
不是任意源码业务模块加载器。

## 检查与当前限制

扩展后执行上述安装检查。`bun run build:host` 也编译 Electron 主进程、preload 和
bootstrap；`bun run build:renderer` 构建界面。Node 运行检查使用本地确定性模型
fixture 完成真实 Pi 对话、鉴权文件/画布/工具/提供商 API、MCP 和重启关闭，
不会调用付费模型或媒体服务。实际语言、图像、音频、视频及 3D 生成需要兼容的
已配置提供商、正常凭据与网络，各提供商能力不同。插件及依赖准备也需要网络。
这里无需私有云、账号额度或 Supabase 配置。

支持新工作区；历史游戏导入、游戏引擎/试玩、托管社区/发布、安装包/签名/公证及
其他平台运行认证不属于本地交付范围。上游游戏原生窗口小数缩放失败仍未通过，
与核心冒烟检查无关。
