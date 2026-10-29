import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createCoffeeSelector,defaultCoffeeSelector} from './coffee-selector';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';
export default function CoffeeSelectorPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createCoffeeSelector>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 // Hover starts/stops the demo; availability owns the clock so an exit can finish.
 const settings=config.coffeeSelector??defaultCoffeeSelector,runtime={...nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,onRunning:(value:boolean)=>callback.current?.(side,value)},false,autoPlay),interactive:enabled,gallery:thumbnail&&autoPlay&&!reduced,interruption:config.interruption},initial=useRef({settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current)return;const r=host.current.getBoundingClientRect();setFit(Math.max(.1,Math.min(1,(r.width-40)/(settings.width*config.scale),(r.height-38)/((settings.rowHeight*5.5+8)*config.scale))))};
 useLayoutEffect(()=>{engine.current=createCoffeeSelector(root.current!,initial.current.settings,initial.current.runtime);const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);observer.observe(root.current!);return()=>{observer.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime);measure.current()},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs,config.scale,config.interruption]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs||previous.coffeeSelector?.bounce!==settings.bounce)engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="coffee-selector" data-trigger="click" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:'max-content',transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>;
}
