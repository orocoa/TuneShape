/** Original wheel/arc layout and DOM carousel. No React Bits Pro code is used. */
export type OrbitSettings={defaultView:'ring'|'arc';count:number;spin:number;interval:number;arc:number;aspect:number;radius:number;gap:number;autoplay:boolean;tilt:boolean;flipWave:boolean;pauseOnHover:boolean;accentColor:string;backgroundColor:string};
export type OrbitItem={src:string;title:string;alt:string};
export type OrbitRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;repeat:boolean;onRunning?:(running:boolean)=>void};
export const defaultOrbit:Readonly<OrbitSettings>={defaultView:'ring',count:18,spin:8,interval:3.5,arc:1,aspect:.8,radius:.07,gap:.18,autoplay:true,tilt:true,flipWave:true,pauseOnHover:true,accentColor:'#171717',backgroundColor:'#F1F1F1'};
export const orbitRanges={count:[18,72,6],spin:[-30,30,1],interval:[1,10,.1],arc:[.5,2.5,.05],aspect:[.5,1.8,.05],radius:[0,.5,.01],gap:[0,.6,.01]} as const;
export function validateOrbit(value:unknown):OrbitSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('卡片转轮设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultOrbit);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('卡片转轮设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(orbitRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`卡片转轮 ${key} 超出范围。`);
 if(!Number.isInteger(v.count)||Number(v.count)%6)throw Error('卡片数量须为 18–72 之间的 6 的倍数。');
 if(!['ring','arc'].includes(v.defaultView as string))throw Error('卡片转轮视图无效。');
 for(const key of ['autoplay','tilt','flipWave','pauseOnHover'])if(typeof v[key]!=='boolean')throw Error('卡片转轮开关无效。');
 for(const key of ['accentColor','backgroundColor'])if(typeof v[key]!=='string'||!/^#[\da-f]{6}$/i.test(v[key] as string))throw Error('卡片转轮颜色须为六位十六进制。');
 return structuredClone(v) as OrbitSettings;
}

function createOrbitEngine(){
 const css=`.orbit-reel{position:relative;pointer-events:auto;width:320px;height:230px;overflow:hidden;border-radius:3px;touch-action:pan-y;isolation:isolate;color:var(--orbit-ink,#171717);font-family:inherit;user-select:none}
 .orbit-reel button{font:inherit;color:inherit;cursor:pointer;touch-action:pan-y}.orbit-reel button:disabled{cursor:default}.orbit-reel button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
 .orbit-card{position:absolute;border:0;padding:0;background:none;perspective:500px;transform-origin:center;will-change:transform;outline-offset:2px}
 .orbit-card-inner{border-radius:inherit;display:block;position:relative;width:100%;height:100%;transform-style:preserve-3d;pointer-events:none}.orbit-card-front,.orbit-card-back{position:absolute;inset:0;overflow:hidden;border-radius:inherit;backface-visibility:hidden}
 .orbit-card-front{background:#ddd;box-shadow:0 1px 3px #00000012}.orbit-card-front img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.orbit-card-back{display:grid;place-items:center;transform:rotateY(180deg);font-size:9px;letter-spacing:.1em;color:white;background:var(--orbit-accent,#171717)}
 .orbit-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:0;background:none;padding:12px;text-align:center}.orbit-center strong{display:block;font-size:19px;letter-spacing:.12em;font-weight:500}.orbit-center small{display:block;font-size:9px;margin-top:7px;opacity:.65}
 .orbit-back{position:absolute;right:10px;top:10px;border:1px solid #8883;border-radius:20px;background:var(--orbit-bg);padding:5px 9px;font-size:9px!important;z-index:1500}
 .orbit-footer{position:absolute;bottom:10px;left:10px;right:10px;text-align:center;z-index:1500;pointer-events:none}.orbit-title{font-size:12px;margin:0 0 8px;font-weight:500}.orbit-controls{display:flex;align-items:center;justify-content:center;gap:14px;font-size:9px}.orbit-controls button{pointer-events:auto;width:27px;height:27px;background:var(--orbit-bg);border:1px solid #8883;border-radius:50%;font-size:13px}.orbit-controls span{font-variant-numeric:tabular-nums;min-width:43px;opacity:.6}
 .orbit-card{transition:filter .2s ease}.orbit-reel[data-selected=true] .orbit-card:not([aria-current=true]){filter:brightness(.75)}`;
 return {
  wrap(value:number,count:number){return ((value+count/2)%count+count)%count-count/2},
  index(value:number,count:number){return ((Math.round(value)%count)+count)%count},
  ease(t:number){return 1-(1-Math.max(0,Math.min(1,t)))**3},
  plan(s:OrbitSettings,position:number,mix:number){
   const step=Math.PI*2/s.count,ringRadius=82,ringWidth=Math.PI*2*ringRadius/s.count*(1-s.gap),arcHeight=100,arcWidth=arcHeight*s.aspect,arcRadius=arcWidth/(1-s.gap)*s.count/(Math.PI*2)*s.arc;
   return Array.from({length:s.count},(_,i)=>{
    const angle=this.wrap(i-position,s.count)*step,ringX=160+Math.sin(angle)*ringRadius,ringY=115-Math.cos(angle)*ringRadius,arcX=160+Math.sin(angle)*arcRadius,arcY=230*.42+arcRadius*(1-Math.cos(angle));
    return {index:i,x:ringX+(arcX-ringX)*mix,y:ringY+(arcY-ringY)*mix,width:ringWidth+(arcWidth-ringWidth)*mix,height:ringWidth/s.aspect+(arcHeight-ringWidth/s.aspect)*mix,rotate:s.tilt?angle*180/Math.PI:0,opacity:1-mix+mix*Math.max(0,Math.min(1,(80-Math.abs(angle*180/Math.PI))/25)),active:i===this.index(position,s.count)};
   });
  },
  create(host:HTMLElement,initial:OrbitSettings,items:OrbitItem[],initialRuntime:OrbitRuntime){
   const engine=this;let s=initial,runtime=initialRuntime,view=s.defaultView,position=0,mix=view==='arc'?1:0,time=0,arcElapsed=0,steps=0,last=0,raf=0,reported:boolean|null=null,destroyed=false,hover=false,focused=false,suppressClick=false;
   type Tween={from:number;to:number;elapsed:number};let positionTween:Tween|null=null,mixTween:Tween|null=null,zoomTween:Tween|null=null;let zoom=1,paintPending=false,staticKey='';
   const cardStates:Array<{active?:boolean;hidden?:boolean;disabled?:boolean;z?:number;flip?:number}>=[];
   let drag:null|{id:number;x:number;y:number;angle:number;position:number;active:boolean;rect:DOMRect}=null;
   const style=document.createElement('style');style.textContent=css;host.appendChild(style);
   const cards=document.createElement('div');cards.className='orbit-cards';host.appendChild(cards);let buttons:HTMLButtonElement[]=[];
   const center=document.createElement('button');center.type='button';center.className='orbit-center';center.dataset.orbitAction='open';center.setAttribute('aria-label','Open card arc');host.appendChild(center);
   const back=document.createElement('button');back.type='button';back.className='orbit-back';back.dataset.orbitAction='back';back.textContent='↙ All cards';host.appendChild(back);
   const footer=document.createElement('div');footer.className='orbit-footer';const title=document.createElement('p');title.className='orbit-title';title.setAttribute('aria-live','polite');footer.appendChild(title);
   const controls=document.createElement('div');controls.className='orbit-controls';const previous=document.createElement('button'),next=document.createElement('button'),counter=document.createElement('span');previous.type=next.type='button';previous.textContent='←';next.textContent='→';previous.setAttribute('aria-label','Previous card');next.setAttribute('aria-label','Next card');previous.dataset.orbitAction='previous';next.dataset.orbitAction='next';controls.append(previous,counter,next);footer.appendChild(controls);host.appendChild(footer);
   host.tabIndex=0;host.setAttribute('role','group');host.setAttribute('aria-label','Orbit reel. Click to open the arc, drag or use arrow keys to turn, Escape to return.');
   const api={
    interactive(){return runtime.enabled&&!runtime.paused},
    automatic(){if(!runtime.enabled||runtime.reduced||!runtime.repeat&&(view==='ring'?Math.abs(s.spin)*time>=360:steps>=s.count-1))return false;return view==='ring'?(s.spin!==0||s.flipWave&&(runtime.repeat||time<6)):s.autoplay||s.flipWave&&(runtime.repeat||time<6)},
    report(){const running=!!(this.automatic()||positionTween||mixTween||zoomTween);if(running!==reported){reported=running;runtime.onRunning?.(running)}},
    build(){
     cards.replaceChildren();cardStates.length=0;staticKey='';buttons=Array.from({length:s.count},(_,i)=>{const item=items[i%items.length],button=document.createElement('button');button.type='button';button.className='orbit-card';button.dataset.orbitCard=String(i);button.setAttribute('aria-label',item.title);const inner=document.createElement('span');inner.className='orbit-card-inner';const front=document.createElement('span');front.className='orbit-card-front';const image=document.createElement('img');image.src=item.src;image.alt=item.alt;image.draggable=false;image.decoding='async';front.appendChild(image);const reverse=document.createElement('span');reverse.className='orbit-card-back';reverse.textContent=String(i%items.length+1).padStart(2,'0');inner.append(front,reverse);button.appendChild(inner);cards.appendChild(button);return button});
    },
    paint(){
     paintPending=false;const active=engine.index(position,s.count),poses=engine.plan(s,position,mix),interactive=api.interactive();
     host.dataset.view=view;host.dataset.active=String(active);host.dataset.position=position.toFixed(5);host.dataset.mix=mix.toFixed(5);host.dataset.orbitTime=time.toFixed(5);host.dataset.zoom=zoom.toFixed(5);host.dataset.paused=String(runtime.paused);
     const key=[s.backgroundColor,s.accentColor,s.aspect,s.radius].join('|');
     if(key!==staticKey){staticKey=key;host.style.background=s.backgroundColor;host.style.setProperty('--orbit-bg',s.backgroundColor);host.style.setProperty('--orbit-accent',s.accentColor);const rgb=[1,3,5].map(i=>parseInt(s.backgroundColor.slice(i,i+2),16));host.style.setProperty('--orbit-ink',rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>130?'#171717':'#fafafa');
      buttons.forEach(button=>{button.style.left='0';button.style.top='0';button.style.width=`${100*s.aspect}px`;button.style.height='100px';button.style.borderRadius=`${100*s.aspect*s.radius}px`});
     }
     poses.forEach((p,i)=>{const button=buttons[i],state=cardStates[i]??(cardStates[i]={}),distance=Math.abs(engine.wrap(i-position,s.count)),wave=(time%6-.6-distance*.065)/1.05,flip=s.flipWave&&!runtime.reduced&&(runtime.repeat||time<6)&&wave>0&&wave<1?engine.ease(wave)*360:0,scale=p.height/100*(view==='arc'&&p.active?zoom:1),hidden=p.opacity<=.15,z=1000-Math.round(distance*10);
      button.style.transform=`translate3d(${p.x-50*s.aspect}px,${p.y-50}px,0) rotate(${p.rotate}deg) scale(${scale})`;button.style.opacity=String(p.opacity);
      if(state.z!==z){button.style.zIndex=String(z);state.z=z}
      if(state.active!==p.active){button.tabIndex=p.active?0:-1;button.setAttribute('aria-current',String(p.active));state.active=p.active}
      if(state.hidden!==hidden){button.style.pointerEvents=hidden?'none':'auto';button.setAttribute('aria-hidden',String(hidden));state.hidden=hidden}
      if(state.disabled!==!interactive){button.disabled=!interactive;state.disabled=!interactive}
      if(state.flip!==flip){(button.firstElementChild as HTMLElement).style.transform=`rotateY(${flip}deg)`;state.flip=flip}
     });
     center.setAttribute('aria-hidden',String(mix>=.1));back.setAttribute('aria-hidden',String(mix<=.9));footer.setAttribute('aria-hidden',String(mix<=.9));center.style.opacity=String(1-mix);center.style.pointerEvents=mix<.1?'auto':'none';center.tabIndex=mix<.1?0:-1;center.disabled=!interactive;back.style.opacity=String(mix);back.style.pointerEvents=mix>.9?'auto':'none';back.tabIndex=mix>.9?0:-1;back.disabled=!interactive;footer.style.opacity=String(mix);footer.style.visibility=mix>.01?'visible':'hidden';previous.disabled=next.disabled=!interactive;previous.tabIndex=next.tabIndex=mix>.9?0:-1;
     const text=items[active%items.length].title;if(title.textContent!==text)title.textContent=text;const count=String(active%items.length+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');if(counter.textContent!==count)counter.textContent=count;this.report();
    },
    request(){this.report();if(!raf&&!destroyed&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden&&(paintPending||positionTween||mixTween||zoomTween||this.automatic()&&!(s.pauseOnHover&&(hover||focused))&&!drag?.active)){if(!last)last=performance.now();raf=requestAnimationFrame(tick)}else if(!raf)last=0},
    schedulePaint(){if(runtime.reduced)this.paint();else {paintPending=true;this.request()}},
    stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0},
    select(selected:boolean){host.dataset.selected=String(selected);const target=selected?1.2:1;zoomTween=runtime.reduced?null:{from:zoom,to:target,elapsed:0};if(runtime.reduced)zoom=target;this.paint();this.request()},
    goTo(index:number){if(!this.interactive())return;const target=position+engine.wrap(index-position,s.count);positionTween=runtime.reduced?null:{from:position,to:target,elapsed:0};if(runtime.reduced)position=target;arcElapsed=0;this.select(false);this.paint();this.request()},
    setView(nextView:'ring'|'arc',index?:number){if(!this.interactive())return;view=nextView;host.dataset.selected='false';zoom=1;zoomTween=null;mixTween=runtime.reduced?null:{from:mix,to:view==='arc'?1:0,elapsed:0};if(runtime.reduced)mix=view==='arc'?1:0;arcElapsed=0;if(index!==undefined)this.goTo(index);else if(view==='arc')this.goTo(Math.round(position));this.paint();this.request()},
    update(settings:OrbitSettings,nextRuntime:OrbitRuntime){const countChanged=s.count!==settings.count,viewChanged=s.defaultView!==settings.defaultView;s=settings;runtime=nextRuntime;if(countChanged){position=engine.index(position,s.count);positionTween=null;this.build()}if(viewChanged){view=s.defaultView;mix=runtime.reduced?(view==='arc'?1:0):mix;mixTween=runtime.reduced?null:{from:mix,to:view==='arc'?1:0,elapsed:0}}if(runtime.reduced){if(positionTween)position=positionTween.to;if(mixTween)mix=mixTween.to;positionTween=mixTween=zoomTween=null;zoom=host.dataset.selected==='true'?1.2:1}this.stop();this.paint();this.request()},
    replay(){position=0;view=s.defaultView;mix=view==='arc'?1:0;time=arcElapsed=steps=0;positionTween=mixTween=zoomTween=null;zoom=1;reported=null;host.dataset.selected='false';this.stop();this.paint();this.request()},
    destroy(){destroyed=true;this.stop();host.removeEventListener('click',click);host.removeEventListener('keydown',key);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancel);host.removeEventListener('pointerleave',leave);host.removeEventListener('focusin',focus);host.removeEventListener('focusout',blur);host.removeEventListener('wheel',wheel);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();runtime.onRunning?.(false)},
   };
   function tick(now:number){
    raf=0;if(destroyed||!runtime.enabled||runtime.paused||runtime.reduced||document.hidden)return;
    const dt=Math.min(.05,Math.max(0,(now-last)/1000))*runtime.speed;last=now;const duration=runtime.durationMs/1000,auto=!(s.pauseOnHover&&(hover||focused))&&!drag?.active;
    if(auto||positionTween||mixTween||zoomTween)time+=dt;
    if(positionTween){positionTween.elapsed+=dt;const u=Math.min(1,positionTween.elapsed/duration);position=positionTween.from+(positionTween.to-positionTween.from)*engine.ease(u);if(u>=1)positionTween=null}
    if(mixTween){mixTween.elapsed+=dt;const u=Math.min(1,mixTween.elapsed/duration);mix=mixTween.from+(mixTween.to-mixTween.from)*engine.ease(u);if(u>=1)mixTween=null}
    if(zoomTween){zoomTween.elapsed+=dt;const u=Math.min(1,zoomTween.elapsed/Math.min(.24,duration));zoom=zoomTween.from+(zoomTween.to-zoomTween.from)*engine.ease(u);if(u>=1)zoomTween=null}
    if(auto&&api.automatic()){
     if(view==='ring'&&!positionTween)position-=s.spin/360*s.count*dt;
     else if(view==='arc'&&s.autoplay){arcElapsed+=dt;if(arcElapsed>=s.interval){arcElapsed-=s.interval;steps++;positionTween={from:position,to:Math.round(position)+1,elapsed:0}}}
    }
    api.paint();api.request();
   }
   function click(event:MouseEvent){event.stopPropagation();if(suppressClick){suppressClick=false;event.preventDefault();return}if(!api.interactive())return;const target=event.target as Element,card=target.closest<HTMLElement>('[data-orbit-card]'),action=target.closest<HTMLElement>('[data-orbit-action]')?.dataset.orbitAction;
    if(card){const index=Number(card.dataset.orbitCard);if(view==='ring')api.setView('arc',index);else if(index!==engine.index(position,s.count))api.goTo(index);else api.select(host.dataset.selected!=='true')}
    else if(action==='next')api.goTo(Math.round(position)+1);else if(action==='previous')api.goTo(Math.round(position)-1);else if(action==='open')api.setView('arc');else if(view==='arc')api.setView('ring');
   }
   function key(event:KeyboardEvent){if(!api.interactive())return;if(['ArrowRight','ArrowLeft','Home','End','Escape'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Escape')api.setView('ring');else api.goTo(event.key==='Home'?0:event.key==='End'?s.count-1:Math.round(position)+(event.key==='ArrowRight'?1:-1))}else if((event.key==='Enter'||event.key===' ')&&event.target===host){event.preventDefault();api.setView(view==='ring'?'arc':'ring')}}
   function point(event:PointerEvent,r:DOMRect){return {x:(event.clientX-r.left)/r.width*320,y:(event.clientY-r.top)/r.height*230}}
   function down(event:PointerEvent){if(!api.interactive()||event.button!==0||(event.target as Element).closest('[data-orbit-action]'))return;suppressClick=false;const rect=host.getBoundingClientRect(),p=point(event,rect);drag={rect,id:event.pointerId,x:p.x,y:p.y,angle:Math.atan2(p.x-160,115-p.y),position,active:false}}
   function move(event:PointerEvent){hover=!!(event.target as Element).closest('.orbit-card');if(!drag){api.request();return}const p=point(event,drag.rect),dx=p.x-drag.x,dy=p.y-drag.y;if(event.pointerType==='touch'&&!drag.active&&Math.abs(dy)>Math.abs(dx)+5){drag=null;return}if(!drag.active&&Math.hypot(dx,dy)<5)return;drag.active=true;suppressClick=true;positionTween=null;if(!host.hasPointerCapture(event.pointerId))host.setPointerCapture(event.pointerId);event.preventDefault();if(view==='ring'){const angle=Math.atan2(p.x-160,115-p.y),delta=engine.wrap((angle-drag.angle)*180/Math.PI,360);position=drag.position-delta/360*s.count}else position=drag.position-dx/(100*s.aspect/(1-s.gap)*s.arc);api.schedulePaint()}
   function up(event:PointerEvent){if(!drag)return;const active=drag.active;drag=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);if(active)api.goTo(Math.round(position));api.request()}
   function cancel(){if(drag?.active)api.goTo(Math.round(position));drag=null;api.request()}
   function leave(){hover=false;if(!drag)api.request()}
   function focus(event:FocusEvent){focused=(event.target as HTMLElement).matches(':focus-visible');api.request()}
   function blur(event:FocusEvent){if(!host.contains(event.relatedTarget as Node)){focused=false;api.request()}}
   let wheelCarry=0;
   function wheel(event:WheelEvent){if(!api.interactive()||(!event.shiftKey&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)))return;event.preventDefault();wheelCarry+=event.shiftKey?event.deltaY:event.deltaX;if(Math.abs(wheelCarry)>=30){api.goTo(Math.round(position)+(wheelCarry>0?1:-1));wheelCarry=0}}
   function visibility(){api.stop();api.request()}
   api.build();host.addEventListener('click',click);host.addEventListener('keydown',key);host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancel);host.addEventListener('pointerleave',leave);host.addEventListener('focusin',focus);host.addEventListener('focusout',blur);host.addEventListener('wheel',wheel,{passive:false});document.addEventListener('visibilitychange',visibility);api.paint();api.request();return api;
  },
 };
}
const engine=createOrbitEngine();
export const planOrbit=(s:OrbitSettings,position:number,mix:number)=>engine.plan(s,position,mix);
export const orbitIndex=(position:number,count:number)=>engine.index(position,count);
export const createOrbit=(host:HTMLElement,s:OrbitSettings,items:OrbitItem[],runtime:OrbitRuntime)=>engine.create(host,s,items,runtime);
export const orbitEngineCode=`const orbitEngine=((__name)=>(${createOrbitEngine.toString()}))((fn)=>fn)();\nconst planOrbit=(settings,position,mix)=>orbitEngine.plan(settings,position,mix);\nconst createOrbit=(host,settings,items,runtime)=>orbitEngine.create(host,settings,items,runtime);`;
