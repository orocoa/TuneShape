# TuneShape 全部动效源码

[English](README.md) · **简体中文**

包含当前可见目录的 73 个动效。每项均包含默认配置、可运行入口与中英文说明，共享此目录内的公开渲染源码。

[在线编辑器](https://tuneshape.kai-nex.com/)

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

打开本地服务后选择动效；修改对应 `config.json` 进行复用。构建产物 `dist/` 包含所有独立页面。

| ID | English | 中文 |
| --- | --- | --- |
| basic-button | [Button Press Feedback](examples/basic-button/README.md) | [按钮按压反馈](examples/basic-button/README.zh-CN.md) |
| hover-invert | [Hover Color Transition](examples/hover-invert/README.md) | [悬停配色过渡](examples/hover-invert/README.zh-CN.md) |
| coffee-selector | [Selector](examples/coffee-selector/README.md) | [选择器](examples/coffee-selector/README.zh-CN.md) |
| glass-radio | [Glass Segmented Radio Control](examples/glass-radio/README.md) | [玻璃分段单选](examples/glass-radio/README.zh-CN.md) |
| dropdown | [Dropdown Menu](examples/dropdown/README.md) | [下拉菜单](examples/dropdown/README.zh-CN.md) |
| folder | [Folder](examples/folder/README.md) | [文件夹](examples/folder/README.zh-CN.md) |
| glass-folder | [Glass Folder](examples/glass-folder/README.md) | [磨砂文件夹](examples/glass-folder/README.zh-CN.md) |
| scroll-progress | [Scroll Progress](examples/scroll-progress/README.md) | [阅读进度胶囊](examples/scroll-progress/README.zh-CN.md) |
| hook-sidebar | [Hook Sidebar](examples/hook-sidebar/README.md) | [钩线侧栏](examples/hook-sidebar/README.zh-CN.md) |
| rail-toc | [Rail TOC](examples/rail-toc/README.md) | [纸飞机目录](examples/rail-toc/README.zh-CN.md) |
| card-morph | [Card Expansion](examples/card-morph/README.md) | [卡片展开](examples/card-morph/README.zh-CN.md) |
| typewriter-text | [Typewriter Text](examples/typewriter-text/README.md) | [逐字打出](examples/typewriter-text/README.zh-CN.md) |
| soft-blur-in | [Soft Blur In](examples/soft-blur-in/README.md) | [柔焦入场](examples/soft-blur-in/README.zh-CN.md) |
| short-slide-down | [Short Slide Down](examples/short-slide-down/README.md) | [落词堆叠](examples/short-slide-down/README.zh-CN.md) |
| kinetic-center-build | [Kinetic Center Build](examples/kinetic-center-build/README.md) | [居中推词](examples/kinetic-center-build/README.zh-CN.md) |
| period-drop | [Period Drop](examples/period-drop/README.md) | [句点弹落](examples/period-drop/README.zh-CN.md) |
| outline-trace | [Outline Trace](examples/outline-trace/README.md) | [字形描边](examples/outline-trace/README.zh-CN.md) |
| glyph-anatomy | [Glyph Anatomy](examples/glyph-anatomy/README.md) | [字形构建](examples/glyph-anatomy/README.zh-CN.md) |
| encrypted-text | [Encrypted Text](examples/encrypted-text/README.md) | [逐字解码](examples/encrypted-text/README.zh-CN.md) |
| gooey-input | [Gooey Input](examples/gooey-input/README.md) | [黏性搜索输入](examples/gooey-input/README.zh-CN.md) |
| flip-words | [Flip Words](examples/flip-words/README.md) | [词语翻替](examples/flip-words/README.zh-CN.md) |
| liquid-carousel | [Liquid Image Carousel](examples/liquid-carousel/README.md) | [液态图片轮播](examples/liquid-carousel/README.zh-CN.md) |
| duration-picker | [Duration Input](examples/duration-picker/README.md) | [时长输入器](examples/duration-picker/README.zh-CN.md) |
| rounded-checks | [Rounded Checkboxes](examples/rounded-checks/README.md) | [圆角复选框](examples/rounded-checks/README.zh-CN.md) |
| mini-sidebar | [Page Navigation](examples/mini-sidebar/README.md) | [页面导航](examples/mini-sidebar/README.zh-CN.md) |
| text-rise | [Staggered Character Reveal](examples/text-rise/README.md) | [文字逐字上移揭示](examples/text-rise/README.zh-CN.md) |
| text-scramble | [Local Text Scramble and Recovery](examples/text-scramble/README.md) | [局部字符扰动与恢复](examples/text-scramble/README.zh-CN.md) |
| glyph-wall | [Glyph Decode Wall](examples/glyph-wall/README.md) | [文字解码墙](examples/glyph-wall/README.zh-CN.md) |
| hover-preview | [Hover Preview](examples/hover-preview/README.md) | [文字悬停图片](examples/hover-preview/README.zh-CN.md) |
| album-rail | [Album Rail](examples/album-rail/README.md) | [唱片轨道](examples/album-rail/README.zh-CN.md) |
| orbit-reel | [Orbit Reel](examples/orbit-reel/README.md) | [卡片转轮](examples/orbit-reel/README.zh-CN.md) |
| elastic-reel | [Elastic Reel](examples/elastic-reel/README.md) | [弹性相片卷](examples/elastic-reel/README.zh-CN.md) |
| dots | [Staggered Loading Dots](examples/dots/README.md) | [三点交错跳动](examples/dots/README.zh-CN.md) |
| finger-tap | [Finger Tapping](examples/finger-tap/README.md) | [手指敲击](examples/finger-tap/README.zh-CN.md) |
| typewriter | [Typewriter](examples/typewriter/README.md) | [打字机](examples/typewriter/README.zh-CN.md) |
| yin-yang | [Yin Yang Loader](examples/yin-yang/README.md) | [太极加载](examples/yin-yang/README.zh-CN.md) |
| pulse | [Pulse Scale and Ripple](examples/pulse/README.md) | [脉冲缩放与扩散](examples/pulse/README.zh-CN.md) |
| watercolor-original | [Watercolor Original](examples/watercolor-original/README.md) | [水彩模糊](examples/watercolor-original/README.zh-CN.md) |
| watercolor-flow | [Watercolor Flow](examples/watercolor-flow/README.md) | [细度水彩融合](examples/watercolor-flow/README.zh-CN.md) |
| ascii-sharks | [ASCII Sharks](examples/ascii-sharks/README.md) | [ASCII 鲨鱼群](examples/ascii-sharks/README.zh-CN.md) |
| particle-tide | [Particle Tide](examples/particle-tide/README.md) | [粒子海浪](examples/particle-tide/README.zh-CN.md) |
| chromatic-button | [Chromatic Button](examples/chromatic-button/README.md) | [流彩按钮](examples/chromatic-button/README.zh-CN.md) |
| liquid-glass-logo | [Liquid Glass Logo](examples/liquid-glass-logo/README.md) | [液态玻璃 Logo](examples/liquid-glass-logo/README.zh-CN.md) |
| skiper-46 | [Next.js Gooey Menu](examples/skiper-46/README.md) | [黏连状态菜单](examples/skiper-46/README.zh-CN.md) |
| skiper-98 | [Vertical Tooltip Menu](examples/skiper-98/README.md) | [竖向裁切提示菜单](examples/skiper-98/README.zh-CN.md) |
| skiper-92 | [Vercel Command Search](examples/skiper-92/README.md) | [变形命令搜索](examples/skiper-92/README.zh-CN.md) |
| skiper-91 | [Elastic Video Player](examples/skiper-91/README.md) | [弹性拖动视频播放器](examples/skiper-91/README.zh-CN.md) |
| skiper-81 | [AI Multi Mode Input](examples/skiper-81/README.md) | [AI 多模式输入框](examples/skiper-81/README.zh-CN.md) |
| skiper-83 | [Integration Mention Input](examples/skiper-83/README.md) | [集成提及输入框](examples/skiper-83/README.zh-CN.md) |
| skiper-43 | [Vercel Tooltip](examples/skiper-43/README.md) | [Vercel 图标提示栏](examples/skiper-43/README.zh-CN.md) |
| skiper-56 | [Devouring Details Sign In](examples/skiper-56/README.md) | [粒子消散输入](examples/skiper-56/README.zh-CN.md) |
| skiper-30 | [Oliver Parallax](examples/skiper-30/README.md) | [多列视差画廊](examples/skiper-30/README.zh-CN.md) |
| skiper-17 | [Rotating Scroll Stack](examples/skiper-17/README.md) | [旋转滚动叠卡](examples/skiper-17/README.zh-CN.md) |
| skiper-16 | [Scaling Scroll Stack](examples/skiper-16/README.md) | [缩放滚动叠卡](examples/skiper-16/README.zh-CN.md) |
| skiper-28 | [Perspective Text Scroll](examples/skiper-28/README.md) | [透视滚动文字](examples/skiper-28/README.zh-CN.md) |
| expanding-menu | [Expanding Icon Menu](examples/expanding-menu/README.md) | [图标展开菜单](examples/expanding-menu/README.zh-CN.md) |
| depth-ribbon | [Depth Ribbon](examples/depth-ribbon/README.md) | [纵深图带](examples/depth-ribbon/README.zh-CN.md) |
| passage-gallery | [Passage Gallery](examples/passage-gallery/README.md) | [穿行图库](examples/passage-gallery/README.zh-CN.md) |
| glass-generate | [Glass Generate Button](examples/glass-generate/README.md) | [玻璃生成按钮](examples/glass-generate/README.zh-CN.md) |
| waving-card | [Waving Tilt Card](examples/waving-card/README.md) | [倾斜挥手卡片](examples/waving-card/README.zh-CN.md) |
| reelfolio-rig | [Rig Assembly](examples/reelfolio-rig/README.md) | [机械臂拼接](examples/reelfolio-rig/README.zh-CN.md) |
| bencho-card-swap | [Card Swap](examples/bencho-card-swap/README.md) | [纵深换卡](examples/bencho-card-swap/README.zh-CN.md) |
| bencho-wake-slider | [Wake Slider](examples/bencho-wake-slider/README.md) | [尾波滑杆](examples/bencho-wake-slider/README.zh-CN.md) |
| bencho-image-compare | [Elastic Image Compare](examples/bencho-image-compare/README.md) | [弹性图片比较](examples/bencho-image-compare/README.zh-CN.md) |
| bencho-label-input | [Floating Label Input](examples/bencho-label-input/README.md) | [浮动标签输入](examples/bencho-label-input/README.zh-CN.md) |
| bencho-carousel | [Floating Ring Carousel](examples/bencho-carousel/README.md) | [漂浮转盘轮播](examples/bencho-carousel/README.zh-CN.md) |
| bencho-upload-dropzone | [Upload Dropzone](examples/bencho-upload-dropzone/README.md) | [弹性上传框](examples/bencho-upload-dropzone/README.zh-CN.md) |
| bencho-slide-confirm | [Slide to Confirm](examples/bencho-slide-confirm/README.md) | [滑动确认](examples/bencho-slide-confirm/README.zh-CN.md) |
| bencho-aspect | [Aspect Ratio](examples/bencho-aspect/README.md) | [等面积裁切](examples/bencho-aspect/README.zh-CN.md) |
| bencho-liq-create | [Create Menu](examples/bencho-liq-create/README.md) | [流动创建菜单](examples/bencho-liq-create/README.zh-CN.md) |
| bencho-eye-tracker | [Eye Tracker](examples/bencho-eye-tracker/README.md) | [眼睛跟随](examples/bencho-eye-tracker/README.zh-CN.md) |
| bencho-context-meter | [Context Meter](examples/bencho-context-meter/README.md) | [上下文计量](examples/bencho-context-meter/README.zh-CN.md) |
| page-turn-cards | [Page Turn Cards](examples/page-turn-cards/README.md) | [翻页卡片](examples/page-turn-cards/README.zh-CN.md) |

## 许可与范围

TuneShape 自有代码采用 MIT；第三方改编与字体保留其署名和许可，详见 THIRD_PARTY_NOTICES.txt。个人头像、产品和品牌图形替换为通用原创图形，提示音与视频使用原创演示素材。本包公开动效渲染源码，不包含完整网页编辑器、部署文件、工作记录或账号验证文件。
