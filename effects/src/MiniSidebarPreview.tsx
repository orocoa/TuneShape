import {t,useLanguage} from './i18n';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {animate} from 'motion/mini';
import {compiledTracks,recipeMap} from './history-model';
import {sidebarTree,sidebarTreeRows,sidebarInteractionConfig,sidebarDefaultPose,sidebarTrackSignature,sidebarNativeTrack} from './mini-sidebar-model';
import type {HistoryPreviewProps} from './HistoryPreview';
import './mini-sidebar.css';
import {createSidebarField,sidebarFieldProfile} from './sidebar-field';
import {evaluateBezier} from './easing';
import {usePreviewClock} from './useDetailPlayback';

export default function MiniSidebarPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,paused:transportPaused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage();
 const host=useRef<HTMLDivElement>(null),rail=useRef<HTMLElement>(null);
 const [fit,setFit]=useState(.9),[selectedId,setSelectedId]=useState(sidebarTree[sidebarDefaultPose.selectedIndex].id),[hoveredId,setHoveredId]=useState(sidebarTree[sidebarDefaultPose.pointerIndex].id),[expanded,setExpanded]=useState<boolean>(sidebarDefaultPose.expanded),[running,setRunning]=useState(false),[fieldRunning,setFieldRunning]=useState(false),[revision,setRevision]=useState(0);
 const rows=useMemo(()=>sidebarTreeRows(sidebarTree),[]),visible=rows,selected=rows.find(row=>row.id===selectedId)?.position??1;
 const pointerTarget=useRef({id:sidebarTree[sidebarDefaultPose.pointerIndex].id,offset:0});
 const pointer=(rows.find(row=>row.id===pointerTarget.current.id)?.position??0)+pointerTarget.current.offset;
 const nearest=rows.find(row=>row.id===hoveredId)??visible[0];
 const initialized=useRef(false),restart=useRef(false),lastCommand=useRef(0),controls=useRef<(ReturnType<typeof animate>|ReturnType<typeof createSidebarField>)[]>([]);
 const trackCache=useRef(new Map<string,{signature:string;target:number|string;control?:ReturnType<typeof animate>}>()),nodes=useRef(new Map<string,HTMLElement>()),previousConfig=useRef(config);
 const pendingPointerY=useRef<number|null>(null),lastPointerY=useRef<number|null>(null),field=useRef<ReturnType<typeof createSidebarField>|null>(null),readPointer=useRef<()=>number|undefined>(()=>undefined);
 const demo=useRef<'forward'|'reverse'|null>(null),controlClock=usePreviewClock(controls,speed,enabled,transportPaused);
 const reach=Number(config.tracks.find(track=>track.part==='line2'&&track.property==='width')!.values.at(-1));
 const restWidth=Math.max(...config.tracks.filter(track=>track.property==='width'&&['line0','line1'].includes(track.part)).map(track=>Number(track.values[0])));
 useEffect(()=>onRunningChange?.(side,running||fieldRunning),[onRunningChange,side,running,fieldRunning,command.seq]);
 useEffect(()=>{
  if(!host.current)return;
  const observer=new ResizeObserver(([entry])=>setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-20)/320,thumbnail?(entry.contentRect.height-16)/230:1))));
  observer.observe(host.current);return()=>observer.disconnect();
 },[thumbnail]);
 const resetDemo=()=>{pointerTarget.current={id:sidebarTree[sidebarDefaultPose.pointerIndex].id,offset:0};setHoveredId(sidebarTree[sidebarDefaultPose.pointerIndex].id);setSelectedId(sidebarTree[sidebarDefaultPose.selectedIndex].id)};
 useEffect(()=>{
  if(lastCommand.current===command.seq)return;
  cancelPointer();field.current?.stop();
  lastCommand.current=command.seq;restart.current=!!command.restart;demo.current=command.demo?'forward':null;
  resetDemo();setExpanded(command.active);setRevision(value=>value+1);
 },[command.seq,command.active,command.restart]);
 const cancelPointer=()=>{pendingPointerY.current=null;lastPointerY.current=null};
 const ensureField=()=>field.current??(field.current=createSidebarField({
  paint:(lines,y)=>{for(const line of lines){const node=nodes.current.get(`[data-part="line${line.index}"]`);if(node){node.style.transform=`scaleX(${Math.max(0,line.width)/80}) scaleY(${line.scaleY})`;node.style.opacity=String(line.opacity)}}nodes.current.get('[data-part="panel"]')?.style.setProperty('--mini-y',`${y}px`)},
  running:value=>{if(host.current)setFieldRunning(value);if(field.current){if(value&&!controls.current.includes(field.current))controlClock.register(field.current);else if(!value)controlClock.forget(field.current)}},
  readPointer:()=>readPointer.current(),
 }));
 useEffect(()=>{cancelPointer()},[enabled,transportPaused]);
 useEffect(()=>()=>{cancelPointer();controlClock.clear();trackCache.current.clear();nodes.current.clear()},[controlClock.clear]);
 useLayoutEffect(()=>{
  if(!host.current)return;
  if(!nodes.current.size)for(const node of host.current.querySelectorAll<HTMLElement>('[data-part]'))nodes.current.set(`[data-part="${node.dataset.part}"]`,node);
  const edited=previousConfig.current!==config;previousConfig.current=config;
  if(edited&&side==='after'&&!thumbnail&&enabled&&!transportPaused){
   field.current?.stop();restart.current=true;demo.current='forward';setExpanded(true);setRevision(value=>value+1);return;
  }
  let current=true;
  const immediate=!initialized.current||reduced,fromStart=restart.current;initialized.current=true;restart.current=false;
  if(fromStart){controlClock.clear();trackCache.current.clear()}
  const adapted=sidebarInteractionConfig(config,pointer,selected,rows);
  const continuous=ensureField();continuous.configure(sidebarFieldProfile(config,rows,selected),pointer,value=>evaluateBezier(value,config.easing),reduced);
  if(demo.current&&fromStart)for(const [target,node] of nodes.current)if(target.startsWith('[data-part="line'))node.style.removeProperty('transform');
  const jobs:{node:HTMLElement;native:ReturnType<typeof sidebarNativeTrack>;transition:any;key:string;signature:string;target:number|string;previous?:ReturnType<typeof animate>}[]=[],styles=new Map<HTMLElement,CSSStyleDeclaration>();
  for(const track of compiledTracks(adapted,!expanded)){
   const lineTrack=track.target.startsWith('[data-part="line');
   if(!demo.current&&(lineTrack||track.target==='[data-part="panel"]'&&track.property==='y'))continue;
   let node=nodes.current.get(track.target);if(!node){node=host.current.querySelector<HTMLElement>(track.target)??undefined;if(node)nodes.current.set(track.target,node)}if(!node)continue;
   const key=track.target+'/'+track.property,signature=sidebarTrackSignature(track,config,reduced),previous=trackCache.current.get(key),target=track.values.at(-1)!;
   // Keep unchanged spacing and reveal clocks running while the pointer moves.
   if(previous?.signature===signature)continue;
   if(!immediate&&!fromStart&&!edited&&previous?.target===target){previous.signature=signature;continue}
   const values=immediate?[track.values.at(-1)!,track.values.at(-1)!]:[...track.values];
   const native=sidebarNativeTrack(track.property,values),{type:_type,...transition}=track.transition;
   if(immediate){
    previous?.control?.cancel();if(previous?.control)controlClock.forget(previous.control);
    const value=native.values.at(-1)!;node.style.setProperty(native.property,typeof value==='number'&&native.property==='width'?`${value}px`:String(value));
    trackCache.current.set(key,{signature,target});continue;
   }
   if(!fromStart&&(transportPaused||!expanded||config.interruption==='retarget')){
    // Read all current values before cancelling or creating any animation.
    // Per-track commitStyles() interleaved with reads forced hundreds of style flushes.
    let style=styles.get(node);if(!style){style=getComputedStyle(node);styles.set(node,style)}
    native.values[0]=style.getPropertyValue(native.property);
   }
   jobs.push({node,native,transition,key,signature,target,previous:previous?.control});
  }
  for(const job of jobs)if(job.previous){job.previous.cancel();controlClock.forget(job.previous)}
  for(const {node,native,transition,key,signature,target} of jobs){
   const control=animate(node,{[native.property]:native.values} as any,transition);
   controlClock.register(control);trackCache.current.set(key,{signature,target,control});
  }
  setRunning(!immediate);
  const complete=()=>{
   if(!current)return;
   if(demo.current==='forward'){demo.current='reverse';setExpanded(false)}
   else{if(demo.current){demo.current=null;continuous.reset(pointer)}setRunning(false)}
  };
  if(immediate&&demo.current)queueMicrotask(complete);
  else if(!immediate)Promise.all(controls.current.map(control=>Promise.resolve(control))).then(complete);
  return()=>{current=false};
 },[config,selected,rows,expanded,revision,reduced]);
 const available=enabled&&!demo.current&&!transportPaused;
 const anchor=(index:number)=>{const nearest=Math.max(0,Math.min(visible.length-1,Math.round(index)));pointerTarget.current={id:visible[nearest].id,offset:index-nearest};setHoveredId(visible[nearest].id)};
 const show=(index:number)=>{if(available){anchor(index);setExpanded(true);ensureField().enter(index)}};
 const restore=()=>{cancelPointer();if(!demo.current&&!transportPaused){setExpanded(false);field.current?.leave()}};
 const indexAt=(clientY:number)=>{
  const items=rail.current?.querySelectorAll<HTMLButtonElement>('[data-sidebar-visible="true"]');if(!items?.length)return pointer;
  // Use visible centers during expansion so the pointer follows the actual rail.
  const centers=Array.from(items,button=>{const r=button.getBoundingClientRect();return r.top+r.height/2});
  if(clientY<=centers[0])return 0;
  for(let i=1;i<centers.length;i++)if(clientY<=centers[i])return i-1+(clientY-centers[i-1])/(centers[i]-centers[i-1]||1);
  return centers.length-1;
 };
 readPointer.current=()=>{const y=pendingPointerY.current;if(y===null)return undefined;pendingPointerY.current=null;const index=indexAt(y);anchor(index);return index};
 const enter=(event:React.PointerEvent<HTMLElement>)=>{if(event.pointerType!=='touch'){cancelPointer();lastPointerY.current=event.clientY;show(indexAt(event.clientY))}};
 const move=(event:React.PointerEvent<HTMLElement>)=>{
  if(event.pointerType==='touch'||!available||lastPointerY.current!==null&&Math.abs(lastPointerY.current-event.clientY)<.1)return;
  lastPointerY.current=event.clientY;pendingPointerY.current=event.clientY;setExpanded(true);ensureField().enter();
 };
 const select=(event:React.MouseEvent<HTMLElement>)=>{
  event.stopPropagation();if(!available)return;cancelPointer();
  const button=(event.target as HTMLElement).closest<HTMLElement>('[data-sidebar-id]'),row=rows.find(row=>row.id===button?.dataset.sidebarId);if(!row?.visible)return;
  setSelectedId(row.id);show(row.position);
 };
 const focus=(id?:string)=>{if(id)rail.current?.querySelector<HTMLButtonElement>(`[data-sidebar-id="${CSS.escape(id)}"]`)?.focus({preventScroll:true})};
 const items=useMemo(()=>rows.map((row,index)=><button key={row.id} type="button" role="option" data-part={'item'+index} data-sidebar-id={row.id} data-sidebar-index={row.position} data-sidebar-visible="true" data-depth="0" className="mini-sidebar-item" aria-label={t(row.label)} aria-current={selectedId===row.id?'page':undefined} aria-selected={selectedId===row.id} tabIndex={row.position===selected?0:-1} onPointerDown={event=>{if(available&&event.button===0)event.currentTarget.setPointerCapture(event.pointerId)}} onFocus={()=>show(row.position)}>
      <span data-part={'line'+index} aria-hidden="true"/>
     </button>),[rows,selectedId,selected,available,language]);
 return <div className="history-demo mini-sidebar-demo" ref={host} data-history-preview={side} data-recipe="mini-sidebar" data-trigger="hover" data-active={expanded} data-running={running||fieldRunning} data-replay-seq={command.seq} data-paused={transportPaused} data-preview-enabled={enabled} data-sidebar-selection={selectedId}>
  <div className="history-canvas" onPointerEnter={thumbnail?enter:undefined} onPointerMove={thumbnail?move:undefined} onPointerLeave={thumbnail?restore:undefined} onPointerCancel={thumbnail?restore:undefined} role="group" aria-label={t(`${side==='before'?'调整前':side==='after'?'调整后':'预览'}，${recipeMap[config.recipeId].label}`)}>
   <div className="history-fit" style={{transform:`scale(${fit})`}}><div data-part="root" className="history-motion-root"><div className="mini-sidebar-stage">
    <nav ref={rail} data-part="rail" className="mini-sidebar-rail" style={{'--sidebar-reach':`${reach}px`,'--sidebar-rest-width':`${restWidth}px`} as React.CSSProperties} aria-label={t('页面导航示例')} onClick={select} onPointerEnter={thumbnail?undefined:enter} onPointerMove={thumbnail?undefined:move} onPointerLeave={thumbnail?undefined:restore} onPointerCancel={thumbnail?undefined:restore} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))restore()}} onKeyDown={event=>{
     if(!available)return;
     const row=rows.find(row=>row.id===(event.target as HTMLElement).closest<HTMLElement>('[data-sidebar-id]')?.dataset.sidebarId);if(!row)return;
     const next=['ArrowDown','ArrowRight'].includes(event.key)?(row.position+1)%visible.length:['ArrowUp','ArrowLeft'].includes(event.key)?(row.position+visible.length-1)%visible.length:event.key==='Home'?0:event.key==='End'?visible.length-1:-1;
     if(next>=0){event.preventDefault();focus(visible[next].id)}
     if(event.key==='Escape'){event.preventDefault();restore()}
    }}>
     <div role="listbox" aria-label={t('动效分类目录')}>
     {items}
     </div>
     <div data-part="panel" className="mini-sidebar-tooltip" aria-hidden="true"><span>{t(nearest?.label??'')}</span></div>
    </nav>
   </div></div></div>
  </div>
 </div>;
}
