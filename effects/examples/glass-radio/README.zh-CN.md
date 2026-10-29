# 玻璃分段单选 · Glass Segmented Radio Control

[English](README.md) · **简体中文**

玻璃分段单选 · 500 ms · Uiverse.io · chase2k25

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/glass-radio) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-radio/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击或使用键盘切换 Silver、Gold、Platinum 单选项，滑块、配色与文字同步响应；选择当前项不重播，悬停不触发切换。 工具栏依次演示 Silver → Gold → Platinum → Silver；暂停保持进度，继续从暂停处接续。

## 起点与终点

初态为 Silver，Gold 与 Platinum 分别位于滑块自身宽度的 100% 和 200%。选中项保持清晰文字与对应的金属表面；导出基础轨道表示 Silver → Gold，交互适配器将同一配置映射为任意两项之间的切换。

## 时序

滑块切换 500 ms，触发延迟 0 ms，弹簧动画（Spring），回弹系数 Bounce 0.24；时长控制节奏，不代表精确落稳时间。配色过渡 400 ms，文字变色 300 ms，均使用 ease-in-out。

## 进入与退出

选择新选项时，滑块移动到对应分段，金属渐变与高光交叉过渡；完成后保持当前选项，重复选择同一项不重播。选择状态不会自动循环。

## 重复操作与打断

使用原生单选按钮，支持 Tab、方向键与空格；每个预览实例使用独立的名称和 ID。选择与焦点属于临时交互状态，不写入 JSON。快速切换停止旧轨迹，从当前画面转向最新目标，不排队。工具栏暂停冻结当前时钟，继续保留进度。

## 减少动态效果

遵循系统 prefers-reduced-motion，跳过延迟、循环和动画，直接呈现目标帧。观察倍速只修改 Motion 控制器 speed，不写入配置。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
