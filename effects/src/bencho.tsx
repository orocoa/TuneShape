import {createRoot} from 'react-dom/client';
import {useLayoutEffect} from 'react';
import {Bench,type BenchContext} from './bencho-runtime/context';
import {createBenchClock} from './bencho-runtime/clock';
import {scopeBenchoCSS} from './bencho-runtime/scope-css';
import {createBenchAudio} from './bencho-runtime/audio';
import {CardSwap} from './bencho-runtime/blocks/CardSwap';
import {WakeSlider} from './bencho-runtime/blocks/WakeSlider';
import {Compare} from './bencho-runtime/blocks/Compare';
import {LabelInput} from './bencho-runtime/blocks/LabelInput';
import {Carousel} from './bencho-runtime/blocks/Carousel';
import cardCss from './bencho-runtime/blocks/CardSwap.css?raw';
import wakeCss from './bencho-runtime/blocks/WakeSlider.css?raw';
import compareCss from './bencho-runtime/blocks/Compare.css?raw';
import labelCss from './bencho-runtime/blocks/LabelInput.css?raw';
import carouselCss from './bencho-runtime/blocks/Carousel.css?raw';
import {validateBencho,type BenchoSettings} from './bencho-settings';
import type {NativeEffectRuntime} from './native-effect-tools';
export type BenchRuntime=NativeEffectRuntime&{gallery?:boolean;onInteract?:()=>void};
const styles=cardCss+wakeCss+compareCss+labelCss+carouselCss;
function Committed({onCommit}:{onCommit:()=>void}){useLayoutEffect(onCommit);return null}
export function createBencho(host:HTMLElement,input:BenchoSettings,initial:BenchRuntime){
 let settings=validateBencho(input),runtime=initial,dead=false,busy=false,epoch=0,pendingDemo=false;
 const abort=new AbortController(),audio=createBenchAudio(),root=document.createElement('div'),style=document.createElement('style'),surface=document.createElement('div'),mount=document.createElement('div');
 root.className='bencho-effect';root.dataset.kind=settings.kind;surface.className='bench-surface';mount.className='bench-mount';surface.append(mount);root.append(style,surface);host.replaceChildren(root);host.dataset.running='false';
 style.textContent=scopeBenchoCSS(styles)+`\n.bencho-effect{position:relative;width:100%;height:100%;display:grid;place-items:center;overflow:hidden;isolation:isolate;--font-ui:ui-sans-serif,system-ui,sans-serif;--bg:var(--bench-bg);--fill-slab:var(--bench-bg);--fill-on:var(--bench-ink);--ink:var(--bench-ink);--ink-3:#666;--ink-4:#777;--shadow-rgb:0,0,0;--ink-rgb:36,36,36;font-family:var(--font-ui);color:var(--bench-ink);background:var(--bench-bg)}.bencho-effect *{box-sizing:border-box}.bencho-effect .bench-surface{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--bench-fit));transform-origin:center}.bencho-effect .bench-mount{width:100%;height:100%;display:grid;place-items:center}.bencho-effect .csw-card{border-radius:var(--bench-corner);transition-duration:var(--bench-duration)}.bencho-effect .csw-photo{border-radius:max(0px,calc(var(--bench-corner) - 3px))}.bencho-effect [tabindex]:focus-visible{outline:2px solid #555;outline-offset:4px}.bencho-effect[data-reduced=true] *{animation:none!important;transition-duration:0ms!important}.bencho-effect .lbi-field{font-family:var(--font-ui)}.bencho-effect [data-front]{outline-offset:5px}`;
 const report=(value:boolean)=>{if(dead)return;const running=value||settings.kind==='carousel'&&settings.float>0&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden;if(running!==busy){busy=running;host.dataset.running=String(busy);runtime.onRunning?.(busy)}};
 const clock=createBenchClock(runtime,report);
 const context:BenchContext={settings,runtime,clock,actions:{demonstrate(){},settle(){}},cue:(name,event)=>{if(settings.sound&&runtime.enabled&&!runtime.paused&&!document.hidden)audio.play(name,settings.volume,event)}};
 const react=createRoot(mount);
 function render(){context.settings=settings;context.runtime=runtime;const props=settings;react.render(<Bench value={context}>{settings.kind==='card-swap'?<CardSwap key={epoch} auto={settings.auto} every={settings.every}/>:settings.kind==='wake-slider'?<WakeSlider key={epoch} bars={settings.bars} wake={settings.wake}/>:settings.kind==='image-compare'?<Compare key={epoch} labels={settings.labels} corner={settings.corner}/>:settings.kind==='label-input'?<LabelInput key={epoch} field={settings.field} corner={settings.corner} showcase={Boolean(runtime.gallery)}/>:<Carousel key={epoch} orbit={props.orbit} depth={props.depth} corner={props.corner} float={props.float} sink={props.sink} settle={props.settle}/>}<Committed onCommit={()=>{sync();if(pendingDemo){pendingDemo=false;context.actions.demonstrate()}}}/></Bench>)}
 function fit(){const w=settings.kind==='carousel'?540:settings.kind==='card-swap'?360:settings.kind==='image-compare'?320:settings.kind==='wake-slider'?Math.max(320,settings.bars*7+80):340,h=settings.kind==='carousel'?390:settings.kind==='card-swap'?380:settings.kind==='image-compare'?410:180;surface.style.width=w+'px';surface.style.height=h+'px';root.style.setProperty('--bench-fit',String(Math.max(.05,Math.min(1,(host.clientWidth-12)/w,(host.clientHeight-12)/h))))}
 function sync(){if(dead)return;root.dataset.reduced=String(runtime.reduced);root.style.setProperty('--bench-bg',settings.background);root.style.setProperty('--bench-ink',settings.ink);root.style.setProperty('--bench-corner',settings.corner+'px');root.style.setProperty('--bench-duration','600ms');host.dataset.settings=JSON.stringify(settings);host.dataset.enabled=String(runtime.enabled);host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);host.dataset.duration=String(runtime.durationMs);host.dataset.speed=String(runtime.speed);clock.update(runtime);
  const allowed=runtime.enabled&&!runtime.paused&&!document.hidden;if(!allowed)context.actions.cancel?.();if(!allowed||!settings.sound||settings.volume===0)audio.mute()
  // An idle gallery field must close its notch with the label in a stable pose.
  // Explicit pause in the detail or portable runtime still freezes the current frame.
  const settleLabel=runtime.gallery&&!runtime.enabled&&settings.kind==='label-input';
  for(const a of root.getAnimations({subtree:true})){a.playbackRate=runtime.speed*600/runtime.durationMs;if(runtime.reduced||settleLabel){try{a.finish()}catch{a.cancel()}}else if(!allowed)a.pause();else if(a.playState==='paused')a.play()}
  fit();report(clock.getState().running);host.dataset.ready='true';
 }
 render();sync();
 const observer=new ResizeObserver(fit);observer.observe(host);
 const manual=(event:Event)=>{if(!runtime.enabled||runtime.paused){event.stopPropagation();event.preventDefault();return}runtime.onInteract?.()};root.addEventListener('pointerdown',manual,{capture:true,signal:abort.signal});root.addEventListener('keydown',manual,{capture:true,signal:abort.signal});
 document.addEventListener('visibilitychange',sync,{signal:abort.signal});
 root.addEventListener('transitionrun',sync,{signal:abort.signal});root.addEventListener('animationstart',sync,{signal:abort.signal});
 return {
  update(value:BenchoSettings,next:BenchRuntime){if(dead)return;const checked=validateBencho(value),changed=JSON.stringify(checked)!==JSON.stringify(settings);runtime=next;if(changed){audio.mute();clock.reset();context.actions.cancel?.();epoch++}settings=checked;render();sync()},
  demonstrate(){if(!dead&&runtime.enabled&&!runtime.paused&&!runtime.reduced){if(mount.firstElementChild)context.actions.demonstrate();else pendingDemo=true;sync()}},
  settle(){if(dead)return;context.actions.settle();sync()},pause(value=true){runtime={...runtime,paused:value};context.runtime=runtime;sync()},
  getState(){return {kind:settings.kind,...context.actions.getState?.(),clock:clock.getState(),audio:audio.getState(),running:busy}},
  destroy(){if(dead)return;dead=true;clock.destroy();audio.destroy();abort.abort();observer.disconnect();root.remove();runtime.onRunning?.(false);queueMicrotask(()=>react.unmount())},
 };
}
