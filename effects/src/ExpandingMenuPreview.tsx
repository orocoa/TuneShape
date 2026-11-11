import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createExpandingMenu,defaultExpandingMenu} from './expanding-menu';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useNativeEngine} from './useNativeEngine';
import {usePreviewFit} from './usePreviewFit';
import {useLanguage} from './i18n';
export default function ExpandingMenuPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createExpandingMenu>|null>(null),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.expandingMenu??defaultExpandingMenu;
 const replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&speed>0,700);
 const runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,onRunning:value=>{callback.current?.(side,value);if(thumbnail)replay(value)}},thumbnail,autoPlay);
 const width=settings.items.length*settings.closedWidth+2*(settings.expandedWidth-settings.closedWidth)+56,fit=usePreviewFit(host,width,200,.1,config.scale);
 useNativeEngine(engine,()=>createExpandingMenu(root.current!,settings,runtime));
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(reduced)callback.current?.(side,false);else engine.current?.demonstrate()}},[command.seq,enabled,reduced]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="expanding-menu" data-trigger="hover" data-paused={paused}><div className="history-canvas" style={{background:settings.backgroundColor}}><div style={{position:'absolute',left:'50%',top:'50%',width,height:200,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px)`}}/></div></div></div>;
}
