import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {defaultMonochromeOrb, monochromeOrbGeometry, monochromeOrbSpring, monochromeOrbVisibility} from './monochrome-scroll-orb';

export function monochromeOrbDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const theme = config.monochromeScrollOrb?.theme ?? defaultMonochromeOrb.theme;
  const themeName = theme === 'dark' ? (en ? 'Dark' : '深色') : (en ? 'Light' : '浅色');
  return {
    title: en ? 'Monochrome Scroll Orb' : '单色滚动球',
    summary: en ? 'A grayscale reading indicator with spring-driven progress.' : '由弹簧驱动的黑白灰阅读进度指示。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll the reading pane. Click, Enter, or Space returns the pane to the top with native smooth scrolling.'
        : '滚动阅读区。点击球体或按 Enter、空格，用浏览器原生平滑滚动回到阅读区顶部。'},
      {label: en ? 'Start and end' : '起点与终点', text: en
        ? `The ${themeName} orb starts at 0 with an empty arc and ends at 100 with a closed circle.`
        : `${themeName}球体从 0 和空弧开始，到 100 时用完整圆环收尾。`},
      {label: en ? 'Timing' : '时序', text: en
        ? 'One spring drives both the arc and the number with stiffness 210, damping 25, and mass 0.85. Hover changes track contrast over 140 ms.'
        : '圆弧与数字共用弹簧，刚度 210、阻尼 25、质量 0.85。悬停时底轨对比度在 140 毫秒内变化。'},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'With more than 320 px of travel, fade in over 180 ms past 80 px and out over 150 ms at 40 px or less. If focused, return focus to the pane when fading out.'
        : '可滚动距离超过 320 像素时，滚过 80 像素后用 180 毫秒淡入，回到 40 像素以内用 150 毫秒淡出。淡出时若有焦点，将焦点交回阅读区。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Retarget the existing spring on scroll updates. Play scrolls to 65% and back. Pause holds the demo and progress display. Manual input takes over.'
        : '滚动更新时直接重设同一个弹簧的目标。播放会滚到 65% 再返回；暂停会保持演示与显示值，手动操作可接管滚动。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Progress, visibility, hover contrast, and return to top update immediately.'
        : '进度、显隐、悬停对比度及返回顶部均即时更新。'},
      {label: en ? 'Implementation' : '来源', text: 'src/MonochromeScrollOrbPreview.tsx'},
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
        settings: config.monochromeScrollOrb ?? defaultMonochromeOrb,
        geometry: monochromeOrbGeometry,
        spring: monochromeOrbSpring,
        visibility: monochromeOrbVisibility,
        hoverContrastMs: 140,
        demo: {fraction: .65, legMs: config.durationMs, delayMs: config.delayMs},
        returnToTop: 'native smooth scroll on the bound pane',
        usage: 'Use the pane scrollTop divided by scroll travel as the spring target from 0 to 100. Draw the clockwise arc and round the same spring value for the label. Hide the arc at zero and use an undashed circle at 100. Keep the control inert during exit and return focus to the pane. The theme is saved; scroll, visibility, spring velocity and playback state are live.',
      },
    },
  };
}
