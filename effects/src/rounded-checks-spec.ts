import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {evaluateBezier} from './easing';
import {defaultRoundedChecks,roundedChecksEngineCode} from './rounded-checks';
import {sourceNotices} from './source-notices';
export const checksSourceNote='改编自 Uiverse.io · uiverse-astronaut 的复选框示例（MIT）。保留原例的圆角与勾选过渡，可调整内容、默认勾选和外观。';
export function checksRuntime(c:HistoryConfig){
 const curve=c.easing;
 return {durationMs:c.durationMs,delayMs:c.delayMs,interruption:c.interruption,cssEasing:Array.isArray(curve)&&curve.length===4?`cubic-bezier(${curve.join(',')})`:`linear(${Array.from({length:101},(_,i)=>evaluateBezier(i/100,curve)).join(',')})`};
}
export function checksDescription(c:HistoryConfig,language:'zh'|'en'='zh'):Description{
 const s=c.roundedChecks??defaultRoundedChecks,en=language==='en',section=(label:string,zh:string,english:string)=>({label,text:en?english:zh});
 return {title:en?'Rounded Checkboxes':'圆角复选框',summary:en?'Independent native checkboxes with a soft fill and checkmark transition.':'可独立勾选的偏好列表，方框填色与勾号柔和过渡。',sections:[
  section('组件','圆角复选框 · Rounded Checkboxes · 控件','Rounded Checkboxes · Controls'),
  section('触发方式','点击方框或整行文字切换该项，Tab 聚焦后按空格勾选；各项独立，可多选。工具栏播放按钮演示首项切换后还原。','Click a checkbox or its label; Tab focuses and Space toggles. Each item is independent. The toolbar toggles the first item and restores it once.'),
  section('起点与终点',s.items.map(item=>`${item.checked?'已勾选':'未勾选'}：${item.label}`).join('；')+`。方框 ${s.size}px，边线 1.5px，圆角 ${s.radius}px，项间距 ${s.rowGap}px，文字间距 ${s.labelGap}px，字号 ${s.fontSize}px。`,s.items.map(item=>`${item.checked?'Checked':'Unchecked'}: ${item.label}`).join('; ')+`. Box ${s.size}px plus a 1.5px border, radius ${s.radius}px, row gap ${s.rowGap}px, label gap ${s.labelGap}px, font ${s.fontSize}px.`),
  section('时序',`填色、边线与勾号缩放 ${c.durationMs} ms；勾号透明度 ${Number((c.durationMs*180/220).toFixed(2))} ms，延迟 ${c.delayMs} ms。同一配置曲线 ${checksRuntime(c).cssEasing}。`,`Fill, border and checkmark scale: ${c.durationMs} ms; checkmark opacity: ${Number((c.durationMs*180/220).toFixed(2))} ms; delay: ${c.delayMs} ms; curve: ${checksRuntime(c).cssEasing}.`),
  section('进入与退出',`未选中背景 ${s.boxColor}、边线 ${s.borderColor}；选中填色 ${s.checkedColor}、勾号 ${s.checkColor}，缩放 0.6 → 1、透明度 0 → 1。取消勾选反向过渡。文字色 ${s.textColor}。${s.disabled?'当前已禁用。':'支持触摸与键盘。'}`,`Unchecked fill ${s.boxColor}, border ${s.borderColor}; checked fill ${s.checkedColor}, mark ${s.checkColor}, scale 0.6 → 1 and opacity 0 → 1. Unchecking reverses the transition. Text ${s.textColor}. ${s.disabled?'Currently disabled.':'Touch and keyboard supported.'}`),
  section('重复操作与打断','快速切换转向最新状态，不排队。暂停、隐藏页面和预览停用时冻结时钟，继续后接续。右侧默认勾选写入配置；预览内的实际勾选与焦点属于临时状态，观察倍速不写入 JSON。','Rapid toggles target the latest state without a queue. Pause, hidden pages and inactive previews freeze clocks; resume continues. Inspector defaults are saved; preview selections, focus and observation speed are transient.'),
  section('减少动态效果','切换立即到位，保留多选、触摸、焦点环和禁用语义；播放按钮立即切换首项，不自动还原。','Transitions settle immediately. Multi-select, touch, focus rings and native disabled semantics remain. Play toggles the first item instantly without a timed return.'),
  section('轨道明细','预览、离线 HTML 与复刻工程共享同一原生 checkbox 渲染器。颜色、尺寸、内容、初始勾选来自 roundedChecks；时长、延迟、曲线和打断方式来自主配置。','Preview, offline HTML and replay projects use the same native checkbox engine. Appearance and initial content come from roundedChecks; duration, delay, curve and interruption come from the main config.'),
  section('来源',checksSourceNote+' https://uiverse.io/uiverse-astronaut/witty-bird-51','Adapted from https://uiverse.io/uiverse-astronaut/witty-bird-51 by uiverse-astronaut (MIT). Native controls and parameter editing added; no remote font requests.'),
 ]};
}
export function checksMotion(c:HistoryConfig){return {component:'Rounded Checkboxes',terminology:{id:'rounded-checks',englishTerm:'Rounded Checkboxes'},sourceNotice:sourceNotices['rounded-checks'],forward:[],reverse:[],policies:{repeat:0,reduceMotion:'instant independent selection; no timed return',observationSpeed:'runtime.speed only; never serialized'},adapters:{roundedChecks:{settings:c.roundedChecks??defaultRoundedChecks,runtime:checksRuntime(c),engineCode:roundedChecksEngineCode,usage:'Evaluate engineCode and call createRoundedChecks(emptyElement, settings, {enabled:true,paused:false,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,speed:1,language:"zh",...runtime,onRunning,onChange}). Call update(settings, fullRuntime), demonstrate(), getValue(), destroy(). Native labeled checkboxes support Tab, Space and touch. Initial checked defaults are saved; live selections are transient. Inspector changes to defaults overwrite only the matching selection; style changes preserve choices. Pause and background freeze clocks. Apply offsetX, offsetY and scale on an outer wrapper. Retain sourceNotice in every copy.'}}};}
