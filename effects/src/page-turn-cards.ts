import {createPageTurn,type PageTurn} from './page-turn-runtime/page-turn.js';
import swiperCss from './page-turn-vendor/swiper/swiper.css?raw';
import turnCss from './page-turn-runtime/page-turn.css?raw';
import {validatePageTurn,pageTurnGeometry,type PageTurnSettings} from './page-turn-cards-settings';
import type {NativeEffectRuntime} from './native-effect-tools';
export type PageTurnRuntime=NativeEffectRuntime&{gallery?:boolean;onInteract?:()=>void};

/** Shared preview/export adapter. Appearance scales without changing turn geometry. */
export function createPageTurnCards(host:HTMLElement,input:PageTurnSettings,initial:PageTurnRuntime){
 let settings=validatePageTurn(input),runtime=initial,dead=false,engine:PageTurn|undefined,busy=false;
 const abort=new AbortController(),root=document.createElement('div'),style=document.createElement('style'),frame=document.createElement('div'),nav=document.createElement('div');
 root.className='page-turn-cards';frame.className='ptc-frame';nav.className='ptc-controls';nav.setAttribute('role','group');
 style.textContent=swiperCss+'\n'+turnCss.replace(/^@import[^;]+;/m,'')+`\n.page-turn-cards{position:relative;width:100%;height:100%;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;overflow:hidden;background:#f1f1f1;color:#424242;box-sizing:border-box;padding:16px}.page-turn-cards .ptc-frame{position:relative;flex:none;min-width:0;max-width:100%}.page-turn-cards .ptc-controls{display:flex;align-items:center;justify-content:center;gap:8px;height:44px;flex:none;width:min(100%,calc(var(--ptc-count)*28px + 80px));max-width:100%}.page-turn-cards button{appearance:none;background:transparent;color:#424242;border:0;border-radius:0;cursor:pointer;font:400 22px/1 ui-sans-serif,system-ui,sans-serif;min-width:32px;height:44px;padding:0;display:grid;place-items:center}.page-turn-cards button:focus-visible{outline:2px solid #555;outline-offset:-2px}.page-turn-cards button:disabled{cursor:default;opacity:.4}.page-turn-cards .ptc-controls>button{flex:0 0 32px}.page-turn-cards .ptc-dots{display:flex;align-items:center;gap:0;min-width:0;flex:1}.page-turn-cards .ptc-dot{min-width:0;width:28px;flex:1}.page-turn-cards .ptc-dot::after{content:"";width:6px;height:6px;border-radius:50%;background:#c2c2c2}.page-turn-cards .ptc-dot[aria-current=true]::after{background:#424242}.page-turn-cards .tspt-face{font-size:var(--ptc-font-size,48px);line-height:1;white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;text-align:center}.page-turn-cards *{box-sizing:border-box}.page-turn-cards.ptc-narrow .ptc-controls{display:grid;grid-template-columns:1fr 1fr;width:100%;height:auto;gap:0}.page-turn-cards.ptc-narrow .ptc-dots{display:grid;grid-template-columns:repeat(var(--ptc-columns),minmax(0,1fr));grid-column:1 / -1;grid-row:1;width:100%}.page-turn-cards.ptc-narrow .ptc-dot{width:100%;height:32px}.page-turn-cards.ptc-narrow .ptc-previous{grid-column:1;grid-row:2;width:100%}.page-turn-cards.ptc-narrow .ptc-next{grid-column:2;grid-row:2;width:100%}`;
 style.textContent+=`.page-turn-cards.ptc-compact .ptc-controls{position:absolute;left:8px;right:8px;top:calc(50% - 16px);transform:translateY(-50%);display:flex;justify-content:space-between;width:auto;height:32px;gap:0;pointer-events:none}.page-turn-cards.ptc-compact .ptc-dots{display:none}.page-turn-cards.ptc-compact .ptc-controls>button{width:32px;min-width:32px;height:32px;pointer-events:auto}`;
 root.append(style,frame,nav);host.classList.add('page-turn-host');host.replaceChildren(root);
 let dots:HTMLButtonElement[]=[],previous:HTMLButtonElement,next:HTMLButtonElement;
 const report=(running:boolean)=>{busy=running;host.dataset.running=String(running);runtime.onRunning?.(running)};
 const allowed=()=>runtime.enabled&&!runtime.paused&&!document.hidden;
 function fit(){
  if(dead)return;
  const narrow=root.clientWidth<280,compact=!!runtime.gallery&&narrow&&root.clientHeight<220;
  const inset=compact?8:16,bottom=compact?40:runtime.gallery&&narrow?52:16;
  root.classList.toggle('ptc-narrow',narrow&&!compact);root.classList.toggle('ptc-compact',compact);
  root.style.padding=`${inset}px ${inset}px ${bottom}px`;
  root.style.setProperty('--ptc-count',String(settings.cards.length));root.style.setProperty('--ptc-columns',String(settings.cards.length>4?Math.ceil(settings.cards.length/2):settings.cards.length));
  // Small gallery tiles reserve one strip for Preview/Stop. Overlay the arrows
  // beside the card instead of spending the remaining height on pagination.
  const w=root.clientWidth-(compact?88:32),h=root.clientHeight-inset-bottom-(compact?0:16+nav.offsetHeight);
  const factor=Math.max(.01,Math.min(1,w/settings.width,h/settings.height))*pageTurnGeometry.previewScale;
  root.style.setProperty('--ptc-radius',pageTurnGeometry.cornerRadius*factor+'px');
  frame.style.width=settings.width*factor+'px';frame.style.height=settings.height*factor+'px';root.style.setProperty('--ptc-font-size',settings.fontSize*factor+'px');
 }
 function labels(){const en=runtime.language==='en';nav.setAttribute('aria-label',en?'Choose a card':'切换卡片');previous.setAttribute('aria-label',en?'Previous card':'上一张卡片');next.setAttribute('aria-label',en?'Next card':'下一张卡片');dots.forEach((b,i)=>b.setAttribute('aria-label',en?'Card '+(i+1)+': '+settings.cards[i].label:'第 '+(i+1)+' 张卡片：'+settings.cards[i].label));}
 function selected(id:string){host.dataset.selected=id;dots.forEach((b,i)=>b.setAttribute('aria-current',String(settings.cards[i].id===id)))}
 function buttons(){nav.replaceChildren();dots=[];previous=document.createElement('button');previous.type='button';previous.textContent='←';previous.className='ptc-previous';next=document.createElement('button');next.type='button';next.textContent='→';next.className='ptc-next';const group=document.createElement('div');group.className='ptc-dots';
  previous.onclick=()=>{if(allowed())engine?.previous()};next.onclick=()=>{if(allowed())engine?.next()};
  dots=settings.cards.map(c=>{const b=document.createElement('button');b.type='button';b.className='ptc-dot';b.onclick=()=>{if(allowed())engine?.select(c.id)};group.appendChild(b);return b});nav.append(previous,group,next);labels();
 }
 const nativeRuntime=()=>({language:runtime.language,durationMs:runtime.durationMs,speed:runtime.speed,reduced:runtime.reduced,paused:runtime.paused||document.hidden,enabled:runtime.enabled});
 function sync(){host.dataset.ready='true';host.dataset.settings=JSON.stringify(settings);host.dataset.enabled=String(runtime.enabled);host.dataset.paused=String(runtime.paused);host.dataset.duration=String(runtime.durationMs);host.dataset.speed=String(runtime.speed);host.dataset.reduced=String(runtime.reduced);nav.querySelectorAll('button').forEach(b=>{b.disabled=!allowed()||settings.cards.length<2});labels();fit();engine?.updateRuntime(nativeRuntime())}
 buttons();fit();engine=createPageTurn(frame,settings.cards,settings.cards[settings.initialIndex].id,{...nativeRuntime(),onSelect:selected,onInteraction:report});
 report(false);sync();
 const observer=new ResizeObserver(fit);observer.observe(root);
 const manual=()=>{if(allowed()){runtime.onInteract?.();host.dataset.manual='true'}};
 root.addEventListener('pointerdown',manual,{capture:true,signal:abort.signal});root.addEventListener('keydown',manual,{capture:true,signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(!dead)sync()},{signal:abort.signal});
 return {
  update(value:PageTurnSettings,nextRuntime:PageTurnRuntime){if(dead)return;const nextSettings=validatePageTurn(value),changed=JSON.stringify(nextSettings)!==JSON.stringify(settings);runtime=nextRuntime;settings=nextSettings;if(changed){buttons();fit();engine!.setItems(settings.cards,settings.cards[settings.initialIndex].id)}sync();},
  demonstrate(){if(!dead&&allowed()&&!runtime.reduced&&runtime.speed>0){engine!.next('auto');if(settings.cards.length===1)report(false)}},
  settle(){if(dead)return;engine!.updateRuntime({...nativeRuntime(),paused:true});engine!.settle();engine!.select(settings.cards[settings.initialIndex].id,'reset');engine!.updateRuntime(nativeRuntime());report(false);host.dataset.manual='false'},
  pause(value=true){if(dead)return;runtime={...runtime,paused:value};sync()},
  select(id:string){if(!dead&&allowed())engine!.select(id)},
  getState(){return {...engine!.getState(),running:busy,settings:structuredClone(settings)}},
  destroy(){if(dead)return;dead=true;abort.abort();observer.disconnect();engine!.destroy();root.remove();host.classList.remove('page-turn-host');report(false)},
 };
}
