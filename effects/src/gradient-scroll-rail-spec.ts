import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  defaultGradientRail, gradientRailDemo, gradientRailGeometry, gradientRailPalette,
  gradientRailPress, gradientRailSpring,
} from './gradient-scroll-rail';

export function gradientRailDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const reverse = config.gradientScrollRail?.direction === 'bottom-to-top';
  return {
    title: en ? 'Gradient Scroll Rail' : '渐变滚动轨',
    summary: en ? 'A grayscale reading rail that arches on press and hold.' : '长按展开弧形、拖动定位的灰阶阅读轨。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Click the rail to scroll smoothly to that position. A vertical drag starts once movement exceeds 6 px. Holding still for 240 ms opens the arc in place.'
        : '单击轨道可平滑滚到对应位置。纵向移动超过 6 像素即可拖动，原地按住 240 毫秒可先展开弧形。'},
      {label: en ? 'Start and end' : '起点与终点', text: en
        ? `The 32 right-aligned bars stay visible in light gray at 0%. They fill ${reverse ? 'from bottom to top' : 'from top to bottom'} from light to dark gray. Filled bars deepen as progress advances.`
        : `0% 时仍显示 32 根右对齐的浅灰短条。进度${reverse ? '从下向上' : '从上向下'}由浅灰向深灰填充，已填充的短条也会随着进度加深。`},
      {label: en ? 'Timing' : '时序', text: en
        ? 'A continuous center and strength drive the Gaussian width profile. The spring uses stiffness 280, damping 30, and mass 0.65. Reading position responds immediately.'
        : '连续中心和形变强度共同驱动高斯宽度曲线。弹簧刚度为 280、阻尼 30、质量 0.65，阅读位置即时响应。'},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'The bars grow from 8 px toward 36 px on hold. Release settles strength to zero around the last pointer position. Hover leaves the bars at rest.'
        : '长按后短条从 8 像素伸长至最多 36 像素。松开后以最后的指针位置为目标收束强度，悬停时短条保持原状。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Use the press position as the drag origin, or the current pointer position when a stationary hold activates. Apply relative displacement over the 189 px rail height. Play demonstrates filling, Pause holds the scroll, and Replay starts at the top.'
        : '直接拖动以按下位置为起点，原地长按则以成立时的指针位置为起点。拖动时按相对位移除以 189 像素轨道高度换算进度。播放演示填充，暂停保持滚动位置，重播从顶部开始。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Clicks scroll instantly. Hold, drag, and release update the bars immediately. Keyboard steps stay in reading order. Play jumps to 65%.'
        : '单击即时定位。长按、拖动与松开即时更新短条，键盘始终按阅读顺序定位。播放直接跳至 65%。'},
      {label: en ? 'Implementation' : '来源', text: 'src/GradientScrollRailPreview.tsx'},
    ],
  };
}

export function gradientRailMotion(config: HistoryConfig) {
  return {
    component: 'Gradient Scroll Rail',
    terminology: {id: 'gradient-scroll-rail', englishTerm: 'Gradient Scroll Rail'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Scroll instantly on click, update the center and strength immediately, and jump to the demo sample.'},
    adapters: {
      gradientScrollRail: {
        settings: config.gradientScrollRail ?? defaultGradientRail,
        geometry: gradientRailGeometry,
        palette: gradientRailPalette,
        press: gradientRailPress,
        spring: gradientRailSpring,
        demo: {fraction: gradientRailDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Bind the rail to one scrollable pane. Paint fill in the configured direction from normalized scroll progress. Keep physical bar indices in top-to-bottom order and their right edges fixed. Apply 8 + 28 × A × exp(-(i-c)² / (2×2.5²)) to each bar, with one shared center and strength. A click maps its Y along the visible bars to absolute progress, mirrored for reverse. Scroll there using native smooth scrolling unless reduced motion is enabled. A new click replaces the target, and manual input can interrupt it. Start drag when vertical movement exceeds the tolerance and use the press Y as its origin. A stationary hold uses its activation Y as the origin. Add relative Y divided by rail height for top-to-bottom and subtract it for reverse. Clamp and scroll instantly during drag. On release, settle strength to zero around the last center. Clear timers and capture on cancel, blur, or unmount.',
      },
    },
  };
}
