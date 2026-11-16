import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  conicOrbDemo, conicOrbGeometry, conicOrbSpring, conicOrbStep, conicOrbVisibility,
} from './conic-scroll-orb';

export function conicOrbDescription(language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  return {
    title: en ? 'Conic Scroll Orb' : '环形渐变滚动球',
    summary: en ? 'A grayscale scroll indicator with a quarter-distance step back.' : '显示滚动进度并支持回退四分之一的灰阶进度球。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll inside the reading pane. Click the orb or press Enter or Space on it to scroll back by 25% of the full travel.'
        : '在阅读区内滚动。点击球体或聚焦后按 Enter、空格，回退总可滚动距离的 25%。'},
      {label: en ? 'Start and end' : '起点与终点', text: en
        ? 'The 46 px orb fills clockwise from 220°. The ring and integer label share a bounded progress value from 0% to 100%.'
        : '46 像素圆球从 220° 顺时针填充。圆环与整数百分比共用 0% 到 100% 的显示进度。'},
      {label: en ? 'Timing' : '时序', text: en
        ? 'The spring follows actual scroll progress with stiffness 210, damping 25, and mass 0.85.'
        : '弹簧跟随真实滚动进度，刚度 210、阻尼 25、质量 0.85。'},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'With more than 320 px of travel, show the orb past 72 px and hide it at or below 72 px. Opacity transitions over 180 ms to 0.78 at rest and 0.93 on hover.'
        : '可滚动距离超过 320 像素时，滚过 72 像素显示球体，回到 72 像素以内隐藏。透明度过渡为 180 毫秒，常态为 0.78，悬停为 0.93。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Each activation uses the current scroll position. Manual scrolling can take over. Play moves to 65% and then back to 40%. Pause holds the demo and Replay starts at the top.'
        : '每次触发都以当前位置为起点，手动滚动可随时接管。播放演示滚到 65% 再回退到 40%。暂停保持演示位置，重播从顶部开始。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Progress, visibility and step-back update immediately. Play jumps to 65%.'
        : '进度、显隐和回退均即时更新。播放直接跳到 65%。'},
      {label: en ? 'Implementation' : '来源', text: 'src/ConicScrollOrbPreview.tsx'},
    ],
  };
}

export function conicOrbMotion(config: HistoryConfig) {
  return {
    component: 'Conic Scroll Orb',
    terminology: {id: 'conic-scroll-orb', englishTerm: 'Conic Scroll Orb'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Jump progress, opacity, and quarter steps. Play jumps to the sample position.'},
    adapters: {
      conicScrollOrb: {
        geometry: conicOrbGeometry,
        spring: conicOrbSpring,
        visibility: conicOrbVisibility,
        stepBackFraction: conicOrbStep,
        demo: {fraction: conicOrbDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Measure only the bound pane. Divide its scrollTop by scrollHeight minus clientHeight, or use zero when there is no travel. Retarget one spring from actual scroll on each update and clamp its display to 0–100. Use that percentage for the conic stop and round it for the label. On button activation, use native smooth scrolling to the current scrollTop minus a quarter of the full travel, clamped at zero. Use an instant scroll and skip the spring and transitions with reduced motion.',
      },
    },
  };
}
