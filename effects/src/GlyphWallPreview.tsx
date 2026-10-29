import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {animate,motion,motionValue} from 'motion/react';
import {compiledTracks} from './history-model';
import type {HistoryPreviewProps} from './HistoryPreview';
import {defaultGlyphWall,frameGlyphWall,glyphPosterPhase,planGlyphWall} from './glyph-wall';
import {usePreviewClock} from './useDetailPlayback';
import {t,useLanguage} from './i18n';
import './glyph-wall.css';

export default function GlyphWallPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [seed,setSeed]=useState(0),[focused,setFocused]=useState<number|null>(null),[running,setRunning]=useState(false),[revision,setRevision]=useState(0),[size,setSize]=useState({width:640,height:360});
 const phase=useRef(motionValue(0)).current,previousPhase=useRef(0),live=useRef(false);
 const controls=useRef<ReturnType<typeof animate>[]>([]),clock=usePreviewClock(controls,speed,enabled,paused||focused!==null);
 const settings=config.wall??defaultGlyphWall,plan=useMemo(()=>planGlyphWall(settings,seed,size),[settings,seed,size]);
 const latest=useRef({config,settings,plan,seed,focused,reduced});latest.current={config,settings,plan,seed,focused,reduced};
 const paint=useCallback(()=>{
  const c=canvas.current,h=host.current;if(!c||!h)return;
  const current=latest.current,p=phase.get();
  if(live.current&&current.config.loop&&p<.1&&previousPhase.current>.9&&current.settings.shuffle)setSeed(n=>n+1);
  previousPhase.current=p;
  const frame=frameGlyphWall(current.plan,current.settings,current.reduced?glyphPosterPhase(current.config.durationMs,current.settings,current.config.loop):p,current.config.durationMs,current.config.loop,current.seed,current.focused);
  const ctx=c.getContext('2d');if(!ctx)return;
  const ratio=Math.min(2,devicePixelRatio||1),w=Math.round(current.plan.width*ratio),height=Math.round(current.plan.height*ratio);if(c.width!==w||c.height!==height){c.width=w;c.height=height}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,current.plan.width,current.plan.height);
  ctx.font=`500 ${current.plan.fontSize}px ui-monospace, "SFMono-Regular", Menlo, monospace`;ctx.textBaseline='top';ctx.fillStyle=current.settings.noiseColor;
  for(const glyph of frame.glyphs){ctx.globalAlpha=glyph.opacity;ctx.fillText(glyph.text,glyph.x,glyph.y)}
  ctx.globalAlpha=1;
  h.dataset.phase=p.toFixed(5);h.dataset.wallStage=frame.stage;h.dataset.layoutSeed=String(current.seed);
  h.querySelectorAll<HTMLButtonElement>('[data-wall-word]').forEach((button,i)=>{
   const word=frame.words[i];if(!word)return;
   button.textContent=word.text;button.style.opacity=String(word.opacity);
   button.dataset.decoded=String(word.progress>=1&&word.opacity>.05);
   button.setAttribute('aria-hidden',String(word.opacity<=.05));
   button.tabIndex=word.progress>=1&&word.opacity>.05?0:-1;
   button.style.pointerEvents=word.progress>=1&&word.opacity>.05?'auto':'none';
  });
 },[phase]);
 useEffect(()=>phase.on('change',paint),[phase,paint]);
 useEffect(()=>onRunningChange?.(side,running),[side,running,onRunningChange,command.seq]);
 useEffect(()=>()=>{live.current=false;clock.clear()},[clock.clear]);
 useEffect(()=>{
  if(!host.current)return;
  const observer=new ResizeObserver(([entry])=>setSize({width:Math.max(80,Math.round(entry.contentRect.width)),height:Math.max(80,Math.round(entry.contentRect.height))}));
  observer.observe(host.current);return()=>observer.disconnect();
 },[]);
 useLayoutEffect(()=>{
  clock.clear();live.current=false;previousPhase.current=0;
  if(reduced||(thumbnail&&!autoPlay)||(!thumbnail&&command.seq===0&&revision===0)){
   phase.set(glyphPosterPhase(config.durationMs,settings,config.loop));setRunning(false);paint();return;
  }
  let current=true;setFocused(null);phase.set(0);paint();live.current=true;
  const track=compiledTracks(config).find(t=>t.property==='glyphPhase')!;
  const control=clock.register(animate(phase,track.values as number[],track.transition));setRunning(true);
  if(!config.loop)Promise.resolve(control).then(()=>{if(current){live.current=false;setRunning(false)}});
  return()=>{current=false;live.current=false};
 },[config,command.seq,reduced,thumbnail,autoPlay,revision,clock.clear,clock.register,phase,paint]);
 useLayoutEffect(paint,[paint,plan,focused]);
 const shuffle=()=>{if(!enabled||paused)return;setFocused(null);setSeed(n=>n+1);setRevision(n=>n+1)};
 const focus=(index:number)=>{if(enabled&&!paused&&host.current?.querySelector(`[data-wall-word="${index}"]`)?.getAttribute('data-decoded')==='true')setFocused(index)};
 return <div className="history-demo" ref={host} data-history-preview={side} data-recipe="glyph-wall" data-running={running} data-paused={paused} data-focused-word={focused??''}>
  <div className="history-canvas" role="group" aria-label={t('文字解码墙预览')}>
   <div className="history-fit" style={{width:size.width,height:size.height,flexBasis:size.width}}><motion.div className="history-motion-root" data-part="root" style={{x:config.offsetX,y:config.offsetY,scale:config.scale,width:size.width,height:size.height}}>
    <div className="glyph-wall-art" style={{width:size.width,height:size.height}} data-part="wall" onClick={event=>{event.stopPropagation();shuffle()}}>
     <canvas ref={canvas} width={1280} height={720} aria-hidden="true"/>
     {plan.words.map((word,index)=><button type="button" data-wall-word={index} data-focused={focused===index} key={index} className="glyph-wall-word" aria-label={word.label} disabled={!enabled||paused} onClick={event=>{event.stopPropagation();focus(index)}} onMouseEnter={()=>focus(index)} onMouseLeave={()=>{if(!host.current?.querySelector(`[data-wall-word="${index}"]`)?.matches(':focus'))setFocused(null)}} onFocus={()=>focus(index)} onBlur={()=>setFocused(null)} onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.blur();setFocused(null)}}} style={{left:word.x,top:word.y,width:word.width,fontSize:plan.fontSize,color:settings.color}}>{word.label}</button>)}
     <button type="button" className="glyph-wall-shuffle" aria-label={t('重新排布词组')} onClick={event=>{event.stopPropagation();shuffle()}} disabled={!enabled||paused}>↻</button>
    </div>
   </motion.div></div>
  </div>
 </div>;
}
