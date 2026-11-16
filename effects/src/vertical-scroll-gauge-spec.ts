import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {defaultVerticalGauge, verticalGaugeDemo, verticalGaugeSpringFor} from './vertical-scroll-gauge';

export function verticalGaugeDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const {direction} = {...defaultVerticalGauge, ...config.verticalScrollGauge};
  const {stiffness, damping, mass, restDelta} = verticalGaugeSpringFor(config.verticalScrollGauge);
  return {
    title: en ? 'Vertical Scroll Gauge' : '竖向滚动刻度',
    summary: en ? 'A draggable vertical gauge for reading progress.' : '可拖动的竖向阅读进度刻度。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll inside the pane or seek using the gauge\'s pointer and keyboard input.'
        : '在阅读区内滚动，或用指针和键盘操作刻度定位。'},
      {label: en ? 'Structure' : '起点与终点', text: en
        ? `Use an always-visible 6 px rounded track (height clamp(42px, 9svh, 75px)) in #38434E, with a #AEBBD4 fill and a #CFDBF0 11 px percentage label next to the moving endpoint. Fill it in the ${direction} direction. Reading stays at 0% at the top and 100% at the bottom in either direction.`
        : `常驻的圆头竖轨宽 6 像素，高度为 clamp(42px, 9svh, 75px)，底轨使用 #38434E、填充使用 #AEBBD4，移动端点旁显示 #CFDBF0 的 11 像素百分比。当前方向为 ${direction}，两个方向下阅读区都从顶部 0% 到底部 100%。`},
      {label: en ? 'Spring' : '时序', text: en
        ? `Drive fill and label position with one spring (stiffness ${stiffness}, damping ${damping}, mass ${mass}, rest delta ${restDelta}). The label and slider ARIA value show actual progress immediately.`
        : `填充与数字位置共用弹簧，刚度 ${stiffness}、阻尼 ${damping}、质量 ${mass}、停止距离 ${restDelta}。显示数字和滑块的 ARIA 值即时使用实际进度。`},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'Keep the gauge visible from start to end, including while its fill is empty.'
        : '从首到尾保持刻度可见，进度为空时也显示底轨。'},
      {label: en ? 'Input and interruption' : '重复操作与打断', text: en
        ? 'Click to seek smoothly, or drag to seek instantly. Mirror pointer mapping in reverse. Manual input interrupts a smooth seek. Tab focus underlines the label. Arrow keys step by 2.5%, Page Up and Page Down by 10%, and Home and End go to the boundaries.'
        : '单击平滑定位，拖动即时跟手，反向时镜像指针映射。手动输入可打断定位。Tab 聚焦时数字加下划线。方向键步进 2.5%，Page Up 和 Page Down 步进 10%，Home 和 End 跳到首尾。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Click and fill tracking become immediate. Release capture and listeners on cancel or unmount.'
        : '单击定位和进度跟随即时完成。取消或卸载时清理指针捕获和监听。'},
      {label: en ? 'Implementation' : '来源', text: en
        ? 'src/VerticalScrollGaugePreview.tsx'
        : 'src/VerticalScrollGaugePreview.tsx'},
    ],
  };
}

export function verticalGaugeMotion(config: HistoryConfig) {
  return {
    component: 'Vertical Scroll Gauge',
    terminology: {id: 'vertical-scroll-gauge', englishTerm: 'Vertical Scroll Gauge'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Scroll instantly on click, follow actual progress immediately, and jump to the demo sample.'},
    adapters: {
      verticalScrollGauge: {
        settings: {...defaultVerticalGauge, ...config.verticalScrollGauge},
        spring: verticalGaugeSpringFor(config.verticalScrollGauge),
        geometry: {targetWidthPx: 44, trackWidthPx: 6, trackHeight: 'clamp(42px, 9svh, 75px)', trackInsetPx: 9, labelGapPx: 8},
        demo: {fraction: verticalGaugeDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Bind the gauge to the scrollable reading pane. Normalize its scrollTop by its scroll travel, using zero when travel is zero. Round real progress for the percentage and slider ARIA value. Drive fill height and label position from the same spring. Click to scroll smoothly and drag to update the pane and gauge instantly. Manual input can interrupt a smooth scroll. With reduced motion, use instant scrolling and real progress for both fill and label position. For bottom-to-top, anchor the fill at the bottom and reflect both label position and pointer fraction. Keep keyboard steps in reading order. End capture and release listeners on cancellation and unmount. Save direction and damping as gauge settings.',
      },
    },
  };
}
