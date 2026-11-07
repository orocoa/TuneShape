import type {NativeEffectRuntime} from './native-effect-tools.ts';
import type {ChapterProgressSettings} from './chapter-progress-nav-settings.ts';
export {defaultChapterProgress,validateChapterProgress} from './chapter-progress-nav-settings.ts';
export type ChapterProgressRuntime=NativeEffectRuntime&{onInteract?:()=>void};
export type ChapterProgressBinding={container?:HTMLElement;resolve:(id:string)=>HTMLElement|null;target?:(id:string)=>number;surface?:HTMLElement};

/** Generic reading navigation. No portfolio controllers, assets or paths. */
function chapterProgressEngine(){
 let instances=0;
 const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
 function metrics(tops:number[],maxScroll:number){if(!Number.isFinite(maxScroll)||tops.some(top=>!Number.isFinite(top)))throw Error('Each chapter must resolve to a measurable reading target.');return tops.map(top=>clamp(top,0,Math.max(0,maxScroll)))}
 function progress(anchors:number[],scroll:number,maxScroll:number){
  const y=clamp(scroll,0,Math.max(0,maxScroll));let active=0;for(let i=0;i<anchors.length;i++)if(y>=anchors[i]-.5)active=i;
  return {active,values:anchors.map((start,i)=>{const end=anchors[i+1]??maxScroll;return end>start?clamp((y-start)/(end-start)):y>=end&&i===active?1:0})};
 }
 const css=`.chapter-progress-nav{position:relative;isolation:isolate;display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;font-family:inherit;container-type:inline-size;--cpn-bg:#111;--cpn-ink:#c4c4c4;--cpn-muted:#8a8a8a;--cpn-hover:#f0f0f0;--cpn-line:#303030;--cpn-fill:#626262;color:var(--cpn-ink);background:var(--cpn-bg)}
 .chapter-progress-nav[data-tone=light]{--cpn-bg:#fff;--cpn-ink:#505050;--cpn-muted:#767676;--cpn-hover:#222;--cpn-line:#dedede;--cpn-fill:#b7b7b7}
 .cpn-header{position:relative;flex:none;z-index:3;padding:16px var(--cpn-padding) 12px;background:var(--cpn-bg)}
 .cpn-items{display:grid;grid-template-columns:repeat(var(--cpn-count),minmax(0,1fr));gap:var(--cpn-gap);min-width:0}.cpn-item{min-width:0}
 .cpn-link{display:flex;align-items:center;box-sizing:border-box;width:100%;min-height:var(--cpn-row);padding:0 2px;text-decoration:none!important;cursor:pointer;font-size:var(--cpn-font);line-height:20px;font-weight:var(--cpn-weight);letter-spacing:.035em;text-transform:uppercase;color:var(--cpn-muted)!important;touch-action:manipulation;overflow:hidden}
 .cpn-link span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cpn-link:hover{color:var(--cpn-hover)!important}.cpn-link[aria-current]{color:var(--cpn-ink)!important}.cpn-link:focus-visible{outline:1px solid currentColor;outline-offset:0}.cpn-short{display:none}
 .cpn-rail{position:relative;height:9px;margin-top:var(--cpn-rail-gap);border-top:var(--cpn-line-width) solid var(--cpn-line);cursor:default;pointer-events:auto;user-select:none}.cpn-fill{position:absolute;top:calc(-1 * var(--cpn-line-width));left:0;width:100%;height:var(--cpn-line-width);background:var(--cpn-fill);transform:scaleX(var(--progress,0));transform-origin:left;pointer-events:none}.cpn-item[data-active=true] .cpn-fill{background:var(--cpn-accent);opacity:.7}
 .cpn-viewport{position:relative;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--cpn-line) var(--cpn-bg);outline-offset:-2px;touch-action:pan-y}.cpn-section{box-sizing:border-box;min-height:var(--cpn-section-height);padding:var(--cpn-offset) var(--cpn-padding) 56px;scroll-margin:0;overflow-wrap:anywhere;background:#111;color:#c4c4c4}.cpn-section[data-tone=light]{background:#fff;color:#505050}.cpn-number{margin:0 0 26px!important;font-size:11px!important;letter-spacing:.12em;opacity:.55}.cpn-heading{font-family:inherit!important;font-size:clamp(24px,5cqw,40px)!important;font-weight:450!important;line-height:1.12!important;letter-spacing:-.04em!important;margin:0 0 24px!important;color:inherit!important;max-width:13em}.cpn-heading:focus{outline:none}.cpn-heading:focus-visible{outline:1px solid currentColor;outline-offset:4px}.cpn-body{font-family:inherit!important;font-size:14px!important;font-weight:350;line-height:1.8!important;max-width:39em;margin:0 0 28px!important;color:inherit!important}.cpn-next{all:unset;display:inline-block;font:inherit;font-size:12px;cursor:pointer;border-bottom:1px solid currentColor;padding:6px 0;opacity:.7}.cpn-next:focus-visible{outline:1px solid currentColor;outline-offset:4px}.cpn-veil{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:var(--cpn-bg)}
 @container(max-width:440px){.cpn-header{padding:12px min(var(--cpn-padding),20px) 10px}.cpn-items{gap:min(var(--cpn-gap),14px)}.cpn-link{font-size:var(--cpn-mobile-font);letter-spacing:.02em;padding:0}.cpn-full{display:none}.cpn-short{display:inline}.cpn-section{padding-inline:min(var(--cpn-padding),20px)}.cpn-body{font-size:13px!important}}
 @media(prefers-reduced-motion:reduce){.cpn-veil{display:none}}`;
 function create(host:HTMLElement,initial:ChapterProgressSettings,initialRuntime:ChapterProgressRuntime,initialBinding?:ChapterProgressBinding){
  const prefix='chapter-progress-'+(++instances);let settings=initial,runtime=initialRuntime,binding=initialBinding,dead=false,frame=0,last=0,phase:'idle'|'out'|'in'='idle',elapsed=0,pending:number|null=null,wantsFocus=false,active=initial.initialIndex,anchors:number[]=[],maxScroll=0,demo:number[]|null=null,dwell=0,reported=false,container:HTMLElement|Window,observed:HTMLElement[]=[];
  host.classList.add('chapter-progress-nav');const style=document.createElement('style');style.textContent=css;
  const nav=document.createElement('nav');nav.className='cpn-header';nav.setAttribute('aria-label',runtime.language==='en'?'Chapter navigation':'章节导航');const list=document.createElement('div');list.className='cpn-items';nav.append(list);
  const reader=document.createElement('article');reader.className='cpn-viewport';reader.tabIndex=0;
  const veil=document.createElement('div');veil.className='cpn-veil';veil.setAttribute('aria-hidden','true');host.append(style,nav,reader,veil);
  let links:HTMLAnchorElement[]=[],rows:HTMLElement[]=[],headings:HTMLElement[]=[],interruptTarget:HTMLElement|Window;let masked:{node:HTMLElement;opacity:string;inert:boolean}|null=null;
  const read=()=>container===window?window.scrollY:(container as HTMLElement).scrollTop;
  const write=(top:number)=>{if(container===window)window.scrollTo({top,behavior:'instant'});else (container as HTMLElement).scrollTo({top,behavior:'instant'})};
  const targets=()=>binding?settings.sections.map(s=>binding!.resolve(s.id)):headings;
  const tone=(index:number)=>settings.theme==='auto'?settings.sections[index]?.tone??'light':settings.theme;
  const allowed=()=>!dead&&runtime.enabled&&!runtime.paused&&!document.hidden&&runtime.speed>0;
  function report(){const running=allowed()&&!runtime.reduced&&(phase!=='idle'||!!demo);host.dataset.running=String(running);host.dataset.paused=String(runtime.paused||!runtime.enabled||document.hidden);if(running!==reported){reported=running;runtime.onRunning?.(running)}}
  function stopClock(){if(frame)cancelAnimationFrame(frame);frame=0;last=0}
  function request(){if(!frame&&allowed()&&!runtime.reduced&&(phase!=='idle'||demo)){if(!last)last=performance.now();frame=requestAnimationFrame(tick)}report()}
  function paint(){
   const p=progress(anchors,read(),maxScroll);active=p.active;host.dataset.active=settings.sections[active]?.id??'';host.dataset.progress=JSON.stringify(p.values);host.dataset.demonstrating=String(!!demo);host.dataset.pending=pending===null?'':settings.sections[pending]?.id??'';host.dataset.phase=phase;host.dataset.elapsed=String(elapsed);host.dataset.tone=tone(active);host.dataset.scroll=String(read());
   rows.forEach((row,i)=>{row.style.setProperty('--progress',String(p.values[i]??0));row.dataset.active=String(i===active);if(i===active)links[i].setAttribute('aria-current','location');else links[i].removeAttribute('aria-current')});
  }
  function refresh(){if(dead)return;const isWindow=container===window,c=container as HTMLElement,bounds=isWindow?null:c.getBoundingClientRect(),ratio=bounds&&bounds.height?c.offsetHeight/bounds.height:1,origin=isWindow?0:bounds!.top+(c.clientTop||0)/ratio;maxScroll=Math.max(0,isWindow?document.documentElement.scrollHeight-innerHeight:c.scrollHeight-c.clientHeight);const top=read();anchors=metrics(targets().map((e,i)=>binding?.target?binding.target(settings.sections[i].id):e?!binding?e.offsetTop:(e.getBoundingClientRect().top-origin)*ratio+top:Infinity),maxScroll);paint()}
  function mask(value:number){if(masked)masked.node.style.opacity=String((parseFloat(masked.opacity)||1)*(1-value));else veil.style.opacity=String(value)}
  function resetMask(){reader.inert=false;veil.style.opacity='0';if(masked){masked.node.style.opacity=masked.opacity;masked.node.inert=masked.inert;masked=null}}
  function cancel(interaction=false,keepDemo=false){if(interaction)runtime.onInteract?.();if(!keepDemo)demo=null;stopClock();phase='idle';pending=null;elapsed=dwell=0;resetMask();paint();report()}
  function focusTarget(index:number){const node=targets()[index],h=binding?node:node?.querySelector<HTMLElement>('.cpn-heading');if(h){if(!h.hasAttribute('tabindex'))h.tabIndex=-1;h.focus({preventScroll:true})}}
  function commit(index:number){refresh();write(anchors[index]??0);paint()}
  function finish(){const index=pending;phase='idle';pending=null;elapsed=0;resetMask();paint();if(wantsFocus&&index!==null)focusTarget(index);wantsFocus=false;if(demo)dwell=650;report()}
  function go(index:number,options:{focus?:boolean;animate?:boolean;demonstration?:boolean}={}){
   if(dead)return;host.dataset.navigationInput=options.demonstration?'demo':'manual';const next=Math.trunc(clamp(index,0,settings.sections.length-1));cancel(!options.demonstration,!!options.demonstration);refresh();pending=next;wantsFocus=!!options.focus;
   if(options.animate===false||runtime.reduced||!allowed()||runtime.durationMs<=0||(binding&&(!binding.surface||binding.surface.contains(nav)))||Math.abs(read()-(anchors[next]??0))<.5){commit(next);finish();return}
   if(binding?.surface){masked={node:binding.surface,opacity:binding.surface.style.opacity,inert:binding.surface.inert};binding.surface.inert=true}else reader.inert=true;veil.style.background=tone(next)==='dark'?'#111':'#fff';phase='out';elapsed=0;paint();request();
  }
  function tick(now:number){frame=0;if(!allowed())return;const dt=Math.max(0,now-last)*runtime.speed;last=now;
   if(phase==='idle'&&demo){dwell-=dt;if(dwell<=0){const index=demo.shift();if(index===undefined){demo=null;report();return}go(index,{demonstration:true});}request();return}
   elapsed+=dt;const out=Math.min(runtime.durationMs,settings.fadeOutMs),inside=Math.max(0,runtime.durationMs-out);
   if(phase==='out'){if(elapsed>=out){elapsed-=out;commit(pending!);phase='in'}else mask(1-Math.pow(1-clamp(elapsed/Math.max(1,out)),3))}
   if(phase==='in'){if(elapsed>=inside)finish();else mask(Math.pow(1-clamp(elapsed/Math.max(1,inside)),3))}
   paint();request();
  }
  function onScroll(){paint()}
  function interrupt(event:Event){const key=(event as KeyboardEvent).key;if(event.type==='keydown'&&!['Escape','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(key))return;if(event.type!=='wheel'&&event.type!=='keydown'&&event.target instanceof Node&&nav.contains(event.target))return;cancel(true)}
  const interrupts=['wheel','touchstart','pointerdown','keydown'];
  function unbind(){container?.removeEventListener('scroll',onScroll);interrupts.forEach(type=>interruptTarget?.removeEventListener(type,interrupt,true));observed.forEach(e=>observer.unobserve(e));observed=[]}
  function bind(){unbind();container=binding?.container??(binding?window:reader);interruptTarget=binding?container:host;container.addEventListener('scroll',onScroll,{passive:true});interrupts.forEach(type=>interruptTarget.addEventListener(type,interrupt,{capture:true,passive:type!=='keydown'}));observed=targets().filter((e):e is HTMLElement=>!!e);if(container!==window)observed.push(container as HTMLElement);observed.forEach(e=>observer.observe(e));reader.hidden=!!binding}
  function build(){
   links=[];rows=[];headings=[];list.replaceChildren();reader.replaceChildren();host.dataset.settings=JSON.stringify(settings);
   for(const[k,v]of Object.entries({'--cpn-count':settings.sections.length,'--cpn-font':settings.fontSize+'px','--cpn-mobile-font':settings.mobileFontSize+'px','--cpn-weight':settings.fontWeight,'--cpn-gap':settings.gap+'px','--cpn-padding':settings.padding+'px','--cpn-row':settings.rowHeight+'px','--cpn-line-width':settings.lineWidth+'px','--cpn-rail-gap':settings.railGap+'px','--cpn-section-height':settings.sectionHeight+'px','--cpn-offset':settings.readingOffset+'px','--cpn-accent':settings.accentColor}))host.style.setProperty(k,String(v));
   settings.sections.forEach((item,i)=>{const row=document.createElement('div');row.className='cpn-item';const link=document.createElement('a');link.className='cpn-link';link.href='#'+prefix+'-'+item.id;link.dataset.chapter=item.id;link.title=item.label;link.setAttribute('aria-label',item.label);const full=document.createElement('span');full.className='cpn-full';full.textContent=item.label;const short=document.createElement('span');short.className='cpn-short';short.textContent=item.shortLabel;link.append(full,short);const rail=document.createElement('div');rail.className='cpn-rail';rail.setAttribute('aria-hidden','true');const fill=document.createElement('i');fill.className='cpn-fill';rail.append(fill);row.append(link,rail);list.append(row);rows.push(row);links.push(link);
    const section=document.createElement('section');section.className='cpn-section';section.dataset.tone=tone(i);const num=document.createElement('p');num.className='cpn-number';num.textContent=String(i+1).padStart(2,'0')+' / '+String(settings.sections.length).padStart(2,'0');const h=document.createElement('h2');h.className='cpn-heading';h.id=prefix+'-'+item.id;h.tabIndex=-1;h.textContent=item.title;const body=document.createElement('p');body.className='cpn-body';body.textContent=item.body;const next=document.createElement('button');next.className='cpn-next';next.type='button';next.dataset.next=String((i+1)%settings.sections.length);next.textContent=runtime.language==='en'?(i===settings.sections.length-1?'Back to start':'Next chapter'):(i===settings.sections.length-1?'返回开头':'下一章节');section.append(num,h,body,next);reader.append(section);headings.push(section);section.dataset.readingTarget=h.id;
   });bind();refresh();
  }
  function click(event:MouseEvent){const target=event.target as Element,link=target.closest<HTMLAnchorElement>('.cpn-link'),next=target.closest<HTMLButtonElement>('.cpn-next');if(!link&&!next)return;event.preventDefault();event.stopPropagation();go(link?links.indexOf(link!):Number(next!.dataset.next),{focus:event.detail===0})}
  function railDown(event:PointerEvent){if((event.target as Element).closest('.cpn-rail')){event.preventDefault();event.stopPropagation()}}
  function keydown(event:KeyboardEvent){const link=(event.target as Element).closest<HTMLAnchorElement>('.cpn-link');if(!link)return;const index=links.indexOf(link);if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();cancel(true);links[event.key==='Home'?0:event.key==='End'?links.length-1:clamp(index+(event.key==='ArrowRight'?1:-1),0,links.length-1)].focus()}else if(event.key===' '){event.preventDefault();event.stopPropagation();go(index,{focus:true})}else if(event.key==='Escape')cancel(true)}
  function globalKey(event:KeyboardEvent){if(phase!=='idle'||demo)interrupt(event)}
  function visibility(){stopClock();if(!document.hidden)refresh();request()}
  const observer=new ResizeObserver(()=>refresh());observer.observe(host);host.addEventListener('click',click);nav.addEventListener('pointerdown',railDown);host.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',visibility);document.addEventListener('keydown',globalKey,true);window.addEventListener('resize',refresh);build();commit(settings.initialIndex);host.dataset.ready='true';report();
  return {go,select:(index:number)=>go(index),refresh,connect(next?:ChapterProgressBinding){cancel();binding=next;bind();refresh()},demonstrate(){cancel();if(runtime.reduced||!allowed())return;demo=[...new Set([Math.min(1,settings.sections.length-1),settings.sections.length-1,settings.initialIndex])];dwell=0;request()},settle(){cancel();commit(settings.initialIndex)},update(next:ChapterProgressSettings,nextRuntime:ChapterProgressRuntime){
   const changed=JSON.stringify(settings)!==JSON.stringify(next),languageChanged=runtime.language!==nextRuntime.language,timingChanged=runtime.durationMs!==nextRuntime.durationMs;
   if(changed||languageChanged||timingChanged){const old=settings,state=progress(anchors,read(),maxScroll),id=old.sections[state.active]?.id;cancel();settings=next;runtime=nextRuntime;if(changed||languageChanged)build();const index=old.initialIndex!==next.initialIndex?next.initialIndex:Math.max(0,next.sections.findIndex(s=>s.id===id));write((anchors[index]??0)+(old.initialIndex===next.initialIndex?(state.values[state.active]??0)*((anchors[index+1]??maxScroll)-(anchors[index]??0)):0))}
   else{stopClock();runtime=nextRuntime;if(runtime.reduced){const target=pending;cancel();if(target!==null)commit(target)}}
   paint();request();
  },getState:()=>({active:settings.sections[active]?.id,progress:progress(anchors,read(),maxScroll).values,scroll:read(),anchors:[...anchors],maxScroll,phase,elapsed,pending:pending===null?null:settings.sections[pending]?.id,running:reported}),destroy(){cancel();dead=true;observer.disconnect();unbind();host.removeEventListener('click',click);nav.removeEventListener('pointerdown',railDown);host.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',globalKey,true);window.removeEventListener('resize',refresh);host.replaceChildren()}};
 }
 return {metrics,progress,create};
}
const chapterEngine=chapterProgressEngine();
export const chapterReadingMetrics=chapterEngine.metrics,chapterReadingProgress=chapterEngine.progress,createChapterProgressNav=chapterEngine.create;
export const chapterProgressEngineCode=`const chapterProgressEngine=((__name)=>(${chapterProgressEngine.toString()}))((fn)=>fn)();const createChapterProgressNav=chapterProgressEngine.create;`;
