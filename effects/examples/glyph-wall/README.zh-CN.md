# 文字解码墙 · Glyph Decode Wall

[English](README.md) · **简体中文**

文字解码墙 · 2600 ms · 原创实现

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/glyph-wall) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/glyph-wall/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glyph-wall/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

目录中进入预览播放扫描，详情中自动运行；词组可悬停或键盘聚焦，点击空白重新排布。 详情中自动扫描，播放按钮暂停或接续当前阶段。词组聚焦时冻结扫描，点击空白或重排按钮开始一轮新排布。

## 起点与终点

字符墙的解码周期进度：0 → 1；整体的横向位移：0 → 0；整体的纵向位移：0 → 0；整体的缩放：1 → 1。

## 时序

扫描 2600 ms，停留 5000 ms，消散 650 ms，轮间停顿 800 ms；整轮 9050 ms。 初始延迟 0 ms。

## 进入与退出

扫描带经过网格时，词组按所在位置逐字解码；完整呈现后停留，再消散回噪声。词组聚焦时清除附近噪声、压暗其余词组并保持当前时钟。按配置重复整轮；每轮是否重排由设置决定。

## 重复操作与打断

暂停保持当前相位、噪声和解码进度，继续时接续。词组悬停和键盘聚焦保持时钟；离开或失焦继续。点击空白重新排布并从头扫描；参数更改从新配置初态重播，不排队。随机种子、聚焦和观察倍速不写入配置。

## 减少动态效果

遵循系统减少动态效果设置，直接显示完整词组；不扫描、不扰动、不循环。观察倍速不写入配置。

## 文字墙设置

词组 "HELLO|TUNESHAPE|EXPLORE|CREATE|IDEA|OROCOA"；排布 scatter；方向 down；字符集 letters；字号 14px；密度 0.7；噪声基础不透明度 0.1；扰动 12Hz；逐字跨度 0.5；扫描带半宽比例 0.09；每轮重排 true；词组色 #171717；噪声色 #777777。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
