# 磨砂文件夹 · Glass Folder

[English](README.md) · **简体中文**

磨砂翻盖向前倾斜，文件卡片错峰扇开并抬起。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/glass-folder) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/glass-folder/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-folder/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

悬停或键盘聚焦时轻展文件；点击、Enter / 空格切换完整展开。移开鼠标、离焦、点击外部或 Escape 收合；触屏点按切换，点按外部收合。

## 起点与终点

名称「」（留空隐藏），3 份文件：Notes / Draft / Ideas。配色 white，尺寸 md（1×），默认展开 false。展开抬升 175px，半侧间距 68px。

## 时序

弹簧响应基准 800 ms，轻微回弹，卡片按响应时长的 6% 逐张错峰；收回时不加延迟。观察倍速只影响运行时钟，不改变保存的响应时长。

## 进入与退出

静止翻盖倾斜 15°，悬停抬升 20px；完整展开时翻盖倾斜 55°，卡片半侧扇开 16°。名称、标题和摘要使用真实文字，空摘要显示纸张线条。

## 重复操作与打断

反复点击从当前画面和速度接续。暂停、后台与隐藏预览冻结弹簧、错峰延迟和演示阶段；继续后接续。播放按钮演示轻展、展开和返回一次；尺寸、配色与内容立即更新，几何参数修改自动演示。运行时的悬停、焦点、展开状态与观察倍速不写入 JSON。

## 减少动态效果

直接到达当前交互状态，跳过错峰和自动演示；点击、聚焦和触屏仍可使用。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
