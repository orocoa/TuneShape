# 卡片转轮 · Orbit Reel

[English](README.md) · **简体中文**

旋转的卡片圆环，点击后展开为可切换的弧形。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/orbit-reel) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/orbit-reel/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/orbit-reel/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情自动播放，目录悬停演示。点击卡片展开弧形；再次点击居中的卡片放大，再点一次还原；点击空白、All cards 或按 Escape 返回圆环。

## 起点与终点

初始视图 ring，18 张卡片，由 6 幅原创插画完整重复。圆环居中，弧形顶点位于画布高度的 42%。

## 时序

视图切换与吸附 700 ms，固定三次方缓出。圆环转速 8°/s，弧形轮播间隔 3.5s；观察倍速只影响运行时钟。

## 进入与退出

卡片悬停或键盘聚焦时暂停自动运动。拖动圆环或横向拖动弧形，松开吸附到卡片；左右按钮和方向键可切换。纵向滚动留给页面；横向滚轮或 Shift + 滚轮可翻页。

## 重复操作与打断

快速操作从当前位置转向最新目标，不排队。暂停冻结旋转、翻面与吸附，继续时接续。自动运动持续重复。视图、选中卡片、拖动位置与观察倍速不写入 JSON。

## 减少动态效果

关闭自动旋转、轮播与翻面；点击、拖动和键盘切换直接到位。

## 转轮设置

数量 18；转速 8；间隔 3.5；弧度 1；比例 0.8；圆角 0.07；间距 0.18；自动轮播 true；倾斜 true；翻面 true；悬停暂停 true；背面 #171717；背景 #F1F1F1。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
