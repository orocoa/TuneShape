# 章节进度导航 · Chapter Progress Navigation

[English](README.md) · **简体中文**

等宽章节标签、真实阅读进度和可随时打断的短转场。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/chapter-progress-nav) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/chapter-progress-nav/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/chapter-progress-nav/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

共 3 章：Overview / Process / Details。初始章节为「Overview」。手机使用各章短标签。

## 触发方式

滚动阅读区同步章节细线；点击整行文字直达稳定阅读位置。Tab、Enter、空格及方向键可用，线条本身不接收输入。

## 真实进度

每条细线由该章节实际滚动起点和下一章起点计算；末章以滚动容器底部为终点。反向滚动同步回退，不把章节永久标记为已读。细线位于点击行之外，不可点击、拖动或键盘聚焦。

## 时序

点击先淡出 140 ms，单次提交滚动位置，再淡入 230 ms，共 370 ms。不高速扫过途经内容。目录演示也写入实际滚动位置，进度线不使用计时模拟。

## 进入与退出

导航固定在内容层之外；单次提交目标位置，读者看不到中间章节的快速扫过。完成或中断后移除遮罩并恢复内容交互。当前项在目标内容实际可读时更新。

## 重复操作与打断

最新点击立即替换旧目标，不排队。滚轮、触摸、指针及滚动按键可取消旧转场，内容恢复可操作。暂停或后台冻结转场，继续时接续；离开卡片清理演示并恢复配置起点。手动阅读后停止自动重播，重新进入卡片再演示。

## 外观

配色 auto，强调色 #2447d8；桌面 14px、手机 13px，字重 350；点击行 44px，细线 1px。章节间隔 28px，水平留白 32px，线间距 7px；示例章节最小高度 480px，顶部留白 24px。

## 减少动态效果

Tab 聚焦章节，Enter / 空格进入；左右箭头、Home / End 在导航内移动焦点。键盘进入后把焦点交给目标标题。减少动态效果时直接到位，仍可滚动和点击。导航留在内容变换层之外，只有一套章节项，没有品牌区、方块或圆点。

## 导出与接入

预览、说明、JSON、Motion 参数、离线 HTML 和复刻工程读取同一配置与 DOM 引擎。章节数支持 1–6；临时选择、滚动、焦点和演示时钟不保存。connect 可绑定真实滚动容器或窗口，resolve 对应章节；target 可提供复杂场景的稳定可读落点。传入独立 surface 才对外部内容淡出入，导航须在其外；未传 surface 时直接定位。refresh 用于布局改变。此条目不额外提供图片或视频媒体导出。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
