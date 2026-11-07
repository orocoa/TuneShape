import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createChapterProgressNav,defaultChapterProgress,type ChapterProgressRuntime} from './chapter-progress-nav';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useInspectorChange} from './useDetailPlayback';
import {useLanguage} from './i18n';
export default function ChapterProgressNavPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,autoPlay=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createChapterProgressNav>|null>(null),held=useRef(false),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.chapterProgressNav??defaultChapterProgress,replay=useNativeGalleryReplay(api,thumbnail&&autoPlay&&enabled&&!paused&&!reduced,900);
 const runtime:ChapterProgressRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,durationMs:config.durationMs,language},thumbnail,autoPlay),onInteract:()=>{held.current=true;if(root.current)root.current.dataset.manualReading='true';replay.cancelPending()},onRunning:running=>{callback.current?.(side,running);if(thumbnail&&!held.current)replay(running)}};
 const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{api.current=createChapterProgressNav(root.current!,initial.current.settings,initial.current.runtime);return()=>{api.current?.destroy();api.current=null}},[]);
 useLayoutEffect(()=>{if(!autoPlay)held.current=false;if(root.current){root.current.dataset.manualReading=String(held.current);root.current.dataset.galleryActive=String(autoPlay)}api.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);

 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs||previous.chapterProgressNav?.fadeOutMs!==settings.fadeOutMs)api.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)api.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="chapter-progress-nav" data-trigger="click" data-paused={paused}><div className="history-canvas" style={{height:thumbnail?'100%':460,cursor:'default'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
