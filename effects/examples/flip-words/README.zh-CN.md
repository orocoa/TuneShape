# 词语翻替 · Flip Words

[English](README.md) · **简体中文**

词语翻替 · 可编辑内容与实时参数

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/flip-words) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/flip-words/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/flip-words/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情自动按顺序切换，点击文字或播放按钮立即切换下一项。逐轮循环。目录悬停演示；各项按索引轮换，重复文字也不会卡住。

## 起点与终点

前缀 "Build"，词表 ["beautiful","modern","interactive","creative"]，后缀 "websites with TuneShape"；字号 36px，文字 #737373，切换词 #171717。离场平移 (40, -40)px，放大至 2，模糊 8px。

## 时序

基础切换 500 ms，每字错峰 50 ms，词间空格额外错峰 300ms。单字进入占基础时长 40%，整次切换至少持续到最后一个字入场结束；随后停留 3000 ms。宽度为词表预留，防止后缀跳位。

## 进入与退出

旧词向上偏移、放大并模糊淡出，新词逐字从下方淡入；完成后保留新词。

## 重复操作与打断

暂停、预览隐藏和页面进入后台时冻结当前时钟，继续从当前进度接续。更改内容和常用参数同步预览、说明、Motion、JSON 与导出。焦点、实际输入、当前选择、播放进度和观察倍速不写入配置。

## 减少动态效果

系统要求减少动态效果时直接呈现可读文字或目标状态，保留原生输入、菜单、焦点与键盘操作，不自动循环。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
