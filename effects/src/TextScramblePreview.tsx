import {t,useLanguage} from './i18n';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import {animate,motionValue} from 'motion/react';
import {compiledTracks,recipeMap} from './history-model';
import {scrambleFrame,scrambleTargets,scrambleInteraction} from './text-scramble';
import type {HistoryPreviewProps} from './HistoryPreview';
import {usePreviewClock} from './useDetailPlayback';

const {text:TEXT,radiusEm:RADIUS_EM,changeIntervalMs:CHANGE_INTERVAL,replayIndex:REPLAY_INDEX,lineBreakIndex:LINE_BREAK_INDEX}=scrambleInteraction;
type GlyphAnimation={control:ReturnType<typeof animate>;dispose:()=>void};

/** Each touched glyph owns its recovery clock; no pointer event starts a line-wide reveal. */
export default function TextScramblePreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,paused:transportPaused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();
 const host=useRef<HTMLDivElement>(null),text=useRef<HTMLDivElement>(null);
 const [fit,setFit]=useState(.9),[running,setRunning]=useState(false);
 const progress=useRef(Array.from(TEXT,()=>1)),variations=useRef(Array.from(TEXT,()=>0));
 const nextChange=useRef(Array.from(TEXT,()=>0)),animations=useRef(new Map<number,GlyphAnimation>());
 const previous=useRef<{x:number;y:number}|null>(null),lastCommand=useRef(0);
 const previousConfig=useRef(config);
 const clock=useRef(speed);clock.current=speed;
 const controls=useRef<ReturnType<typeof animate>[]>([]),controlClock=usePreviewClock(controls,speed,enabled,transportPaused),demo=useRef(false);
 useEffect(()=>onRunningChange?.(side,running),[onRunningChange,side,running,command.seq]);

 function paint(){
  const cells=text.current?.children;if(!cells)return;
  const frame=scrambleFrame(1,progress.current,variations.current);
  frame.forEach((glyph,index)=>{
   const cell=cells[index] as HTMLElement,source=cell.children[0] as HTMLElement,noise=cell.children[1] as HTMLElement;
   const noisy=glyph.color!=='inherit',recovery=Math.max(0,Math.min(1,progress.current[index]));
   cell.dataset.noisy=String(noisy);cell.classList.toggle('is-framed',noisy&&glyph.framed);
   source.style.opacity=String(noisy?recovery:1);
   noise.textContent=glyph.text;noise.style.color=glyph.color;noise.style.opacity=String(noisy?1-recovery:0);
  });
 }
 function settle(){
  for(const animation of animations.current.values()){animation.control.stop();animation.dispose()}
  controlClock.clear();demo.current=false;animations.current.clear();progress.current.fill(1);nextChange.current.fill(0);previous.current=null;
  paint();setRunning(false);
 }
 function disturbAt(x:number,y:number){
  const node=text.current;if(!node||!enabled||reduced||transportPaused||document.hidden)return;
  const bounds=node.getBoundingClientRect(),scale=bounds.width/(node.offsetWidth||bounds.width);
  const radius=parseFloat(getComputedStyle(node).fontSize)*scale*RADIUS_EM;
  const centers=Array.from(node.children,(cell,index)=>{const r=cell.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,fixed:/\s/.test(TEXT[index])}});
  const touched=scrambleTargets(x,y,centers,radius),now=performance.now();
  const track=compiledTracks(config).find(t=>t.property==='textProgress');if(!track)return;
  for(const index of touched){
   const old=animations.current.get(index);if(old){old.control.stop();old.dispose();controlClock.forget(old.control)}
   if(now>=nextChange.current[index]){variations.current[index]++;nextChange.current[index]=now+CHANGE_INTERVAL}
   // Movement renews only the touched characters; the others finish their own short trail.
   const values=track.values.map(Number),from=Number(values[0]);
   progress.current[index]=from;
   const value=motionValue(from),unsubscribe=value.on('change',v=>{progress.current[index]=v;paint()});
   const dispose=()=>{unsubscribe();value.destroy()};
   const control=animate(value,values,{...track.transition,repeat:0,repeatDelay:0,onComplete:()=>{
    progress.current[index]=1;animations.current.delete(index);controlClock.forget(control);dispose();paint();
    if(!animations.current.size){demo.current=false;setRunning(false)}
   }});
   controlClock.register(control);animations.current.set(index,{control,dispose});
  }
  if(touched.length){paint();setRunning(true)}
 }
 function replay(){
  settle();variations.current.fill(0);
  const cell=text.current?.children[REPLAY_INDEX];if(!cell)return;
  const r=cell.getBoundingClientRect();disturbAt(r.left+r.width/2,r.top+r.height/2);
 }
 function move(event:PointerEvent<HTMLDivElement>){
  if(demo.current||transportPaused)return;
  if(event.pointerType==='touch'||event.buttons||!(event.target as Element).closest('[data-part="scramble"]'))return;
  const p=previous.current;if(p&&Math.hypot(event.clientX-p.x,event.clientY-p.y)<.5)return;
  previous.current={x:event.clientX,y:event.clientY};disturbAt(event.clientX,event.clientY);
 }
 useLayoutEffect(()=>{settle()},[config,reduced,enabled]);
 useLayoutEffect(()=>{
  const changed=previousConfig.current!==config;previousConfig.current=config;
  if(changed&&side==='after'&&!thumbnail&&enabled&&!transportPaused){replay();demo.current=animations.current.size>0}
 },[config,side,thumbnail,enabled,transportPaused]);
 useEffect(()=>{
  const node=host.current;if(!node)return;
  const observer=new ResizeObserver(([entry])=>{
   setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-14)/320,thumbnail?(entry.contentRect.height-12)/230:1)));
  });observer.observe(node);return()=>observer.disconnect();
 },[thumbnail]);
 useEffect(()=>{if(lastCommand.current!==command.seq){lastCommand.current=command.seq;if(command.active){replay();demo.current=!!command.demo&&animations.current.size>0}else settle()}},[command.seq,command.active]);
 useEffect(()=>{
  return()=>{controlClock.clear();for(const a of animations.current.values()){a.control.stop();a.dispose()}animations.current.clear()};
 },[]);
 return <div className="history-demo" ref={host} data-history-preview={side} data-recipe={config.recipeId} data-trigger="hover" data-active={running} data-running={running} data-replay-seq={command.seq} data-paused={transportPaused}>
  <div className="history-canvas" role="button" tabIndex={0} aria-label={t(`${side==='before'?'调整前':side==='after'?'调整后':'预览'}，${recipeMap[config.recipeId].label}`)} onPointerMove={move} onPointerOver={move} onPointerLeave={()=>{previous.current=null}} onPointerDown={()=>{if(!demo.current&&!transportPaused)settle()}} onPointerCancel={()=>{if(!demo.current&&!transportPaused)settle()}} onBlur={()=>{if(!demo.current&&!transportPaused)settle()}} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')&&!event.repeat){event.preventDefault();replay()}}}>
   <div className="history-fit" style={{transform:`scale(${fit})`}}><div data-part="root" className="history-motion-root"><div data-part="scramble" className="sculpt-part sculpt-scramble scramble-copy" ref={text}>{Array.from(TEXT,(char,index)=><span className={index===LINE_BREAK_INDEX?'scramble-cell scramble-line-break':'scramble-cell'} key={index}><span className="scramble-source-char">{char}</span><span className="scramble-noise-char" aria-hidden="true"/></span>)}</div></div></div>
  </div>
 </div>;
}
