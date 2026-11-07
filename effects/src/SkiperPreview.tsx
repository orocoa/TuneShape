import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createSkiperEffect,skiperMap} from './skiper-effects';
import type {SkiperEngine} from './skiper-types';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useLanguage} from './i18n';
export default function SkiperPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<SkiperEngine|null>(null),callback=useRef(onRunningChange),[fit,setFit]=useState(1);callback.current=onRunningChange;
 const d=skiperMap[config.recipeId],settings=config.skiper??d.defaults;
 const base=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs},false,autoPlay);
 const runtime={...base,delayMs:config.delayMs,gallery:thumbnail&&autoPlay&&!reduced,managed:thumbnail,onRunning:(value:boolean)=>callback.current?.(side,value)};
 const initial=useRef({id:config.recipeId,settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{const r=host.current?.getBoundingClientRect();if(r)setFit(Math.max(.04,Math.min(1,(r.width-12)/(d.width*config.scale),(r.height-12)/(d.height*config.scale))))};
 useLayoutEffect(()=>{engine.current=createSkiperEffect(root.current!,initial.current.id,initial.current.settings,initial.current.runtime);const o=new ResizeObserver(()=>measure.current());o.observe(host.current!);measure.current();return()=>{o.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime);measure.current()},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs,config.scale]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:d.width,height:d.height,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{width:d.width,height:d.height,transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>;
}
