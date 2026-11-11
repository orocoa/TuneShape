import {useLayoutEffect,useRef} from 'react';
import {createSkiperEffect,skiperMap} from './skiper-effects';
import type {SkiperEngine,SkiperRuntime} from './skiper-types';
import type {HistoryPreviewProps} from './preview-types';
import {useNativeEngine} from './useNativeEngine';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useLanguage} from './i18n';
import './skiper-scroll-preview.css';
export default function SkiperScrollPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),engine=useRef<SkiperEngine|null>(null),held=useRef(false),wasAutoPlay=useRef(autoPlay),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.skiper??skiperMap[config.recipeId].defaults,replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced,1300);
 const runtime:SkiperRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs},false,autoPlay),delayMs:config.delayMs,gallery:false,managed:thumbnail,onInteract:()=>{held.current=true;replay.cancelPending()},onRunning:value=>{callback.current?.(side,value);if(thumbnail&&!held.current)replay(value)}};
 useNativeEngine(engine,()=>createSkiperEffect(host.current!,config.recipeId,settings,runtime));
 useLayoutEffect(()=>{if(!autoPlay||autoPlay!==wasAutoPlay.current)held.current=false;wasAutoPlay.current=autoPlay;engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div className="history-demo skiper-scroll-preview" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused}><div className="history-canvas" style={{height:thumbnail?'100%':440,background:String(settings.backgroundColor),width:'100%'}}><div ref={host} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
