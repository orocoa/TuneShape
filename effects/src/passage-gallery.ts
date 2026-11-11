import {reactbitsGallerySamples} from './reactbits-gallery-art';
import {galleryFocus,galleryFocusCode} from './gallery-focus';
import {type PassageGallerySettings} from './passage-gallery-settings';
export {defaultPassageGallery,validatePassageGallery} from './passage-gallery-settings';
export type {PassageGallerySettings} from './passage-gallery-settings';
export type PassageGalleryRuntime={enabled:boolean;interactive?:boolean;paused:boolean;reduced:boolean;speed:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onFocusChange?:(index:number)=>void};
type Sample={src:string;title:string};
/** Perspective-correct tiled projection, independently authored in Canvas 2D. */
function passageGalleryEngine(samples:Sample[],layout:typeof galleryFocus){
 type Vec={x:number;y:number};type Quad=[Vec,Vec,Vec,Vec];type Tile={key:string;quad:Quad;index:number;z:number};
 type Focus={index:number;key?:string;origin:Quad;quad:Quad;amount:number;target:number;blend:number;previous?:HTMLCanvasElement};
 function create(host:HTMLElement,initial:PassageGallerySettings,initialRuntime:PassageGalleryRuntime){
  let settings=initial,runtime=initialRuntime,dead=false,raf=0,last=0,distance=0,elapsed=0,velocity=0,reported=false,width=720,height=420,dpr=1,ui=1,compact=false,lookX=0,lookY=0,targetX=0,targetY=0,over:Tile|undefined,tiles:Tile[]=[],items:Sample[]=[],sprites:HTMLCanvasElement[]=[],fullSprites:HTMLCanvasElement[]=[],loadToken=0,drag:null|{id:number;x:number;y:number;startX:number;startY:number;type:string;moved:boolean;age:number}=null,focused:Focus|null=null,keyboardIndex=0;
  const style=document.createElement('style');style.textContent=`
.passage-gallery{position:relative;width:100%;height:100%;min-height:180px;overflow:hidden;touch-action:pan-y;outline:none;isolation:isolate}
.passage-gallery:focus-visible{outline:2px solid currentColor;outline-offset:-4px}.passage-gallery canvas{display:block;width:100%;height:100%}
.passage-gallery .pg-caption{position:absolute;inset:auto calc(10px * var(--pg-ui,1)) calc(10px * var(--pg-ui,1));display:grid;grid-template-columns:calc(40px * var(--pg-ui,1)) minmax(0,1fr) calc(40px * var(--pg-ui,1));align-items:center;gap:calc(6px * var(--pg-ui,1));pointer-events:none;color:var(--pg-ink);font:calc(14px * var(--pg-ui,1))/1.4 system-ui,sans-serif}
.passage-gallery .pg-caption>span{background:var(--pg-panel);padding:calc(6px * var(--pg-ui,1)) calc(10px * var(--pg-ui,1));min-width:0;overflow-wrap:anywhere;text-align:center;border-radius:calc(14px * var(--pg-ui,1));display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.passage-gallery .pg-caption>span[hidden]{visibility:hidden;display:block;padding:0}
.passage-gallery :is(.pg-caption button,.pg-close){pointer-events:auto;border:1px solid color-mix(in srgb,currentColor 28%,transparent);background:var(--pg-panel);color:inherit;border-radius:50%;width:calc(40px * var(--pg-ui,1));height:calc(40px * var(--pg-ui,1));padding:0;cursor:pointer;font:calc(23px * var(--pg-ui,1)) system-ui;display:grid;place-items:center}
.passage-gallery :is(.pg-caption button,.pg-close):hover{background:var(--pg-panel);border-color:currentColor}.passage-gallery :is(.pg-caption button,.pg-close):focus-visible{outline:2px solid currentColor;outline-offset:3px}.passage-gallery .pg-caption[hidden]{display:none}.passage-gallery .pg-close{position:absolute;top:calc(10px * var(--pg-ui,1));right:calc(10px * var(--pg-ui,1))}.passage-gallery .pg-close[hidden]{display:none}.passage-gallery[data-compact=true] .pg-caption>span{padding:calc(2px * var(--pg-ui,1));font-size:calc(12px * var(--pg-ui,1));-webkit-line-clamp:1;white-space:nowrap}.passage-gallery .pg-access{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}`;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!,trail=document.createElement('canvas'),trailCtx=trail.getContext('2d')!;canvas.setAttribute('aria-hidden','true');
  const caption=document.createElement('div');caption.className='pg-caption';caption.hidden=true;caption.setAttribute('role','group');
  const prev=document.createElement('button'),text=document.createElement('span'),next=document.createElement('button'),close=document.createElement('button'),image=document.createElement('img');prev.type=next.type=close.type='button';prev.textContent='‹';next.textContent='›';close.textContent='×';close.className='pg-close';close.hidden=true;image.className='pg-access';text.setAttribute('role','status');text.setAttribute('aria-live','polite');text.setAttribute('aria-atomic','true');caption.append(prev,text,next,image);host.append(style,canvas,caption,close);host.classList.add('passage-gallery');host.dataset.settings=JSON.stringify(settings);host.tabIndex=0;host.setAttribute('role','region');host.setAttribute('aria-roledescription','gallery');
  const listeners:Array<[EventTarget,string,EventListener,AddEventListenerOptions|undefined]>=[];function listen(node:EventTarget,type:string,fn:(e:any)=>void,o?:AddEventListenerOptions){node.addEventListener(type,fn,o);listeners.push([node,type,fn,o])}
  const mix=(a:number,b:number,t:number)=>a+(b-a)*t,random=(n:number)=>{const x=Math.sin(n*127.1+settings.seed*311.7)*43758.5453;return x-Math.floor(x)},clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const allowed=()=>(runtime.enabled||!!focused&&!!runtime.interactive)&&!runtime.paused&&!runtime.reduced&&!document.hidden&&runtime.speed>0;
  const interactive=()=>(runtime.enabled||runtime.interactive)&&settings.interactive&&!runtime.paused&&!document.hidden;
  const cruise=()=>runtime.enabled&&!settings.paused&&!focused&&settings.speed!==0;
  function report(value:boolean){host.dataset.running=String(value);if(reported!==value){reported=value;runtime.onRunning?.(value)}}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
  function project(x:number,y:number,z:number):Vec{
   const yaw=lookX*.085*settings.look,pitch=lookY*.06*settings.look,x1=x*Math.cos(yaw)-z*Math.sin(yaw),z1=x*Math.sin(yaw)+z*Math.cos(yaw),y1=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch),f=height/(2*Math.tan(settings.fov*Math.PI/360));
   return {x:width/2+x1*f/Math.max(.12,z2),y:height/2+y1*f/Math.max(.12,z2)};
  }
  function path(q:Quad,r=0){
   const p=ctx; p.beginPath();if(r<=0){p.moveTo(q[0].x,q[0].y);for(let i=1;i<4;i++)p.lineTo(q[i].x,q[i].y)}else{for(let i=0;i<4;i++){const a=q[(i+3)%4],b=q[i],c=q[(i+1)%4],before={x:mix(b.x,a.x,r*.48),y:mix(b.y,a.y,r*.48)},after={x:mix(b.x,c.x,r*.48),y:mix(b.y,c.y,r*.48)};if(!i)p.moveTo(before.x,before.y);else p.lineTo(before.x,before.y);p.quadraticCurveTo(b.x,b.y,after.x,after.y)}}p.closePath();
  }
  function triangle(img:CanvasImageSource,a:Vec,b:Vec,c:Vec,ta:Vec,tb:Vec,tc:Vec){
   const determinant=ta.x*(tb.y-tc.y)+tb.x*(tc.y-ta.y)+tc.x*(ta.y-tb.y);if(Math.abs(determinant)<.00001)return;
   const solve=(v0:number,v1:number,v2:number)=>[(v0*(tb.y-tc.y)+v1*(tc.y-ta.y)+v2*(ta.y-tb.y))/determinant,(v0*(tc.x-tb.x)+v1*(ta.x-tc.x)+v2*(tb.x-ta.x))/determinant,(v0*(tb.x*tc.y-tc.x*tb.y)+v1*(tc.x*ta.y-ta.x*tc.y)+v2*(ta.x*tb.y-tb.x*ta.y))/determinant];
   const x=solve(a.x,b.x,c.x),y=solve(a.y,b.y,c.y);ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();ctx.transform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(img,0,0);ctx.restore();
  }
  // Project each subdivision in 3D: affine mapping of a whole wall is visibly wrong.
  function texture(img:HTMLCanvasElement,q:Quad,world?:Array<[number,number,number]>,crop?:{x:number;y:number;w:number;h:number}){
   const edge=Math.max(...q.map((p,i)=>Math.hypot(p.x-q[(i+1)%4].x,p.y-q[(i+1)%4].y))),n=edge>160?4:edge>60?2:1,uv=crop??{x:0,y:0,w:img.width,h:img.height};
   const at=(u:number,v:number)=>{if(world){const p=world[0].map((a,k)=>a+(world[1][k]-a)*u+(world[3][k]-a)*v);return project(p[0],p[1],p[2])}return {x:mix(mix(q[0].x,q[1].x,u),mix(q[3].x,q[2].x,u),v),y:mix(mix(q[0].y,q[1].y,u),mix(q[3].y,q[2].y,u),v)}};
   for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,U=(x+1)/n,V=(y+1)/n,a=at(u,v),b=at(U,v),c=at(U,V),d=at(u,V),ta={x:uv.x+u*uv.w,y:uv.y+v*uv.h},tb={x:uv.x+U*uv.w,y:uv.y+v*uv.h},tc={x:uv.x+U*uv.w,y:uv.y+V*uv.h},td={x:uv.x+u*uv.w,y:uv.y+V*uv.h};triangle(img,a,b,c,ta,tb,tc);triangle(img,a,c,d,ta,tc,td)}
  }
  function contains(q:Quad,p:Vec){let inside=false;for(let i=0,j=3;i<4;j=i++){const a=q[i],b=q[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside}return inside}
  function frameQuad(index=focused?.index??0):Quad{
   const sprite=fullSprites[index],aspect=sprite?sprite.width/sprite.height:1;
   const f=layout.frame(width,height,aspect,caption.hidden?0:caption.offsetHeight,ui,compact);
   return [{x:f.x,y:f.y},{x:f.x+f.w,y:f.y},{x:f.x+f.w,y:f.y+f.h},{x:f.x,y:f.y+f.h}];
  }
  const quadError=(a:Quad,b:Quad)=>Math.max(...a.map((p,i)=>Math.hypot(p.x-b[i].x,p.y-b[i].y)));
  const destination=()=>focused!.target?frameQuad():focused!.origin;
  function syncCaption(){
   const en=runtime.language==='en';host.setAttribute('aria-label',en?'Photo tunnel. Drag or scroll to travel. Enter opens a photo. While open, arrows or a horizontal swipe change images; Escape closes.':'穿行图库。拖拽或滚轮穿行，Enter 打开图片。近看时用方向键或横向轻扫切换图片，Escape 关闭。');
   for(const [button,zh,english] of [[prev,'上一张图片','Previous image'],[next,'下一张图片','Next image'],[close,'关闭图片','Close image']] as const){button.setAttribute('aria-label',en?english:zh);button.title=en?english:zh}
   prev.disabled=next.disabled=!interactive()||items.length<2;close.disabled=!interactive();caption.setAttribute('aria-label',en?'Image navigation':'图片切换');caption.hidden=close.hidden=!focused||focused.target===0;text.hidden=!settings.captions;
   if(focused){const item=items[focused.index],value=`${focused.index+1} / ${items.length} · ${item?.title||(en?'Untitled':'未命名')}`;const visible=compact?`${focused.index+1}/${items.length}`:value;if(text.textContent!==visible)text.textContent=visible;text.setAttribute('aria-label',value);text.title=value;image.alt=item?.title??'';if(image.getAttribute('src')!==item?.src)image.src=item?.src??''}
  }
  function crop(sprite:HTMLCanvasElement,amount:number){const side=Math.min(sprite.width,sprite.height);return {x:(sprite.width-side)/2*(1-amount),y:(sprite.height-side)/2*(1-amount),w:mix(side,sprite.width,amount),h:mix(side,sprite.height,amount)}}
  // Snapshot only the selected image blend, so rapid next/previous retargets never flash an older image.
  function snapshotPhoto(f:Focus){
   const c=document.createElement('canvas');c.width=512;c.height=Math.max(1,Math.round(512*Math.hypot(f.quad[3].x-f.quad[0].x,f.quad[3].y-f.quad[0].y)/Math.max(1,Math.hypot(f.quad[1].x-f.quad[0].x,f.quad[1].y-f.quad[0].y))));
   c.height=Math.min(1024,c.height);const p=c.getContext('2d')!;if(f.previous)p.drawImage(f.previous,0,0,c.width,c.height);const sprite=fullSprites[f.index];if(sprite){const r=crop(sprite,f.amount);p.globalAlpha=f.previous?f.blend:1;p.drawImage(sprite,r.x,r.y,r.w,r.h,0,0,c.width,c.height)}return c;
  }
  function paint(){
   const rect=host.getBoundingClientRect();ui=Math.max(1,Math.min(10,width/(rect.width||width)));compact=rect.width<260;host.dataset.compact=String(compact);host.style.setProperty('--pg-ui',String(ui));syncCaption();if(runtime.reduced&&focused?.target===1)focused.quad=frameQuad();
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,width,height);const transparent=settings.backgroundColor==='transparent',bg=transparent?'#fafafa':settings.backgroundColor,dark=parseInt(bg.slice(1,3),16)*.2126+parseInt(bg.slice(3,5),16)*.7152+parseInt(bg.slice(5,7),16)*.0722<128;
   if(!transparent){ctx.fillStyle=bg;ctx.fillRect(0,0,width,height)}host.style.setProperty('--pg-ink',dark?'#f4f4f4':'#171717');host.style.setProperty('--pg-panel',dark?'#171717dd':'#fafafadd');
   const halfW=settings.lanes/2,rows=Math.max(2,Math.round(settings.lanes*height/width)),halfH=rows/2,base=Math.floor(distance),fraction=distance-base,deep=22,g=settings.gap/2;tiles=[];
   for(let layer=deep;layer>=0;layer--){const z0=.7+layer-fraction,z1=z0+1;if(z0<.12)continue;const absolute=base+layer,fade=Math.exp(-Math.pow(z0/(7/Math.max(.3,settings.fog)),1.65));
    for(let wall=0;wall<4;wall++){const count=wall<2?settings.lanes:rows;
     for(let cell=0;cell<count;cell++){
      const a=(wall<2?-halfW:-halfH)+cell,b=a+1;
      const quad3=(inset:number):Array<[number,number,number]>=>{const A=a+inset,B=b-inset,Z=z0+inset,T=z1-inset;return wall===0?[[A,-halfH,Z],[B,-halfH,Z],[B,-halfH,T],[A,-halfH,T]]:wall===1?[[A,halfH,T],[B,halfH,T],[B,halfH,Z],[A,halfH,Z]]:wall===2?[[-halfW,A,T],[-halfW,A,Z],[-halfW,B,Z],[-halfW,B,T]]:[[halfW,A,Z],[halfW,A,T],[halfW,B,T],[halfW,B,Z]]};
      const full=quad3(0).map(p=>project(...p)) as Quad,minX=Math.min(...full.map(p=>p.x)),maxX=Math.max(...full.map(p=>p.x)),minY=Math.min(...full.map(p=>p.y)),maxY=Math.max(...full.map(p=>p.y));if(maxX<0||minX>width||maxY<0||minY>height)continue;
      const id=absolute*197+wall*53+cell*11,r=random(id+17),key=`${absolute}:${wall}:${cell}`,world=quad3(g),index=Math.floor(random(id+79)*items.length),photo=r<settings.photoFill,accent=!photo&&r<Math.min(1,settings.photoFill+settings.accentFill);
      if(photo&&over?.key===key&&settings.hover>0)for(const p of world)p[wall<2?1:0]+=(wall===0||wall===2?1:-1)*settings.hover*.055;
      const q=world.map(p=>project(...p)) as Quad;
      if(settings.lineOpacity>0){path(full);ctx.strokeStyle=dark?'#ffffff':'#000000';ctx.globalAlpha=settings.lineOpacity*fade;ctx.lineWidth=.6;ctx.stroke()}
      if(photo||accent){ctx.save();path(q,settings.radius);ctx.clip();ctx.globalAlpha=fade;
       if(photo&&sprites[index])texture(sprites[index],q,world);else{const grad=ctx.createLinearGradient(q[0].x,q[0].y,q[2].x+.01,q[2].y+.01);grad.addColorStop(0,accent?settings.colorA:dark?'#777777':'#dddddd');grad.addColorStop(1,accent?settings.colorB:dark?'#444444':'#aaaaaa');ctx.fillStyle=grad;ctx.fillRect(minX,minY,maxX-minX,maxY-minY)}
       if(photo){const tile={key,quad:q,index,z:z0};tiles.push(tile);if(over?.key===key&&settings.hover>0){ctx.globalAlpha=Math.min(.25,settings.hover*.13);ctx.fillStyle='#ffffff';ctx.fillRect(minX,minY,maxX-minX,maxY-minY)}}ctx.restore();
      }
     }
    }
   }
   ctx.globalAlpha=1;
   const boost=drag&&!drag.moved&&drag.age>.2?settings.boost:1;if(settings.blur>0&&boost>1&&allowed()&&!focused){ctx.save();ctx.globalAlpha=Math.min(.4,settings.blur*.12);ctx.drawImage(trail,0,0,trail.width,trail.height,-width*.008,-height*.008,width*1.016,height*1.016);ctx.restore()}
   trailCtx.clearRect(0,0,trail.width,trail.height);trailCtx.drawImage(canvas,0,0);
   if(focused){
    const f=focused,anchor=tiles.find(t=>t.key===f.key);if(anchor)f.origin=anchor.quad;
    ctx.save();ctx.globalAlpha=f.amount*.78;ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;path(f.quad,settings.radius);ctx.clip();
    if(f.previous)texture(f.previous,f.quad);const sprite=fullSprites[f.index];if(sprite){ctx.globalAlpha=f.previous?f.blend:1;texture(sprite,f.quad,undefined,crop(sprite,f.amount))}ctx.restore();
   }
   host.dataset.ready='true';host.dataset.distance=distance.toFixed(5);host.dataset.elapsed=String(Math.round(elapsed*1000));host.dataset.focused=String(focused?.index??-1);host.dataset.focusProgress=String(focused?.amount??0);host.dataset.tiles=String(tiles.length);host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);host.dataset.enabled=String(runtime.enabled);syncCaption();
  }
  function load(){host.removeAttribute('data-image-error');const token=++loadToken;items=settings.items.length?settings.items:samples;sprites=[];fullSprites=[];for(const [i,item] of items.entries()){const image=new Image();image.onload=()=>{if(dead||token!==loadToken)return;const sprite=document.createElement('canvas');sprite.width=sprite.height=256;const g=sprite.getContext('2d')!,size=Math.min(image.naturalWidth,image.naturalHeight);g.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,256,256);sprites[i]=sprite;const full=document.createElement('canvas'),fit=Math.min(1,512/Math.max(image.naturalWidth,image.naturalHeight));full.width=Math.round(image.naturalWidth*fit);full.height=Math.round(image.naturalHeight*fit);full.getContext('2d')!.drawImage(image,0,0,full.width,full.height);fullSprites[i]=full;paint()};image.onerror=()=>{if(!dead&&token===loadToken){host.dataset.imageError='true';paint()}};image.src=item.src}}
  function resize(){width=host.clientWidth||720;height=host.clientHeight||420;dpr=Math.min(2,devicePixelRatio||1);canvas.width=trail.width=Math.round(width*dpr);canvas.height=trail.height=Math.round(height*dpr);paint()}
  function work(){return cruise()||Math.abs(velocity)>.001||!!drag||!!focused&&(Math.abs(focused.amount-focused.target)>.001||focused.blend<1||quadError(focused.quad,destination())>.05)||!focused&&Math.abs(lookX-targetX)+Math.abs(lookY-targetY)>.001}
  function wake(){if(dead)return;host.dataset.runtimeSpeed=String(runtime.speed);host.dataset.allowed=String(allowed());host.dataset.pending=String(!!work());report(allowed()&&!!work());if(!allowed()||!work()){stop();return}if(!raf){if(!last)last=performance.now();raf=requestAnimationFrame(frame)}}
  function frame(now:number){raf=0;if(!allowed()){wake();return}const dt=Math.min(.06,Math.max(0,(now-last)/1000))*runtime.speed;last=now;elapsed+=dt;if(drag)drag.age+=dt;
   if(cruise()||drag&&!drag.moved&&drag.age>.2&&!focused)distance+=settings.speed*dt*(drag&&!drag.moved&&drag.age>.2?settings.boost:1);distance+=velocity*dt;velocity*=Math.exp(-dt*5);if(!focused){lookX=mix(lookX,targetX,1-Math.exp(-dt*8));lookY=mix(lookY,targetY,1-Math.exp(-dt*8))}
   if(focused){const f=focused,k=1-Math.exp(-dt*11),end=destination();f.amount=mix(f.amount,f.target,k);f.blend=mix(f.blend,1,1-Math.exp(-dt*15));f.quad=f.quad.map((p,i)=>({x:mix(p.x,end[i].x,k),y:mix(p.y,end[i].y,k)})) as Quad;
    if(f.blend>.999){f.blend=1;f.previous=undefined}if(Math.abs(f.amount-f.target)<.001&&quadError(f.quad,end)<.05){f.amount=f.target;f.quad=end;if(f.target===0)clearFocus()}
   }paint();wake();
  }
  function point(e:PointerEvent|WheelEvent){const r=host.getBoundingClientRect();return {x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height}}
  function clearFocus(){if(!focused)return;focused=null;runtime.onFocusChange?.(-1);if((caption.contains(document.activeElement)||document.activeElement===close))host.focus({preventScroll:true})}
  function open(index:number,from?:Quad,key?:string){
   if(dead||!Number.isFinite(index)||!items.length||!settings.focusOnClick)return;const i=layout.wrap(index,items.length);
   if(focused?.index===i&&focused.target===1)return;
   const anchor=tiles.filter(t=>t.index===i).sort((a,b)=>Math.abs(a.z-3)-Math.abs(b.z-3))[0],origin=from??anchor?.quad??frameQuad(i),previous=focused?snapshotPhoto(focused):undefined;
   focused={index:i,key:key??anchor?.key,origin,quad:focused?.quad??origin,amount:focused?.amount??0,target:1,blend:previous?0:1,previous};keyboardIndex=i;velocity=0;over=undefined;runtime.onFocusChange?.(i);syncCaption();
   if(runtime.reduced){focused.amount=1;focused.quad=frameQuad(i);focused.blend=1;focused.previous=undefined}paint();wake();
  }
  function closePhoto(){if(!focused||focused.target===0)return;if((caption.contains(document.activeElement)||document.activeElement===close))host.focus({preventScroll:true});focused.target=0;if(runtime.reduced||focused.amount<.001&&quadError(focused.quad,focused.origin)<.05)clearFocus();paint();wake()}
  function travel(cells:number){if(!interactive()||!Number.isFinite(cells))return;closePhoto();if(runtime.reduced){distance+=cells;paint()}else{velocity+=cells*4;wake()}}
  function settle(){stop();distance=elapsed=velocity=0;lookX=lookY=targetX=targetY=0;drag=null;clearFocus();over=undefined;paint();report(false)}
  listen(host,'pointermove',e=>{if(!interactive()||e.target!==canvas&&!drag)return;const p=point(e);if(!focused){targetX=clamp(p.x/width*2-1,-1,1);targetY=clamp(p.y/height*2-1,-1,1)}over=[...tiles].reverse().find(t=>contains(t.quad,p));host.style.cursor=focused||over&&settings.focusOnClick?'pointer':drag?'grabbing':'grab';
   if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y,totalX=e.clientX-drag.startX,totalY=e.clientY-drag.startY;if(Math.hypot(totalX,totalY)>6)drag.moved=true;
    if(drag.type==='touch'&&focused){if(Math.abs(totalX)>Math.abs(totalY)&&drag.moved)host.setPointerCapture?.(e.pointerId)}
    else if(drag.moved&&(drag.type!=='touch'||Math.abs(totalX)>Math.abs(totalY))){host.setPointerCapture?.(e.pointerId);if(focused)closePhoto();const delta=(drag.type==='touch'?-dx:dy)*.014;distance+=delta;velocity=runtime.reduced?0:delta*8}drag.x=e.clientX;drag.y=e.clientY}
   if(runtime.reduced){lookX=targetX;lookY=targetY}paint();wake();
  });
  listen(host,'pointerdown',e=>{if(!interactive()||e.target!==canvas||e.button!==0)return;host.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,type:e.pointerType,moved:false,age:0};wake()});
  listen(host,'pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(host.hasPointerCapture?.(e.pointerId))host.releasePointerCapture(e.pointerId);
   const dx=e.clientX-d.startX,dy=e.clientY-d.startY;if(interactive()&&d.type==='touch'&&focused&&Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy)*1.2)open(focused.index+(dx<0?1:-1));
   else if(!d.moved&&d.age<.24&&interactive()){const p=point(e),hit=[...tiles].reverse().find(t=>contains(t.quad,p));if(focused)closePhoto();else if(hit)open(hit.index,hit.quad,hit.key);else if(focused)closePhoto()}paint();wake()});
  listen(host,'pointercancel',()=>{drag=null;wake()});listen(host,'pointerleave',()=>{over=undefined;if(!focused)targetX=targetY=0;if(drag&&!host.hasPointerCapture?.(drag.id))drag=null;if(runtime.reduced&&!focused)lookX=lookY=0;paint();wake()});
  listen(host,'wheel',e=>{if(!interactive()||!settings.wheel)return;e.preventDefault();travel(clamp((Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX)*(e.deltaMode===1?16:e.deltaMode===2?height:1)*.007,-4,4))},{passive:false});
  listen(host,'keydown',e=>{if(!interactive())return;const direct=e.target===host;if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key)&&(direct||focused)){e.preventDefault();e.stopPropagation();const delta=['ArrowUp','ArrowRight'].includes(e.key)?1:-1;if(focused)open(focused.index+delta);else{keyboardIndex=layout.wrap(keyboardIndex+delta,items.length);travel(delta)}}
   else if(direct&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(focused)closePhoto();else{const visible=tiles.filter(t=>t.z>1&&t.z<5),tile=visible[keyboardIndex%Math.max(1,visible.length)];open(tile?.index??keyboardIndex,tile?.quad,tile?.key)}}
   else if(e.key==='Escape'&&focused){e.preventDefault();e.stopPropagation();closePhoto();host.focus({preventScroll:true})}else if(direct&&e.key==='Home'){e.preventDefault();settle();wake()}});
  listen(prev,'click',()=>{if(focused&&interactive())open(focused.index-1)});listen(next,'click',()=>{if(focused&&interactive())open(focused.index+1)});listen(close,'click',()=>{if(interactive()){closePhoto();host.focus({preventScroll:true})}});
  listen(document,'visibilitychange',()=>{if(document.hidden){drag=null;velocity=0}wake()});const observer=new ResizeObserver(()=>{resize();wake()});observer.observe(host);load();resize();wake();
  return {demonstrate(){if(!runtime.reduced){if(!cruise())velocity=3;wake()}},settle,travel,close:closePhoto,open,
   update(s:PassageGallerySettings,r:PassageGalleryRuntime){const change=JSON.stringify(s)!==JSON.stringify(settings),imageChange=JSON.stringify(s.items)!==JSON.stringify(settings.items);settings=s;runtime=r;if(imageChange){clearFocus();load()}if(change){host.dataset.settings=JSON.stringify(s);over=undefined}if(!r.enabled)drag=null;if(r.reduced){drag=null;velocity=0;lookX=targetX;lookY=targetY;if(focused){focused.amount=focused.target;focused.quad=destination();focused.blend=1;focused.previous=undefined;if(focused.target===0)clearFocus()}}if(!s.focusOnClick)clearFocus();paint();wake()},
   getState(){return {distance,elapsed,velocity,running:reported,focused:focused?.index??-1,focusProgress:focused?.amount??0,images:sprites.filter(Boolean).length,tiles:tiles.length,focusQuad:focused?.quad,focusOrigin:focused?.origin,focusKey:focused?.key,focusBlend:focused?.blend}},
   destroy(){if(dead)return;dead=true;++loadToken;stop();observer.disconnect();listeners.forEach(([n,t,f,o])=>n.removeEventListener(t,f,o));report(false);host.replaceChildren();host.classList.remove('passage-gallery');host.removeAttribute('tabindex');host.removeAttribute('role')},
  };
 }
 return {create};
}
const samples:Sample[]=reactbitsGallerySamples.map(({src,title})=>({src,title}));
export const createPassageGallery=passageGalleryEngine(samples,galleryFocus).create;
export const passageGalleryEngineCode=`/* TuneShape independent Passage Gallery, MIT. Original TuneShape sample art, MIT. No React Bits Pro code or media. */\n${galleryFocusCode}\nconst passageGalleryEngine=((__name)=>(${passageGalleryEngine.toString()}))((fn)=>fn)(${JSON.stringify(samples)},galleryFocus);\nconst createPassageGallery=passageGalleryEngine.create;`;
