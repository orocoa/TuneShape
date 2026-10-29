import {createFlowWatercolorRenderer} from './watercolor-flow';
import {createOriginalWatercolorRenderer} from './watercolor-original';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {animate,motion,motionValue} from 'motion/react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {compiledTracks} from './history-model';
import {createWatercolorRenderer,defaultWatercolor} from './watercolor';
import type {WatercolorPointer} from './watercolor';
import {useInspectorChange,usePreviewClock} from './useDetailPlayback';
import {t,useLanguage} from './i18n';
import './watercolor.css';

export default function WatercolorPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();const settings=config.watercolor??defaultWatercolor;
 const host=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),renderer=useRef<ReturnType<typeof createWatercolorRenderer>|null>(null);
 const [fit,setFit]=useState(1),[running,setRunning]=useState(false);
 const phase=useRef(motionValue(0)).current,time=useRef(0),previous=useRef(0),pointer=useRef<WatercolorPointer|null>(null);
 const controls=useRef<ReturnType<typeof animate>[]>([]),clock=usePreviewClock(controls,speed*settings.speed,enabled,paused);
 const latest=useRef({settings,reduced,enabled,paused});latest.current={settings,reduced,enabled,paused};
 const paint=useCallback((force=true)=>{const current=latest.current;renderer.current?.render(time.current,current.settings,current.reduced?null:pointer.current,force);if(host.current){host.current.dataset.watercolorTime=time.current.toFixed(5);host.current.dataset.renderer=renderer.current?.backend??'pending';host.current.dataset.pointer=pointer.current?`${pointer.current.x.toFixed(3)},${pointer.current.y.toFixed(3)}`:''}},[]);
 useLayoutEffect(()=>{if(!surface.current)return;renderer.current=(config.recipeId==='watercolor-original'?createOriginalWatercolorRenderer:config.recipeId==='watercolor-flow'?createFlowWatercolorRenderer:createWatercolorRenderer)(surface.current);paint();return()=>{renderer.current?.dispose();renderer.current=null}},[paint,config.recipeId]);
 useEffect(()=>phase.on('change',value=>{const span=Number(config.tracks[0].values.at(-1))-Number(config.tracks[0].values[0]);let delta=value-previous.current;if(delta<0)delta+=span;time.current+=Math.max(0,delta);previous.current=value;paint(false)}),[phase,config.tracks,paint]);
 useEffect(()=>onRunningChange?.(side,running),[side,running,onRunningChange,command.seq]);
 useEffect(()=>()=>clock.clear(),[clock.clear]);
 useEffect(()=>{if(!host.current)return;const observer=new ResizeObserver(([e])=>setFit(Math.max(.1,Math.max(e.contentRect.width/320,e.contentRect.height/230))));observer.observe(host.current);return()=>observer.disconnect()},[]);
 useLayoutEffect(()=>paint(),[fit,config.scale,paint]);
 const timing=JSON.stringify([config.durationMs,config.delayMs,config.tracks,config.loop]);
 useLayoutEffect(()=>{
  clock.clear();time.current=0;previous.current=0;pointer.current=null;phase.set(0);paint();
  if(reduced||(thumbnail&&!autoPlay)||(!thumbnail&&command.seq===0)){setRunning(false);return}
  const track=compiledTracks(config).find(track=>track.property==='watercolorTime')!;
  const control=clock.register(animate(phase,track.values as number[],track.transition));setRunning(true);let current=true;
  if(!config.loop)Promise.resolve(control).then(()=>{if(current)setRunning(false)});
  return()=>{current=false};
 },[timing,command.seq,reduced,thumbnail,autoPlay,clock.clear,clock.register,phase,paint]);
 useLayoutEffect(()=>{if(!settings.cursorInteraction)pointer.current=null;paint()},[settings,paint]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  if(settings.cursorInteraction&&(previous.watercolor?.cursorIntensity!==settings.cursorIntensity||!previous.watercolor?.cursorInteraction)){
   pointer.current={x:.5,y:.5};paint();
  }
 });
 const canInteract=()=>enabled&&!paused&&!reduced&&settings.cursorInteraction;
 const leave=()=>{pointer.current=null;if(!paused)paint()};
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-running={running} data-paused={paused}>
  <div className="history-canvas" role="group" aria-label={t('水彩融合预览')}><div className="history-fit" style={{transform:`scale(${fit})`}}><motion.div className="history-motion-root" data-part="root" style={{x:config.offsetX,y:config.offsetY,scale:config.scale}}>
   <div ref={surface} data-part="watercolor" className="watercolor-art" role="img" aria-label={t('双颜色水彩融合背景')} tabIndex={enabled?0:-1} onPointerMove={e=>{if(!canInteract())return;const r=e.currentTarget.getBoundingClientRect();pointer.current={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};paint()}} onPointerLeave={leave} onPointerCancel={leave} onFocus={()=>{if(canInteract()){pointer.current={x:.5,y:.5};paint()}}} onBlur={leave}/>
  </motion.div></div></div>
 </div>;
}
