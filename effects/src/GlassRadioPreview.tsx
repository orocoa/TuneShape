import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {animate,motion} from 'motion/react';
import {compiledTracks,recipeMap} from './history-model';
import {glassRadioOptions,glassRadioSelection} from './glass-radio-model';
import type {HistoryPreviewProps} from './HistoryPreview';
import {usePreviewClock} from './useDetailPlayback';
import {t,useLanguage} from './i18n';
import './glass-radio.css';

export default function GlassRadioPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,paused=false,onRunningChange}:HistoryPreviewProps){
 useLanguage();
 const host=useRef<HTMLDivElement>(null),prefix=useId();
 const [selected,setSelected]=useState(0),[revision,setRevision]=useState(0),[running,setRunning]=useState(false),[fit,setFit]=useState(1);
 const previous=useRef(0),previousConfig=useRef(config),initialized=useRef(false),lastCommand=useRef(0),demo=useRef<number|null>(null);
 const controls=useRef<ReturnType<typeof animate>[]>([]),clock=usePreviewClock(controls,speed,enabled,paused);
 useEffect(()=>onRunningChange?.(side,running),[side,running,onRunningChange,command.seq]);
 useEffect(()=>{
  if(!host.current)return;
  const observer=new ResizeObserver(([entry])=>setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-20)/320,(entry.contentRect.height-12)/230))));
  observer.observe(host.current);return()=>observer.disconnect();
 },[]);
 useEffect(()=>()=>clock.clear(),[clock.clear]);
 useEffect(()=>{
  if(command.seq===lastCommand.current)return;
  lastCommand.current=command.seq;demo.current=1;setSelected(1);setRevision(n=>n+1);
 },[command.seq]);
 useLayoutEffect(()=>{
  const node=host.current;if(!node)return;
  const edited=previousConfig.current!==config;previousConfig.current=config;
  if(edited&&side==='after'&&!thumbnail&&!paused&&enabled){demo.current=1;setSelected(1);setRevision(n=>n+1);return}
  const immediate=!initialized.current||reduced;initialized.current=true;
  const adapted=glassRadioSelection(config,previous.current,selected);previous.current=selected;
  clock.clear();let live=true;
  for(const track of compiledTracks(adapted)){
   const target=node.querySelector<HTMLElement>(track.target);if(!target)continue;
   const values=immediate?[track.values.at(-1)!,track.values.at(-1)!]:[...track.values];
   if(!immediate&&config.interruption==='retarget')values[0]=null as never;
   clock.register(animate(target,{[track.property]:values} as any,immediate?{duration:0}:track.transition));
  }
  setRunning(!immediate);
  const complete=()=>{
   if(!live)return;
   if(demo.current===1){demo.current=2;setSelected(2);setRevision(n=>n+1)}
   else if(demo.current===2){demo.current=0;setSelected(0);setRevision(n=>n+1)}
   else{demo.current=null;setRunning(false)}
  };
  if(immediate)queueMicrotask(complete);
  else Promise.all(controls.current.map(control=>Promise.resolve(control))).then(complete);
  return()=>{live=false};
 },[config,selected,revision,reduced,clock.clear,clock.register]);
 const select=(index:number)=>{
  if(!enabled||paused||index===selected)return;
  demo.current=null;setSelected(index);
 };
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="glass-radio" data-glass-theme={config.glass?.theme??'dark'} data-trigger="click" data-running={running} data-paused={paused} data-selected={selected}>
  <div className="history-canvas" role="group" aria-label={t(`${side==='before'?'调整前':side==='after'?'调整后':'预览'}，${recipeMap[config.recipeId].label}`)}>
   <div className="history-fit" style={{transform:`scale(${fit})`}}><motion.div data-part="root" className="history-motion-root">
    <div className="glass-radio-stage" onClick={event=>event.stopPropagation()}>
     <div className="glass-radio-group" role="radiogroup" aria-label="Metal finish">
      {glassRadioOptions.map((option,index)=><span className="glass-radio-option" key={option}>
       <input className="glass-radio-input" type="radio" aria-label={option} name={`glass-plan-${prefix}`} id={`${prefix}-${index}`} value={option} checked={selected===index} disabled={!enabled||paused} onChange={()=>select(index)}/>
       <label data-part={'label'+index} htmlFor={`${prefix}-${index}`}>{option}</label>
      </span>)}
      <motion.div data-part="glider" className="glass-radio-glider" style={{x:'0%'}} aria-hidden="true">{glassRadioOptions.map((option,index)=><div key={option} data-part={'finish'+index} className={`glass-radio-finish finish-${index}`} style={{opacity:index===0?1:0}}/>)}</motion.div>
     </div>
    </div>
   </motion.div></div>
  </div>
 </div>;
}
