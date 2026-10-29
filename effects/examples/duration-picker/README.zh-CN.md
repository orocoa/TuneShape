# 时长选择器 · Duration Picker

[English](README.md) · **简体中文**

紧凑的时长输入，点击后弹开编辑，确认后重新合拢。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/duration-picker) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/duration-picker/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/duration-picker/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击铅笔展开并聚焦小时输入，修改小时和分钟；点击勾号或 Enter 确认。Escape 撤回到上次确认值并收合，Tab 可切换字段。

## 起点与终点

初始内容 7 h / 25 min；小时范围 0–24，分钟范围 0–60。默认合拢。合拢时为连续胶囊，展开间距 8px；高度 48px，外圆角不超过高度的一半（设置 12px）。

## 时序

弹开与收合响应基准 450 ms，解析阻尼弹簧的回弹系数 0.12；时长控制响应节奏，并非精确落稳时间。段间留白、内圆角、输入宽度、轻微摇摆和铅笔到勾号变形同步。

## 进入与退出

输入负数、小数或超出上限时立即取整并截断到范围，产生短暂轻晃；清空可继续输入，确认后空值记为 0。控件可编辑。配色 light。

## 重复操作与打断

快速点击从当前弹簧位置与速度接续；工具栏暂停、后台与隐藏预览冻结全部时钟，继续后接续。调整间距、回弹或时长自动演示一次。右侧内容参数实时生效并保存；直接在预览中输入的值、确认记录、焦点、展开进度与观察倍速属于临时状态，不写入 JSON。

## 减少动态效果

所有编辑状态立即到位，关闭回弹、摇摆、越界轻晃和自动演示收合；输入、确认、撤回与范围校验照常工作。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
