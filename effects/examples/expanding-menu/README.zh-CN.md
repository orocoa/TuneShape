# 图标展开菜单 · Expanding Icon Menu

[English](README.md) · **简体中文**

悬停或聚焦图标时，菜单项横向展开，文字与浅色底同步滑入。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/expanding-menu) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/expanding-menu/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/expanding-menu/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 进入与退出

图标固定在左侧；宽度、文字与高亮底色同时展开，移开且失焦后沿同一曲线收回。

## 起点与终点

5 项：Home / Games / Chat / Search / Profile。宽度从 70px 到 130px，高度 50px，图标 28px。

## 触发方式

悬停与 Tab 聚焦展开，移开且失焦收起；左右键、Home / End 移动焦点，Enter / 空格选择，Escape 收起。手机点按展开并选择；预览不跳转页面。

## 时序

每次展开与收起 200 ms，ease-in 曲线 cubic-bezier(.42,0,1,1)。宽度、文字和底色使用同一进度；快速切换从当前画面接续。

## 外观

背景 #f1f1f1，菜单 #ffffff，高亮 #eeeeee，图标与文字 #242424。容器圆角 15px，项目圆角 8px，阴影浓度 0.075。

## 重复操作与打断

目录悬停、聚焦或手机 Preview 顺序演示，移开且失焦、离屏或后台停止，再次进入重播。直接操作菜单优先于演示。详情暂停冻结当前进度，继续从暂停处推进；观察倍速只影响时钟。

## 减少动态效果

不自动轮播演示；悬停、聚焦、点按与键盘立即显示对应文字。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
