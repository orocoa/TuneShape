/** Original cover-fan geometry and vinyl interaction; no React Bits Pro source code. */
export type AlbumSettings={aspect:number;size:number;spread:number;stack:number;fan:number;turn:number;depth:number;visible:number;radius:number;rpm:number;interval:number;vinyl:boolean;autoplay:boolean;albumAccent:boolean;accentColor:string;backgroundColor:string};
export type AlbumItem={src:string;title:string;artist:string;alt:string;accent:string;sourceUrl?:string};
export type AlbumRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;repeat:boolean;language:'zh'|'en';onRunning?:(value:boolean)=>void};
export const defaultAlbum:Readonly<AlbumSettings>={aspect:1,size:.62,spread:.58,stack:.5,fan:6,turn:22,depth:.5,visible:3,radius:14,rpm:33,interval:4,vinyl:true,autoplay:true,albumAccent:true,accentColor:'#5227ff',backgroundColor:'#f1f1f1'};
export const albumRanges={aspect:[.6,1.6,.05],size:[.35,.85,.01],spread:[.15,1.2,.01],stack:[0,1,.01],fan:[0,20,.5],turn:[0,70,1],depth:[0,1,.01],visible:[1,5,1],radius:[0,32,1],rpm:[0,78,1],interval:[1.5,10,.5]} as const;
export function validateAlbum(value:unknown):AlbumSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw Error('唱片轨道设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultAlbum);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('唱片轨道设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(albumRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`唱片轨道 ${key} 超出范围。`);
 if(!Number.isInteger(v.visible))throw Error('两侧显示数量须为整数。');
 for(const key of ['vinyl','autoplay','albumAccent'])if(typeof v[key]!=='boolean')throw Error('唱片轨道开关无效。');
 for(const key of ['accentColor','backgroundColor'])if(typeof v[key]!=='string'||!/^#[\da-f]{6}$/i.test(v[key] as string))throw Error('唱片轨道颜色须为六位十六进制。');
 return {...v} as AlbumSettings;
}

function createAlbumEngine(){
 const css=`.album-rail{position:relative;width:640px;height:420px;overflow:hidden;isolation:isolate;touch-action:pan-y;user-select:none;color:var(--album-ink,#171717);font-family:Arial,Helvetica,sans-serif}
 .album-rail button{all:unset;box-sizing:border-box;font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}.album-rail button:disabled{cursor:default}.album-rail button:focus-visible{outline:3px solid var(--album-accent);outline-offset:5px}
 .album-stage{position:absolute;left:0;right:0;top:0;height:304px;overflow:hidden;perspective:1100px;perspective-origin:50% 40%;pointer-events:none}.album-rail .album-card{position:absolute;left:0;top:0;transform-origin:50% 50%;transform-style:preserve-3d;will-change:transform;outline-offset:3px;pointer-events:auto}
 .album-sleeve{position:absolute;inset:0;z-index:2;border-radius:inherit;overflow:hidden;backface-visibility:hidden;box-shadow:0 13px 32px -17px #0008,0 0 0 1px #00000016;transform:translateZ(1px)}
 .album-sleeve::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(100deg,#ffffff21,transparent 12%,transparent 92%,#0002);box-shadow:inset 1px 0 1px #ffffff65,inset -1px 0 2px #0002;pointer-events:none}
 .album-sleeve img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none}
 .album-record{position:absolute;border-radius:50%;z-index:1;background:repeating-radial-gradient(circle at center,transparent 0 2px,#ffffff12 2.4px 3px,transparent 3.4px 5px),conic-gradient(from 20deg,#0f1013,#292b31 17%,#101115 30%,#37383d 42%,#111216 55%,#313238 70%,#101115 90%,#0f1013);box-shadow:0 5px 16px #0005;pointer-events:none}
 .album-record::after{content:'';position:absolute;left:50%;top:50%;width:6px;height:6px;border:1px solid #0008;background:var(--album-bg,#f1f1f1);border-radius:50%;transform:translate(-50%,-50%)}
 .album-record img{position:absolute;left:33.5%;top:33.5%;width:33%;height:33%;object-fit:cover;border-radius:50%;box-shadow:0 0 0 1px #0005;pointer-events:none}
 .album-caption{position:absolute;left:40px;right:40px;top:310px;text-align:center;pointer-events:none}.album-title{margin:0;font-size:18px;line-height:25px;font-weight:600}.album-artist{margin:4px 0 0;font-size:12px;line-height:18px;opacity:.58}
 .album-controls{position:absolute;left:130px;right:130px;bottom:13px;height:38px;display:flex;align-items:center;gap:15px}
 .album-rail .album-arrow{display:grid;place-items:center;width:28px;height:32px;flex:none;font-family:Arial,sans-serif;font-size:18px;opacity:.65}.album-arrow:disabled{opacity:.2!important}
 .album-ruler{position:relative;flex:1;height:32px;overflow:hidden;cursor:ew-resize;touch-action:pan-y}.album-ruler:focus-visible{outline:2px solid var(--album-accent);outline-offset:2px;border-radius:3px}.album-tick{position:absolute;left:50%;top:12px;width:1px;height:9px;background:currentColor;opacity:.23;pointer-events:none}.album-tick[data-current=true]{height:14px;top:9px;opacity:.8;background:var(--album-accent)}
 .album-rail .album-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--album-accent);color:var(--album-play-ink,#fff);z-index:3;box-shadow:0 0 0 8px var(--album-bg);font-family:Arial,sans-serif;font-size:15px;line-height:1}
 .album-rail .album-play[hidden]{display:none}.album-rail .album-card[aria-hidden=true]{pointer-events:none}
 @media(prefers-reduced-motion:reduce){.album-rail .album-card{will-change:auto}}`;
 return {
  index(position:number,count:number){return ((Math.round(position)%count)+count)%count},
  delta(distance:number,count:number){return ((distance+count/2)%count+count)%count-count/2},
  // Fitted to the public demo's painted cover displacement and ruler at 60 Hz.
  // Exact integration preserves velocity during interruptions at any preview speed.
  spring(position:number,velocity:number,target:number,dt:number,durationMs:number,alpha:number,beta=0){
   const rate=650/durationMs,a=alpha*rate,b=beta*rate,distance=position-target,decay=Math.exp(-a*dt);
   if(!b){const impulse=velocity+a*distance;return {position:target+(distance+impulse*dt)*decay,velocity:(velocity-a*impulse*dt)*decay}}
   const impulse=(velocity+a*distance)/b,cos=Math.cos(b*dt),sin=Math.sin(b*dt);
   return {position:target+decay*(distance*cos+impulse*sin),velocity:decay*((-a*distance+b*impulse)*cos+(-a*impulse-b*distance)*sin)};
  },
  step(position:number,velocity:number,target:number,dt:number,durationMs:number){return this.spring(position,velocity,target,dt,durationMs,6.822,3.324)},
  recordStep(position:number,velocity:number,target:number,dt:number,durationMs:number,opening=true){return opening?this.spring(position,velocity,target,dt,durationMs,7.358,5.865):this.spring(position,velocity,target,dt,durationMs,14.306)},
  caption(position:number){const phase=position-Math.round(position),t=Math.max(0,Math.min(1,(Math.abs(phase)-.08)/.34));return {x:-phase*46,opacity:Math.min(.999,1-t*t*(3-2*t))}},
  plan(s:AlbumSettings,count:number,position:number,loop=true){
   const height=336*s.size,width=height*s.aspect;
   return Array.from({length:count},(_,i)=>{const distance=loop?this.delta(i-position,count):i-position,a=Math.abs(distance),space=width*s.spread*a/(1+s.stack*.3*Math.max(0,a-1));
    return {index:i,distance,x:320+Math.sign(distance)*space,y:Math.min(174,304-height/2)+a*s.fan*.55,z:-a*s.depth*70,width,height,scale:1/(1+a*s.depth*.12),rotate:s.fan*Math.max(-s.visible,Math.min(s.visible,distance))||0,turn:-s.turn*Math.tanh(distance*.8)||0,radius:Math.min(s.radius,width/2,height/2),opacity:Math.max(0,Math.min(1,s.visible+.5-a))*(1-.45*Math.min(1,a/2)),active:i===this.index(position,count)};
   });
  },
  create(host:HTMLElement,initial:AlbumSettings,items:AlbumItem[],initialRuntime:AlbumRuntime){
   const engine=this;let s=initial,runtime=initialRuntime,position=0,target=0,velocity=0,playing=-1,hoverIndex=-1,hover=false,focus=false,elapsed=0,raf=0,last=0,reported:boolean|null=null,disposed=false,suppressClick=false,wheelCarry=0;
   const slides=items.map(()=>0),slideVelocities=items.map(()=>0),slideGoals=items.map(()=>0),slideOpening=items.map(()=>true),angles=items.map(()=>0);
   // The fan makes room only for playback. A hover peek leaves the fan in place.
   // Keep this spring separate from the focused index so switching cannot jump it.
   let fanSlide=0,fanVelocity=0;
   let drag:null|{id:number;x:number;y:number;start:number;lastX:number;lastTime:number;velocity:number;active:boolean;scrub:boolean}=null;
   const style=document.createElement('style');style.textContent=css;
   const stage=document.createElement('div');stage.className='album-stage';stage.dataset.part='sleeves';
   const records:HTMLElement[]=[],labels:HTMLElement[]=[],sleeves:HTMLElement[]=[];
   const buttons=items.map((item,i)=>{const button=document.createElement('button');button.type='button';button.className='album-card';button.dataset.album=String(i);button.dataset.part='album'+i;const disc=document.createElement('div');disc.className='album-record';disc.dataset.part='record'+i;const label=document.createElement('img');label.src=item.src;label.alt='';label.draggable=false;disc.append(label);labels.push(label);records.push(disc);const sleeve=document.createElement('div');sleeve.className='album-sleeve';const art=document.createElement('img');art.src=item.src;art.alt=item.alt;art.draggable=false;sleeve.append(art);sleeves.push(sleeve);button.append(disc,sleeve);stage.append(button);return button});
   const caption=document.createElement('div');caption.className='album-caption';caption.setAttribute('aria-live','polite');caption.setAttribute('aria-atomic','true');const title=document.createElement('p'),artist=document.createElement('p');title.className='album-title';artist.className='album-artist';caption.append(title,artist);
   const controls=document.createElement('div');controls.className='album-controls';
   const previous=document.createElement('button'),next=document.createElement('button'),play=document.createElement('button');previous.type=next.type=play.type='button';previous.className=next.className='album-arrow';play.className='album-play';previous.dataset.albumAction='previous';next.dataset.albumAction='next';play.dataset.albumAction='play';previous.textContent='‹';next.textContent='›';
   const ruler=document.createElement('div');ruler.className='album-ruler';ruler.dataset.albumAction='scrub';ruler.setAttribute('role','slider');ruler.setAttribute('aria-valuemin','0');ruler.setAttribute('aria-valuemax',String(items.length-1));
   const ticks=items.map(()=>{const tick=document.createElement('i');tick.className='album-tick';ruler.append(tick);return tick});controls.append(previous,ruler,next,play);host.replaceChildren(style,stage,caption,controls);host.tabIndex=0;host.setAttribute('role','group');
   const api={
    interactive(){return runtime.enabled&&!runtime.paused},
    auto(){return s.autoplay&&!runtime.reduced&&playing<0&&(runtime.repeat||target<items.length-1)},
    moving(){return Math.abs(target-position)>.0001||Math.abs(velocity)>.001||Math.abs(fanSlide-(playing>=0?1:0))>.0001||Math.abs(fanVelocity)>.001||slides.some((slide,i)=>Math.abs(slide-this.slideTarget(i))>.0001||Math.abs(slideVelocities[i])>.001)},
    slideTarget(index:number){return s.vinyl?(playing===index?1:!runtime.reduced&&hoverIndex===index&&index===engine.index(position,items.length) ? .25 : 0):0},
    report(){const running=!runtime.reduced&&(this.auto()||this.moving()||playing>=0&&s.rpm>0);if(running!==reported){reported=running;runtime.onRunning?.(running)}},
    request(){this.report();if(!raf&&!disposed&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden&&(this.moving()||playing>=0&&s.rpm>0||this.auto()&&!hover&&!focus&&!drag)){last=performance.now();raf=requestAnimationFrame(tick)}},
    stop(){if(raf)cancelAnimationFrame(raf);raf=0},
    paint(){
     const current=engine.index(position,items.length),en=runtime.language==='en',accent=s.albumAccent?items[current].accent:s.accentColor;
     const light=(color:string)=>{const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));return r*.2126+g*.7152+b*.0722>145};
     host.style.background=s.backgroundColor;host.style.setProperty('--album-bg',s.backgroundColor);host.style.setProperty('--album-ink',light(s.backgroundColor)?'#171717':'#f7f6f2');host.style.setProperty('--album-accent',accent);host.style.setProperty('--album-play-ink',light(accent)?'#171717':'#fff');
     host.dataset.index=String(current);host.dataset.position=position.toFixed(6);host.dataset.playing=String(playing);host.dataset.recordAngle=angles[current].toFixed(5);host.dataset.recordSlide=slides[current].toFixed(5);host.dataset.fanSlide=fanSlide.toFixed(6);host.dataset.paused=String(runtime.paused);host.dataset.elapsed=elapsed.toFixed(5);
     host.setAttribute('aria-label',en?'Album rail. Drag or use arrow keys to browse; Enter pulls out the record.':'唱片轨道。拖动或使用方向键切换，Enter 抽出唱片，Escape 收回。');host.tabIndex=runtime.enabled?0:-1;
     engine.plan(s,items.length,position,runtime.repeat).forEach((p,i)=>{const button=buttons[i],visible=p.opacity>.01;button.style.cssText=`width:${p.width}px;height:${p.height}px;transform:translate3d(${p.x-336*s.size*.23*fanSlide}px,${p.y}px,${p.z}px) translate(-50%,-50%) rotateZ(${p.rotate}deg) rotateY(${p.turn}deg) scale(${p.scale});opacity:${hoverIndex===i&&visible?1:p.opacity*(1-.35*fanSlide*Math.min(1,Math.abs(p.distance)))};z-index:${1000-Math.round(Math.abs(p.distance)*100)};border-radius:${p.radius}px`;button.disabled=!api.interactive()||!visible;button.tabIndex=p.active&&runtime.enabled?0:-1;button.setAttribute('aria-hidden',String(!visible));button.setAttribute('aria-current',String(p.active));button.setAttribute('aria-label',(en?'Album: ':'唱片：')+items[i].title);button.setAttribute('aria-pressed',String(playing===i));
      const discSize=Math.min(p.width,p.height)*.94,record=records[i];record.hidden=!s.vinyl;record.style.cssText=`width:${discSize}px;height:${discSize}px;left:${(p.width-discSize)/2}px;top:${(p.height-discSize)/2}px;transform:translateX(${discSize*.48*slides[i]}px)`;sleeves[i].style.transform=`translateX(${-p.height*.06*slides[i]}px) translateZ(1px)`;
      // Concentric grooves and their lighting stay fixed; the printed label spins.
      labels[i].style.transform=`rotate(${angles[i]}deg)`;
     });
     if(title.textContent!==items[current].title){title.textContent=items[current].title;artist.textContent=items[current].artist}
     const captionPose=engine.caption(position);caption.style.transform=`translateX(${captionPose.x}px)`;caption.style.opacity=String(captionPose.opacity);
     previous.disabled=!this.interactive()||!runtime.repeat&&target<=0;next.disabled=!this.interactive()||!runtime.repeat&&target>=items.length-1;play.disabled=!this.interactive();play.hidden=!s.vinyl;
     previous.setAttribute('aria-label',en?'Previous album':'上一张唱片');next.setAttribute('aria-label',en?'Next album':'下一张唱片');play.textContent=playing>=0?'Ⅱ':'▶';play.setAttribute('aria-label',en?(playing>=0?'Return record':'Spin record'):(playing>=0?'收回唱片':'旋转唱片'));play.setAttribute('aria-pressed',String(playing>=0));
     ruler.tabIndex=runtime.enabled?0:-1;ruler.setAttribute('aria-label',en?'Album position':'唱片位置');ruler.setAttribute('aria-valuenow',String(current));ruler.setAttribute('aria-valuetext',`${current+1} / ${items.length} · ${items[current].title}`);ruler.setAttribute('aria-disabled',String(!this.interactive()));
     ticks.forEach((tick,i)=>{const relative=runtime.repeat?engine.delta(i-position,items.length):i-position;tick.style.transform=`translateX(${relative*18}px)`;tick.dataset.current=String(i===current)});
     this.report();
    },
    settle(){position=target;velocity=0;fanSlide=playing>=0?1:0;fanVelocity=0;slides.forEach((_,i)=>{slideGoals[i]=slides[i]=this.slideTarget(i);slideVelocities[i]=0})},
    retarget(index:number){if(!this.interactive())return;target=runtime.repeat?index:Math.max(0,Math.min(items.length-1,index));playing=-1;elapsed=0;if(runtime.reduced)this.settle();this.paint();this.request()},
    goTo(index:number){this.retarget(runtime.repeat?position+engine.delta(index-position,items.length):index)},
    navigate(delta:number){this.retarget(Math.round(target)+delta)},
    toggle(){if(!this.interactive()||!s.vinyl)return;const current=engine.index(position,items.length);playing=playing===current?-1:current;target=position+engine.delta(current-position,items.length);elapsed=0;if(runtime.reduced)this.settle();this.paint();this.request()},
    update(settings:AlbumSettings,nextRuntime:AlbumRuntime){s=settings;runtime=nextRuntime;if(!s.vinyl)playing=-1;if(!runtime.repeat){target=Math.max(0,Math.min(items.length-1,engine.index(target,items.length)));position=engine.index(position,items.length)+position-Math.round(position)}if(runtime.reduced)this.settle();this.stop();this.paint();this.request()},
    replay(){position=target=velocity=elapsed=fanSlide=fanVelocity=0;playing=-1;slides.fill(0);slideVelocities.fill(0);slideGoals.fill(0);slideOpening.fill(true);angles.fill(0);this.stop();this.paint();this.request()},
    destroy(){disposed=true;this.stop();for(const remove of listeners)remove();document.removeEventListener('visibilitychange',visibility);host.replaceChildren();runtime.onRunning?.(false)},
   };
   function tick(now:number){
    raf=0;if(disposed||!runtime.enabled||runtime.paused||runtime.reduced||document.hidden)return;const dt=Math.min(.05,Math.max(0,(now-last)/1000))*runtime.speed;last=now;
    if(!drag?.active){const result=engine.step(position,velocity,target,dt,runtime.durationMs);position=result.position;velocity=result.velocity;if(Math.abs(target-position)<.0001&&Math.abs(velocity)<.001){position=target;velocity=0}}
    slides.forEach((value,i)=>{const goal=api.slideTarget(i);if(goal!==slideGoals[i]){slideOpening[i]=goal>slideGoals[i];slideGoals[i]=goal}const result=engine.recordStep(value,slideVelocities[i],goal,dt,runtime.durationMs,slideOpening[i]);slides[i]=Math.abs(goal-result.position)<.0001&&Math.abs(result.velocity)<.001?goal:result.position;slideVelocities[i]=slides[i]===goal?0:result.velocity});
    const fanGoal=playing>=0?1:0,fan=engine.recordStep(fanSlide,fanVelocity,fanGoal,dt,runtime.durationMs,fanGoal>0);fanSlide=Math.abs(fanGoal-fan.position)<.0001&&Math.abs(fan.velocity)<.001?fanGoal:fan.position;fanVelocity=fanSlide===fanGoal?0:fan.velocity;
    if(playing>=0)angles[playing]=(angles[playing]-s.rpm*6*dt)%360;
    if(api.auto()&&!hover&&!focus&&!drag){elapsed+=dt;if(elapsed>=s.interval){elapsed%=s.interval;target=Math.round(target)+1;if(!runtime.repeat)target=Math.min(items.length-1,target)}}
    api.paint();api.request();
   }
   const listeners:(()=>void)[]=[];
   function listen<K extends keyof HTMLElementEventMap>(type:K,fn:(event:HTMLElementEventMap[K])=>void,options?:AddEventListenerOptions){host.addEventListener(type,fn as EventListener,options);listeners.push(()=>host.removeEventListener(type,fn as EventListener,options))}
   function point(event:PointerEvent){const rect=host.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width*640,y:(event.clientY-rect.top)/rect.height*420}}
   listen('click',event=>{event.stopPropagation();if(suppressClick&&event.detail>0){suppressClick=false;return}if(!api.interactive())return;const element=event.target as HTMLElement,action=element.closest<HTMLElement>('[data-album-action]')?.dataset.albumAction,card=element.closest<HTMLElement>('[data-album]');if(action==='previous')api.navigate(-1);else if(action==='next')api.navigate(1);else if(action==='play')api.toggle();else if(card){const index=Number(card.dataset.album);if(index===engine.index(position,items.length))api.toggle();else api.goTo(index)}});
   listen('keydown',event=>{if(!api.interactive())return;if(['ArrowLeft','ArrowRight','Home','End','Escape'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Escape'){playing=-1;if(runtime.reduced)api.settle();api.paint();api.request()}else if(event.key==='Home'||event.key==='End')api.goTo(event.key==='Home'?0:items.length-1);else api.navigate(event.key==='ArrowRight'?1:-1)}else if((event.key==='Enter'||event.key===' ')&&event.target===host){event.preventDefault();api.toggle()}});
   listen('pointerdown',event=>{if(!api.interactive()||event.button!==0)return;const action=(event.target as Element).closest<HTMLElement>('[data-album-action]')?.dataset.albumAction;if(action&&action!=='scrub')return;suppressClick=false;const p=point(event),scrub=action==='scrub';drag={id:event.pointerId,x:p.x,y:p.y,start:position,lastX:p.x,lastTime:event.timeStamp,velocity:0,active:false,scrub};if(scrub){target=position+Math.round((p.x-320)/18);if(!runtime.repeat)target=Math.max(0,Math.min(items.length-1,target))}});
   listen('pointermove',event=>{if(!api.interactive())return;if(event.pointerType!=='touch'){hover=true;hoverIndex=Number((event.target as Element).closest<HTMLElement>('[data-album]')?.dataset.album??-1)}if(!drag){api.request();return}const p=point(event),dx=p.x-drag.x,dy=p.y-drag.y;if(event.pointerType==='touch'&&!drag.active&&Math.abs(dy)>Math.abs(dx)+5){drag=null;api.request();return}if(!drag.active&&Math.abs(dx)<5)return;drag.active=true;suppressClick=true;playing=-1;if(!host.hasPointerCapture(event.pointerId))host.setPointerCapture(event.pointerId);event.preventDefault();const spacing=drag.scrub?18:336*s.size*s.aspect*Math.max(.25,s.spread);position=drag.start-dx/spacing;if(!runtime.repeat)position=Math.max(-.25,Math.min(items.length-.75,position));target=position;const dt=Math.max(.008,(event.timeStamp-drag.lastTime)/1000);drag.velocity=Math.max(-12,Math.min(12,-(p.x-drag.lastX)/spacing/dt));velocity=drag.velocity;drag.lastX=p.x;drag.lastTime=event.timeStamp;api.paint()});
   listen('pointerup',event=>{if(!drag)return;const gesture=drag;drag=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);if(gesture.active)api.goTo(Math.round(position+Math.max(-2,Math.min(2,gesture.velocity*.12))));else if(gesture.scrub)api.goTo(Math.round(target));api.request()});
   const cancel=()=>{if(drag?.active){target=Math.round(position);if(!runtime.repeat)target=Math.max(0,Math.min(items.length-1,target))}drag=null;hoverIndex=-1;api.paint();api.request()};listen('pointercancel',cancel);listen('lostpointercapture',()=>{if(drag)cancel()});
   listen('pointerenter',event=>{if(event.pointerType==='touch')return;hover=true;api.request()});listen('pointerleave',()=>{hover=false;if(!drag)hoverIndex=-1;api.request()});
   listen('focusin',event=>{focus=(event.target as HTMLElement).matches(':focus-visible');api.request()});listen('focusout',event=>{if(!host.contains(event.relatedTarget as Node)){focus=false;api.request()}});
   listen('wheel',event=>{if(!api.interactive()||!Number.isFinite(event.deltaX+event.deltaY))return;event.preventDefault();wheelCarry+=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(Math.abs(wheelCarry)>=30){api.navigate(Math.sign(wheelCarry));wheelCarry=0}}, {passive:false});
   const visibility=()=>{api.stop();api.request()};document.addEventListener('visibilitychange',visibility);api.paint();api.request();return api;
  },
 };
}
const albumEngine=createAlbumEngine();
export const planAlbum=(settings:AlbumSettings,count:number,position:number,loop=true)=>albumEngine.plan(settings,count,position,loop);
export const albumStep=(position:number,velocity:number,target:number,dt:number,durationMs:number)=>albumEngine.step(position,velocity,target,dt,durationMs);
export const albumRecordStep=(position:number,velocity:number,target:number,dt:number,durationMs:number,opening=true)=>albumEngine.recordStep(position,velocity,target,dt,durationMs,opening);
export const albumCaptionPose=(position:number)=>albumEngine.caption(position);
export const createAlbumRail=(host:HTMLElement,settings:AlbumSettings,items:AlbumItem[],runtime:AlbumRuntime)=>albumEngine.create(host,settings,items,runtime);
export const albumEngineCode=`const albumEngine=((__name)=>(${createAlbumEngine.toString()}))((fn)=>fn)();\nconst planAlbum=(settings,count,position,loop=true)=>albumEngine.plan(settings,count,position,loop);\nconst createAlbumRail=(host,settings,items,runtime)=>albumEngine.create(host,settings,items,runtime);`;
