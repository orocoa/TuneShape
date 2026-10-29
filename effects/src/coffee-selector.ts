import {nativeEffectTools,nativeToolsCode} from './native-effect-tools';
import type {NativeEffectRuntime} from './native-effect-tools';

export type CoffeeSelectorSettings={items:string[];selectedIndex:number;width:number;rowHeight:number;radius:number;fontSize:number;blur:number;fade:number;bounce:number;disabled:boolean};
export const defaultCoffeeSelector:Readonly<CoffeeSelectorSettings>={items:['Geisha','Bourbon','SL28','Typica','Pacamara'],selectedIndex:0,width:280,rowHeight:48,radius:24,fontSize:16,blur:2.4,fade:.22,bounce:.12,disabled:false};
export const coffeeRanges={width:[240,380],rowHeight:[40,64],radius:[8,36],fontSize:[13,22],blur:[0,5],fade:[.08,.5],bounce:[0,.5]} as const;
export function validateCoffeeSelector(value:unknown):CoffeeSelectorSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw Error('咖啡选择器设置须为普通对象。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultCoffeeSelector);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('咖啡选择器设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(coffeeRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error('咖啡选择器参数超出范围。');
 const items=v.items;
 if(!Array.isArray(items)||Object.getPrototypeOf(items)!==Array.prototype||items.length<3||items.length>12||Reflect.ownKeys(items).length!==items.length+1)throw Error('请输入 3–12 个选项。');
 for(let i=0;i<items.length;i++)if(!Object.hasOwn(Object.getOwnPropertyDescriptor(items,String(i))??{},'value')||typeof items[i]!=='string'||!items[i].trim()||Array.from(items[i]).length>28||/[\u0000-\u001f\u007f-\u009f<>]/u.test(items[i]))throw Error('选项须为 1–28 个可见字符。');
 if(new Set(items.map(s=>s.trim())).size!==items.length)throw Error('选项名称不能重复。');
 if(!Number.isInteger(v.selectedIndex)||Number(v.selectedIndex)<0||Number(v.selectedIndex)>=items.length||typeof v.disabled!=='boolean')throw Error('默认选项或禁用状态无效。');
 return structuredClone(v) as CoffeeSelectorSettings;
}
/** Circular wheel coordinates; the label column stays perfectly straight. */
export function coffeeWheelDelta(index:number,position:number,count:number){return ((index-position+count/2)%count+count)%count-count/2}
export function coffeeSnapTarget(position:number,velocity:number){return Math.round(position+Math.max(-.018,Math.min(.018,velocity))*160)}
/** A full response window for collapse, with continuous incoming velocity and a soft stop. */
export function coffeeClosingFrame(position:number,velocity:number,elapsed:number,duration:number){
 const seconds=Math.max(80,duration)/1000,t=Math.max(0,Math.min(1,elapsed/(seconds*1000))),t2=t*t,t3=t2*t,t4=t3*t,t5=t4*t;
 // Retain incoming velocity, but dissipate outward momentum before it can
 // push a partially opened panel against the full-size clamp and look stuck.
 const decay=velocity>0?Math.max(8,velocity*seconds/(Math.E*Math.max(.0001,1-position))):0,envelope=Math.exp(-decay*t),momentum=t-6*t3+8*t4-3*t5;
 return {position:position*(1-10*t3+15*t4-6*t5)+velocity*seconds*momentum*envelope,velocity:(position*(-30*t2+60*t3-30*t4)+velocity*seconds*(1-18*t2+32*t3-15*t4-decay*momentum)*envelope)/seconds,done:t===1};
}
export type CoffeeRuntime=NativeEffectRuntime&{gallery?:boolean;interactive?:boolean;interruption?:'retarget'|'restart'};

function coffeeSelectorEngine(tools:ReturnType<typeof nativeEffectTools>,delta:typeof coffeeWheelDelta,snap:typeof coffeeSnapTarget,closingFrame:typeof coffeeClosingFrame){
 const css=`.coffee-selector{position:relative;isolation:isolate;color:#202020;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;user-select:none;-webkit-user-select:none}
 .coffee-selector *{box-sizing:border-box}.coffee-selector .cs-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);overflow:hidden;background:#FFFFFF;border:1px solid #eaeaea;box-shadow:0 14px 28px -14px #00000025,0 3px 10px #00000006;outline:none;touch-action:pan-y;cursor:pointer;contain:layout paint}
 .coffee-selector[data-open=true] .cs-panel{touch-action:none;cursor:grab}.coffee-selector[data-dragging=true] .cs-panel{cursor:grabbing}.coffee-selector .cs-panel:focus-visible{outline:2px solid #777;outline-offset:4px}
 .coffee-selector .cs-highlight{position:absolute;top:50%;left:55px;right:12px;border-radius:12px;corner-shape:round;background:#f0f0f0;pointer-events:none}
 .coffee-selector .cs-pointer{position:absolute;left:19px;top:50%;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:6px solid #222;transform:translateY(-50%);pointer-events:none}
 .coffee-selector .cs-list{position:absolute;inset:0;pointer-events:none;mask-image:linear-gradient(transparent 0%,#000 17%,#000 83%,transparent 100%)}
 .coffee-selector .cs-item{position:absolute;left:69px;right:13px;top:50%;display:flex;align-items:center;gap:12px;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:inherit;font-weight:450;line-height:1.25;outline:none;white-space:nowrap;cursor:inherit;will-change:transform,opacity,filter;touch-action:none}
 .coffee-selector .cs-item[aria-selected=true]{font-weight:600}.coffee-selector .cs-label{overflow:hidden;text-overflow:ellipsis}.coffee-selector .cs-bean{flex:none;width:19px;height:23px;overflow:visible;transform:rotate(-20deg)}
 .coffee-selector .cs-live{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.coffee-selector[data-disabled=true]{opacity:.4}
 .coffee-selector-controls .cs-edit-row{display:flex;align-items:center;gap:10px;margin:9px 0}.coffee-selector-controls .cs-edit-row input[type=text]{min-width:0;width:100%;padding:8px;border:1px solid var(--line,#ddd);background:transparent;color:inherit;font:inherit}.coffee-selector-controls select{width:100%;padding:8px;background:transparent;color:inherit;border:1px solid var(--line,#ddd)}`;
 function create(host:HTMLElement,initial:CoffeeSelectorSettings,initialRuntime:CoffeeRuntime){
  let settings=initial,runtime=initialRuntime,position=initial.selectedIndex,target=position,velocity=0,committed=position,open=false,openness=0,openVelocity=0,dead=false,manualSession=false;
  let closing:{position:number;velocity:number;elapsed:number}|null=null;
  let demonstration=false,demoTime=0,demoOrigin=position,demoStep=0,wheelWait=0,drag:{id:number;y:number;position:number;lastY:number;lastAt:number;velocity:number;moved:boolean;scale:number}|null=null,suppressClickUntil=0;
  const style=tools.install(host,'coffee-selector',css),panel=tools.element('div','cs-panel'),highlight=tools.element('span','cs-highlight'),pointer=tools.element('span','cs-pointer'),list=tools.element('div','cs-list'),live=tools.element('span','cs-live');
  const listId='coffee-'+crypto.randomUUID();list.id=listId;list.setAttribute('role','listbox');list.setAttribute('aria-label',runtime.language==='en'?'Options':'选项');panel.tabIndex=0;panel.setAttribute('role','combobox');panel.setAttribute('aria-haspopup','listbox');panel.setAttribute('aria-controls',listId);live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');highlight.setAttribute('aria-hidden','true');pointer.setAttribute('aria-hidden','true');
  panel.append(highlight,pointer,list);host.append(panel,live);let rows:HTMLButtonElement[]=[];
  const modulo=(n:number)=>((Math.round(n)%settings.items.length)+settings.items.length)%settings.items.length;
  const available=()=>!dead&&!settings.disabled&&(runtime.interactive??runtime.enabled)&&!runtime.paused;
  const instant=()=>runtime.reduced||!runtime.enabled||runtime.speed<=0;
  function build(){
   list.replaceChildren();rows=settings.items.map((label,index)=>{const button=tools.element('button','cs-item');button.type='button';button.tabIndex=-1;button.id=listId+'-'+index;button.dataset.index=String(index);button.setAttribute('role','option');button.setAttribute('aria-label',label);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 28');svg.classList.add('cs-bean');svg.setAttribute('aria-hidden','true');
    for(const d of ['M15.7 2.8C9.6 1.6 3.4 7.1 2.6 14.3c-.8 6.9 2.3 11 7.7 11.2 6.3.3 10.7-5.7 11-12.6.2-5.1-1.8-9.2-5.6-10.1Z','M15.7 3.3c-6.9 6-1.8 12-7.9 21.6']){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.6');path.setAttribute('stroke-linecap','round');svg.append(path)}
    button.append(svg,tools.element('span','cs-label',label));list.append(button);return button});
  }
  function paint(){
   const p=tools.clamp(openness),height=settings.rowHeight*5.5+8,collapsed=56,width=settings.width*(.76+.24*p),selected=modulo(target);
   host.style.width=settings.width+'px';host.style.height=height+'px';host.style.fontSize=settings.fontSize+'px';host.dataset.open=String(open);host.dataset.position=position.toFixed(4);host.dataset.expansion=p.toFixed(4);host.dataset.value=settings.items[modulo(committed)];host.dataset.active=settings.items[selected];host.dataset.disabled=String(settings.disabled);host.dataset.elapsed=demoTime.toFixed(1);
   panel.style.width=width+'px';panel.style.height=collapsed+(height-collapsed)*p+'px';panel.style.borderRadius=(Math.min(18,settings.radius)+(settings.radius-Math.min(18,settings.radius))*p)+'px';panel.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-disabled',String(settings.disabled));panel.setAttribute('aria-label',(runtime.language==='en'?'Selected option: ':'当前选项：')+settings.items[modulo(committed)]);panel.setAttribute('aria-activedescendant',rows[selected].id);
   highlight.style.height=settings.rowHeight-6+'px';highlight.style.marginTop=-(settings.rowHeight-6)/2+'px';highlight.style.opacity=String(p*.9);list.style.maskImage=p>.02?'':'none';
   rows.forEach((row,index)=>{const d=delta(index,position,settings.items.length),distance=Math.abs(d),opacity=distance<.001?1:Math.max(0,1-distance*(1-settings.fade)/2),focusWeight=1-Math.min(1,distance);
    row.style.height=settings.rowHeight+'px';row.style.marginTop=-settings.rowHeight/2+'px';row.style.left=(49+20*p)+'px';row.style.transform=`translateY(${d*settings.rowHeight}px)`;row.style.opacity=String(opacity*(p+(1-p)*Math.max(0,1-distance*2)));row.style.filter=`blur(${Math.max(0,distance-.35)*settings.blur/2}px)`;row.style.color=`rgb(${Math.round(32+94*(1-focusWeight))},${Math.round(32+94*(1-focusWeight))},${Math.round(32+94*(1-focusWeight))})`;row.setAttribute('aria-selected',String(index===selected));row.setAttribute('aria-hidden',String(!open&&index!==modulo(committed)));row.disabled=settings.disabled;row.style.pointerEvents=open&&p>.8?'auto':'none';
   });
  }
  function finishSelection(cancel=false){if(cancel)target=position+delta(committed,position,settings.items.length);else{committed=modulo(target);target=position+delta(committed,position,settings.items.length);live.textContent=settings.items[committed];runtime.onChange?.(settings.items[committed])}open=false;wake()}
  function manual(){manualSession=true;demonstration=false;demoTime=0;wheelWait=0}
  function settle(){demonstration=false;wheelWait=0;drag=null;closing=null;host.dataset.dragging='false';open=false;openness=0;position=target=committed;velocity=openVelocity=0;clock.sleep();paint()}
  function startDemo(){if(!runtime.enabled||runtime.paused||runtime.reduced||settings.disabled)return;demonstration=true;demoTime=0;demoStep=0;demoOrigin=position+delta(committed,position,settings.items.length);target=demoOrigin;if(openness===0)position=target;open=true;wake()}
  function leaveDemo(){manualSession=false;demonstration=false;demoTime=0;wheelWait=0;drag=null;host.dataset.dragging='false';target=position+delta(committed,position,settings.items.length);open=false;wake()}
  function tick(dt:number){
   if(wheelWait>0){wheelWait-=dt;if(wheelWait<=0)target=Math.round(target)}
   if(demonstration){demoTime+=dt;const delay=runtime.delayMs??0,unit=Math.max(300,runtime.durationMs),elapsed=demoTime-delay;
    if(elapsed<0)open=false;else open=elapsed<unit*4.8;
    const step=elapsed<unit*1.6?0:elapsed<unit*3.2?1:2;if(step!==demoStep){demoStep=step;target=demoOrigin+step}
    if(elapsed>=unit*6.1){if(runtime.gallery&&!manualSession){demoTime=0;demoStep=0;position=target=demoOrigin;open=true}else{demonstration=false;open=false;target=committed}}
   }
   let panelMoving=false;
   if(open){closing=null;const a=tools.spring(openness,openVelocity,1,dt,runtime.durationMs,settings.bounce);openness=a.position;openVelocity=a.velocity}
   else if(openness!==0||openVelocity!==0||closing){
    closing??={position:openness,velocity:openVelocity,elapsed:0};closing.elapsed+=dt;
    const a=closingFrame(closing.position,closing.velocity,closing.elapsed,runtime.durationMs);openness=a.position;openVelocity=a.velocity;panelMoving=!a.done;if(a.done)closing=null;
   }
   if(!drag){const b=tools.spring(position,velocity,target,dt,runtime.durationMs,settings.bounce);position=b.position;velocity=b.velocity}
   const moving=panelMoving||Math.abs(position-target)>.0005||Math.abs(velocity)>.005||Math.abs(openness-(open?1:0))>.0005||Math.abs(openVelocity)>.005;
   if(!moving){position=target;velocity=0;openness=open?1:0;openVelocity=0}paint();return moving||demonstration||wheelWait>0;
  }
  const clock=tools.clock(runtime,tick,host);
  function wake(){if(open)closing=null;if(instant()){closing=null;position=target;velocity=0;openness=open?1:0;openVelocity=0;clock.sleep();paint()}else{paint();clock.wake()}}
  function click(event:MouseEvent){event.stopPropagation();if(!available())return;if(event.timeStamp<suppressClickUntil){suppressClickUntil=0;return}const wasDemo=demonstration;manual();const row=(event.target as Element).closest<HTMLButtonElement>('.cs-item');
   if(open&&row){target=position+delta(Number(row.dataset.index),position,settings.items.length);finishSelection()}
   else if(!open||wasDemo){open=true;wake()}else finishSelection();panel.focus({preventScroll:true});
  }
  function key(event:KeyboardEvent){if(!available())return;const keys=['ArrowDown','ArrowUp','Home','End','Enter',' ','Escape'];if(!keys.includes(event.key))return;event.preventDefault();event.stopPropagation();manual();
   if(event.key==='Escape'){finishSelection(true);return}if(event.key==='Enter'||event.key===' '){if(open)finishSelection();else{open=true;wake()}return}
   open=true;target=event.key==='Home'?position+delta(0,position,settings.items.length):event.key==='End'?position+delta(settings.items.length-1,position,settings.items.length):Math.round(target)+(event.key==='ArrowDown'?1:-1);wake();
  }
  function wheel(event:WheelEvent){if(!available()||!open)return;event.preventDefault();event.stopPropagation();manual();const dy=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?settings.rowHeight*3:1);target+=Math.max(-2,Math.min(2,dy/settings.rowHeight));wheelWait=140;if(runtime.reduced)target=Math.round(target);wake()}
  function pointerDown(event:PointerEvent){if(!available()||!open||event.button!==0)return;event.stopPropagation();manual();panel.focus({preventScroll:true});const scale=panel.getBoundingClientRect().height/panel.offsetHeight;drag={id:event.pointerId,y:event.clientY,position,lastY:event.clientY,lastAt:event.timeStamp,velocity:0,moved:false,scale};velocity=0}
  function pointerMove(event:PointerEvent){if(!drag||drag.id!==event.pointerId)return;const dy=(event.clientY-drag.y)/drag.scale;if(Math.abs(dy)>4){drag.moved=true;if(!panel.hasPointerCapture(event.pointerId))panel.setPointerCapture(event.pointerId)}if(!drag.moved)return;event.preventDefault();event.stopPropagation();host.dataset.dragging='true';position=target=drag.position-dy/settings.rowHeight;const dt=event.timeStamp-drag.lastAt;if(dt>0)drag.velocity=(drag.lastY-event.clientY)/drag.scale/settings.rowHeight/dt;drag.lastAt=event.timeStamp;drag.lastY=event.clientY;paint()}
  function pointerEnd(event:PointerEvent){if(!drag||event.pointerId!==drag.id)return;const moved=drag.moved;if(moved){target=snap(position,runtime.reduced||event.timeStamp-drag.lastAt>100?0:drag.velocity);suppressClickUntil=event.timeStamp+180}drag=null;host.dataset.dragging='false';if(panel.hasPointerCapture(event.pointerId))panel.releasePointerCapture(event.pointerId);if(moved)wake()}
  function outside(event:Event){if(open&&!demonstration&&!host.contains(event.target as Node)){manual();finishSelection()}}
  function blur(event:FocusEvent){if(open&&!host.contains(event.relatedTarget as Node)){manual();finishSelection()}}
  const listeners:[EventTarget,string,EventListener,AddEventListenerOptions?][]=[[panel,'click',click as EventListener],[panel,'keydown',key as EventListener],[panel,'wheel',wheel as EventListener,{passive:false}],[panel,'pointerdown',pointerDown as EventListener],[panel,'pointermove',pointerMove as EventListener],[panel,'pointerup',pointerEnd as EventListener],[panel,'pointercancel',pointerEnd as EventListener],[panel,'lostpointercapture',pointerEnd as EventListener],[panel,'focusout',blur as EventListener],[document,'pointerdown',outside]];
  listeners.forEach(([node,event,handler,options])=>node.addEventListener(event,handler,options));build();paint();clock.update(runtime);if(runtime.gallery)startDemo();
  return {update(next:CoffeeSelectorSettings,nextRuntime:CoffeeRuntime){const prev=settings,old=runtime;settings=next;runtime=nextRuntime;
   if(JSON.stringify(prev.items)!==JSON.stringify(next.items)){committed=position=target=next.selectedIndex;build()}else if(prev.selectedIndex!==next.selectedIndex){committed=position=target=next.selectedIndex}
   clock.update(runtime);if(!runtime.enabled||settings.disabled){manualSession=false;settle()}else if(runtime.reduced){demonstration=false;closing=null;openVelocity=0;position=target=Math.round(target);openness=open?1:0;clock.sleep()}else if(old.gallery&&!runtime.gallery){leaveDemo()}else if(runtime.gallery&&!old.gallery&&!manualSession){startDemo()}
   paint();
  },demonstrate(){manualSession=false;if(runtime.reduced){open=!open;wake()}else startDemo()},settle,getValue:()=>settings.items[modulo(committed)],destroy(){dead=true;clock.destroy();listeners.forEach(([node,event,handler,options])=>node.removeEventListener(event,handler,options));host.replaceChildren();host.classList.remove('coffee-selector');void style}};
 }
 return {create,css};
}
const engine=coffeeSelectorEngine(nativeEffectTools(),coffeeWheelDelta,coffeeSnapTarget,coffeeClosingFrame);
export const createCoffeeSelector=engine.create;
export const coffeeSelectorEngineCode=`${nativeToolsCode}\nconst coffeeWheelDelta=${coffeeWheelDelta.toString()};\nconst coffeeSnapTarget=${coffeeSnapTarget.toString()};\nconst coffeeClosingFrame=${coffeeClosingFrame.toString()};\nconst coffeeEngine=((__name)=>(${coffeeSelectorEngine.toString()}))((fn)=>fn)(tools,coffeeWheelDelta,coffeeSnapTarget,coffeeClosingFrame);\nconst createCoffeeSelector=coffeeEngine.create;`;
