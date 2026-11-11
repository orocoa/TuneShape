# 滑动确认 · Slide to Confirm

[English](README.md) · **简体中文**

滑块到达终点后向左舒展成确认胶囊，未完成时弹回。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/bencho-slide-confirm) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/bencho-slide-confirm/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-slide-confirm/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 自定义

速度 50、宽度 280px、圆角 28px。必须到达终点才确认；方向键调整，End 到终点，Enter 确认，Escape 复位。

## 触发方式

主动拖动滑块到终点后松开才确认；方向键调整，End 到终点后按 Enter / 空格确认。悬停、聚焦及播放不会自动确认。

## 起点与终点

从配置的初始外观进入操作状态；文件完成与滑动确认短暂停留后复位，菜单选择后收起，上下文支持撤销。

## 重复操作与打断

手动输入取消等待演示；暂停冻结当前状态，继续后接续；离开时释放拖动，销毁清理时钟、监听与声音。

## 时序

响应基准 600 ms；观察倍速不写入配置。

## 进入与退出

目录卡片保持待机，需主动拖动或键盘操作；未到终点松手或取消拖拽会返回起点。离屏及后台暂停，操作不会打开详情。

## 减少动态效果

停止自动演示与眼睛漂浮；拖动、选择与键盘仍可用，结果直接呈现。

## 临时状态

当前文件、进度、确认结果、菜单选择、眼睛位置和压缩状态均不保存；只导出内容与 Customize 参数。

## 声音

真实操作声音开启，音量 35%；自动演示静音。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
