# 水彩模糊 · Watercolor Original

[English](README.md) · **简体中文**

两种颜色随纹理流动，形成水彩般的渗透与交融。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/watercolor-original) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/watercolor-original/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/watercolor-original/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

目录悬停播放，详情自动流动。开启指针交互后，移动指针或键盘聚焦可局部晕染。

## 起点与终点

画布 320 × 230；平移 0, 0px；缩放 1。纹理持续变化，无倒放阶段。

## 时序

线性基础时钟 12000 ms，延迟 0 ms，流动速度 0.6×。跨循环累计时间，避免纹理突然跳回。

## 进入与退出

持续流动。目录离开恢复静态预览；指针离开清除局部晕染。指针交互已关闭。

## 重复操作与打断

工具栏暂停保持纹理，再次播放从原进度继续。颜色、外观与速度调节保留累计时间；观察倍速和指针位置不写入 JSON。

## 减少动态效果

遵循系统减少动态效果设置，显示静态水彩，关闭流动与指针晕染。

## 水彩设置

颜色 #0A0A0A / #E0E0E0；速度 0.6；图案缩放 0.6；扭曲速度 0.08；不透明度 1；RGB 亮度偏移 0.15；指针交互 false；指针强度 1。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
