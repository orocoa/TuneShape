import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {defaultAsciiSharks} from './ascii-sharks-settings';
import {asciiSharksEngineCode} from './ascii-sharks-engine';
import {sourceNotices} from './source-notices';

export const asciiSharksSourceNote='使用 ASCII Shoal 独立实现，从 Ariadne / TuneShape ASCII 波浪的字符采样与流场方法扩展鱼群绘制和运动。以 MIT 许可提供，保留 2026 KAI-NEX 与 TuneShape contributors 版权声明。';
export function asciiSharksDescription(c:HistoryConfig,language:'zh'|'en'='zh'):Description{
 const s=c.asciiSharks??defaultAsciiSharks,en=language==='en',section=(label:string,zh:string,english:string)=>({label,text:en?english:zh});
 return {title:en?'ASCII Sharks':'ASCII 鲨鱼群',summary:en?'Top-down sharks and small fish drawn on a configurable character grid.':'俯视游动的鲨鱼与小鱼，以可调密度的字符网格构成动态背景。',sections:[
  section('组件','ASCII 鲨鱼群 · ASCII Sharks · 页面与背景','ASCII Sharks · Backgrounds'),
  section('触发方式','目录卡片悬停、聚焦或手机预览时播放；详情自动运行，播放按钮可暂停并接续。','Catalog hover, keyboard focus and mobile Preview start playback. Detail auto-starts; the toolbar pauses and resumes.'),
  section('起点与终点',`画面铺满宿主，字符采样密度 ${s.density}×，字符尺寸 ${s.fontScale}×；鲨鱼 ${s.sharkCount} 条，大小 ${s.sharkScale}×，鱼群密度 ${s.fishDensity}×。`,`Fill the host. Character sampling density ${s.density}×, font scale ${s.fontScale}×; ${s.sharkCount} sharks at ${s.sharkScale}× size, fish density ${s.fishDensity}×.`),
  section('时序',`单次播放时长 ${c.durationMs} ms，触发延迟 ${c.delayMs} ms；游动速度 ${s.speed}×；${c.loop?'持续循环。':`完成 ${c.durationMs} ms 后停止。`}速度为 0 和暂停均保持当前画面；观察倍速只影响运行时。`,`Single-pass duration ${c.durationMs} ms, delay ${c.delayMs} ms; simulation speed ${s.speed}×; ${c.loop?'continuous playback.':`stop after ${c.durationMs} ms.`} Speed 0 and Pause hold the current frame. Observation speed is runtime-only.`),
  section('进入与退出','离开且失焦、滚出可视区或切换后台时停止演示；再次进入可重新播放。背景不反向倒放。','Leaving with no focus, scrolling offscreen and switching to a background tab stop the preview. Re-entry can replay. The background does not reverse.'),
  section('字符密度',`稀疏 0.6×、均衡 1×、细密 1.6×，并可在 0.5–2× 连续调节；密度控制采样网格，字符尺寸控制网格中的字形大小。当前背景网格强度 ${s.gridOpacity}，尾迹强度 ${s.wakeOpacity}。`,`Sparse 0.6×, balanced 1× and fine 1.6× presets, with continuous adjustment from 0.5–2×. Density sets grid sampling; font scale sets glyph size within cells. Background grid opacity ${s.gridOpacity}; wake opacity ${s.wakeOpacity}.`),
  section('重复操作与打断','外观设置来自同一份配置；鱼群位置、累计时钟和目录运行状态不写入 JSON。播放接续暂停位置，重新演示从初态开始。','Appearance comes from one configuration. Fish positions, elapsed time and gallery state are transient. Play resumes a pause; a new demonstration restarts.'),
  section('减少动态效果','遵循系统设置，只呈现静态画面，不自动循环。','Follow the system preference: render a still frame without automatic loops.'),
  section('配色与自主游动',`背景 ${s.backgroundColor}；字符 ${s.inkColor}；字符不透明度 ${s.opacity}；鱼群自主游动，不受鼠标扰动。`,`Background ${s.backgroundColor}; ink ${s.inkColor}; glyph opacity ${s.opacity}; autonomous paths are unaffected by pointer input.`),
  section('来源',asciiSharksSourceNote,'Uses the independent ASCII Shoal implementation, extending character sampling and flow-field methods from Ariadne / TuneShape ASCII Wave with fish rendering and motion. Available under MIT; retain the 2026 KAI-NEX and TuneShape contributors copyright and permission notice.'),
 ]};
}
export function asciiSharksMotion(c:HistoryConfig){return {
 component:'ASCII Sharks',terminology:{id:'ascii-sharks',englishTerm:'ASCII Sharks'},sourceNotice:sourceNotices['ascii-sharks'],canvas:{fit:'responsive',coordinateUnits:'normalized logical pixels; responsive output'},forward:[],reverse:[],
 policies:{trigger:'detail auto-start; catalog hover, focus or mobile Preview',repeat:c.loop?Infinity:0,previewTransport:'pause/resume preserve simulation; a new demonstration resets',reduceMotion:'static poster, no loops',pointer:'ignored; autonomous paths',observationSpeed:'runtime only; never serialized'},
 adapters:{asciiSharks:{settings:c.asciiSharks??defaultAsciiSharks,runtime:{durationMs:c.durationMs,delayMs:c.delayMs,loop:c.loop},engineCode:asciiSharksEngineCode,usage:'Evaluate engineCode and call createAsciiSharks(emptyHost, settings, {enabled:true,paused:false,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,speed:1,language:"en",...runtime,onRunning}). Give the host an explicit width and height; the engine fills it and observes resizing. update(settings, fullRuntime) changes settings/transport, demonstrate() resets playback, settle() freezes, destroy() releases canvas/listeners. Use offsetX/offsetY/scale on an outer wrapper. Settings density controls character sampling; fontScale independently controls glyph size. Keep the ASCII Shoal sourceNotice with its MIT copyright and permission notice.'}},
};}
