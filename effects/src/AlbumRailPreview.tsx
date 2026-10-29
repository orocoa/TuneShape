import {useLayoutEffect,useRef,useState,useMemo} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createAlbumRail,defaultAlbum} from './album-rail';
import {resolveAlbumItems} from './album-content';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';

export default function AlbumRailPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createAlbumRail>|null>(null),[fit,setFit]=useState(.5);
 const callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.album??defaultAlbum,runtime={enabled:enabled&&(!thumbnail||autoPlay),paused,reduced,speed,durationMs:config.durationMs,repeat:config.loop,language,onRunning:(running:boolean)=>callback.current?.(side,running)};
 const items=useMemo(()=>resolveAlbumItems(config.albumCovers),[config.albumCovers]);
 const initial=useRef({settings,runtime});initial.current={settings,runtime};
 useLayoutEffect(()=>{
  engine.current=createAlbumRail(root.current!,initial.current.settings,items,initial.current.runtime);
  const observer=new ResizeObserver(([entry])=>setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-12)/640,(entry.contentRect.height-12)/420))));observer.observe(host.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[items]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,thumbnail,autoPlay,paused,language,config.durationMs,config.loop]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  const api=engine.current,old=previous.album??defaultAlbum;if(!api)return;
  if(settings.vinyl&&(old.rpm!==settings.rpm||old.vinyl!==settings.vinyl)){
   if(Number(root.current?.dataset.playing??-1)<0)api.toggle();
  }else if(previous.durationMs!==config.durationMs||old.interval!==settings.interval||old.autoplay!==settings.autoplay&&settings.autoplay)api.goTo((Number(root.current?.dataset.index??0)+1)%items.length);
 });
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.replay()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="album-rail" data-paused={paused} style={{background:settings.backgroundColor}}>
  <div className="history-canvas"><div style={{position:'absolute',width:640,height:420,left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} className="album-rail" data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
 </div>;
}
