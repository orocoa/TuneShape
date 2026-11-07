# 平滑光标输入框 · Smooth Caret Input

[English](README.md) · **简体中文**

弹簧光标跟随原生文本选区，保留标准输入作对照。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-106) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-106/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-106/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

在上方输入框输入、点击定位或用方向键移动光标；下方是普通光标对照。刚度越大跟随越快，阻尼越大回弹越少，质量越大惯性越明显。字号、输入宽度和密码类型同时改变真实输入与光标测量。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

平滑输入占位文字: "smooth input"；普通输入占位文字: "normal input"；默认文字: ""；输入类型: "text"；文字大小: 24；输入框宽度: 420；弹簧刚度: 500；阻尼: 30；质量: 0.5；背景颜色: "#f5f4f3"；输入背景: "#fcfcfc"；文字颜色: "#121212"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 520 × 360，整体缩放 1，位置偏移 (0, 0)。

## 时序

光标时序由刚度 500、阻尼 30 和质量 0.5 决定；演示延迟 0 ms。通用时长字段不控制此物理弹簧。

## 进入与退出

弹簧光标跟随原生文本选区，保留标准输入作对照。 演示停止后保留组件的当前交互状态。

## 重复操作与打断

离开目录且失焦、滚出可视区和切换后台会停止演示。实际输入、当前选择与播放进度不覆盖保存的默认值。

## 参数与导出

控件、预览、JSON、Motion 适配器、复刻工程和 HTML 导出共用同一设置对象与渲染器。目录卡片始终显示项目默认预设。

## 减少动态效果

不自动演示，过渡直接呈现目标状态；保留真实输入、按钮、选择和键盘操作。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
