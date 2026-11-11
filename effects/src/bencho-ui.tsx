import {createRoot} from 'react-dom/client';
import {useLayoutEffect} from 'react';
import {createBenchClock} from './bencho-runtime/clock';
import {createBenchAudio} from './bencho-runtime/audio';
import {scopeBenchoCSS} from './bencho-runtime/scope-css';
import {UiBench,type UiContext,type UiRuntime} from './bencho-ui-runtime/context';
import {validateBenchoUi,type BenchoUiSettings} from './bencho-ui-settings';
import {Upload} from './bencho-ui-runtime/blocks/Upload';
import {SlideConfirm} from './bencho-ui-runtime/blocks/SlideConfirm';
import {Aspect} from './bencho-ui-runtime/blocks/Aspect';
import {Create} from './bencho-ui-runtime/blocks/Create';
import {Watcher} from './bencho-ui-runtime/blocks/Watcher';
import {ContextMeter} from './bencho-ui-runtime/blocks/ContextMeter';
import uploadCss from './bencho-ui-runtime/blocks/Upload.css?raw';
import slideCss from './bencho-ui-runtime/blocks/SlideConfirm.css?raw';
import aspectCss from './bencho-ui-runtime/blocks/Aspect.css?raw';
import createCss from './bencho-ui-runtime/blocks/Create.css?raw';
import watcherCss from './bencho-ui-runtime/blocks/Watcher.css?raw';
import contextCss from './bencho-ui-runtime/blocks/ContextMeter.css?raw';
export type BenchoUiRuntime=UiRuntime;
function Committed({commit}:{commit:()=>void}){useLayoutEffect(commit);return null}
const styles=uploadCss+slideCss+aspectCss+createCss+watcherCss+contextCss;
export function createBenchoUi(host:HTMLElement,input:BenchoUiSettings,initial:UiRuntime){
 let settings=validateBenchoUi(input),runtime=initial,dead=false,busy=false,eyeMotion=false,epoch=0,pending=false,demonstrations=0;
 const abort=new AbortController(),root=document.createElement('div'),style=document.createElement('style'),surface=document.createElement('div'),mount=document.createElement('div'),audio=createBenchAudio();
 root.className='bencho-ui-effect';surface.className='bench-ui-surface';mount.className='bench-ui-mount';surface.append(mount);root.append(style,surface);host.replaceChildren(root);host.dataset.running='false';
 style.textContent=scopeBenchoCSS(styles,'.bencho-ui-effect')+`
.bencho-ui-effect{width:100%;height:100%;position:relative;overflow:hidden;isolation:isolate;background:var(--bui-background);color:var(--ink);font-family:var(--font-ui);--font-ui:ui-sans-serif,system-ui,-apple-system,sans-serif;--surface-2:#ededed;--wash:.06;--signal:#2231dd;--focus:#2231dd;--ok:#15803d;--pane-edge:color-mix(in srgb,var(--fill-on) 12%,transparent)}
.bencho-ui-effect *{box-sizing:border-box}.bencho-ui-effect .bench-ui-surface{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--bui-fit));transform-origin:center}.bencho-ui-effect .bench-ui-mount{width:100%;height:100%;display:grid;place-items:center}
.bencho-ui-effect [tabindex]:focus-visible,.bencho-ui-effect button:focus-visible{outline:2px solid var(--fill-on);outline-offset:3px}.bencho-ui-effect[data-reduced=true] *,.bencho-ui-effect[data-reduced=true] *::before,.bencho-ui-effect[data-reduced=true] *::after{animation:none!important;transition-duration:0ms!important}
.bencho-ui-effect .ctx-seg:not(.ctx-seg-room){background:var(--ctx-colour,var(--fill-on))}
.bencho-ui-effect[data-compact=true] .upl-say b,.bencho-ui-effect[data-compact=true] .upl-name,.bencho-ui-effect[data-compact=true] .sld-say{font-size:calc(12px * var(--bui-ui))}
.bencho-ui-effect[data-compact=true] :is(.upl-say>span,.upl-meta,.upl-label){font-size:calc(10px * var(--bui-ui))}.bencho-ui-effect[data-compact=true] .upl-file{max-width:130px}.bencho-ui-effect .upl-tray{flex-wrap:wrap}.bencho-ui-effect .ctx-chip{max-width:100%}.bencho-ui-effect .ctx-chip-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bencho-ui-effect .crt-item button{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.bencho-ui-effect .upl-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bencho-ui-effect[data-compact=true] .crt-say,.bencho-ui-effect[data-compact=true] .crt-item button{font-size:calc(12px * var(--bui-ui))}.bencho-ui-effect[data-compact=true] .ctx-title{font-size:calc(12px * var(--bui-ui))}
.bencho-ui-effect[data-compact=true] .ctx-chip{font-size:calc(10px * var(--bui-ui));height:calc(22px * var(--bui-ui));gap:calc(4px * var(--bui-ui));padding:0 calc(6px * var(--bui-ui))}.bencho-ui-effect[data-compact=true] .ctx-num{font-size:calc(18px * var(--bui-ui));line-height:1.1}.bencho-ui-effect[data-compact=true] .ctx-of{font-size:calc(9px * var(--bui-ui))}.bencho-ui-effect[data-compact=true] .ctx-act{height:calc(24px * var(--bui-ui));font-size:calc(10px * var(--bui-ui));padding:calc(4px * var(--bui-ui)) calc(7px * var(--bui-ui))}.bencho-ui-effect[data-narrow=true] .eyt-say{font-size:13px;left:50%;top:calc(50% + var(--eyt-size) * .25);transform:translateX(-50%);white-space:normal;max-width:230px;text-align:center;padding:8px 12px}
`;
 const report=(value:boolean)=>{const next=value&&(settings.kind!=='eye-tracker'||eyeMotion)&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden;if(next!==busy){busy=next;host.dataset.running=String(next);runtime.onRunning?.(next)}};
 // Logical completion/hold timers remain available with reduced motion. Every
 // visual driver separately snaps or skips motion using the genuine runtime.
 const clock=createBenchClock({...runtime,reduced:false},report);
 const context:UiContext={settings,runtime,clock,actions:{demonstrate(){},settle(){}},cue:(name,event)=>{if(settings.sound&&runtime.enabled&&!runtime.paused&&!document.hidden)audio.play(name,settings.volume,event)},sync,motion(running){eyeMotion=running;report(clock.getState().running)},activity(ms=600){if(!runtime.reduced)clock.activity(ms)}};
 const react=createRoot(mount);
 function render(){context.settings=settings;context.runtime=runtime;const s=settings;react.render(<UiBench value={context}>
  {s.kind==='upload-dropzone'?<Upload key={epoch} speed={s.speed} bounce={s.bounce} corner={s.corner}/>:s.kind==='slide-confirm'?<SlideConfirm key={epoch} speed={s.speed} width={s.width} corner={s.corner}/>:s.kind==='aspect'?<Aspect key={epoch} morph={s.morph} corner={s.corner}/>:s.kind==='liq-create'?<Create key={epoch} corner={s.corner}/>:s.kind==='eye-tracker'?<Watcher key={epoch} follow={s.follow} bounce={s.bounce} size={s.size} shape={s.shape} eyes={s.eyes}/>:<ContextMeter key={epoch} style={s.meterStyle} colour={s.colour}/>}
  <Committed commit={()=>{sync();if(pending){pending=false;context.actions.demonstrate()}}}/>
 </UiBench>)}
 function fit(){
  const kind=settings.kind,w=kind==='slide-confirm'?settings.width+20:kind==='aspect'?300:kind==='liq-create'?Math.max(264,settings.createLabel.length*8+90,(mount.querySelector<HTMLElement>('.crt-pill')?.offsetWidth??0)+32):kind==='eye-tracker'?Math.max(240,settings.size+80):340,h=kind==='upload-dropzone'?300+Math.floor((settings.files.length-1)/2)*70:kind==='slide-confirm'?110:kind==='aspect'?350:kind==='liq-create'?Math.max(264,settings.menuItems.length*36+70):kind==='eye-tracker'?Math.max(200,settings.size+90):settings.meterStyle==='Field'?340:260;
  const factor=Math.max(.1,Math.min(1,(host.clientWidth-12)/w,(host.clientHeight-(runtime.gallery?52:12))/h));surface.style.top=runtime.gallery?'calc(50% - 20px)':'50%';surface.style.width=w+'px';surface.style.height=h+'px';root.style.setProperty('--bui-fit',String(factor));root.style.setProperty('--bui-ui',String(1/factor));root.dataset.compact=String(host.clientWidth<280);root.dataset.narrow=String(host.clientWidth<500);host.dataset.fit=String(factor);
 }
 function sync(){if(dead)return;const fill=settings.fill==='Dark'?settings.ink:'#ffffff',ink=settings.fill==='Dark'?'#ffffff':settings.ink,rgb=ink.replace('#','').match(/../g)!.map(x=>parseInt(x,16)).join(',');
  root.dataset.gallery=String(Boolean(runtime.gallery));root.dataset.fill=surface.dataset.fill=settings.fill.toLowerCase();root.dataset.kind=settings.kind;root.dataset.reduced=String(runtime.reduced);root.dataset.stroke=surface.dataset.stroke=settings.stroke?'on':'off';root.style.setProperty('--bui-background',settings.background);
  for(const [key,value]of Object.entries({'--bg':settings.background,'--board':fill,'--card':fill,'--fill-slab':fill,'--fill-on':ink,'--fill-on-rgb':rgb,'--ink':ink,'--ink-rgb':rgb,'--ink-3':`rgba(${rgb},.6)`,'--ink-4':`rgba(${rgb},.5)`}))root.style.setProperty(key,value);
  host.dataset.settings=JSON.stringify(settings);host.dataset.enabled=String(runtime.enabled);host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);host.dataset.demonstrations=String(demonstrations);clock.update({...runtime,reduced:false});
  const allowed=runtime.enabled&&!runtime.paused&&!document.hidden;if(!allowed){context.actions.cancel?.();audio.mute()}if(!settings.sound||settings.volume===0)audio.mute();
  for(const animation of root.getAnimations({subtree:true})){animation.playbackRate=runtime.speed*600/runtime.durationMs;if(runtime.reduced||runtime.gallery&&!allowed){try{animation.finish()}catch{animation.cancel()}}else if(!allowed)animation.pause();else if(animation.playState==='paused')animation.play()}
  fit();host.dataset.ready=String(Boolean(mount.firstElementChild));report(clock.getState().running);
 }
 const noteAnimation=()=>{if(dead)return;sync();if(runtime.reduced)return;let ms=0;for(const a of root.getAnimations({subtree:true})){const t=a.effect?.getTiming();if(t&&typeof t.duration==='number'&&t.iterations!==Infinity)ms=Math.max(ms,t.duration+(t.delay??0))}if(ms)context.activity(Math.min(5000,ms+20))};
 root.addEventListener('transitionrun',noteAnimation,{signal:abort.signal});root.addEventListener('animationstart',noteAnimation,{signal:abort.signal});
 const manual=(event:Event)=>{if(event instanceof KeyboardEvent&&event.key==='Tab')return;if(!runtime.enabled||runtime.paused||document.hidden){event.stopPropagation();event.preventDefault();return}context.actions.interrupt?.();runtime.onInteract?.()};
 root.addEventListener('pointerdown',manual,{capture:true,signal:abort.signal});root.addEventListener('keydown',manual,{capture:true,signal:abort.signal});document.addEventListener('visibilitychange',sync,{signal:abort.signal});
 const observer=new ResizeObserver(fit);observer.observe(host);render();sync();
 return {update(value:BenchoUiSettings,next:UiRuntime){if(dead)return;const checked=validateBenchoUi(value),replace=checked.kind!==settings.kind||checked.kind==='aspect'&&checked.ratio!==settings.ratio||checked.kind==='slide-confirm'&&checked.width!==settings.width;if(replace){context.actions.settle();clock.reset();epoch++}settings=checked;runtime=next;render();sync()},
  demonstrate(){if(dead||!runtime.enabled||runtime.paused||runtime.reduced)return;demonstrations++;if(mount.firstElementChild)context.actions.demonstrate();else pending=true;sync()},
  settle(){if(dead)return;context.actions.settle();audio.mute();sync()},pause(paused=true){runtime={...runtime,paused};context.runtime=runtime;sync()},
  getState(){return {kind:settings.kind,...context.actions.getState?.(),clock:clock.getState(),audio:audio.getState(),running:busy,demonstrations}},
  destroy(){if(dead)return;context.actions.cancel?.();dead=true;abort.abort();observer.disconnect();clock.destroy();audio.destroy();root.remove();runtime.onRunning?.(false);queueMicrotask(()=>react.unmount())},
 };
}
