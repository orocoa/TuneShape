# 阅读进度胶囊 · Scroll Progress

[English](README.md) · **简体中文**

圆环跟随真实阅读进度，悬停胶囊自动展开，点击章节定位。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/scroll-progress) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/scroll-progress/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/scroll-progress/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

滚动阅读区，圆环和当前章节同步更新；鼠标悬停当前章节胶囊自动展开目录，不移动键盘焦点；移出胶囊和展开菜单区域自动收合，菜单内移动保持展开；点击章节平滑定位并收合。触屏点按或键盘激活胶囊仍可展开并聚焦当前章节。点击外部或 Escape 关闭，方向键与 Home / End 移动焦点，Enter / 空格选择。

## 起点与终点

初始阅读进度 0%，默认展开 false。文章标题「Attention Is All You Need」，共 4 章，按以下顺序渲染：1.「Introduction」（id introduction），正文「The 2017 paper introduced the Transformer, a model first tested on machine translation. It replaces recurrent and convolutional layers with attention, allowing more of the training computation to run in parallel.」；2.「Self-Attention」（id self-attention），正文「Each token creates a query, a key and a value. The query is compared with keys to assign attention weights. A weighted combination of values gives that token information from relevant parts of the sequence.」；3.「Multi-Head Attention」（id multi-head-attention），正文「Several attention heads work in parallel, learning different relationships between tokens. Their outputs are combined into one representation. Positional encodings add information about token order, which attention alone does not provide.」；4.「The Transformer」（id transformer），正文「An encoder builds representations of the input. A decoder uses those representations and earlier output tokens to predict the next token. A mask hides future output tokens during training. Both stacks also contain feed-forward layers. The paper demonstrated strong translation results with less sequential computation.」。面板可编辑标题、章节名称与正文，添加、删除及重排章节；这些内容随配置保存。

## 时序

展开与定位响应基准 500 ms，解析弹簧保留当前位置和速度；圆环响应上限 450 ms、层切换上限 240 ms、章节文字交叉淡化上限 220 ms。目录条目按响应时长的 6% 逐项错峰进入。

## 进入与退出

收合胶囊按当前章节测量宽度，展开为圆角目录，文字与圆点逐项淡入并轻移。章节识别偏移 120px，距底部 24px，字号 14px，强调色 #222222，配色 light。长标题换行并重新测量尺寸。

## 重复操作与打断

快速选择从当前位置接续。点击定位会保留章节选择，下一次真实滚轮、触屏或滚动按键解除锁定。暂停、后台和隐藏预览冻结动效与程序定位；继续后接续。工具栏演示一次展开、定位和返回。实际阅读位置、开合、焦点和观察倍速不保存到 JSON。

## 减少动态效果

圆环、开合和章节定位直接到位，关闭自动演示；真实滚动、目录选择与键盘仍可使用。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
