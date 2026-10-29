/** Independent Hook Sidebar interaction engine; no reference source or runtime dependency. */
import {tuneShapeNavigation,tuneShapeNavigationTitle} from './tuneshape-navigation';
export type HookSettings={label:string;items:string[];initialIndex:number;rowHeight:number;fontSize:number;accentColor:string;dashed:boolean;theme:'light'|'dark'};
export type HookRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onHeight?:(height:number)=>void;onSelect?:(index:number,label:string)=>void};
export const defaultHook:Readonly<HookSettings>={label:tuneShapeNavigationTitle,items:tuneShapeNavigation.map(item=>item.label),initialIndex:0,rowHeight:32,fontSize:14,accentColor:'#fc4c01',dashed:true,theme:'light'};
export function validateHook(value:unknown):HookSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==Object.keys(defaultHook).length||Object.keys(defaultHook).some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('钩线侧栏字段不完整或含未知字段。');
 const s=value as HookSettings,text=(s:unknown,min:number,max:number)=>typeof s==='string'&&s.trim().length>=min&&Array.from(s).length<=max&&!/[\u0000-\u001f\u007f-\u009f<>]/u.test(s);
 if(!text(s.label,0,40))throw Error('侧栏组标题最多 40 字。');
 if(!Array.isArray(s.items)||Object.getPrototypeOf(s.items)!==Array.prototype||s.items.length<1||s.items.length>12||Reflect.ownKeys(s.items).length!==s.items.length+1)throw Error('菜单须有 1–12 项，每项最多 60 字。');
 for(let i=0;i<s.items.length;i++){const d=Object.getOwnPropertyDescriptor(s.items,String(i));if(!d||!Object.hasOwn(d,'value')||!text(d.value,1,60))throw Error('菜单须有 1–12 项，每项最多 60 字。')}
 if(!Number.isInteger(s.initialIndex)||s.initialIndex<0||s.initialIndex>=s.items.length||!Number.isInteger(s.rowHeight)||s.rowHeight<28||s.rowHeight>52||!Number.isInteger(s.fontSize)||s.fontSize<12||s.fontSize>18||typeof s.dashed!=='boolean'||!['light','dark'].includes(s.theme)||typeof s.accentColor!=='string'||!/^#[0-9a-f]{6}$/i.test(s.accentColor))throw Error('侧栏预选项、间距或配色无效。');
 return structuredClone(s);
}
export function parseHookItems(text:string){return validateHook({...defaultHook,items:text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)}).items}

function hookEngine(){
 const css=`.hook-sidebar-stage{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#222;font-family:inherit;--hook-muted:#bcbcbc;isolation:isolate}.hook-sidebar-stage[data-theme=dark]{background:#171717;color:#ededed;--hook-muted:#626262}
 .hook-sidebar-nav{width:max-content;max-width:calc(100% - 48px);min-width:0;font-family:inherit;font-size:14px;line-height:1.4286}.hook-sidebar-label{display:block;margin:0!important;padding:0 8px 12px 2px;font:inherit;font-weight:500;text-transform:uppercase;letter-spacing:.04em;overflow-wrap:anywhere}.hook-sidebar-label[hidden]{display:none}
 .hook-sidebar-list{position:relative;display:flex;flex-direction:column;gap:2px}.hook-sidebar-item{all:unset;position:relative;box-sizing:border-box;display:block;width:100%;padding:6px 8px 6px 20px;min-height:32px;text-align:left;font:inherit;line-height:1.4286;color:inherit;cursor:pointer;overflow-wrap:anywhere;touch-action:manipulation}.hook-sidebar-nav .hook-sidebar-item:hover{background:transparent}.hook-sidebar-item:focus-visible{outline:1px solid currentColor;outline-offset:1px;border-radius:3px}.hook-sidebar-lines{position:absolute;inset:0 auto auto 2px;width:13px;overflow:visible;pointer-events:none}
 .hook-controls .hook-text-field{display:grid;gap:9px;margin:18px 0;font-size:12px}.hook-controls .hook-text-field input,.hook-controls textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid var(--line,#ddd);border-radius:5px;padding:9px 10px;background:transparent;color:inherit;font:inherit;line-height:1.65}.hook-controls textarea{resize:vertical;min-height:145px}.hook-controls .hook-hint{font-size:11px;color:var(--muted,#777);line-height:1.7}.hook-controls .hook-error{font-size:11px;color:#b52323}.hook-controls details{margin-top:20px}.hook-controls summary{cursor:pointer;font-size:12px;color:var(--muted,#777);margin-bottom:18px}`;
 // A quadratic turn authored here; both rails end at the measured text-row center.
 function path(y:number,from=0){const end=Math.max(0,y),r=Math.min(6,end),start=Math.max(0,Math.min(from,end-r));return `M.5 ${start} V${end-r} Q.5 ${end} ${r+.5} ${end} H12.5`}
 function hoverStart(activeY:number,hoverY:number){return hoverY<=activeY?Math.max(0,hoverY-6):activeY}
 function spring(position:number,velocity:number,target:number,dt:number,durationMs:number){const w=8/Math.max(.08,durationMs/1000),x=position-target,b=velocity+w*x,e=Math.exp(-w*dt);return {position:target+(x+b*dt)*e,velocity:(velocity-w*b*dt)*e}}
 function create(host:HTMLElement,initial:HookSettings,initialRuntime:HookRuntime){
  let settings=initial,runtime=initialRuntime,active=initial.initialIndex,pointer=-1,focused=-1,inside=false,centers:number[]=[],buttons:HTMLButtonElement[]=[],dead=false,raf=0,last=0,reported:boolean|null=null,naturalHeight=0;
  let selected={position:0,velocity:0},hovered={position:0,velocity:0},opacity={position:0,velocity:0},demo:null|{age:number;origin:number;returning:boolean}=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('hook-sidebar-stage');
  const nav=document.createElement('nav');nav.className='hook-sidebar-nav';nav.dataset.slot='hook-sidebar';host.appendChild(nav);
  const label=document.createElement('p');label.className='hook-sidebar-label';nav.appendChild(label);
  const list=document.createElement('div');list.className='hook-sidebar-list';nav.appendChild(list);
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','hook-sidebar-lines');svg.setAttribute('aria-hidden','true');
  const muted=document.createElementNS(ns,'path'),accent=document.createElementNS(ns,'path');for(const p of [muted,accent]){p.setAttribute('fill','none');p.setAttribute('stroke-width','1');svg.appendChild(p)}muted.setAttribute('stroke','var(--hook-muted)');list.appendChild(svg);
  const listeners:Array<[EventTarget,string,EventListener]>=[],listen=(node:EventTarget,type:string,fn:(event:any)=>void)=>{node.addEventListener(type,fn);listeners.push([node,type,fn])};
  const hoverIndex=()=>inside&&pointer>=0?pointer:focused;
  const hoverVisible=()=>hoverIndex()>=0&&hoverIndex()!==active;
  const available=()=>runtime.enabled&&!runtime.paused&&!document.hidden&&runtime.speed>0;
  function report(running:boolean){host.dataset.running=String(running&&available());if(reported!==running){reported=running;runtime.onRunning?.(running)}}
  function paint(){
   const h=hoverIndex(),y=selected.position;accent.setAttribute('d',path(y));muted.setAttribute('d',path(hovered.position,hoverStart(y,hovered.position)));muted.setAttribute('opacity',String(Math.max(0,Math.min(1,opacity.position))));
   host.dataset.active=String(active);host.dataset.hover=String(h);host.dataset.activeY=y.toFixed(4);host.dataset.hoverY=hovered.position.toFixed(4);host.dataset.hoverOpacity=opacity.position.toFixed(4);
   buttons.forEach((button,i)=>{if(i===active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');button.style.opacity=i===active?'1':i===h?'.8':'.5'});
  }
  function targets(){return {a:centers[active]??0,h:centers[hoverIndex()]??hovered.position,o:hoverVisible()?1:0}}
  function snap(){const t=targets();selected={position:t.a,velocity:0};hovered={position:t.h,velocity:0};opacity={position:t.o,velocity:0};paint()}
  function moving(){const t=targets();return Math.abs(selected.position-t.a)>.015||Math.abs(selected.velocity)>.03||Math.abs(hovered.position-t.h)>.015||Math.abs(hovered.velocity)>.03||Math.abs(opacity.position-t.o)>.002||Math.abs(opacity.velocity)>.003}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;report(false)}
  function wake(){
   if(dead)return;if(!available()){if(raf)cancelAnimationFrame(raf);raf=0;last=0;report(runtime.enabled&&(moving()||!!demo));return}
   if(runtime.reduced){demo=null;snap();stop();return}
   if(!moving()&&!demo){paint();stop();return}report(true);if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}
  }
  function frame(now:number){
   raf=0;if(dead)return;if(!available()){if(raf)cancelAnimationFrame(raf);raf=0;last=0;report(runtime.enabled&&(moving()||!!demo));return}const dt=Math.max(0,(now-last)/1000)*Math.max(0,runtime.speed);last=now;
   if(demo){demo.age+=dt*1000;const wait=Math.max(600,runtime.durationMs*1.6);if(!demo.returning&&demo.age>=wait){demo.returning=true;active=demo.origin}if(demo.age>=wait*2)demo=null}
   const t=targets();selected=spring(selected.position,selected.velocity,t.a,dt,runtime.durationMs);hovered=spring(hovered.position,hovered.velocity,t.h,dt,runtime.durationMs);opacity=spring(opacity.position,opacity.velocity,t.o,dt,Math.min(200,runtime.durationMs));
   paint();if(moving()||demo){report(true);raf=requestAnimationFrame(frame)}else{snap();report(false);last=0}
  }
  function measure(initialPaint=false){
   if(dead)return;centers=buttons.map(button=>button.offsetTop+button.offsetHeight/2);svg.setAttribute('height',String(list.offsetHeight));
   const next=Math.max(320,nav.offsetHeight+80);if(next!==naturalHeight){naturalHeight=next;runtime.onHeight?.(next)}
   if(initialPaint)snap();else wake();
  }
  function appearance(){
   host.dataset.theme=settings.theme;label.textContent=settings.label;label.hidden=!settings.label.trim();nav.setAttribute('aria-label',settings.label.trim()||(runtime.language==='en'?'Sidebar navigation':'侧栏导航'));nav.style.fontSize=settings.fontSize+'px';nav.inert=!runtime.enabled;
   buttons.forEach(b=>b.style.minHeight=settings.rowHeight+'px');accent.setAttribute('stroke',settings.accentColor);for(const p of [accent,muted]){if(settings.dashed)p.setAttribute('stroke-dasharray','2 2');else p.removeAttribute('stroke-dasharray')}
  }
  function rows(){buttons.forEach(b=>b.remove());buttons=settings.items.map((text,index)=>{const b=document.createElement('button');b.type='button';b.className='hook-sidebar-item';b.dataset.index=String(index);b.textContent=text;list.appendChild(b);return b})}
  function indexOf(event:Event){const button=(event.target as HTMLElement)?.closest?.('.hook-sidebar-item');return button&&list.contains(button)?buttons.indexOf(button as HTMLButtonElement):-1}
  function select(index:number,notify=true){if(!Number.isInteger(index)||index<0||index>=buttons.length||!available())return;demo=null;if(active===index)return;active=index;if(notify)runtime.onSelect?.(index,settings.items[index]);paint();wake()}
  listen(nav,'pointerover',e=>{if(!available()||e.pointerType==='touch')return;const i=indexOf(e);if(i<0)return;demo=null;inside=true;pointer=i;paint();wake()});
  listen(nav,'pointerleave',()=>{inside=false;pointer=-1;paint();wake()});
  listen(nav,'pointercancel',()=>{inside=false;pointer=-1;paint();wake()});
  listen(nav,'focusin',e=>{if(!available())return;focused=indexOf(e);demo=null;paint();wake()});
  listen(nav,'focusout',e=>{if(nav.contains(e.relatedTarget))return;focused=-1;paint();wake()});
  listen(nav,'click',e=>{const i=indexOf(e);if(i>=0)select(i)});
  listen(nav,'keydown',e=>{if(!available())return;const i=indexOf(e);if(i<0)return;const next=e.key==='ArrowDown'?Math.min(i+1,buttons.length-1):e.key==='ArrowUp'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;if(next>=0){e.preventDefault();inside=false;pointer=-1;buttons[next].focus()}else if(e.key==='Escape'){inside=false;pointer=-1;focused=-1;paint();wake()}});
  listen(document,'visibilitychange',wake);
  rows();appearance();measure(true);const observer=new ResizeObserver(()=>measure());observer.observe(list);observer.observe(nav);document.fonts?.ready.then(()=>{if(!dead)measure()});
  return {
   select:(index:number)=>select(index),
   demonstrate(){if(!available())return;inside=false;pointer=-1;focused=-1;if(runtime.reduced){demo=null;snap();stop();return}const origin=active;active=active===buttons.length-1?0:buttons.length-1;if(active===origin)return;demo={age:0,origin,returning:false};paint();wake()},
   update(next:HookSettings,nextRuntime:HookRuntime){
    const contentChanged=JSON.stringify(next.items)!==JSON.stringify(settings.items),selectionChanged=next.initialIndex!==settings.initialIndex;settings=next;runtime=nextRuntime;
    if(contentChanged||selectionChanged){demo=null;active=next.initialIndex;if(contentChanged){inside=false;pointer=-1;focused=-1;rows()}}
    appearance();measure();paint();wake();
   },
   refresh(){measure()},
   destroy(){if(dead)return;dead=true;stop();observer.disconnect();listeners.forEach(([node,type,fn])=>node.removeEventListener(type,fn));host.replaceChildren();host.classList.remove('hook-sidebar-stage')},
  };
 }
 return {create,path,hoverStart,spring};
}
const engine=hookEngine();
export const createHookSidebar=engine.create,hookPath=engine.path,hookHoverStart=engine.hoverStart,hookSpring=engine.spring;
export const hookEngineCode=`const hookEngine=((__name)=>(${hookEngine.toString()}))((fn)=>fn)();\nconst createHookSidebar=hookEngine.create;`;
