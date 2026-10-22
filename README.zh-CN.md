# TuneShape · 随形 — React UI 动效示例

[English](README.md) · **简体中文**

[![基础示例 CI](https://github.com/orocoa/TuneShape/actions/workflows/ci.yml/badge.svg)](https://github.com/orocoa/TuneShape/actions/workflows/ci.yml) · [MIT 许可证](LICENSE)

TuneShape · 随形，由 [orocoa](https://github.com/orocoa) 维护，提供 3 个基于 React、TypeScript 和 Motion 的基础 UI 动效示例：按钮按压反馈、Tab 切换和页内对话框。每个示例均提供可运行源码、经过校验的 JSON 配置，以及与之对应的实现 Prompt。

**[在线调整 UI 动效](https://kai-nex.com/tuneshape/)** · [运行 3 个公开示例](#快速开始)

[关于 TuneShape](https://kai-nex.com/tuneshape/about/) · [English introduction](https://kai-nex.com/tuneshape/en/about/) · [在线交互示例](https://kai-nex.com/tuneshape/effects/) · [使用指南](https://kai-nex.com/tuneshape/guides/)

[版本发布](https://github.com/orocoa/TuneShape/releases) · [反馈问题](https://github.com/orocoa/TuneShape/issues) · [参与贡献](CONTRIBUTING.md)

![TuneShape 基础示例：按钮按压与释放反馈](docs/preview-button-press.gif)

录自本仓库的基础示例：按住按钮，再松开回到初始状态。

## 社区示例：闪电岛

**[在线体验闪电岛 UI 动效](https://lightning-island-ui.liiiillliii.chatgpt.site/#lightning-island)** — 由贡献者托管的公开演示，无需登录或安装。

[闪电岛 UI](docs/lightning-island.md) 由 [OXOOOOX](https://github.com/OXOOOOX) 提取，用三张紧凑卡片展示轮廓高亮、状态提示和完成反馈。只使用简单 SVG 与 CSS 图形，不加载图片素材；事件卡、LIVE 抽屉和更新弹窗放在默认折叠的组合示例中。沿用「源码 + JSON 配置 + Prompt」的组织方式，无新增依赖或后端。

新增的 filter 与循环轨道采用独立的 `lightning-island-effects` 扩展格式，通过原生 Web Animations 播放。该 JSON 配合扩展源码使用，基础配置编辑器不支持；组合示例原有的三份动效预设仍可在基础编辑器使用。

运行 `pnpm dev` 后选择 **闪电岛 · Lightning Island**（`/#lightning-island`）。[查看源码](src/lightning-island/IslandExamples.tsx) · [配置](configs/lightning-island/) · [提示词](prompts/lightning-island/) · [使用与来源说明](docs/lightning-island.md)。基础示例仍是默认入口。

![闪电岛社区 UI 示例](docs/lightning-island-preview.png)

## 项目介绍

TuneShape，中文名「随形」，取意“随物赋形”，是用于浏览和调整 UI 动效的网页工具。在线编辑器提供完整动效目录、交互式参数调整、配置导入导出，以及可复用的动效规格。

本仓库公开三个可独立运行的基础示例，沿用在线编辑器的基础交互渲染器，并使用系统字体和简洁的演示布局。完整网站、编辑器面板、目录、启动动画和高级效果实现由独立工程维护。

## 名称与项目入口

项目正式名称为 **TuneShape**，中文名是「随形」。如果你搜索 **TurnShape / turnshape** 想寻找这个 UI 动效工具，请以以上官网地址和 `orocoa/TuneShape` 仓库确认项目。公开仓库提供基础示例，完整在线编辑器由独立工程维护。

## 基础示例

| 示例 | 交互方式 | 配置 | Prompt |
| --- | --- | --- | --- |
| 按钮按压反馈 | 指针、空格键或 Enter 键按下与释放 | [button.json](configs/button.json) | [button.md](prompts/button.md) |
| Tab 切换过渡 | 指针或方向键切换内容，支持 Home 和 End 键 | [tabs.json](configs/tabs.json) | [tabs.md](prompts/tabs.md) |
| 页内对话框 | 打开、关闭或按 Escape 退出，关闭后焦点返回触发按钮 | [modal.json](configs/modal.json) | [modal.md](prompts/modal.md) |

对话框用于演示预览区域内的进入与退出，使用 `aria-modal="false"`，不限制整个应用的键盘焦点。

## 快速开始

### 环境要求

- Node.js **22.12 或更高版本**。CI 使用 Node.js 24。
- pnpm **11.x**。请使用 [`package.json`](package.json) 的 `packageManager` 字段声明的具体版本。

### 安装与运行

```sh
git clone https://github.com/orocoa/TuneShape.git
cd TuneShape
pnpm install --frozen-lockfile
pnpm dev
```

在浏览器中打开 Vite 输出的本地地址。如果下载的是 Release ZIP，请先解压，再进入包含 `package.json` 的目录，执行最后两条命令。

安装依赖时需要访问软件包仓库。依赖安装完成后，示例可以在本地运行，无需账号、API Key、数据库或连接 TuneShape 网站。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm test` | 执行配置、校验和交互契约测试 |
| `pnpm build` | 执行 TypeScript 检查，将静态生产文件输出到 `dist/` |
| `pnpm preview` | 在本地预览已生成的生产构建 |

使用 `pnpm preview` 前，请先执行构建。部署时，将 `dist/` 中的内容发布到静态网站托管服务即可。

## 配置示例

在演示页面选择 `button`、`tabs` 或 `modal`，可以加载对应示例的默认参数。应用精确配置的方法如下：

1. 展开 **Edit the exact configuration**。
2. 粘贴完整基础配置，如 `configs/button.json`、`configs/tabs.json` 或 `configs/modal.json`，也可使用在线编辑器导出的兼容 schema version 1 配置。
3. 点击 **Apply configuration**。

配置包含组件类型，应用后会切换到对应示例。也可以在启动或构建前修改 [`config.json`](config.json)，设置初始示例。通过导航切换示例时，会加载新示例的默认配置。

支持补间与弹簧过渡、延迟、缓动、变换值，以及物理型弹簧参数。非法或不兼容的配置会被拒绝，并显示校验提示。播放控件支持暂停与继续；示例会实时响应系统 `prefers-reduced-motion` 设置。

## 使用对应 Prompt 复刻

[`prompts/`](prompts/) 中的三份基础 Prompt 包含对应示例的交互规则、精确 JSON 配置，以及 Motion 状态和过渡契约，与 [`configs/`](configs/) 中的配置一一对应。独立的闪电岛扩展请按其 [Prompt](prompts/lightning-island/interaction-effects.md) 和源码使用，不适用下面的基础编辑器导入步骤。

1. 从上表选择配套的配置和 Prompt。
2. 将 Prompt 与本仓库的实现及依赖模块一起使用。
3. 将 Prompt 中的 **Exact configuration** 应用到演示页面，或保存为 `config.json`。
4. 执行 `pnpm test` 和 `pnpm build`。
5. 在浏览器中检查指针与键盘输入、重复操作、动画打断、暂停继续和减少动态效果。

仓库中的源码与经过校验的配置共同定义参考行为。使用 AI 生成其他实现后，应按照该契约验收；仅凭自然语言输入无法保证生成逐字节相同的代码。基础示例使用本包的简化样式复现对应交互和参数。

## 源码导航

| 路径 | 职责 |
| --- | --- |
| [`src/main.tsx`](src/main.tsx) | 示例导航、JSON 编辑器和播放控件 |
| [`src/Preview.tsx`](src/Preview.tsx) | 按钮、Tab 和对话框的渲染与交互 |
| [`src/model.ts`](src/model.ts) | 配置校验、状态映射和 Motion 规格 |
| [`src/easing.ts`](src/easing.ts) | 缓动配置的校验与计算 |
| [`src/useDetailPlayback.ts`](src/useDetailPlayback.ts) | 播放状态和动画时钟控制 |
| [`src/usePrefersReducedMotion.ts`](src/usePrefersReducedMotion.ts) | 实时响应系统动态效果偏好 |
| [`src/model.test.ts`](src/model.test.ts) | 配置往返、参数边界和交互契约测试 |
| [`src/style.css`](src/style.css) | 系统字体、演示样式和响应式布局 |
| `configs/` / `prompts/` | 配套的配置快照与实现 Prompt |

## 发布包完整性

GitHub 发布包包含 `SOURCE_MANIFEST.json`，记录导出文件的路径、字节长度和 SHA-256 哈希。为避免循环摘要，该文件不记录自身哈希。每个 Release 还提供用于验证 ZIP 的 `SHA256SUMS.txt`。

将 ZIP 与校验文件下载到同一目录，然后执行：

```sh
# macOS
shasum -a 256 -c SHA256SUMS.txt
```

```sh
# Linux
sha256sum -c SHA256SUMS.txt
```

清单描述的是发布时的文件快照。自行修改其中的文件后，文件哈希也会改变。

## 参与贡献

欢迎提交问题反馈，以及针对公开基础示例的改进。开发流程和验证要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。Issue 和 Pull Request 均可使用中文或英文。

## 许可证

本仓库的源码与文档采用 [MIT 许可证](LICENSE)。React、React DOM、Motion 及开发依赖分别保留其上游许可证。

基础示例使用系统字体，不包含参考图片、打包字体、本地运行记录或部署配置。本仓库的许可证适用于在此发布的文件；网站素材及其他第三方内容分别遵循各自的许可。
