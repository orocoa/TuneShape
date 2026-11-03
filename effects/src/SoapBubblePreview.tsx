import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createSoapBubble,defaultSoapBubble} from './soap-bubble';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useLanguage} from './i18n';
export default function SoapBubblePreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createSoapBubble>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.soapBubble??defaultSoapBubble,runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,onRunning:(running:boolean)=>callback.current?.(side,running)},thumbnail,autoPlay),initial=useRef({settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current)return;const b=host.current.getBoundingClientRect();setFit(Math.max(.1,Math.min(1,(b.width-12)/600,(b.height-12)/430)))};
 useLayoutEffect(()=>{engine.current=createSoapBubble(root.current!,initial.current.settings,initial.current.runtime);const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);measure.current();return()=>{observer.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime);measure.current()},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs,config.scale]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="soap-bubble" data-trigger="loading" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:600,height:430,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>
}
