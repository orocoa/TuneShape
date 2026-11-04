import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createLiquidGlassLogo,defaultLiquidGlassLogo,type GlassLogoRuntime} from './liquid-glass-logo';
import {glassLogoDesignHeight,glassLogoDesignWidth} from './liquid-glass-logo-settings';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useInspectorChange} from './useDetailPlayback';
import {useLanguage} from './i18n';
export default function LiquidGlassLogoPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createLiquidGlassLogo>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.liquidGlassLogo??defaultLiquidGlassLogo,height=glassLogoDesignHeight(settings),replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&speed>0,Math.max(350,settings.loopDelay*1000));
 const runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,offsetX:config.offsetX,offsetY:config.offsetY,scale:config.scale,onSeek:()=>replay.cancelPending(),onRunning:(value:boolean)=>{callback.current?.(side,value);if(thumbnail)replay(value)}} as GlassLogoRuntime,thumbnail,autoPlay),initial=useRef({settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current)return;const b=host.current.getBoundingClientRect();setFit(Math.max(.05,Math.min(1,(b.width-12)/glassLogoDesignWidth,(b.height-12)/height)))};
 useLayoutEffect(()=>{engine.current=createLiquidGlassLogo(root.current!,initial.current.settings,initial.current.runtime);const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);measure.current();return()=>{observer.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime);measure.current()},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs,config.delayMs,config.offsetX,config.offsetY,config.scale,height]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(settings.exportType==='image'){engine.current?.seek(settings.exportFrame);return}if(settings.paused)return;const before=previous.liquidGlassLogo;const keys=Object.keys(settings).filter(k=>!k.startsWith('export')&&k!=='paused') as (keyof typeof settings)[];if(before&&keys.some(k=>before[k]!==settings[k])||previous.durationMs!==config.durationMs||previous.delayMs!==config.delayMs||previous.offsetX!==config.offsetX||previous.offsetY!==config.offsetY||previous.scale!==config.scale||before?.exportType==='image')engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(settings.exportType==='image')engine.current?.seek(settings.exportFrame);else engine.current?.demonstrate()}},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="liquid-glass-logo" data-trigger="loading" data-paused={paused} style={{background:settings.transparentBackground?'transparent':settings.backgroundColor}}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:glassLogoDesignWidth,height,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{width:glassLogoDesignWidth,height}}/></div></div></div>
}
