import {createCardsRenderer} from './cards-renderer.js';
import {PointerVelocity,advanceSpring,releaseTarget,settleProfile,createControlMotion,sampleControlMotion,THROW_SPRING,mod,clamp} from './deck-physics.js';

// Compatibility with the gallery controller ends at this API and the sb-*
// element names. The old TuneShape engine and all response patches are absent.
export function mountTuneShapeDeck(host,initialItems,initialId,options){
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),abort=new AbortController();
 const root=document.createElement('div');root.className='portfolio-deck';root.tabIndex=0;root.setAttribute('role','region');
 const live=document.createElement('span');live.className='sb-live';live.setAttribute('aria-live','polite');
 const renderer=createCardsRenderer(root);root.append(live);host.replaceChildren(root);
 const tracker=new PointerVelocity();
 let runtime={durationMs:980,speed:1,reduced:false};
 const rate=()=>980/Math.max(120,Number(runtime.durationMs)||980)*Math.max(0,Number(runtime.speed)||0);
 let items=[],cards=[],ids=[],selected=0,position=0,displayedPosition=0,target=0,velocity=0,profile=THROW_SPRING,width=Math.max(1,host.clientWidth)+40;
 let pointer=null,mode='idle',controlMotion=null,motionElapsed=0,frame=0,previousTime=0,interaction=false,paused=false,enabled=true,dead=false,language='zh',reason='mount';
 const listen=(node,type,handler,settings={})=>node.addEventListener(type,handler,{...settings,signal:abort.signal});
 const time=event=>Math.abs(event.timeStamp-performance.now())<60000?event.timeStamp:performance.now();
 function interacting(value){if(interaction===value)return;interaction=value;options.onInteraction(value);}
 function metadata(){
  root.dataset.cardId=items[selected].id;root.dataset.index=String(selected);
  const name=language==='zh'?'卡片，左右拖动或使用方向键切换':'Cards. Drag or use the arrow keys to switch.';
  root.setAttribute('aria-label',name);root.setAttribute('aria-roledescription',language==='zh'?'卡片轮播':'card carousel');
  live.setAttribute('aria-live',reason==='auto'?'off':'polite');
  live.textContent=language==='zh'?`第 ${selected+1} 张，共 ${items.length} 张：${items[selected].title}`:`Card ${selected+1} of ${items.length}: ${items[selected].title}`;
  cards.forEach((card,index)=>{const itemIndex=Number(card.dataset.itemIndex);card.setAttribute('aria-hidden',String(index!==items.length+selected));card.setAttribute('aria-label',items[itemIndex].title);});
 }
 function commit(next,why,force=false){
  const index=mod(Math.round(next),items.length),changed=index!==selected;
  selected=index;reason=why;
  if(changed||force){metadata();options.onSelect(items[index].id,why);}
 }
 function paint(){
  if(dead)return;
  const moving=mode!=='idle';
  root.dataset.gesture=mode;root.dataset.running=String(mode==='settling');root.dataset.position=position.toFixed(5);
  renderer.paint(position,mode);
  if(mode!=='pending')displayedPosition=position;
  options.onPosition?.(position,ids,moving);
 }
 function schedule(){if(!frame&&!dead&&!paused&&enabled&&!document.hidden&&rate()>0)frame=requestAnimationFrame(tick);}
 function stopFrame(){cancelAnimationFrame(frame);frame=0;previousTime=0;}
 function tick(now){
  frame=0;if(dead)return;
  const dt=previousTime?Math.max(0,(now-previousTime)/1000)*rate():0;previousTime=now;
  if(mode==='settling'){
   let finished;
   if(controlMotion){
    motionElapsed+=dt;const sample=sampleControlMotion(controlMotion,motionElapsed);
    position=sample.position;velocity=sample.velocity;finished=sample.done;
   }else{
    ({position,velocity}=advanceSpring(position,velocity,target,dt,profile));
    finished=Math.abs(position-target)<.0006&&Math.abs(velocity)<.012;
   }
   if(finished){
    position=target;velocity=0;controlMotion=null;mode='idle';paint();
    // Text/URL/layout work happens after the visual handoff, not in the drag.
    commit(target,reason);interacting(false);previousTime=0;return;
   }
  }
  paint();if(mode==='settling')schedule();else previousTime=0;
 }
 function clearPointer(){
  if(!pointer)return null;
  const ended=pointer;pointer=null;
  try{if(root.hasPointerCapture(ended.id))root.releasePointerCapture(ended.id);}catch{}
  return ended;
 }
 function snap(next=target,why=reason){
  if(dead)return;
  clearPointer();stopFrame();controlMotion=null;target=position=next;velocity=0;mode='idle';paint();commit(next,why);interacting(false);
 }
 function settleTo(next,speed,why,returning=false){
  if(dead)return;
  if(why!=='drag'&&controlMotion&&next===target)return;
  const carry=controlMotion?velocity:0;
  clearPointer();stopFrame();target=next;reason=why;motionElapsed=0;
  controlMotion=why==='drag'?null:createControlMotion(position,next,carry);
  velocity=controlMotion?sampleControlMotion(controlMotion,0).velocity:clamp(speed,-12,12);
  profile=settleProfile(position,next,velocity,returning);
  if(items.length===1||reduced.matches||runtime.reduced||rate()===0||paused||!enabled||document.hidden){snap(next,why);return;}
  if(Math.abs(position-next)<.0006&&Math.abs(velocity)<.012){snap(next,why);return;}
  mode='settling';previousTime=performance.now();interacting(true);paint();schedule();
 }
 function select(id,why='control'){
  if(dead)return;
  const index=items.findIndex(item=>item.id===id);if(index<0)return;
  const next=index+Math.round((position-index)/items.length)*items.length;
  settleTo(next,mode==='settling'?velocity:0,why);
 }
 function down(event){
  if(dead||paused||!enabled||rate()===0||event.button!==0||event.isPrimary===false)return;
  const interrupted=mode!=='idle';
  // A fresh primary press also recovers a missing release. Freeze what was
  // actually drawn, including when the previous input frame was not painted.
  clearPointer();stopFrame();controlMotion=null;position=displayedPosition;width=Math.max(1,host.getBoundingClientRect().width)+40;
  pointer={interrupted,dragged:false,id:event.pointerId,x:event.clientX,y:event.clientY,start:position,lastX:event.clientX,lastY:event.clientY,maxDistance:0};
  tracker.reset(event.clientX,time(event));velocity=0;mode='pending';
  try{root.setPointerCapture(event.pointerId);}catch{}
  interacting(true);paint();
 }
 function readInput(event){
  const points=event.getCoalescedEvents?.()||[];
  for(const point of points)tracker.add(point.clientX,time(point));
  // Always include the final dispatch position, including on pointerup.
  tracker.add(event.clientX,time(event));
  pointer.lastX=event.clientX;pointer.lastY=event.clientY;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  pointer.maxDistance=Math.max(pointer.maxDistance,Math.hypot(dx,dy));
  return {dx,dy};
 }
 function applyDrag(dx){
  position=pointer.start-dx/width;
  if(items.length===1)position=pointer.start-Math.tanh(dx/width)*.06;
 }
 function dragIntent(dx,dy){
  if(mode!=='pending')return true;
  const slop=pointer.interrupted ? .5 : 3;
  if(pointer.maxDistance<slop)return true;
  if(Math.abs(dy)>Math.abs(dx)*1.15)return false;
  pointer.dragged=true;mode='dragging';return true;
 }
 function move(event){
  if(!pointer||event.pointerId!==pointer.id)return;
  if(event.pointerType!=='touch'&&!(event.buttons&1)){finish(event,false,false);return;}
  const {dx,dy}=readInput(event);
  if(!dragIntent(dx,dy)){finish(event,true,false);return;}
  if(mode!=='dragging')return;
  applyDrag(dx);
  if(event.cancelable)event.preventDefault();
  // No DOM reads or project changes here; one visual update per display frame.
  schedule();
 }
 function finish(event,cancelled=false,includePoint=true){
  if(!pointer||(event?.pointerId!==undefined&&event.pointerId!==pointer.id))return;
  if(includePoint&&event?.clientX!==undefined){
   // A release can contain the entire short flick, even with zero move events.
   const {dx,dy}=readInput(event);
   if(!dragIntent(dx,dy))cancelled=true;
   else if(mode==='dragging')applyDrag(dx);
  }
  const ended=clearPointer(),wasDrag=ended.dragged;
  const speed=cancelled?0:tracker.read(event?time(event):performance.now());
  const next=items.length===1?Math.round(ended.start):releaseTarget({position,start:ended.start,velocity:speed,distance:ended.lastX-ended.x,width,cancelled});
  if(!wasDrag&&!cancelled){
   if(ended.interrupted){settleTo(Math.round(position),0,'drag',true);return;}
   snap(Math.round(position),'drag');options.onOpen(items[selected].id);return;
  }
  settleTo(next,cancelled?0:-speed*1000/width,'drag',cancelled||next===Math.round(ended.start));
 }
 function suspend(){snap(mode==='settling'?target:Math.round(position),'drag');}
 function resize(){
  if(dead)return;
  const next=Math.max(1,host.clientWidth)+40;
  if(Math.abs(next-width)>.5){suspend();width=next;renderer.resize();paint();}
 }
 function setItems(next,id){
  if(dead)return;
  clearPointer();stopFrame();controlMotion=null;items=next;ids=items.map(item=>item.id);selected=Math.max(0,ids.indexOf(id));displayedPosition=position=target=selected;velocity=0;mode='idle';
  cards=renderer.setItems(items,selected);paint();commit(selected,'mount',true);interacting(false);
 }
 listen(root,'pointerdown',down);
 listen(window,'pointermove',move,{capture:true,passive:false});
 listen(window,'pointerup',event=>finish(event),{capture:true});
 listen(window,'pointercancel',event=>finish(event,true,false),{capture:true});
 listen(root,'lostpointercapture',event=>{
  // A delayed loss from the previous capture cannot cancel a fresh capture.
  if(!root.hasPointerCapture(event.pointerId))finish(event,true,false);
 });
 listen(root,'dragstart',event=>event.preventDefault());
 listen(root,'click',event=>{event.preventDefault();event.stopPropagation();});
 listen(root,'keydown',event=>{
  if(dead||paused||!enabled||rate()===0)return;
  if(event.key==='Enter'){event.preventDefault();snap(Math.round(position),'control');options.onOpen(items[selected].id);}
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();settleTo(Math.round(target)+(event.key==='ArrowRight'?1:-1),velocity,'control');}
 });
 listen(window,'blur',suspend);
 listen(document,'visibilitychange',()=>{if(document.hidden)suspend();});
 listen(reduced,'change',()=>{if(reduced.matches)suspend();});
 const observer=new ResizeObserver(resize);observer.observe(host);
 function updateRuntime(next={}){
  if(dead)return;
  runtime={...runtime,...next};
  if(next.paused!==undefined)paused=Boolean(next.paused);
  if(next.enabled!==undefined)enabled=Boolean(next.enabled);
  if(next.language!==undefined)language=next.language==='en'?'en':'zh';
  root.dataset.paused=String(paused);root.dataset.duration=String(runtime.durationMs);root.dataset.speed=String(runtime.speed);
  if(paused||!enabled||runtime.reduced||reduced.matches||rate()===0)suspend();
  else if(mode==='settling'){previousTime=performance.now();schedule();}
  metadata();
 }
 setItems(initialItems,initialId);
 return {
  updateRuntime,select,next:(why='control')=>settleTo(Math.round(target)+1,velocity,why),previous:(why='control')=>settleTo(Math.round(target)-1,velocity,why),setItems,
  getState:()=>({index:selected,id:items[selected].id,position,displayedPosition,target,velocity,phase:mode,motion:mode==='settling'?(controlMotion?'controlled':'inertia'):null,runtime:{durationMs:runtime.durationMs,speed:runtime.speed,reduced:Boolean(runtime.reduced||reduced.matches),enabled,paused},items:[...ids]}),
  setLanguage(value){language=value;metadata();},
  pause(value=true){updateRuntime({paused:value});},
  setEnabled(value){updateRuntime({enabled:value});},
  settle:()=>snap(target),destroy:dispose,dispose
 };
 function dispose(){if(dead)return;clearPointer();stopFrame();dead=true;abort.abort();observer.disconnect();renderer.destroy();interacting(false);root.remove();}
}
