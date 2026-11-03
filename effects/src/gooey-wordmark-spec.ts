import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {gooeyWordmarkEngineCode} from './gooey-wordmark';
export const gooeyWordmarkSourceNote='参考 hipuku.dev 的公开页面与用户 2026-11-03 录屏独立实现：字形强模糊凝聚入场、逐字轻微上移、指针局部黏连与换色、网格和标注引线。主文字改为 tuneshape。未复用原站字标路径、脚本、品牌素材或个人文案；内嵌 Parkinsans 字体采用 SIL OFL 1.1。';
export function gooeyWordmarkDescription(c:HistoryConfig,language:'zh'|'en'='zh'):Description{
 const en=language==='en',s=c.typography!,section=(label:string,zh:string,english:string)=>({label,text:en?english:zh});
 return {title:en?'Gooey Wordmark':'液态交互字标',summary:en?'A blurred liquid mass resolves into readable type. The pointer melts nearby strokes and changes each touched letter’s hue.':'模糊液团逐渐凝聚成字标；鼠标在局部融化、黏连笔画，并逐字切换颜色。',sections:[
  section('组件','液态交互字标 · Gooey Wordmark','Gooey Wordmark'),
  section('触发方式','详情入场自动播放一次；点击或按 Enter / 空格重播。移动指针只影响附近笔画，移开平滑恢复；方向键逐字体验，Escape 收回。触屏可拖动或点按文字。','Play once on detail entry. Click or press Enter / Space to replay. Move the pointer to melt nearby strokes and change the touched letter’s hue. Arrow keys explore letters; Escape clears the lens. Touch and drag are supported.'),
  section('起点与终点','同一组字形从强模糊与透明度阈值生成的液团中逐渐显现，字母以 50ms 基准错峰轻微上移；没有独立彩带、压扁、旋转或回弹。字标形成后说明文字淡入；引线不覆盖加载阶段。','The same glyphs resolve from a strongly blurred, alpha-thresholded liquid mass. Letters rise slightly with a 50ms basis stagger. No surrogate ribbon, squash, rotation or bounce. The caption follows; leader lines stay hidden during loading.'),
  section('进入与退出','入场完成后保持清晰字标。移开指针只让局部透镜与形变平滑消退，不重新运行入场；点击或播放按钮才从头重播。','Keep the readable wordmark after the entrance. Pointer leave fades the local lens and deformation without replaying the entrance; click or Play explicitly restarts it.'),
  section('时序',`完整入场 ${c.durationMs} ms；延迟 ${c.delayMs} ms。目录悬停、聚焦或手机 Preview 重播，完成后短暂停留。`,`Full entrance ${c.durationMs} ms; delay ${c.delayMs} ms. Catalog hover, keyboard focus and mobile Preview repeat after a readable dwell.`),
  section('重复操作与打断','暂停冻结入场与局部恢复；继续接续当前时钟。目录离开且失焦、离屏或后台时停止。临时指针、换色与进度不写入配置。','Pause freezes the entrance and pointer recovery; resume continues the clock. Inactive, offscreen and background catalog cards stop. Pointer position, colour mutations and progress stay out of saved configuration.'),
  section('内容与参数',`文字 ${JSON.stringify(s.text)}；字号 ${s.fontSize}px；形变强度 ${s.intensity}；交互范围 ${s.radius}px；网格 ${s.grid}；标注 ${s.annotations}。1280 × 720 参考画布，等比适配。`,`Text ${JSON.stringify(s.text)}; type size ${s.fontSize}px; melt intensity ${s.intensity}; interaction radius ${s.radius}px; grid ${s.grid}; annotations ${s.annotations}. Proportionally fit a 1280 × 720 reference canvas.`),
  section('减少动态效果','直接显示完整可读字标、网格与标注，关闭液态入场、指针融化和目录循环。','Show the readable final wordmark and annotations; disable the entrance, pointer melting and catalog repetition.'),
  section('来源',gooeyWordmarkSourceNote,'Independently implemented from the public hipuku.dev page and the user recording dated 2026-11-03. No original logo paths, scripts, brand assets or personal copy are included. Embedded Parkinsans: SIL OFL 1.1.'),
 ]};
}
export function gooeyWordmarkMotion(c:HistoryConfig){return {
 component:'Gooey Wordmark',terminology:{id:'gooey-wordmark',englishTerm:'Gooey Wordmark'},canvas:{width:1280,height:720,fit:'contain'},
 sourceNotice:{source:'https://www.hipuku.dev/',license:'Independent TuneShape implementation, project MIT. Parkinsans, SIL OFL 1.1.',note:gooeyWordmarkSourceNote},forward:[],reverse:[],
 policies:{repeat:0,reduceMotion:'readable static final wordmark; no pointer deformation or gallery repeat',observationSpeed:'runtime.speed only; never serialize pointer or playback state'},
 adapters:{typography:{settings:c.typography,runtime:{durationMs:c.durationMs,delayMs:c.delayMs,loop:false},engineCode:gooeyWordmarkEngineCode,usage:'Evaluate engineCode and call createTypography(emptyHost, settings, fullRuntime). The renderer includes its SVG filters, annotations, pointer and keyboard events and embedded Parkinsans font. Call demonstrate(), settle(), update(settings,fullRuntime), getValue(), destroy(). Pause/resume with runtime.paused. Apply offsets/scale on an outer wrapper. No network requests.'}},
};}
