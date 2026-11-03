# OhMyTemplate

从 [OhMyGame](https://github.com/WhiteTowerAI/ohmygame) 提取的独立智能体工作台。
保留对话、工作区文件、通用画布、模型及媒体提供商配置、Skills/MCP 插件，
以及包含工具与可编辑画布节点的编译示例模块。不包含游戏、故事、发布、社区及
OhMyGame 账号服务。参阅 [English](README.md)、[LICENSE](LICENSE) 和 [NOTICE](NOTICE)。

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

修改 `application.json` 中的显示名称、包名、桌面 ID 和相对数据目录后重新构建。
分发时保持 package.json 包名一致。基线为 OhMyTemplate / ohmytemplate /
org.example.ohmytemplate；产品应使用唯一 ID。浏览器开发数据位于 `.data`，
Electron 使用独立配置目录。可通过 `OHMYGAME_DATA_DIR` 和 `PI_CODING_AGENT_DIR`
显式隔离数据。不要提交数据、提供商凭据、`.runtime`、构建产物及 node_modules。
不同浏览器来源可隔离不同产品的浏览器偏好。

从 `src/modules/example/`、`src/renderer/core-contributions.ts` 的示例渲染注册和
`src/shared/application-composition.ts` 的源码选择开始。示例提供主机工具与经过
Schema 验证的节点；扩展源码贡献后重新构建全部界面。工作区的 `workspace.json`
及英文智能体指令描述所选能力，修改指令不会授予不可用工具。画布保留未知模块
数据。支持新工作区，不承诺导入历史游戏项目。扩展后运行核心测试、严格所选源码
图类型检查、鉴权 Node 运行检查及 Electron 冒烟检查；无需运行游戏专用检查。
