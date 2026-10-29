# 逐字解码 · Encrypted Text

[English](README.md) · **简体中文**

逐字解码 · 可编辑内容与实时参数

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/encrypted-text) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/encrypted-text/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情页自动解码一次，点击文字或播放按钮重播；目录中悬停演示，移开保留完整文字。按 Tab 聚焦后可用 Enter 或空格重播。

## 起点与终点

原文 "Lorem ipsum"；字符集 "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?"，噪声色 #999999 → 原文色 #171717，字号 16px。空白保留，支持 Unicode 码点，字符宽度不被噪声撑动。

## 时序

完整解码 550 ms，逐字间隔 50 ms；噪声刷新 50 ms，开始延迟 0 ms。完成后保持原文，不自动循环。这是视觉解码，不用于数据加密。

## 进入与退出

未揭示字符持续变换，按顺序归位为原文；完成后保持原文，再次触发从头解码。

## 重复操作与打断

暂停、预览隐藏和页面进入后台时冻结当前时钟，继续从当前进度接续。更改内容和常用参数同步预览、说明、Motion、JSON 与导出。焦点、实际输入、当前选择、播放进度和观察倍速不写入配置。

## 减少动态效果

系统要求减少动态效果时直接呈现可读文字或目标状态，保留原生输入、菜单、焦点与键盘操作，不自动循环。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
