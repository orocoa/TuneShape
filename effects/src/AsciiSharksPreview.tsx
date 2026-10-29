import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createAsciiSharks} from './ascii-sharks-engine';
import {defaultAsciiSharks} from './ascii-sharks-settings';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useLanguage} from './i18n';

export default function AsciiSharksPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createAsciiSharks>|null>(null),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.asciiSharks??defaultAsciiSharks;
 const runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,loop:config.loop,onRunning:(value:boolean)=>callback.current?.(side,value)},thumbnail,autoPlay),initial=useRef({settings,runtime});
 useLayoutEffect(()=>{engine.current=createAsciiSharks(root.current!,initial.current.settings,initial.current.runtime);return()=>{engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs,config.loop]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div className="history-demo" data-history-preview={side} data-recipe="ascii-sharks" data-trigger="loading" data-paused={paused}><div className="history-canvas" style={{background:settings.backgroundColor}}><div ref={root} data-part="root" style={{position:'absolute',inset:0,overflow:'hidden',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
