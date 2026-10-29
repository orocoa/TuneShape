import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createReel,defaultReel} from './elastic-reel';
import {reelItems} from './elastic-reel-art';
import {useLanguage} from './i18n';
import {reelCss} from './elastic-reel-styles';
import {useInspectorChange} from './useDetailPlayback';

export default function ElasticReelPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,interactive=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createReel>|null>(null),[fit,setFit]=useState(.5);
 const callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.reel??defaultReel;
 const effectiveSettings=thumbnail&&!autoPlay?{...settings,autoplay:'off' as const}:settings;
 const runtime={enabled:enabled&&(!thumbnail||interactive||autoPlay),paused,reduced,speed,durationMs:config.durationMs,repeat:config.loop,language,onRunning:(value:boolean)=>callback.current?.(side,value)};
 const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{
  engine.current=createReel(root.current!,initial.current.settings,reelItems,initial.current.runtime);
  const observer=new ResizeObserver(([entry])=>setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-12)/640,(entry.contentRect.height-12)/400))));observer.observe(host.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[config.recipeId]);
 useLayoutEffect(()=>engine.current?.update(effectiveSettings,runtime),[settings,speed,reduced,enabled,thumbnail,autoPlay,interactive,paused,language,config.durationMs,config.loop]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  const old=previous.reel??defaultReel;
  if(old.openSize!==settings.openSize||old.openAspect!==settings.openAspect)engine.current?.preview('open');
  else if(old.magnify!==settings.magnify||old.influence!==settings.influence||old.elasticity!==settings.elasticity||previous.durationMs!==config.durationMs)engine.current?.preview('hover');
 });
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.replay()},[command.seq]);
 return <div ref={host} className="history-demo elastic-demo" data-history-preview={side} data-recipe={config.recipeId} data-paused={paused}>
  <style>{reelCss}</style><div className="history-canvas"><div className="elastic-fit" style={{transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} className="elastic-reel" data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
 </div>;
}
