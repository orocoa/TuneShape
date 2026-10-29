# 逐字打出 · Typewriter Text

[English](README.md) · **简体中文**

文字按固定速度逐字打出，末尾光标按时间闪烁。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/typewriter-text) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/typewriter-text/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/typewriter-text/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情进入时播放一次；点击文字、Enter、空格或工具栏播放按钮可重播。目录悬停演示，离开后显示完整文字。

## 起点与终点

文字按固定速度逐字打出，末尾光标按时间闪烁。

## 进入与退出

入场按完整文字时间线展开，完成后保持清晰可读；重播重新执行入场。

## 内容与参数

当前保存设置：{"kind":"typewriter-text","text":"Hello, World!","fontSize":72,"fontWeight":600,"color":"#171717","charsPerSecond":22,"cursor":true,"cursorColor":"#171717"}。文字采用 1280×720 参考画布，预览按可用空间等比缩放。

## 时序

时长基准 4000 ms，起始延迟 0 ms。打字速度 22 字符/秒，完整打字需要 591 ms；总播放至少持续到文字打完。

## 重复操作与打断

重播从头开始；暂停、预览隐藏和页面后台冻结当前时钟。实际旋转角度、选择、观察倍速和播放进度不写入配置。改动参数会同步预览、说明、Motion、JSON 与导出。

## 减少动态效果

直接显示完整文字与静态几何轨道，保留点击聚焦与键盘选择，不自动旋转。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
