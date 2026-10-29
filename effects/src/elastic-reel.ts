export type ReelSettings={barWidth:number;barHeight:number;gap:number;radius:number;magnify:number;influence:number;openSize:number;openAspect:number;elasticity:number;align:'center'|'bottom';autoplay:'off'|'sweep'|'cycle';speed:number;interval:number};
export const reelRanges={barWidth:[8,120,1],barHeight:[.2,.8,.01],gap:[0,32,1],radius:[0,32,1],magnify:[1,6,.05],influence:[60,400,5],openSize:[.4,.9,.01],openAspect:[.5,2,.05],elasticity:[0,1,.01],speed:[.2,4,.1],interval:[1.5,10,.5]} as const;
export const defaultReel:ReelSettings={barWidth:44,barHeight:.5,gap:10,radius:12,magnify:2.4,influence:200,openSize:.72,openAspect:1,elasticity:.35,align:'center',autoplay:'sweep',speed:1.4,interval:4};
export function validateReel(value:unknown):ReelSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==Object.keys(defaultReel).length||Object.keys(defaultReel).some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('相片卷设置字段不完整或含未知字段。');
 const v=value as ReelSettings;
 for(const [key,[min,max]] of Object.entries(reelRanges)){const n=v[key as keyof typeof reelRanges];if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error(`相片卷 ${key} 须在 ${min}–${max} 范围内。`)}
 if(!['center','bottom'].includes(v.align)||!['off','sweep','cycle'].includes(v.autoplay))throw Error('相片卷排列或自动播放方式无效。');return {...v};
}
export type ReelPose={x:number;y:number;width:number;height:number;radius:number;opacity:number;blur:number;tilt:number};
export type ReelItem={src:string;title:string;titleZh?:string;alt:string;focus?:number};
export type ReelRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;repeat:boolean;language:'zh'|'en';onRunning?:(value:boolean)=>void};

/** One closed module keeps serialized helpers valid after production name mangling. */
function createReelEngine(){
/** All geometry is authored at 640 × 400, then fitted to the preview. */
function planReel(s:ReelSettings,count:number,focusX:number|null,open=-1):ReelPose[]{
 const width=640,height=400,available=width-48,gap=Math.min(s.gap,available/Math.max(1,count-1)*.3),base=Math.min(s.barWidth,(available-gap*(count-1))/count),restTotal=count*base+(count-1)*gap;
 const weights=Array.from({length:count},(_,i)=>focusX===null?0:Math.exp(-.5*((24+(available-restTotal)/2+i*(base+gap)+base/2-focusX)/(s.influence*.45))**2));
 let widths=weights.map(w=>base*(1+(s.magnify-1)*w));
 const openHeight=(height-56)*s.openSize,openWidth=Math.min(openHeight*s.openAspect,available-gap*(count-1)-Math.max(4,count-1)*8);
 if(open>=0&&open<count){widths[open]=openWidth;const otherTotal=widths.reduce((a,b,i)=>a+(i===open?0:b),0),space=Math.max(8*(count-1),available-openWidth-gap*(count-1));if(otherTotal>space)widths=widths.map((w,i)=>i===open?w:w*space/otherTotal)}
 else{const total=widths.reduce((a,b)=>a+b,0);if(total+gap*(count-1)>available)widths=widths.map(w=>w*(available-gap*(count-1))/total)}
 let cursor=(width-widths.reduce((a,b)=>a+b,0)-gap*(count-1))/2;
 return widths.map((w,i)=>{const selected=i===open,h=selected?openHeight:height*s.barHeight*(1+.15*weights[i]),pose={x:cursor,y:s.align==='bottom'?332-h:188-h/2,width:w,height:h,radius:Math.min(s.radius,w/2),opacity:open<0||selected?1:1-.45*(1-weights[i]),blur:open<0||selected?0:2.5*(1-weights[i]),tilt:open<0?(weights[Math.max(0,i-1)]-weights[Math.min(count-1,i+1)])*s.elasticity*2:0};cursor+=w+gap;return pose});
}
/** Stable small-step spring integration, shared by live and exported renderers. */
function stepReel(position:number,velocity:number,target:number,dt:number,elasticity:number,durationMs=800){
 const stiffness=220*(800/durationMs)**2,damping=2*Math.sqrt(stiffness)*(1-.64*elasticity),steps=Math.max(1,Math.ceil(dt/.004)),h=dt/steps;
 for(let i=0;i<steps;i++){velocity+=(stiffness*(target-position)-damping*velocity)*h;position+=velocity*h}
 return {position,velocity};
}
/** Self-contained DOM renderer. Pointer, selection, velocities and clocks stay outside saved settings. */
function createReel(root:HTMLElement,initial:ReelSettings,items:ReelItem[],initialRuntime:ReelRuntime){
 let settings={...initial},runtime={...initialRuntime},open=-1,focusX:number|null=null,hovering=false,focused=false,elapsed=0,cycle=0,previousTime=0,frame=0,disposed=false,reported=false,previewRemaining=0;
 let down:{x:number;y:number;index:number;open:number;dragged:boolean}|null=null,lastWheel=0;
 const track=document.createElement('div');track.className='elastic-track';track.dataset.part='reel';
 const caption=document.createElement('div');caption.className='elastic-caption';caption.setAttribute('aria-live','polite');caption.setAttribute('aria-atomic','true');
 const close=document.createElement('button');close.type='button';close.className='elastic-close';close.textContent='×';
 const nav=document.createElement('div');nav.className='elastic-nav';
 const previous=document.createElement('button'),next=document.createElement('button');previous.type=next.type='button';previous.textContent='←';next.textContent='→';nav.append(previous,next);
 const buttons=items.map((item,i)=>{const button=document.createElement('button');button.className='elastic-slice';button.type='button';button.dataset.index=String(i);button.dataset.part='photo'+i;const image=document.createElement('img');image.src=item.src;image.alt=item.alt;image.draggable=false;image.style.objectPosition=`${(item.focus??.5)*100}% center`;button.append(image);track.append(button);return button});
 root.replaceChildren(track,caption,close,nav);root.setAttribute('role','group');
 let poses=planReel(settings,items.length,null),velocities=poses.map(p=>Object.fromEntries(Object.keys(p).map(k=>[k,0])) as unknown as ReelPose);
 const report=(running:boolean)=>{if(running!==reported){reported=running;runtime.onRunning?.(running)}};
 const labels=()=>{const en=runtime.language==='en';root.setAttribute('aria-label',en?'Elastic reel. Hover to magnify, click to open. Arrow keys browse; Escape closes.':'弹性相片卷。悬停放大，点击展开；方向键切换，Escape 收起。');close.setAttribute('aria-label',en?'Close image':'收起相片');previous.setAttribute('aria-label',en?'Previous image':'上一张相片');next.setAttribute('aria-label',en?'Next image':'下一张相片');buttons.forEach((b,i)=>{b.setAttribute('aria-label',(en?'Open ':'展开')+(en?items[i].title:items[i].titleZh??items[i].title));b.setAttribute('aria-expanded',String(open===i));b.tabIndex=runtime.enabled?0:-1});for(const b of [close,previous,next])b.tabIndex=runtime.enabled?0:-1};
 const selection=()=>{root.dataset.open=String(open);close.hidden=nav.hidden=open<0;labels();caption.textContent=open>=0?`${String(open+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}　${items[open].title}`:''};
 const paint=()=>buttons.forEach((button,i)=>{const p=poses[i];button.style.cssText=`left:${p.x}px;top:${p.y}px;width:${Math.max(2,p.width)}px;height:${Math.max(2,p.height)}px;border-radius:${Math.max(0,p.radius)}px;opacity:${p.opacity};filter:blur(${Math.max(0,p.blur)}px);transform:perspective(800px) rotateY(${p.tilt}deg);z-index:${i===open?3:1}`});
 const activeAuto=()=>!previewRemaining&&settings.autoplay!=='off'&&!runtime.reduced&&!hovering&&!focused&&(settings.autoplay==='cycle'||open<0);
 const request=()=>{if(!frame&&!disposed&&runtime.enabled&&!runtime.paused&&!document.hidden){previousTime=0;frame=requestAnimationFrame(tick)}};
 const setOpen=(index:number)=>{if(!runtime.enabled||runtime.paused)return;previewRemaining=0;open=index;focusX=null;cycle=0;selection();if(runtime.reduced){poses=planReel(settings,items.length,null,open);paint()}else request()};
 const stepSelection=(delta:number)=>{const current=open>=0?open:Math.max(0,buttons.indexOf(document.activeElement as HTMLButtonElement));setOpen((current+delta+items.length)%items.length)};
 function tick(now:number){
  frame=0;if(disposed||!runtime.enabled||runtime.paused||document.hidden){report(false);return}
  const dt=previousTime?Math.min(.032,(now-previousTime)/1000)*runtime.speed:0;previousTime=now;
  if(previewRemaining>0){previewRemaining=Math.max(0,previewRemaining-dt);if(!previewRemaining)focusX=null}
  let autoX:number|null=null;
  if(activeAuto()){
   elapsed+=dt;
   if(settings.autoplay==='sweep'){
    const span=Math.max(1,items.length-1),progress=elapsed*settings.speed,local=runtime.repeat?progress%(span*2):Math.min(progress,span*2),index=local>span?span*2-local:local;
    const rest=planReel(settings,items.length,null),lo=Math.floor(index),hi=Math.min(items.length-1,lo+1),a=rest[lo].x+rest[lo].width/2,b=rest[hi].x+rest[hi].width/2;autoX=a+(b-a)*(index-lo);
   }else{cycle+=dt;if(cycle>=settings.interval){cycle%=settings.interval;open=open<0?0:(runtime.repeat?(open+1)%items.length:Math.min(items.length-1,open+1));selection()}}
  }
  const targets=planReel(settings,items.length,runtime.reduced?null:focusX??autoX,open);let settled=true;
  poses=poses.map((p,i)=>Object.fromEntries(Object.entries(p).map(([key,value])=>{const k=key as keyof ReelPose,target=targets[i][k];if(runtime.reduced){velocities[i][k]=0;return [key,target]};const result=stepReel(value,velocities[i][k],target,dt,settings.elasticity,runtime.durationMs);velocities[i][k]=result.velocity;if(Math.abs(target-result.position)>.008||Math.abs(result.velocity)>.02)settled=false;return [key,Math.abs(target-result.position)<.001&&Math.abs(result.velocity)<.005?target:result.position]})) as ReelPose);
  paint();const auto=activeAuto()&&(runtime.repeat||elapsed*settings.speed<(items.length-1)*2&&settings.autoplay==='sweep'||settings.autoplay==='cycle'&&open<items.length-1);const running=!runtime.reduced&&(!settled||auto||previewRemaining>0);report(running);if(running)frame=requestAnimationFrame(tick);
 }
 const events: (()=>void)[]=[];
 const listen=<K extends keyof HTMLElementEventMap>(node:HTMLElement,type:K,fn:(event:HTMLElementEventMap[K])=>void,options?:AddEventListenerOptions)=>{node.addEventListener(type,fn as EventListener,options);events.push(()=>node.removeEventListener(type,fn as EventListener,options))};
 const xAt=(event:PointerEvent)=>{const rect=root.getBoundingClientRect();return (event.clientX-rect.left)/rect.width*640};
 const can=()=>runtime.enabled&&!runtime.paused;
 listen(root,'pointerenter',event=>{if(!can()||event.pointerType==='touch')return;previewRemaining=0;hovering=true;if(!runtime.reduced)focusX=xAt(event);request()});
 listen(root,'pointermove',event=>{if(!can())return;previewRemaining=0;if(down&&Math.abs(event.clientX-down.x)>12){down.dragged=true;if(!runtime.reduced)focusX=xAt(event);request()}else if(event.pointerType!=='touch'&&!runtime.reduced){focusX=xAt(event);request()}});
 listen(root,'pointerleave',()=>{hovering=false;if(!down){focusX=null;request()}});
 const cancel=()=>{previewRemaining=0;down=null;focusX=null;hovering=false;request()};listen(root,'pointercancel',cancel);listen(root,'lostpointercapture',()=>{down=null});
 listen(root,'pointerdown',event=>{if(!can()||event.button!==0)return;const index=Number((event.target as HTMLElement).closest<HTMLElement>('.elastic-slice')?.dataset.index??-1);if(index<0)return;down={x:event.clientX,y:event.clientY,index,open,dragged:false};root.setPointerCapture(event.pointerId)});
 listen(root,'pointerup',event=>{if(!down)return;const gesture=down;down=null;if(gesture.dragged){if(gesture.open>=0)setOpen((gesture.open+(event.clientX<gesture.x?1:-1)+items.length)%items.length);else{focusX=null;request()}}else if(Math.abs(event.clientY-gesture.y)<12)setOpen(open===gesture.index?-1:gesture.index);if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId)});
 listen(track,'click',event=>{event.stopPropagation();if(event.detail===0){const index=Number((event.target as HTMLElement).closest<HTMLElement>('.elastic-slice')?.dataset.index??-1);if(index>=0)setOpen(open===index?-1:index)}});
 listen(close,'click',event=>{event.stopPropagation();const index=open;setOpen(-1);buttons[index]?.focus()});
 listen(previous,'click',event=>{event.stopPropagation();stepSelection(-1)});listen(next,'click',event=>{event.stopPropagation();stepSelection(1)});
 listen(root,'focusin',event=>{previewRemaining=0;focused=true;const index=buttons.indexOf(event.target as HTMLButtonElement);if(index>=0&&!runtime.reduced){focusX=poses[index].x+poses[index].width/2;request()}});
 listen(root,'focusout',event=>{if(!root.contains(event.relatedTarget as Node|null)){focused=false;focusX=null;request()}});
 listen(root,'keydown',event=>{if(!can())return;const current=buttons.indexOf(document.activeElement as HTMLButtonElement);if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(-1)}else if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();const index=event.key==='Home'?0:event.key==='End'?items.length-1:((current<0?Math.max(0,open):current)+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;if(open>=0)setOpen(index);buttons[index].focus()}});
 listen(root,'wheel',event=>{if(!can()||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;event.preventDefault();if(Math.abs(event.deltaX)>8&&event.timeStamp-lastWheel>240){lastWheel=event.timeStamp;stepSelection(Math.sign(event.deltaX))}}, {passive:false});
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previousTime=0}else request()};document.addEventListener('visibilitychange',visibility);
 selection();paint();request();
 return {update(nextSettings:ReelSettings,nextRuntime:ReelRuntime){const changed=runtime.language!==nextRuntime.language;settings={...nextSettings};runtime={...nextRuntime};root.dataset.paused=String(runtime.paused);if(changed)selection();else labels();if(!runtime.enabled||runtime.paused){cancelAnimationFrame(frame);frame=0;previousTime=0}else if(runtime.reduced){poses=planReel(settings,items.length,null,open);velocities=poses.map(p=>Object.fromEntries(Object.keys(p).map(k=>[k,0])) as unknown as ReelPose);paint();report(false)}else request()},
  preview(mode:'hover'|'open'){
   if(!can())return;
   if(mode==='open'){setOpen(open>=0?open:Math.floor(items.length/2));return}
   open=-1;focusX=320;previewRemaining=runtime.reduced?0:runtime.durationMs/1000+.3;selection();
   if(runtime.reduced){poses=planReel(settings,items.length,focusX);paint()}else request();
  },
  replay(){elapsed=0;cycle=0;request()},destroy(){disposed=true;cancelAnimationFrame(frame);events.forEach(remove=>remove());document.removeEventListener('visibilitychange',visibility);runtime.onRunning?.(false)}};
}
return {planReel,stepReel,createReel};
}
export const {planReel,stepReel,createReel}=createReelEngine();
export const reelEngineCode='((__name) => ('+createReelEngine.toString()+')())((fn) => fn)';
