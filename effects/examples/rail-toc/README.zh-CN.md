# 纸飞机目录 · Rail TOC

[English](README.md) · **简体中文**

纸飞机沿层级轨道跟随阅读进度，经过的路径与节点逐步填实。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/rail-toc) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/rail-toc/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击目录或用方向键、Home / End 切换章节。单独预览时，滚轮沿目录移动；开启联动阅读预览后，滚动阅读区同步目录，点击条目滚动到对应标题。

## 起点与终点

目录标题「On this page」，共 8 项，预览章节「Installation」。Installation / ›Prerequisites / ›Installation Steps / ›Configuration / Usage / ›Customizing Content / ››Submenu Content / Features。层级缩进 14px，行距 32px，字号 14px，纸飞机 16px。

## 时序

跟随响应基准 520 ms，解析临界阻尼弹簧保留当前位置与速度；转向响应最多 300 ms。反向目标累计超过 2px 才掉头，防止微小滚动抖动反复转向。

## 进入与退出

纸飞机沿实测目录行中心生成的折线移动，转弯时随切线调整角度；经过部分为实线、未经过部分为虚线，已读节点填实。阅读锚点偏移 96px；联动阅读 false；强调色 #333333，配色 light。

## 重复操作与打断

快速切换从当前位置接续。点击锁定目标章节，下一次真实滚轮、触屏或滚动按键操作后恢复阅读跟踪；接近文末时仍能定位最后一章。暂停、后台和隐藏预览冻结移动、转向、演示与程序滚动，继续后接续。右侧条目与层级立即更新目录和阅读标题；点击项、阅读位置、焦点和观察倍速不保存到 JSON。

## 减少动态效果

纸飞机与阅读位置直接到位，关闭自动往返演示；点击、键盘、真实滚动和节点状态仍可使用。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
