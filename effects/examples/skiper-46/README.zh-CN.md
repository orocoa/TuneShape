# 黏连状态菜单 · Next.js Gooey Menu

[English](README.md) · **简体中文**

黑色圆形标志与三行状态气泡通过 SVG 黏连滤镜展开和收合。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-46) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-46/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-46/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

悬停或聚焦圆形按钮展开气泡，点击切换，Escape 收起。修改框架、版本、错误和路由文字；模糊决定黏连程度，抬升距离与面板宽度改变展开几何。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

框架名称: "Next.js"；版本: "v13.4.8"；错误标签: "Errors"；错误数量: "3"；路由标签: "Route"；路由状态: "Static"；圆形按钮直径: 40；气泡宽度: 200；黏连模糊: 4.4；展开距离: 50；背景颜色: "#ffffff"；菜单颜色: "#000000"；文字颜色: "#ffffff"；错误提示颜色: "#fb2c36"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 440 × 380，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

黑色圆形标志与三行状态气泡通过 SVG 黏连滤镜展开和收合。 演示停止后保留组件的当前交互状态。

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
