import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {animate,motion,motionValue} from 'motion/react';
import {compiledTracks} from './history-model';
import type {HistoryPreviewProps} from './HistoryPreview';
import {defaultTide,createTideRenderer,tidePointer} from './particle-tide';
import type {TidePointer,TideRipple} from './particle-tide';
import {useInspectorChange,usePreviewClock} from './useDetailPlayback';
import {t,useLanguage} from './i18n';
import './particle-tide.css';

export default function ParticleTidePreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();
 const settings=config.tide??defaultTide,host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null);
 const [fit,setFit]=useState({x:1,y:1}),[running,setRunning]=useState(false);
 const phase=useRef(motionValue(0)).current,time=useRef(0),previous=useRef(0),pointer=useRef<TidePointer|null>(null),ripples=useRef<TideRipple[]>([]);
 const renderer=useRef<ReturnType<typeof createTideRenderer>|null>(null),viewport=useRef({width:320,height:230}),targetPointer=useRef<TidePointer|null>(null),paintTime=useRef(0),queued=useRef(0);
 const controls=useRef<ReturnType<typeof animate>[]>([]);
 const frozen=paused||settings.speed===0;
 const clock=usePreviewClock(controls,speed*settings.speed,enabled,frozen);
 const latest=useRef({settings,reduced,enabled,frozen});latest.current={settings,reduced,enabled,frozen};
 const paint=useCallback((force=true)=>{
  const h=host.current,current=latest.current;if(!h||!renderer.current)return;
  const now=performance.now(),dt=Math.min(80,Math.max(1,now-paintTime.current));paintTime.current=now;
  if(!current.frozen){const target=targetPointer.current,old=pointer.current;if(target&&!old)pointer.current={...target,strength:0};const p=pointer.current;if(p){const amount=1-Math.exp(-dt/100);if(target)for(const key of ['x','z','viewX','viewY'] as const)p[key]+=(target[key]-p[key])*amount;p.strength=(p.strength??1)+((target?1:0)-(p.strength??1))*amount;if(!target&&(p.strength??0)<.002)pointer.current=null}}
  renderer.current.render(time.current,current.settings,current.reduced?null:pointer.current,current.reduced?[]:ripples.current,force);
  h.dataset.tideTime=time.current.toFixed(5);h.dataset.ripples=String(ripples.current.length);h.dataset.particles=String(renderer.current.particleCount);h.dataset.renderer=renderer.current.backend;
 },[]);
 useLayoutEffect(()=>{if(!canvas.current)return;renderer.current=createTideRenderer(canvas.current);renderer.current.resize(viewport.current.width,viewport.current.height);paint();return()=>{if(queued.current)cancelAnimationFrame(queued.current);renderer.current?.dispose();renderer.current=null}},[paint]);
 const queuePaint=()=>{if(!queued.current)queued.current=requestAnimationFrame(()=>{queued.current=0;paint(false)})};
 useEffect(()=>phase.on('change',value=>{
  const span=Number(config.tracks[0].values.at(-1))-Number(config.tracks[0].values[0]);
  let delta=value-previous.current;if(delta<0)delta+=span;time.current+=Math.max(0,delta);previous.current=value;
  ripples.current=ripples.current.filter(r=>time.current-r.time<6);paint(false);
 }),[phase,config.tracks,paint]);
 useEffect(()=>onRunningChange?.(side,running),[side,running,onRunningChange,command.seq]);
 useEffect(()=>()=>clock.clear(),[clock.clear]);
 useEffect(()=>{
  if(!host.current)return;const observer=new ResizeObserver(([e])=>{const {width,height}=e.contentRect;viewport.current={width,height};setFit({x:Math.max(.1,width/320),y:Math.max(.1,height/230)});renderer.current?.resize(width,height);paint()});
  observer.observe(host.current);return()=>observer.disconnect();
 },[]);
 // Settings repaint in place. Transport changes establish a fresh clock; pause/speed never reset it.
 const timing=JSON.stringify([config.durationMs,config.delayMs,config.tracks,config.loop,config.easing]);
 useLayoutEffect(()=>{
  clock.clear();time.current=0;previous.current=0;pointer.current=null;targetPointer.current=null;ripples.current=[];phase.set(0);paint();
  if(reduced||(thumbnail&&!autoPlay)||(!thumbnail&&command.seq===0)){setRunning(false);return}
  const track=compiledTracks(config).find(track=>track.property==='tideTime')!;
  const control=clock.register(animate(phase,track.values as number[],track.transition));setRunning(true);let current=true;
  if(!config.loop)Promise.resolve(control).then(()=>{if(current)setRunning(false)});
  return()=>{current=false};
 },[timing,command.seq,reduced,thumbnail,autoPlay,clock.clear,clock.register,phase,paint]);
 useLayoutEffect(()=>{if(!settings.interactive){pointer.current=null;targetPointer.current=null;}if(!settings.clickRipples)ripples.current=[];paint()},[settings,paint]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!frozen&&!reduced,previous=>{
  const point=tidePointer(160,145,settings,time.current,pointer.current,ripples.current);
  if(previous.tide?.interactive!==settings.interactive&&settings.interactive){targetPointer.current=point;pointer.current={...point,strength:1}}
  if(previous.tide?.clickRipples!==settings.clickRipples&&settings.clickRipples)ripples.current=[{x:point.x,z:point.z,time:time.current}];
  paint();
 });
 const canInteract=()=>latest.current.enabled&&!latest.current.frozen&&!latest.current.reduced;
 const position=(event:React.PointerEvent<HTMLDivElement>)=>{const r=event.currentTarget.getBoundingClientRect();return tidePointer((event.clientX-r.left)/r.width*320,(event.clientY-r.top)/r.height*230,latest.current.settings,time.current,pointer.current,ripples.current)};
 const ripple=(point:TidePointer)=>{if(!canInteract()||!settings.clickRipples||point.onSurface===false)return;ripples.current=[...ripples.current.slice(-11),{x:point.x,z:point.z,time:time.current}];paint()};
 const leave=()=>{targetPointer.current=null;if(canInteract())queuePaint()};
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="particle-tide" data-running={running} data-paused={frozen}>
  <div className="history-canvas" role="group" aria-label={t('粒子海浪预览')}><div className="history-fit" style={{transform:`scale(${fit.x},${fit.y})`}}><motion.div className="history-motion-root" data-part="root" style={{x:config.offsetX,y:config.offsetY,scale:config.scale}}>
   <div ref={canvas} className="particle-tide-art" data-part="ocean" role="button" aria-label={t('粒子海面，点击产生涟漪')} tabIndex={enabled?0:-1} aria-disabled={!canInteract()} onClick={event=>event.stopPropagation()} onPointerMove={event=>{if(!canInteract()||!settings.interactive)return;const point=position(event);targetPointer.current=point.onSurface===false?null:point;queuePaint()}} onPointerLeave={leave} onPointerCancel={leave} onPointerDown={event=>{event.stopPropagation();ripple(position(event))}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();ripple(tidePointer(160,145,settings,time.current,pointer.current,ripples.current))}}}/>
  </motion.div></div></div>
 </div>;
}
