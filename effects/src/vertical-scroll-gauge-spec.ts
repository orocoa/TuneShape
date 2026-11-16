import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {defaultVerticalGauge, verticalGaugeDemo, verticalGaugeSpring} from './vertical-scroll-gauge';

export function verticalGaugeDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const reverse = config.verticalScrollGauge?.direction === 'bottom-to-top';
  return {
    title: en ? 'Vertical Scroll Gauge' : '竖向滚动刻度',
    summary: en ? 'A draggable vertical gauge for reading progress.' : '可拖动的竖向阅读进度刻度。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll the reading pane, drag the track, or focus the gauge and use the keyboard.'
        : '滚动阅读区、沿刻度拖动，或聚焦刻度后用键盘操作。'},
      {label: en ? 'Start and end' : '起点与终点', text: en
        ? `The reading pane runs from 0% at the top to 100% at the bottom. The gauge fills ${reverse ? 'bottom to top' : 'top to bottom'}.`
        : `阅读区顶部为 0%，底部为 100%。刻度${reverse ? '由下向上' : '由上向下'}填充。`},
      {label: en ? 'Timing' : '时序', text: en
        ? 'One spring drives the fill and label position with stiffness 300, damping 36, mass 0.6 and rest delta 0.001. The number shows the actual scroll percentage immediately.'
        : '填充与数字位置共用弹簧，刚度 300、阻尼 36、质量 0.6、停止距离 0.001。数字即时显示实际滚动百分比。'},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'The gauge stays visible throughout the article. Tab focus underlines the percentage. Arrows step by 2.5%, Page Up and Page Down by 10%, and Home and End jump to the reading boundaries.'
        : '刻度在整个阅读区持续显示。Tab 聚焦时百分比加下划线。方向键步进 2.5%，Page Up 和 Page Down 步进 10%，Home 和 End 跳到首尾。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Play scrolls to 65% and back. Pause holds the demo and its spring, and manual input cancels playback. Replay starts from the top.'
        : '播放会滚到 65% 再返回。暂停保持演示与弹簧位置，手动操作可打断播放，重播从顶部开始。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'The fill and label follow scroll position immediately, as they do while dragging. Play jumps to the sample position.'
        : '填充和数字位置即时跟随滚动，拖动时也如此。播放直接跳到示例位置。'},
      {label: en ? 'Implementation' : '来源', text: 'src/VerticalScrollGaugePreview.tsx'},
    ],
  };
}

export function verticalGaugeMotion(config: HistoryConfig) {
  return {
    component: 'Vertical Scroll Gauge',
    terminology: {id: 'vertical-scroll-gauge', englishTerm: 'Vertical Scroll Gauge'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Follow actual progress immediately and jump to the demo sample.'},
    adapters: {
      verticalScrollGauge: {
        settings: config.verticalScrollGauge ?? defaultVerticalGauge,
        spring: verticalGaugeSpring,
        geometry: {targetWidthPx: 44, trackWidthPx: 6, trackHeight: 'clamp(42px, 9svh, 75px)', trackInsetPx: 9, labelGapPx: 8},
        demo: {fraction: verticalGaugeDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Bind the gauge to the scrollable reading pane. Normalize its scrollTop by its scroll travel, using zero when travel is zero. Round real progress for the percentage and slider ARIA value. Drive fill height and label position from the same spring; use real progress during capture and reduced motion. For bottom-to-top, anchor the fill at the bottom and reflect both label position and pointer fraction. Keep keyboard steps in reading order. End capture and release listeners on cancellation and unmount. Save only the direction as gauge settings.',
      },
    },
  };
}
