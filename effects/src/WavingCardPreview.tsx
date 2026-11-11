import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createWavingCard,defaultWavingCard} from './waving-card';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useNativeEngine} from './useNativeEngine';
import {usePreviewFit} from './usePreviewFit';
import {useLanguage} from './i18n';
export default function WavingCardPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createWavingCard>|null>(null),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.wavingCard??defaultWavingCard,replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&speed>0,700);
 const runtime={...nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,onRunning:value=>{callback.current?.(side,value);if(thumbnail)replay(value)}},thumbnail,autoPlay),interactive:enabled};
 const width=Math.max(420,settings.cardWidth+120),lines=Math.ceil(Array.from(settings.description).length*settings.bodySize*.6/(settings.cardWidth-settings.padding*2)),height=Math.max(260,settings.padding*2+32+24+settings.titleSize*1.5+lines*settings.bodySize*1.5+80),fit=usePreviewFit(host,width,height,.1,config.scale);
 useNativeEngine(engine,()=>createWavingCard(root.current!,settings,runtime));
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(reduced)callback.current?.(side,false);else engine.current?.demonstrate()}},[command.seq,enabled,reduced]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="waving-card" data-trigger="hover" data-paused={paused}><div className="history-canvas" style={{background:settings.backgroundColor}}><div style={{position:'absolute',left:'50%',top:'50%',width,height,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px)`}}/></div></div></div>;
}
