import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createPageTurnCards,type PageTurnRuntime} from './page-turn-cards';
import {defaultPageTurn} from './page-turn-cards-settings';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useInspectorChange} from './useDetailPlayback';
import {useLanguage} from './i18n';
export default function PageTurnCardsPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,autoPlay=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createPageTurnCards>|null>(null),held=useRef(false),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.pageTurnCards??defaultPageTurn,replay=useNativeGalleryReplay(api,thumbnail&&autoPlay&&enabled&&!paused&&!reduced,1100);
 const runtime:PageTurnRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,durationMs:config.durationMs,language},thumbnail,autoPlay),gallery:thumbnail,onInteract:()=>{held.current=true;replay.cancelPending()},onRunning:running=>{callback.current?.(side,running);if(thumbnail&&!held.current)replay(running)}};
 const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{api.current=createPageTurnCards(root.current!,initial.current.settings,initial.current.runtime);return()=>{api.current?.destroy();api.current=null}},[]);
 useLayoutEffect(()=>{if(!autoPlay)held.current=false;api.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs)api.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)api.current?.demonstrate()},[command.seq]);
 return <div className="history-demo" data-history-preview={side} data-recipe="page-turn-cards" data-trigger="click" data-paused={paused} style={{background:'#f1f1f1'}}><div className="history-canvas" style={{height:thumbnail?'100%':440,background:'#f1f1f1',cursor:'default'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
