import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {defaultMonochromeOrb, monochromeOrbGeometry, monochromeOrbSpringFor, monochromeOrbVisibility} from './monochrome-scroll-orb';

export function monochromeOrbDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const {size, innerDiameter, trackRadius, trackWidth, arcWidth} = monochromeOrbGeometry;
  const {stiffness, damping, mass} = monochromeOrbSpringFor(config.monochromeScrollOrb);
  const theme = config.monochromeScrollOrb?.theme ?? defaultMonochromeOrb.theme;
  return {
    title: en ? 'Monochrome Scroll Orb' : '单色滚动球',
    summary: en ? 'A grayscale reading indicator with spring-driven progress.' : '由弹簧驱动的灰阶阅读进度球。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll the pane to drive the indicator. Give the return button a visible keyboard focus and a progress label.'
        : '滚动阅读区驱动指示器。回顶按钮保留可见键盘焦点和进度标签。'},
      {label: en ? 'Structure' : '起点与终点', text: en
        ? `Use a ${size} px grayscale SVG with a ${innerDiameter} px disc, a ${trackWidth} px track at radius ${trackRadius} px and a clockwise ${arcWidth} px rounded arc. Use theme ${theme}. In light mode the disc and arc use #363636, the track #B9B9B9 and the digits #E8E8E8. In dark mode use #C9C9C9, #626262 and #303030 respectively. Show a centered 14 px monospaced integer without a percent sign; hide the arc at 0 and close it at 100.`
        : `绘制 ${size} 像素灰阶 SVG，实心圆直径 ${innerDiameter} 像素，底轨半径 ${trackRadius} 像素、宽 ${trackWidth} 像素，圆头进度弧宽 ${arcWidth} 像素。当前主题为 ${theme}。浅色的圆盘与圆弧、底轨、数字分别用 #363636、#B9B9B9、#E8E8E8，深色分别用 #C9C9C9、#626262、#303030。居中显示 14 像素等宽整数，无百分号，0 时隐藏进度弧，100 时闭合。`},
      {label: en ? 'Spring' : '时序', text: en
        ? `Drive the arc and number with the same spring (stiffness ${stiffness}, damping ${damping}, mass ${mass}). Retarget from the displayed value when settings change.`
        : `弧线和数字共用一个弹簧，刚度 ${stiffness}、阻尼 ${damping}、质量 ${mass}。更改参数时从当前显示值继续追踪。`},
      {label: en ? 'Visibility' : '进入与退出', text: en
        ? 'When travel exceeds 320 px, fade in over 180 ms past 80 px and out over 150 ms at or below 40 px. Restore focus to the reading pane on exit. Hover changes track contrast over 140 ms.'
        : '滚动距离超过 320 像素时，滚过 80 像素用 180 毫秒淡入，回到 40 像素以内用 150 毫秒淡出。淡出时交还焦点。悬停在 140 毫秒内改变底轨对比度。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Retarget the spring on each scroll update. A wheel, touch or scrolling key can take over during a smooth return.'
        : '随每次滚动更新弹簧目标。平滑回顶期间，滚轮、触屏或滚动键可接管。'},
      {label: en ? 'Input and reduced motion' : '减少动态效果', text: en
        ? 'Click, Enter or Space uses native smooth scroll to return to the top. Manual input interrupts. With reduced motion, progress, visibility, hover contrast and return to top update immediately.'
        : '点击、Enter 或空格使用原生平滑滚动回到顶部，手动输入可打断。减少动态效果时进度、显隐、悬停对比度和回顶即时更新。'},
      {label: en ? 'Implementation' : '来源', text: en
        ? 'src/MonochromeScrollOrbPreview.tsx'
        : 'src/MonochromeScrollOrbPreview.tsx'},
    ],
  };
}

export function monochromeOrbMotion(config: HistoryConfig) {
  return {
    component: 'Monochrome Scroll Orb',
    terminology: {id: 'monochrome-scroll-orb', englishTerm: 'Monochrome Scroll Orb'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Jump progress and visibility, disable contrast transitions, and scroll instantly.'},
    adapters: {
      monochromeScrollOrb: {
        settings: {...defaultMonochromeOrb, ...config.monochromeScrollOrb},
        geometry: monochromeOrbGeometry,
        spring: monochromeOrbSpringFor(config.monochromeScrollOrb),
        visibility: monochromeOrbVisibility,
        hoverContrastMs: 140,
        demo: {fraction: .65, legMs: config.durationMs, delayMs: config.delayMs},
        returnToTop: 'native smooth scroll on the bound pane',
        usage: 'Use the pane scrollTop divided by scroll travel as the spring target from 0 to 100. Draw the clockwise arc and round the same spring value for the label. Hide the arc at zero and use an undashed circle at 100. Keep the control inert during exit and return focus to the pane. Theme, stiffness and damping are saved; scroll, visibility, spring velocity and playback state are live.',
      },
    },
  };
}
