# AI 多模式输入框 · AI Multi Mode Input

[English](README.md) · **简体中文**

带附件、搜索、DeepMind 和模型选择的多行输入；提交内容只保存在当前演示。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-81) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-81/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-81/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

输入消息，Enter 本地发送，Shift+Enter 换行。加号选择附件；Search、DeepMind 可切换，模型菜单从保存的模型列表选择。默认模型须属于列表，模式开关设置的是下一次初始状态。回复文字与延迟可以调节，延迟单位为毫秒（1000 为 1 秒）；仅为本地演示，不调用 AI。修改配置取消旧的待发回复，下次发送使用当前设置。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

输入提示: "Ask Anything"；输入区宽度: 744；输入文字大小: 16；输入区圆角: 16；画布背景: "#f1f1f1"；输入区底色: "#f9f8f8"；按钮底色: "#f9f8f8"；文字颜色: "#121212"；选中颜色: "#0ea5e9"；模型列表（每行一项）: "GPT-4o\nClaude 3.5 Sonnet\nGemini Pro\nLlama 3.1"；默认模型: "GPT-4o"；默认开启搜索: false；默认开启 DeepMind: false；本地演示回复: "I dunnoo 😭"；演示回复延迟: 1000；演示输入内容: "Plan a studio"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 768 × 440，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

带附件、搜索、DeepMind 和模型选择的多行输入；提交内容只保存在当前演示。 演示停止后保留组件的当前交互状态。

## 重复操作与打断

离开目录且失焦、滚出可视区和切换后台会停止演示。实际输入、当前选择与播放进度不覆盖保存的默认值。

## 参数与导出

控件、预览、JSON、Motion 适配器、复刻工程和 HTML 导出共用同一设置对象与渲染器。目录卡片始终显示项目默认预设。

## 减少动态效果

不自动演示，过渡直接呈现目标状态；保留真实输入、按钮、选择和键盘操作。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
