# 粒子海浪 · Particle Tide

[English](README.md) · **简体中文**

粒子构成连续起伏的海面，可移动指针涌浪、点击叠加涟漪。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/particle-tide) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/particle-tide/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

目录悬停播放，详情自动流动；点击海面或按 Enter / 空格产生带明亮浪峰的扩散涟漪。

## 起点与终点

画布 320 × 230；平移 0, 0px；缩放 1。海浪持续前进，不反向返回初态。

## 时序

基础时钟 12000 ms，延迟 0 ms；海浪速度 1×。循环回绕累计时间，不重置海面；速度为 0 保持当前帧。

## 进入与退出

目录悬停播放，离开恢复静态海面；详情自动播放。持续流动。指针带动局部涌浪与轻微视差。点击叠加涟漪，最多保留 12 圈；Tab 聚焦后 Enter / 空格在中央触发。

## 重复操作与打断

播放按钮暂停并保持海面与涟漪进度，再次播放接续当前画面；调节外观与海浪速度保留累计时间。观察倍速、指针位置和运行中的涟漪不写入 JSON。

## 减少动态效果

遵循系统减少动态效果设置，只显示静态海面，关闭涌浪、点击涟漪和循环。

## 粒子海浪设置

背景 #242426；水体 #B9B9C2；浪峰 #FFFFFF；密度 1；大小 1；浪高 1；波长 1；速度 1；指针交互 true；点击涟漪 true。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
