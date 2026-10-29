import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createOrbit,defaultOrbit} from './orbit-reel';
import {orbitItems} from './orbit-reel-art';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';

export default function OrbitReelPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();const host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createOrbit>|null>(null),[fit,setFit]=useState(1);
 const callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.orbit??defaultOrbit,runtime={enabled:enabled&&(!thumbnail||autoPlay),paused,reduced,speed,durationMs:config.durationMs,repeat:config.loop,onRunning:(running:boolean)=>callback.current?.(side,running)};
 const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{
  engine.current=createOrbit(root.current!,initial.current.settings,orbitItems,initial.current.runtime);
  const observer=new ResizeObserver(([e])=>setFit(Math.max(.1,Math.min((e.contentRect.width-12)/320,(e.contentRect.height-12)/230))));observer.observe(host.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,thumbnail,autoPlay,paused,config.durationMs,config.loop]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  const api=engine.current,old=previous.orbit??defaultOrbit;if(!api)return;
  if(previous.durationMs!==config.durationMs){api.setView(root.current?.dataset.view==='ring'?'arc':'ring');return}
  if(['arc','gap','interval','autoplay'].some(key=>old[key as keyof typeof old]!==settings[key as keyof typeof settings]))api.setView('arc');
  else if(['spin','tilt','flipWave','accentColor'].some(key=>old[key as keyof typeof old]!==settings[key as keyof typeof settings])){api.replay();api.setView('ring')}
 });
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.replay()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="orbit-reel" data-paused={paused} style={{background:settings.backgroundColor}}>
  <div className="history-canvas"><div className="history-fit" style={{transform:`scale(${fit})`}}><div ref={root} className="orbit-reel" data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
 </div>;
}
