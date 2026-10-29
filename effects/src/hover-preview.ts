/** Original inline-word image preview. Uses only native DOM and Web Animations. */
export type HoverPreviewSettings={imagePosition:'above'|'below'|'left'|'right';exitMs:number;maxRotation:number;maxOffset:number;imageSize:number;aspect:number;radius:number;shadow:boolean;targetPadding:number};
export type HoverPreviewItem={text:string;src:string;alt:string};
export type HoverPreviewRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;enterMs:number;onRunning?:(running:boolean)=>void};
export type HoverPreviewRect={x:number;y:number;width:number;height:number};
export const defaultHoverPreview:Readonly<HoverPreviewSettings>={imagePosition:'above',exitMs:150,maxRotation:12,maxOffset:15,imageSize:200,aspect:1,radius:12,shadow:true,targetPadding:4};
export const hoverPreviewRanges={exitMs:[50,800,10],maxRotation:[0,30,1],maxOffset:[0,40,1],imageSize:[100,400,5],aspect:[.5,2,.05],radius:[0,60,1],targetPadding:[0,20,1]} as const;
export function validateHoverPreview(value:unknown):HoverPreviewSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('悬停图片设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultHoverPreview);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('悬停图片设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(hoverPreviewRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`悬停图片 ${key} 超出范围。`);
 if(!['above','below','left','right'].includes(v.imagePosition as string)||typeof v.shadow!=='boolean')throw Error('悬停图片位置或阴影无效。');
 return structuredClone(v) as HoverPreviewSettings;
}

function createHoverPreviewEngine(){
 let instance=0;
 const css=`.hover-preview-fit{position:absolute;left:50%;top:50%;width:640px;height:440px;transform-origin:center;pointer-events:auto}
 .hover-preview{position:relative;width:640px;height:440px;pointer-events:auto;isolation:isolate;color:#171717;font-family:inherit}
 .hover-sentence{position:absolute;left:54px;right:54px;top:53%;transform:translateY(-50%);margin:0;font-size:32px;line-height:1.6;text-align:center;font-weight:450;letter-spacing:-1.3px;text-wrap:balance}
 .hover-preview[data-side=below] .hover-sentence{top:47%}.hover-preview[data-side=left] .hover-sentence{left:330px;right:40px;top:50%;bottom:auto;transform:translateY(-50%);font-size:30px}.hover-preview[data-side=right] .hover-sentence{left:40px;right:330px;top:50%;bottom:auto;transform:translateY(-50%);font-size:30px}
 .hover-preview .hover-target{all:unset;position:relative;display:inline;cursor:pointer;color:inherit;font:inherit;text-decoration:underline;text-decoration-color:#17171755;text-decoration-thickness:2px;text-underline-offset:6px;-webkit-tap-highlight-color:transparent}
 .hover-target:focus-visible{outline:2px solid #171717;outline-offset:5px;border-radius:2px}.hover-target[aria-expanded=true]{text-decoration-color:currentColor;z-index:5}.hover-target:disabled{cursor:default}
 .hover-image{position:absolute;top:0;left:0;overflow:hidden;pointer-events:none;opacity:0;visibility:hidden;z-index:3;will-change:transform,opacity;transform-origin:center}
 .hover-image img{width:100%;height:100%;display:block;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-drag:none}
 @media(prefers-reduced-motion:reduce){.hover-image{will-change:auto}}
 .hover-preview-controls details{border-top:1px solid var(--line,#e8e8e8);margin-top:20px;padding-top:14px}.hover-preview-controls summary{cursor:pointer;font-size:12px;color:var(--muted,#737373);margin-bottom:18px}`;
 return {
  css,
  plan(s:HoverPreviewSettings,r:HoverPreviewRect,p={x:0,y:0}){
   const px=Math.max(-1,Math.min(1,p.x)),py=Math.max(-1,Math.min(1,p.y)),rotate=px*s.maxRotation,angle=rotate*Math.PI/180,w=s.imageSize,h=w/s.aspect;
   const boundW=Math.abs(w*Math.cos(angle))+Math.abs(h*Math.sin(angle)),boundH=Math.abs(w*Math.sin(angle))+Math.abs(h*Math.cos(angle));
   const gap=12,available=s.imagePosition==='above'?r.y-gap-12:s.imagePosition==='below'?428-r.y-r.height-gap:s.imagePosition==='left'?r.x-gap-12:628-r.x-r.width-gap;
   const extent=s.imagePosition==='above'||s.imagePosition==='below'?boundH:boundW;
   const fit=Math.min(1,616/boundW,416/boundH,available>40?available/extent:1),width=w*fit,height=h*fit,bw=boundW*fit,bh=boundH*fit;
   let x=r.x+r.width/2+px*s.maxOffset,y=r.y+r.height/2+py*s.maxOffset;
   if(s.imagePosition==='above')y=r.y-gap-bh/2+Math.min(0,py)*s.maxOffset;
   if(s.imagePosition==='below')y=r.y+r.height+gap+bh/2+Math.max(0,py)*s.maxOffset;
   if(s.imagePosition==='left')x=r.x-gap-bw/2+Math.min(0,px)*s.maxOffset;
   if(s.imagePosition==='right')x=r.x+r.width+gap+bw/2+Math.max(0,px)*s.maxOffset;
   return {x:Math.max(12+bw/2,Math.min(628-bw/2,x)),y:Math.max(12+bh/2,Math.min(428-bh/2,y)),width,height,rotate,boundW:bw,boundH:bh};
  },
  create(host:HTMLElement,initial:HoverPreviewSettings,content:string,items:HoverPreviewItem[],initialRuntime:HoverPreviewRuntime){
   const engine=this,id='word-preview-'+(++instance);let s=initial,runtime=initialRuntime,active=-1,pointer={x:0,y:0},animation:Animation|null=null,pinned=false,hovered=-1,focused=-1,dismissed=false,destroyed=false,reported:boolean|null=null,raf=0,last=0,demo:null|{elapsed:number;closing:boolean}=null;
   const style=document.createElement('style');style.textContent=css;host.appendChild(style);
   const sentence=document.createElement('p');sentence.className='hover-sentence';host.appendChild(sentence);const buttons:HTMLButtonElement[]=[];
   for(const chunk of content.split(/(\{\d+\})/g)){const match=chunk.match(/^\{(\d+)\}$/);if(!match){sentence.appendChild(document.createTextNode(chunk));continue}const i=Number(match[1]),item=items[i];if(!item)continue;const button=document.createElement('button');button.type='button';button.className='hover-target';button.textContent=item.text;button.dataset.hoverTarget=String(i);button.setAttribute('aria-controls',id);button.setAttribute('aria-expanded','false');buttons.push(button);sentence.appendChild(button)}
   const frame=document.createElement('div');frame.className='hover-image';frame.id=id;frame.setAttribute('role','tooltip');frame.setAttribute('aria-hidden','true');const image=document.createElement('img');image.draggable=false;frame.appendChild(image);host.appendChild(frame);
   host.setAttribute('role','group');host.setAttribute('aria-label','Hover image preview');host.dataset.phase='closed';host.dataset.active='-1';
   function stopAnimation(){if(animation){try{animation.commitStyles()}catch{/* A detached element has no computed style. */}animation.onfinish=null;animation.cancel();animation=null}}
   function transform(p:ReturnType<typeof engine.plan>,scale=1){return `translate(${p.x-p.width/2}px,${p.y-p.height/2}px) rotate(${p.rotate}deg) scale(${scale})`}
   function rect(index:number){const button=buttons.find(b=>Number(b.dataset.hoverTarget)===index)!,b=button.getBoundingClientRect(),block=sentence.getBoundingClientRect(),root=host.getBoundingClientRect(),vertical=s.imagePosition==='above'||s.imagePosition==='below';return {x:((vertical?b.left:block.left)-root.left)/root.width*640,y:((vertical?block.top:b.top)-root.top)/root.height*440,width:(vertical?b.width:block.width)/root.width*640,height:(vertical?block.height:b.height)/root.height*440}}
   const api={
    report(){const running=!!(animation||demo);if(running!==reported){reported=running;runtime.onRunning?.(running)}},
    sync(){buttons.forEach(b=>b.disabled=!runtime.enabled||runtime.paused);if(animation){animation.updatePlaybackRate(runtime.speed);if(runtime.paused||!runtime.enabled||document.hidden)animation.pause();else animation.play()}this.stopClock();this.request();this.report();host.dataset.paused=String(runtime.paused)},
    request(){if(!raf&&demo&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden&&!destroyed){last=performance.now();raf=requestAnimationFrame(tick)}},
    stopClock(){if(raf)cancelAnimationFrame(raf);raf=0},
    render(enter:boolean,move=false){
     if(active<0)return;const p=engine.plan(s,rect(active),runtime.reduced?{x:0,y:0}:pointer),end=transform(p,enter?1:.94),wasHidden=frame.style.visibility==='hidden'||host.dataset.phase==='closed';stopAnimation();
     if(wasHidden){frame.style.transform=transform(p,.94);frame.style.opacity='0'}
     frame.style.width=p.width+'px';frame.style.height=p.height+'px';frame.style.borderRadius=s.radius+'px';frame.style.boxShadow=s.shadow?'0 18px 40px -12px #00000038':'none';frame.style.visibility='visible';frame.setAttribute('aria-hidden',String(!enter));host.dataset.active=String(active);host.dataset.phase=enter?'opening':'closing';host.dataset.targetX=p.x.toFixed(3);host.dataset.targetY=p.y.toFixed(3);
     const finish=()=>{frame.style.transform=end;frame.style.opacity=enter?'1':'0';frame.style.visibility=enter?'visible':'hidden';host.dataset.phase=enter?'open':'closed';if(!enter){active=-1;host.dataset.active='-1'}animation=null;api.report()};
     if(runtime.reduced){finish();return}
     const from=getComputedStyle(frame);animation=frame.animate([{transform:from.transform,opacity:from.opacity},{transform:end,opacity:enter?1:0}],{duration:move?Math.min(160,runtime.enterMs):enter?runtime.enterMs:s.exitMs,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
     const current=animation;current.onfinish=()=>{if(animation!==current)return;current.onfinish=null;finish();current.cancel()};this.sync();
    },
    open(index:number,point={x:0,y:0},isDemo=false){if(!runtime.enabled||runtime.paused||!items[index])return;if(!isDemo){demo=null;this.stopClock()}dismissed=false;const changed=active!==index;active=index;pointer=point;image.src=items[index].src;image.alt=items[index].alt;buttons.forEach(b=>{const on=Number(b.dataset.hoverTarget)===index;b.setAttribute('aria-expanded',String(on));if(on)b.setAttribute('aria-describedby',id);else b.removeAttribute('aria-describedby')});this.render(true,!changed&&host.dataset.phase!=='closed')},
    close(){buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.removeAttribute('aria-describedby')});pinned=false;if(active>=0)this.render(false);this.report()},
    update(settings:HoverPreviewSettings,nextRuntime:HoverPreviewRuntime){const changed=s!==settings||runtime.enterMs!==nextRuntime.enterMs;s=settings;runtime=nextRuntime;host.dataset.side=s.imagePosition;buttons.forEach(b=>{b.style.padding=s.targetPadding+'px';b.style.margin=-s.targetPadding+'px'});if(!runtime.enabled){demo=null;this.stopClock();stopAnimation();active=hovered=focused=-1;pinned=false;frame.style.opacity='0';frame.style.visibility='hidden';frame.setAttribute('aria-hidden','true');host.dataset.active='-1';host.dataset.phase='closed';buttons.forEach(b=>b.setAttribute('aria-expanded','false'))}else if(runtime.reduced){stopAnimation();if(demo){demo=null;active=-1}if(active>=0)this.render(host.dataset.phase!=='closing');else {frame.style.opacity='0';frame.style.visibility='hidden';host.dataset.phase='closed';frame.setAttribute('aria-hidden','true');buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.removeAttribute('aria-describedby')})}}else if(changed&&active>=0)this.render(host.dataset.phase!=='closing');this.sync()},
    replay(point={x:0,y:0}){demo=null;this.stopClock();stopAnimation();hovered=focused=-1;pinned=false;active=-1;frame.style.opacity='0';frame.style.visibility='hidden';host.dataset.phase='closed';reported=null;if(runtime.reduced){this.open(1,point);this.report();return}this.open(1,point,true);demo={elapsed:0,closing:false};this.request();this.report()},
    destroy(){destroyed=true;this.stopClock();stopAnimation();host.removeEventListener('pointerover',over);host.removeEventListener('pointermove',move);host.removeEventListener('pointerout',out);host.removeEventListener('focusin',focus);host.removeEventListener('focusout',blur);host.removeEventListener('click',click);host.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();runtime.onRunning?.(false)},
   };
   function tick(now:number){raf=0;if(!demo||!runtime.enabled||runtime.paused||document.hidden)return;demo.elapsed+=Math.min(.05,Math.max(0,(now-last)/1000))*1000*runtime.speed;last=now;if(!demo.closing&&demo.elapsed>=runtime.enterMs+800){demo.closing=true;api.close()}if(demo&&demo.elapsed>=runtime.enterMs+800+s.exitMs){demo=null;api.report()}api.request()}
   function target(event:Event){return (event.target as Element).closest<HTMLButtonElement>('.hover-target')}
   function over(event:PointerEvent){if(event.pointerType==='touch'||pinned)return;const button=target(event);if(!button||button.contains(event.relatedTarget as Node))return;hovered=Number(button.dataset.hoverTarget);api.open(hovered)}
   function move(event:PointerEvent){if(event.pointerType==='touch'||pinned)return;const button=target(event);if(!button)return;const r=button.getBoundingClientRect();hovered=Number(button.dataset.hoverTarget);api.open(hovered,{x:(event.clientX-r.left)/r.width*2-1,y:(event.clientY-r.top)/r.height*2-1})}
   function out(event:PointerEvent){const button=target(event);if(!button||button.contains(event.relatedTarget as Node))return;hovered=-1;if(!pinned&&focused<0){demo=null;api.stopClock();api.close()}}
   function focus(event:FocusEvent){const button=target(event);if(!button)return;focused=Number(button.dataset.hoverTarget);api.open(focused)}
   function blur(event:FocusEvent){const button=target(event);if(!button)return;focused=-1;dismissed=false;if(!host.contains(event.relatedTarget as Node)||!(event.relatedTarget as Element)?.closest?.('.hover-target')){pinned=false;if(hovered<0)api.close()}}
   function click(event:MouseEvent){const button=target(event);if(!button)return;event.stopPropagation();if(!runtime.enabled||runtime.paused)return;const index=Number(button.dataset.hoverTarget);if(pinned&&active===index){dismissed=true;api.close()}else{api.open(index);pinned=true}}
   function key(event:KeyboardEvent){const button=target(event);if(!button||!runtime.enabled||runtime.paused)return;const keys=['ArrowLeft','ArrowRight','Home','End','Escape'];if(!keys.includes(event.key))return;event.preventDefault();event.stopPropagation();if(event.key==='Escape'){dismissed=true;demo=null;api.stopClock();api.close();return}const i=buttons.indexOf(button),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus()}
   function outside(event:PointerEvent){if(!demo&&!host.contains(event.target as Node)){pinned=false;hovered=focused=-1;if(!dismissed){demo=null;api.stopClock();api.close()}}}
   function visibility(){api.sync()}
   host.addEventListener('pointerover',over);host.addEventListener('pointermove',move);host.addEventListener('pointerout',out);host.addEventListener('focusin',focus);host.addEventListener('focusout',blur);host.addEventListener('click',click);host.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);document.addEventListener('visibilitychange',visibility);api.update(s,runtime);return api;
  },
 };
}
const engine=createHoverPreviewEngine();
export const hoverPreviewCss=engine.css;
export const planHoverPreview=(s:HoverPreviewSettings,r:HoverPreviewRect,p={x:0,y:0})=>engine.plan(s,r,p);
export const createHoverPreview=(host:HTMLElement,s:HoverPreviewSettings,content:string,items:HoverPreviewItem[],runtime:HoverPreviewRuntime)=>engine.create(host,s,content,items,runtime);
export const hoverPreviewEngineCode=`const hoverEngine=((__name)=>(${createHoverPreviewEngine.toString()}))((fn)=>fn)();\nconst planHoverPreview=(settings,rect,pointer)=>hoverEngine.plan(settings,rect,pointer);\nconst createHoverPreview=(host,settings,content,items,runtime)=>hoverEngine.create(host,settings,content,items,runtime);`;
