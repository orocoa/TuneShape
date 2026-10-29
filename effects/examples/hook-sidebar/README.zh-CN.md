# 钩线侧栏 · Hook Sidebar

[English](README.md) · **简体中文**

细钩线标记当前项，灰色轨道跟随悬停与焦点。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/hook-sidebar) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/hook-sidebar/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/hook-sidebar/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击菜单项确认选择；悬停或 Tab 聚焦另一项仅显示灰色钩线。上下方向键、Home / End 移动焦点，Enter / 空格确认。

## 起点与终点

组标题「TuneShape」（留空隐藏），共 7 项：Controls / Navigation / Containers / Text / Images / Indicators / Backgrounds。预选「Controls」。最小行高 32px，字号 14px。

## 时序

钩线跟随基准 360 ms，解析临界阻尼弹簧保留当前位置与速度；灰线显隐响应上限 200 ms。此值控制弹簧响应，不是精确的落稳时刻。

## 进入与退出

强调色 #fc4c01 的轨道从列表顶部延伸到选中行中心；悬停在选中项下方时灰线接在其后，上方时只显示弯钩，避免重复覆盖。虚线轨道，light 配色。文字换行后重新测量行中心。

## 重复操作与打断

快速切换从当前位置接续；移开并离焦后灰线淡出，保留选中项。暂停、后台与隐藏预览冻结时钟，继续后接续。播放按钮完成一次往返演示；菜单、标题和外观修改立即更新。点击选择、悬停、焦点和观察倍速不写入 JSON。

## 减少动态效果

选中项和焦点轨道直接到位，关闭自动往返演示；点击与键盘仍可操作。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
