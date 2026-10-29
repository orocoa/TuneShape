import AsciiSharksPreview from './AsciiSharksPreview';
import CoffeeSelectorPreview from './CoffeeSelectorPreview';
import StudioEffectsPreview from './StudioEffectsPreview';
import {isStudioEffect} from './orbit-typography-spec';
import {isWatercolorRecipe,isReelRecipe} from './effect-variants';
import {t,useLanguage} from './i18n';
import {useEffect,useLayoutEffect,useRef,useState,memo} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {animate,motion,motionValue} from 'motion/react';
import {compiledTracks,recipeMap,proceduralText} from './history-model';
import {effectTrigger,hoverTarget,clickTarget,interactionSelector} from './effect-behavior';
import {galleryPass,galleryPassDuration,galleryPosterValue,PREVIEW_DWELL_MS} from './preview-playback';
import {defaultAsciiSettings,paintAscii,createPhaseAccumulator} from './ascii-wave';
import type {AsciiPointer} from './ascii-wave';
import type {HistoryConfig,FrameValue} from './history-model';
import {scrambleFrame} from './text-scramble';
import HoverImagePreview from './HoverImagePreview';
import GlassFolderPreview from './GlassFolderPreview';
import ScrollProgressPreview from './ScrollProgressPreview';
import HookSidebarPreview from './HookSidebarPreview';
import RailTocPreview from './RailTocPreview';
import AceternityPreview from './AceternityPreview';
import {isAceternityEffect} from './aceternity-settings';
import RoundedChecksPreview from './RoundedChecksPreview';
import DurationPickerPreview from './DurationPickerPreview';
import AlbumRailPreview from './AlbumRailPreview';
import OrbitReelPreview from './OrbitReelPreview';
import WatercolorPreview from './WatercolorPreview';
import ElasticReelPreview from './ElasticReelPreview';
import ParticleTidePreview from './ParticleTidePreview';
import GlyphWallPreview from './GlyphWallPreview';
import GlassRadioPreview from './GlassRadioPreview';
import MiniSidebarPreview from './MiniSidebarPreview';
import TextScramblePreview from './TextScramblePreview';
import DemoArrow from './DemoArrow';
import {textRiseSample} from './text-rise-model';
import './finger-tap.css';
import './typewriter.css';
import './yin-yang.css';
import {yinYangHover} from './yin-yang-model';
import {typewriterKeys} from './typewriter-model';
import {usePreviewClock} from './useDetailPlayback';
import type {PreviewCommand} from './useDetailPlayback';
const Sculpture=memo(function Sculpture({config}:{config:HistoryConfig}){
 const initial=useRef(config).current;const recipe=recipeMap[config.recipeId];
 const P=({id,cls='',children,style={}}:{id:string;cls?:string;children?:ReactNode;style?:CSSProperties})=>{
  const pose=Object.fromEntries(initial.tracks.filter(t=>t.part===id&&!['textProgress','asciiPhase'].includes(t.property)).map(t=>[t.property,t.values[0]]));
  return <motion.div data-part={id} className={`sculpt-part ${cls}`} style={{...style,...pose} as any}>{children}</motion.div>
 };
 const lines=<><i/><i/><i/></>;const scene=recipe.scene;
 if(scene==='tile')return <P id="face" cls="sculpt-tile">Explore<DemoArrow diagonal/></P>;
 if(scene==='menu')return <><P id="trigger" cls="sculpt-trigger">Choose a coffee <P id="chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 9 12 15.5 18.5 9"/></svg></P></P><P id="panel" cls="sculpt-menu">{['Geisha','SL28'].map((s,i)=><P key={s} id={'item'+i} cls="sculpt-menu-item">{s}<span>↗</span></P>)}</P></>;
 if(scene==='accordion')return <div className="sculpt-accordion"><div className="sculpt-accordion-head">Project details<P id="chevron">⌄</P></div><P id="panel" cls="sculpt-accordion-body"><div>An idea unfolds.</div><p>More details, same context.</p></P></div>;
 if(scene==='toast')return <><div className="sculpt-document">{lines}</div><P id="face" cls="sculpt-toast">✓　Changes saved</P></>;
 if(scene==='sheet')return <><button type="button" data-activation="open" className="sculpt-open-panel">Open panel</button><P id="shade" cls="sculpt-shade"/><P id="panel" cls="sculpt-sheet"><button type="button" data-activation="close" className="sculpt-close-panel" aria-label="Close panel">×</button><i className="sculpt-handle"/><strong>A little more space</strong><p>Room for your next idea.</p><div className="sculpt-placeholder">{lines}</div></P></>;
 if(scene==='tooltip')return <><div className="sculpt-tooltip-anchor">＋</div><P id="panel" cls="sculpt-tooltip">Hover here</P></>;
 if(scene==='toggle')return <P id="track" cls="sculpt-switch"><P id="knob" cls="sculpt-knob"/></P>;
 if(scene==='arrow')return <div className="sculpt-arrow-link">Explore more<P id="face">⟶</P></div>;
 if(scene==='message')return <P id="face" cls="sculpt-message">Every small change,<br/>makes things clearer.<small>Just now</small></P>;
 if(scene==='submit')return <div className="sculpt-submit"><P id="label">Save changes</P><P id="loader" cls="sculpt-small-spinner"/><P id="check">✓　Saved</P></div>;
 if(scene==='grid')return <div className="sculpt-grid"><P id="directory" cls="sculpt-directory">{['Ideas','In progress','Done'].map(s=><div key={s}>{s}</div>)}</P><P id="detail" cls="sculpt-grid-detail"><strong>Make room</strong><p>Details arrive when the layout settles.</p>{lines}</P></div>;
 if(scene==='borders')return <div className="sculpt-borders">{[0,1,2].map(i=><P key={i} id={'line'+i} cls="sculpt-rule" style={{top:45+i*0}}/>)}</div>;
 if(scene==='divider')return <div className="sculpt-divider-box"><div className="sculpt-divider-copy">From index<br/>to full width</div><P id="divider" cls="sculpt-divider"/></div>;
 if(scene==='morph'){
  const title='One idea';
  return <P id="surface" cls="sculpt-morph"><P id="summary" cls="sculpt-morph-summary"><span>01</span><strong>{title}</strong></P><P id="detail" cls="sculpt-morph-detail"><small>DETAIL</small><h3>{title}</h3><p>Keep the context. Explore the details.</p><div className="sculpt-placeholder">{lines}</div></P></P>;
 }
 if(scene==='folder')return <div className="sculpt-folder"><div className="sculpt-folder-back"><svg viewBox="0 0 513.45 318.15" aria-hidden="true"><path d="M32 318.15H261.9H481.45C492.651 318.15 498.252 318.15 502.53 315.97C506.293 314.053 509.353 310.993 511.27 307.23C513.45 302.952 513.45 297.351 513.45 286.15V53.15C513.45 41.9489 513.45 36.3484 511.27 32.0702C509.353 28.3069 506.293 25.2473 502.53 23.3299C498.252 21.15 492.651 21.15 481.45 21.15H139.275C133.435 21.15 128.7 16.4154 128.7 10.575C128.7 4.73459 123.965 0 118.125 0H32C20.7989 0 15.1984 0 10.9202 2.17987C7.15695 4.09734 4.09734 7.15695 2.17987 10.9202C0 15.1984 0 20.7989 0 32V286.15C0 297.351 0 302.952 2.17987 307.23C4.09734 310.993 7.15695 314.053 10.9202 315.97C15.1984 318.15 20.799 318.15 32 318.15Z" fill="currentColor"/></svg></div>{[3,2,1].map(layer=><P key={layer} id={layer===1?'paper':'paper'+layer} cls={'sculpt-folder-paper paper-'+layer}>{lines}</P>)}<P id="front" cls="sculpt-folder-front"/></div>;
 if(scene==='pages')return <div className="sculpt-pages">{[0,1].map(i=><P key={i} id={'page'+i} cls="sculpt-page"><small>PAGE 0{i+1}</small><h3>{i?'Keep going.':'Start here.'}</h3><div className="sculpt-placeholder">{lines}</div></P>)}</div>;
 if(scene==='stagger')return <div className="sculpt-stagger">{['Capture ideas','Shape the plan','Build a prototype','Test the idea'].map((s,i)=><P key={i} id={'item'+i} cls="sculpt-list-item"><span>0{i+1}</span>{s}<span>↗</span></P>)}</div>;
 if(scene==='letters')return <div className="sculpt-letters" aria-hidden="true">{Array.from(textRiseSample).map((s,i)=><span className="sculpt-letter-mask" key={i}><P id={'char'+i}>{s}</P></span>)}</div>;
 if(scene==='scramble')return <P id="scramble" cls="sculpt-scramble">Thank you for playing my game</P>;
 if(scene==='scroll')return <div className="sculpt-scroll-mask"><P id="face">Let things<br/>flow naturally.</P></div>;
 if(scene==='nav')return <div className="sculpt-nav"><span>INDEX</span><P id="face">Selected work</P><span>01—08</span></div>;
 if(scene==='image'||scene==='image-flight')return <><P id="shade" cls="sculpt-shade"/><P id="image" cls={'sculpt-image '+(scene==='image-flight'?'sculpt-flight':'')}><div className="sculpt-sun"/><div className="sculpt-mountain one"/><div className="sculpt-mountain two"/><span>LIGHT / 01</span></P></>;
 if(scene==='progress')return <div className="sculpt-progress"><div><span>Loading</span><span>Progress</span></div><div className="sculpt-progress-track"><P id="fill"/></div></div>;
 if(scene==='spinner')return <P id="face" cls="sculpt-spinner"/>;
 if(scene==='dots')return <div className="sculpt-dots">{[0,1,2].map(i=><P key={i} id={'dot'+i}/>)}</div>;
 if(scene==='yin-yang')return <div className="yin-yang-stage" aria-label="Yin Yang" style={{'--yin-shadow':yinYangHover.rest,'--yin-hover-shadow':yinYangHover.hover,'--yin-shadow-transition':`${yinYangHover.transition.duration}s ${yinYangHover.cssEasing}`} as CSSProperties}><P id="face" cls="demo-yin-yang"><P id="dot0" cls="yin-yang-dot white"/><P id="dot1" cls="yin-yang-dot black"/></P></div>;
 if(scene==='typewriter')return <div className="typewriter-stage" aria-label="Typewriter"><P id="machine" cls="demo-typewriter"><P id="carriage" cls="typewriter-carriage"><i/></P><P id="paper" cls="typewriter-paper"/><div className="typewriter-keyboard">{typewriterKeys.map((key,i)=><P key={i} id={'key'+i} cls="typewriter-key" style={{left:2+key.x,top:25+key.y}}/>)}</div></P></div>;
 if(scene==='finger-tap')return <div className="tapping-hand" aria-label="Finger tapping">{[0,1,2,3].map(i=><P key={i} id={'finger'+i} cls="tapping-hand-finger"/>)}<div className="tapping-hand-palm"/><div className="tapping-hand-thumb"/></div>;
 if(scene==='pulse')return <div className="sculpt-pulse"><P id="halo"/><P id="face"/></div>;
 if(scene==='wave')return <div className="sculpt-wave">{Array.from({length:15},(_,i)=><P key={i} id={'bar'+i} cls="sculpt-wave-bar" style={{left:i*20}}/>)}<P id="ball" cls="sculpt-wave-ball"/></div>;
 if(scene==='ascii')return <canvas data-part="ascii" className="sculpt-ascii-canvas" width={320} height={230} aria-label="Interactive ASCII wave"/>;
 if(scene==='cloud')return <div className="sculpt-cloud">{Array.from({length:20},(_,i)=><P key={i} id={'p'+i} style={{left:(i%5)*30,top:Math.floor(i/5)*30}}/>)}</div>;
 if(scene==='tap')return <><div className="sculpt-trackpad"/><P id="finger" cls="sculpt-finger"/><P id="ring" cls="sculpt-ring"/></>;
 if(scene==='pointer')return <div className="sculpt-pointer-demo"><div className="sculpt-pointer-track"><P id="finger" cls="sculpt-tiny-finger"/></div><div className="sculpt-pointer-track"><P id="cursor" cls="sculpt-cursor">↖</P></div></div>;
 if(scene==='minimize')return <><P id="window" cls="sculpt-window"><div>Project space <span>−　×</span></div><div className="sculpt-placeholder">{lines}</div></P><div className="sculpt-dock"><i/><i/><i/><i/></div></>;
 if(scene==='proximity')return <><P id="watch" cls="sculpt-watch">12:08</P><P id="halo" cls="sculpt-proximity-halo"/><div className="sculpt-lock"><P id="lock">⌑</P><P id="unlock">✓</P></div></>;
 if(scene==='drag')return <><div className="sculpt-dropzone">Drop here</div><P id="file" cls="sculpt-file">File</P><P id="fingers" cls="sculpt-fingers"><i/><i/><i/></P><P id="ring" cls="sculpt-drop-ring">✓</P></>;
 if(scene==='hotcorner')return <div className="sculpt-system-screen"><P id="window" cls="sculpt-system-window">Project space</P><P id="upload" cls="sculpt-upload">Drop files<P id="check">✓</P></P><P id="corner" cls="sculpt-hot-corner"/><P id="file" cls="sculpt-drag-file">File</P><P id="cursor" cls="sculpt-cursor system-cursor">↖</P></div>;
 if(scene==='sleep')return <P id="screen" cls="sculpt-system-screen"><P id="corner" cls="sculpt-hot-corner"/><P id="cursor" cls="sculpt-cursor sleep-cursor">↖</P><P id="sleep" cls="sculpt-sleep-state">☾</P></P>;
 return null;
},(before,after)=>before.config.recipeId===after.config.recipeId);
export interface HistoryPreviewProps{config:HistoryConfig;speed:number;reduced:boolean;command:PreviewCommand;side:string;paused?:boolean;onRunningChange?:(side:string,running:boolean)=>void;enabled?:boolean;thumbnail?:boolean;autoPlay?:boolean;interactive?:boolean;presentation?:'loading'|'cycle'|'direct'}
export default function HistoryPreview(props:HistoryPreviewProps){
 useLanguage();
 return props.config.recipeId==='ascii-sharks'?<AsciiSharksPreview {...props}/>:props.config.recipeId==='coffee-selector'?<CoffeeSelectorPreview {...props}/>:isStudioEffect(props.config.recipeId)?<StudioEffectsPreview {...props}/>:isAceternityEffect(props.config.recipeId)?<AceternityPreview {...props}/>:props.config.recipeId==='rounded-checks'?<RoundedChecksPreview {...props}/>:props.config.recipeId==='glass-folder'?<GlassFolderPreview {...props}/>:props.config.recipeId==='scroll-progress'?<ScrollProgressPreview {...props}/>:props.config.recipeId==='hook-sidebar'?<HookSidebarPreview {...props}/>:props.config.recipeId==='rail-toc'?<RailTocPreview {...props}/>:props.config.recipeId==='duration-picker'?<DurationPickerPreview {...props}/>:props.config.recipeId==='hover-preview'?<HoverImagePreview {...props}/>:props.config.recipeId==='album-rail'?<AlbumRailPreview {...props}/>:props.config.recipeId==='orbit-reel'?<OrbitReelPreview {...props}/>:isWatercolorRecipe(props.config.recipeId)?<WatercolorPreview {...props}/>:isReelRecipe(props.config.recipeId)?<ElasticReelPreview {...props}/>:props.config.recipeId==='particle-tide'?<ParticleTidePreview {...props}/>:props.config.recipeId==='glyph-wall'?<GlyphWallPreview {...props}/>:props.config.recipeId==='glass-radio'?<GlassRadioPreview {...props}/>:props.config.recipeId==='mini-sidebar'?<MiniSidebarPreview {...props}/>:props.config.recipeId==='text-scramble'?<TextScramblePreview {...props}/>:<TrackPreview {...props}/>;
}
function TrackPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,interactive=false,presentation='loading',paused:transportPaused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();
 const host=useRef<HTMLDivElement>(null),[fit,setFit]=useState(.9),[active,setActive]=useState(false),[revision,setRevision]=useState(0),[running,setRunning]=useState(false),[manual,setManual]=useState(false);
 const trigger=effectTrigger(config.recipeId),automatic=thumbnail&&!interactive&&!manual;
 const restartRequested=useRef(false),lastCommand=useRef(0),initialized=useRef(false),controls=useRef<ReturnType<typeof animate>[]>([]),clock=useRef(speed);clock.current=speed;
 const demo=useRef<'forward'|'reverse'|null>(null),controlClock=usePreviewClock(controls,speed,enabled,transportPaused);
 const previousConfig=useRef(config),previousReduced=useRef(reduced),interruptionDemo=useRef(false);
 useEffect(()=>onRunningChange?.(side,running),[onRunningChange,side,running,command.seq]);
 const custom=useRef(new Map<string,number>()),subscriptions=useRef<(()=>void)[]>([]),hovered=useRef(false);
 const pointer=useRef<AsciiPointer>({x:-1000,y:-1000,vx:0,vy:0,energy:0});
 const phaseBasis=useRef(config.tracks.find(t=>t.property==='asciiPhase')?.values[0]);
 const paint=(node:HTMLElement,property:string,value:number)=>{
  if(property==='asciiPhase'){
   const canvas=node as unknown as HTMLCanvasElement,ctx=canvas.getContext('2d');
   if(ctx){paintAscii(ctx,value,config.ascii??defaultAsciiSettings,pointer.current);canvas.dataset.phase=String(value);canvas.dataset.characters=(config.ascii??defaultAsciiSettings).characters;canvas.dataset.pointerEnergy=String(pointer.current.energy)}
  }else if(property==='textProgress'){
   const glyphs=scrambleFrame(value);
   if(node.children.length!==glyphs.length){node.replaceChildren(...glyphs.map(()=>document.createElement('span')));node.setAttribute('aria-label','Thank you for playing my game')}
   glyphs.forEach((glyph,index)=>{const cell=node.children[index] as HTMLElement;cell.textContent=glyph.text;cell.style.color=glyph.color;cell.className=glyph.framed?'scramble-cell is-framed':'scramble-cell';cell.setAttribute('aria-hidden','true')});
  }else node.textContent=proceduralText(property,value);
 };
 const activate=(value:boolean,restart=false)=>{restartRequested.current=restart;setActive(value);setRevision(n=>n+1)};
 const reveal=['stagger','text-rise'].includes(config.recipeId),hoverRestart=['text-scramble','ascii-wave'].includes(config.recipeId),fill=config.recipeId==='progress',textRise=config.recipeId==='text-rise';
 useEffect(()=>{if(!host.current)return;const observer=new ResizeObserver(([e])=>setFit(Math.max(.1,Math.min(1,(e.contentRect.width-14)/320,thumbnail?(e.contentRect.height-12)/230:1))));observer.observe(host.current);return()=>observer.disconnect()},[thumbnail]);
 useEffect(()=>{if(!autoPlay)setManual(false);if(automatic)activate(autoPlay)},[autoPlay,automatic]);
 useEffect(()=>{if(lastCommand.current!==command.seq){lastCommand.current=command.seq;demo.current=command.demo?'forward':null;activate(command.active,!!command.restart)}},[command.seq,command.active,command.restart]);
 useLayoutEffect(()=>{
  const motionResumed=previousReduced.current&&!reduced;previousReduced.current=reduced;
  const previous=previousConfig.current,edited=previous!==config;previousConfig.current=config;
  if(edited&&side==='after'&&!thumbnail&&!transportPaused&&config.recipeId==='ascii-wave'&&(previous.ascii?.pointerStrength!==config.ascii?.pointerStrength||previous.ascii?.pointerRadius!==config.ascii?.pointerRadius))pointer.current={x:160,y:115,vx:65,vy:-30,energy:1};
  if(edited&&side==='after'&&!thumbnail&&enabled&&!transportPaused&&trigger!=='loading'&&config.recipeId!=='ascii-wave'){
   // First commit the new phase, then consume its restart in the next layout.
   // Animating the old phase here can finish synchronously and cancel the replay.
   interruptionDemo.current=previous.interruption!==config.interruption;
   demo.current='forward';activate(true,true);return;
  }
  const root=host.current;if(!root)return;let current=true;let repeatTimer:ReturnType<typeof setTimeout>|undefined;controlClock.clear();
  // Re-enabling a finished loader must restore its authored cycle. A retarget
  // from 360deg to 360deg is otherwise optimized into a permanently still frame.
  let restart=restartRequested.current||textRise&&active||(edited||motionResumed)&&trigger==='loading'&&active;restartRequested.current=false;
  const basis=config.tracks.find(t=>t.property==='asciiPhase')?.values[0];
  if(basis!==phaseBasis.current){phaseBasis.current=basis;custom.current.delete('[data-part="ascii"]asciiPhase');restart=true}
  const first=!initialized.current;initialized.current=true;
  const idleFlow=config.recipeId==='ascii-wave'&&!active&&!demo.current,idleText=!demo.current&&!automatic&&(config.recipeId==='text-scramble'||reveal)&&!active;
  const poster=automatic&&!autoPlay,immediate=first||reduced||poster||idleFlow||idleText||(fill&&!active);
  const loading=trigger==='loading'||config.recipeId==='ascii-wave';
  const tracks=(poster||idleText)&&textRise?compiledTracks(config):demo.current&&!loading?galleryPass(config,!active):poster&&config.recipeId==='wave'?compiledTracks(config):automatic&&presentation==='cycle'?galleryPass(config,!active):compiledTracks(config,!active),forward=idleText?compiledTracks(config):[];
  setRunning(!immediate);
  for(const tr of tracks){
   const node=root.querySelector<HTMLElement>(tr.target);if(!node)continue;
   const key=tr.target+tr.property,customProperty=['textProgress','asciiPhase'].includes(tr.property);
   let terminal=tr.values.at(-1)!;
   if(reduced&&fill)terminal=compiledTracks(config).find(track=>track.target===tr.target&&track.property===tr.property)!.values.at(-1)!;
   if(poster&&config.recipeId==='wave')terminal=galleryPosterValue(tr);
   if(idleText)terminal=forward.find(t=>t.target===tr.target&&t.property===tr.property)!.values.at(-1)!;
   if(idleFlow&&!first)terminal=custom.current.get(key)??terminal;
   if(customProperty){
    const ascii=tr.property==='asciiPhase';
    const from=restart||ascii?Number(tr.values[0]):custom.current.get(key)??Number(tr.values[0]);
    if(immediate){custom.current.set(key,Number(terminal));paint(node,tr.property,Number(terminal));continue}
    if(restart){custom.current.set(key,from);paint(node,tr.property,from)}
    const accumulate=ascii?createPhaseAccumulator(Number(tr.values[0]),Number(tr.values.at(-1)),restart?0:(custom.current.get(key)??from)-from):(v:number)=>v;
    const mv=motionValue(from),unsubscribe=mv.on('change',raw=>{const v=accumulate(raw);custom.current.set(key,v);paint(node,tr.property,v)});subscriptions.current.push(unsubscribe);
    const values=tr.values.map(Number);if(!ascii&&!restart&&config.interruption==='retarget')values[0]=from;
    const c=animate(mv,values,{...tr.transition,onComplete:()=>unsubscribe()});controlClock.register(c as any);continue;
   }
   // Repeating fills must keep their configured start in every cycle, including parameter edits.
   const frames:(FrameValue|null)[]=immediate?[terminal,terminal]:[...tr.values];if(!immediate&&!restart&&!fill&&config.interruption==='retarget')frames[0]=null;
   controlClock.register(animate(node,{[tr.property]:frames} as any,immediate?{duration:0}:tr.transition));
  }
  if(immediate)interruptionDemo.current=false;
  else if(interruptionDemo.current&&active){
   interruptionDemo.current=false;
   const cue=motionValue(0);
   controlClock.register(animate(cue,1,{duration:(config.delayMs+config.durationMs*.4)/1000,onComplete:()=>{
    if(current){demo.current='reverse';activate(false)}
   }}));
  }
  const complete=()=>{
   if(!current)return;
   if(textRise&&(demo.current||automatic&&autoPlay)){
    if(active){demo.current='reverse';activate(false)}
    else if(!reduced&&(automatic&&autoPlay||!automatic&&config.loop)){demo.current='forward';activate(true,true)}
    else{demo.current=null;setRunning(false)}
   }
   else if(demo.current==='forward'&&!loading){demo.current='reverse';activate(false)}
   else{demo.current=null;setRunning(false)}
  };
  if(immediate&&demo.current)queueMicrotask(complete);
  else if(!immediate){if(automatic&&presentation==='cycle'&&!textRise)repeatTimer=setTimeout(()=>{if(current)activate(!active)},galleryPassDuration(config,!active)/clock.current+PREVIEW_DWELL_MS);else Promise.all(controls.current.map(c=>Promise.resolve(c))).then(complete)}
  return()=>{current=false;clearTimeout(repeatTimer);controlClock.clear();subscriptions.current.forEach(fn=>fn());subscriptions.current=[]};
 },[config,active,revision,reduced,automatic,autoPlay,presentation]);
 const hover=(event:React.PointerEvent<HTMLDivElement>)=>{
  if(trigger!=='hover'||automatic||!enabled||transportPaused)return;
  const inside=!!(event.target as Element).closest(hoverTarget[config.recipeId]);
  if(!demo.current&&inside&&!hovered.current){hovered.current=true;activate(true,hoverRestart)}
  else if(!demo.current&&!inside&&hovered.current){hovered.current=false;pointer.current.energy=0;activate(false)}
  if(inside&&config.recipeId==='ascii-wave'&&!reduced){
   const canvas=host.current?.querySelector<HTMLCanvasElement>('canvas');if(!canvas)return;const r=canvas.getBoundingClientRect(),p=pointer.current,x=(event.clientX-r.left)*320/r.width,y=(event.clientY-r.top)*230/r.height,dx=p.energy?x-p.x:1,dy=p.energy?y-p.y:0,length=Math.hypot(dx,dy)||1;
   pointer.current={x,y,vx:dx/length,vy:dy/length,energy:Math.min(1,Math.max(.2,length/24))};
   const key='[data-part="ascii"]asciiPhase';paint(canvas as unknown as HTMLElement,'asciiPhase',custom.current.get(key)??0);
  }
 };
 const leave=()=>{pointer.current.energy=0;if(demo.current||transportPaused)return;if(hovered.current){hovered.current=false;pointer.current.energy=0;activate(false)}};
 const click=(event:React.MouseEvent<HTMLDivElement>)=>{
  if(demo.current||transportPaused)return;
  const target=event.target as Element;
  if(automatic){if(!target.closest(interactionSelector(config.recipeId)))return;setManual(true)}
  if(trigger==='hover')return;
  if(target.closest('[data-activation="open"]'))activate(true,true);
  else if(target.closest('[data-activation="close"],.sculpt-menu-item,.sculpt-shade'))activate(false);
  else if(!clickTarget[config.recipeId]||target.closest(clickTarget[config.recipeId])){if(reveal){if(textRise)demo.current='forward';activate(true,true)}else activate(!active)}
 };
 return <div className="history-demo" ref={host} data-history-preview={side} data-recipe={config.recipeId} data-trigger={trigger} data-active={active} data-running={running} data-replay-seq={command.seq} data-paused={transportPaused}>
  <div className="history-canvas" role={automatic?undefined:recipeMap[config.recipeId].scene==='sheet'?'group':'button'} tabIndex={automatic?undefined:0} aria-label={t(`${side==='before'?'调整前':side==='after'?'调整后':'预览'}，${recipeMap[config.recipeId].label}`)} onClick={click} onPointerOver={hover} onPointerMove={hover} onPointerLeave={leave} onFocus={()=>{if(!demo.current&&!transportPaused&&trigger==='hover'&&!automatic&&!hovered.current){hovered.current=true;activate(true,hoverRestart)}}} onBlur={leave} onKeyDown={e=>{if(!demo.current&&!transportPaused&&e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();if(textRise)demo.current='forward';activate(reveal||trigger==='hover'?true:!active,reveal||hoverRestart)}}}>
   <div className="history-fit" style={{transform:`scale(${fit})`}}><motion.div data-part="root" className="history-motion-root"><Sculpture config={config}/></motion.div></div>
  </div>
 </div>;
}
