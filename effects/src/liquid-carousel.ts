import {nativeEffectTools,nativeToolsCode} from './native-effect-tools';
import type {NativeEffectRuntime} from './native-effect-tools';
import {liquidCarouselImages} from './liquid-carousel-art';

export type LiquidImage={src:string;title:string};
export type LiquidCarouselSettings={items:LiquidImage[];selectedIndex:number;height:number;aspect:number;radius:number;border:number;buttonSize:number;distortion:number;edge:number;autoplay:boolean;interval:number;disabled:boolean};
export const defaultLiquidCarousel:LiquidCarouselSettings={items:structuredClone(liquidCarouselImages),selectedIndex:0,height:202,aspect:350/463,radius:14.2,border:4.5,buttonSize:19.2,distortion:.01,edge:.02,autoplay:false,interval:1800,disabled:false};
export const liquidCarouselRanges={height:[150,280],aspect:[.6,1.5],radius:[0,40],border:[0,12],buttonSize:[16,36],distortion:[0,.6],edge:[0,.25],interval:[800,6000]} as const;
export function validateLiquidCarousel(value:unknown):LiquidCarouselSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw Error('液态轮播设置须为普通对象。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultLiquidCarousel);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('液态轮播设置字段缺失或含未知字段。');
 for(const [key,[min,max]] of Object.entries(liquidCarouselRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error('液态轮播参数超出范围。');
 if(typeof v.autoplay!=='boolean'||typeof v.disabled!=='boolean')throw Error('轮播状态无效。');
 const items=v.items;
 if(!Array.isArray(items)||Object.getPrototypeOf(items)!==Array.prototype||Reflect.ownKeys(items).length!==items.length+1||items.length>8||items.length<2)throw Error('图片数量须为 2–8 张。');
 for(let i=0;i<items.length;i++){
  if(!Object.hasOwn(Object.getOwnPropertyDescriptor(items,String(i))??{},'value'))throw Error('图片列表须连续。');
  const item=items[i];if(!item||typeof item!=='object'||Object.getPrototypeOf(item)!==Object.prototype||Reflect.ownKeys(item).length!==2||['src','title'].some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(item,key)??{},'value')))throw Error('图片只可包含地址和名称。');
  if(typeof item.src!=='string'||item.src.length>180000||!liquidCarouselImages.some(entry=>entry.src===item.src)&&!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(item.src)||typeof item.title!=='string'||!item.title.trim()||Array.from(item.title).length>80||/[\u0000-\u001f\u007f<>]/u.test(item.title))throw Error('图片须为站内默认几何图或本地 PNG、JPEG、WebP，名称为 1–80 个可见字符。');
 }
 if(!Number.isInteger(v.selectedIndex)||Number(v.selectedIndex)<0||Number(v.selectedIndex)>=(items.length||4))throw Error('默认图片索引无效。');
 return structuredClone(v) as LiquidCarouselSettings;
}
export function liquidIndex(index:number,count:number){return ((index%count)+count)%count}
export function liquidRadius(progress:number,aspect=350/463){const p=Math.max(0,Math.min(1,progress));return (-.05+.84*p+.235*(1-Math.exp(-196*p*p)))*Math.hypot(.889*aspect,.5)/Math.hypot(.889*350/463,.5)}
export type LiquidRuntime=NativeEffectRuntime&{gallery?:boolean;managed?:boolean;interactive?:boolean;interruption?:'retarget'|'restart'};

function liquidCarouselEngine(tools:ReturnType<typeof nativeEffectTools>,wrap:typeof liquidIndex,radiusAt:typeof liquidRadius){
 const css=`.liquid-carousel{position:relative;width:320px;height:300px;isolation:isolate;user-select:none;-webkit-user-select:none;color:#17191a}
 .liquid-carousel *{box-sizing:border-box}.liquid-carousel .lc-frame{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;overflow:hidden;box-shadow:0 3px 10px #00000003;outline:none;touch-action:pan-y}
 .liquid-carousel .lc-frame:focus-visible{outline:2px solid #555;outline-offset:4px}.liquid-carousel .lc-canvas{display:block;width:100%;height:100%;pointer-events:none}
 .liquid-carousel .lc-halo{position:absolute;left:50%;top:50%;transform:translate(-20%,-46%) scale(.93);width:166px;height:200px;background-position:center;background-size:cover;filter:blur(20px);opacity:.2;pointer-events:none;z-index:-1}
 .liquid-carousel .lc-button{position:absolute;top:50%;transform:translateY(-50%);border:0;border-radius:50%;padding:0;display:grid;place-items:center;background:#fff;color:#141919;cursor:pointer;box-shadow:none;touch-action:manipulation;outline:none}
 .liquid-carousel .lc-button:focus-visible{outline:2px solid #222;outline-offset:3px}.liquid-carousel .lc-button:hover{background:#f8f8f8}.liquid-carousel .lc-button:disabled{cursor:default}.liquid-carousel .lc-button svg{display:block;width:44%;height:44%;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
 .liquid-carousel .lc-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.liquid-carousel[data-disabled=true]{opacity:.45}`;
 const vertex=`attribute vec2 aPosition;varying vec2 vUv;void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
 const fragment=`precision highp float;varying vec2 vUv;uniform sampler2D uFrom,uTo;uniform float uProgress,uRadius,uAspect,uFromAspect,uToAspect,uDirection,uDistortion,uEdge;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec2(7.1,3.4);a*=.5;}return n;}
 vec2 cover(vec2 uv,float imageAspect){return (uv-.5)*vec2(min(uAspect/imageAspect,1.),min(imageAspect/uAspect,1.))+.5;}
 void main(){vec2 uv=vUv;if(uProgress<=0.){gl_FragColor=texture2D(uFrom,cover(uv,uFromAspect));return;}if(uProgress>=1.){gl_FragColor=texture2D(uTo,cover(uv,uToAspect));return;}
 vec2 origin=vec2(uDirection>0.?.889:.111,.5),q=(uv-origin)*vec2(uAspect,1.);float distance=length(q);vec2 direction=q/max(distance,.001);
 float detail=(fbm(q*5.2+vec2(uProgress*.4,-uProgress*.25))-.47)*2.;float edge=distance+detail*uEdge-uRadius;
 float mask=1.-smoothstep(-.009,.009,edge);float band=exp(-pow(edge/.155,2.))*sin(3.14159265*uProgress);
 vec2 offset=direction/vec2(uAspect,1.)*uDistortion*band;vec2 fromUv=cover(clamp(uv+offset*.52,.001,.999),uFromAspect),toUv=cover(clamp(uv-offset*.34,.001,.999),uToAspect);
 gl_FragColor=mix(texture2D(uFrom,fromUv),texture2D(uTo,toUv),mask);}`;
 function create(host:HTMLElement,initial:LiquidCarouselSettings,initialRuntime:LiquidRuntime){
  let settings=initial,runtime=initialRuntime,items=settings.items,index=settings.selectedIndex,target=index,dead=false,ready=false,generation=0,elapsed=0,frames=0;
  let mode:'none'|'once'|'gallery'|'auto'='none',demoElapsed=0,nextAt=0,demoSteps=0,originIndex=index;
  type Surface={image:HTMLCanvasElement;aspect:number;texture:WebGLTexture|null;snapshot?:boolean};
  let surfaces:Surface[]=[],transition:{from:Surface;to:Surface;elapsed:number;direction:number}|null=null,drag:{x:number;y:number;id:number}|null=null;
  const style=tools.install(host,'liquid-carousel',css),haloA=tools.element('div','lc-halo'),haloB=tools.element('div','lc-halo'),frame=tools.element('div','lc-frame'),canvas=tools.element('canvas','lc-canvas'),previous=tools.element('button','lc-button'),next=tools.element('button','lc-button'),status=tools.element('span','lc-status');
  host.setAttribute('role','region');host.setAttribute('aria-roledescription','carousel');frame.tabIndex=0;frame.setAttribute('role','group');canvas.setAttribute('aria-hidden','true');status.setAttribute('aria-live','polite');previous.type=next.type='button';
  previous.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5"/></svg>';next.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
  frame.append(canvas,previous,next);host.append(haloA,haloB,frame,status);
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,depth:false,stencil:false}),ctx=gl?null:canvas.getContext('2d');
  let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;const uniforms:Record<string,WebGLUniformLocation|null>={};
  if(gl){
   const compile=(kind:number,source:string)=>{const shader=gl.createShader(kind)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)??'Liquid shader compile failed');return shader};
   const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram()!;gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Liquid shader link failed');gl.useProgram(program);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
   for(const key of ['uFrom','uTo','uProgress','uRadius','uAspect','uFromAspect','uToAspect','uDirection','uDistortion','uEdge'])uniforms[key]=gl.getUniformLocation(program,key);
  }
  host.dataset.backend=gl?'webgl':'canvas2d';
  function texture(source?:TexImageSource){if(!gl)return null;const tex=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if(source){gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source)}return tex}
  function release(surface:Surface|null){if(surface?.snapshot&&surface.texture)gl?.deleteTexture(surface.texture)}
  function layout(){
   const innerHeight=settings.height-2*settings.border,innerWidth=innerHeight*settings.aspect,dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(innerWidth*dpr)),h=Math.max(1,Math.round(innerHeight*dpr));
   frame.style.width=innerWidth+settings.border*2+'px';frame.style.height=settings.height+'px';frame.style.border=settings.border+'px solid white';frame.style.borderRadius=settings.radius+'px';
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}for(const button of [previous,next]){button.style.width=button.style.height=settings.buttonSize+'px'}previous.style.left=innerWidth*.111-settings.buttonSize/2+'px';next.style.right=innerWidth*.111-settings.buttonSize/2+'px';
   haloA.style.width=haloB.style.width=innerWidth+'px';haloA.style.height=haloB.style.height=innerHeight+'px';
   const en=runtime.language==='en';host.setAttribute('aria-label',en?'Liquid image carousel':'液态图片轮播');previous.setAttribute('aria-label',en?'Previous image':'上一张图片');next.setAttribute('aria-label',en?'Next image':'下一张图片');frame.setAttribute('aria-label',(en?'Image: ':'图片：')+items[target].title);previous.disabled=next.disabled=settings.disabled||!ready;host.dataset.disabled=String(settings.disabled);
  }
  function coverDraw(context:CanvasRenderingContext2D,surface:Surface){const s=Math.max(canvas.width/surface.image.width,canvas.height/surface.image.height),w=surface.image.width*s,h=surface.image.height*s;context.drawImage(surface.image,(canvas.width-w)/2,(canvas.height-h)/2,w,h)}
  function paint(){
   if(dead)return;layout();host.dataset.ready=String(ready);host.dataset.count=String(items.length);host.dataset.index=String(index);host.dataset.target=String(target);host.dataset.value=items[target].title;host.dataset.elapsed=elapsed.toFixed(1);host.dataset.frame=String(++frames);
   if(!ready)return;const a=transition?.from??surfaces[index],b=transition?.to??a,p=transition?tools.clamp(transition.elapsed/Math.max(80,runtime.durationMs)):0;host.dataset.progress=p.toFixed(4);
   if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,a.texture);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,b.texture);gl.uniform1i(uniforms.uFrom,0);gl.uniform1i(uniforms.uTo,1);gl.uniform1f(uniforms.uProgress,p);gl.uniform1f(uniforms.uRadius,radiusAt(p,canvas.width/canvas.height));gl.uniform1f(uniforms.uAspect,canvas.width/canvas.height);gl.uniform1f(uniforms.uFromAspect,a.aspect);gl.uniform1f(uniforms.uToAspect,b.aspect);gl.uniform1f(uniforms.uDirection,transition?.direction??1);gl.uniform1f(uniforms.uDistortion,settings.distortion);gl.uniform1f(uniforms.uEdge,settings.edge);gl.drawArrays(gl.TRIANGLES,0,6)}
   else if(ctx){ctx.clearRect(0,0,canvas.width,canvas.height);coverDraw(ctx,a);if(transition){ctx.save();ctx.beginPath();const x=canvas.width*(transition.direction>0?.889:.111),y=canvas.height*.5,r=radiusAt(p,canvas.width/canvas.height)*canvas.height;for(let i=0;i<=180;i++){const angle=i/180*Math.PI*2,edge=(Math.sin(angle*5+1)+Math.sin(angle*9-2)*.45)*settings.edge*canvas.height*.35;const px=x+Math.cos(angle)*Math.max(0,r+edge),py=y+Math.sin(angle)*Math.max(0,r+edge);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.clip();coverDraw(ctx,b);ctx.restore()}}
   haloA.style.backgroundImage=`url("${items[index].src}")`;haloB.style.backgroundImage=`url("${items[target].src}")`;haloA.style.opacity=String(.18*(1-p));haloB.style.opacity=String(.18*p);
  }
  function finish(){if(transition){release(transition.from);transition=null;index=target;status.textContent=items[index].title}paint()}
  function snapshot():Surface{
   const image=document.createElement('canvas');image.width=canvas.width;image.height=canvas.height;if(ctx)image.getContext('2d')!.drawImage(canvas,0,0);
   const tex=texture();if(gl){gl.bindTexture(gl.TEXTURE_2D,tex);gl.copyTexImage2D(gl.TEXTURE_2D,0,gl.RGB,0,0,canvas.width,canvas.height,0)}return {image,aspect:canvas.width/canvas.height,texture:tex,snapshot:true};
  }
  function choose(to:number,direction:number,manual=true){
   if(!ready||settings.disabled||!(runtime.interactive??runtime.enabled)||runtime.paused)return;
   if(manual){mode='none';demoElapsed=0}to=wrap(to,items.length);if(to===target&&!transition)return;
   let from=surfaces[index];if(transition){if(runtime.interruption!=='restart')from=snapshot();release(transition.from)}target=to;elapsed=0;runtime.onChange?.({index:target,title:items[target].title});
   if(runtime.reduced||!runtime.enabled||runtime.speed<=0){transition=null;index=target;status.textContent=items[index].title;clock.sleep();paint();return}
   transition={from,to:surfaces[to],elapsed:0,direction};paint();clock.wake();
  }
  function startDemo(nextMode:'once'|'gallery'|'auto'){
   if(!runtime.enabled||runtime.paused||runtime.reduced||settings.disabled)return;mode=nextMode;demoElapsed=0;demoSteps=0;originIndex=target;nextAt=(runtime.delayMs??0)+400;if(ready)clock.wake();
  }
  function settle(){mode='none';demoElapsed=0;finish();clock.sleep()}
  function tick(dt:number){
   elapsed+=dt;if(transition)transition.elapsed+=dt;
   if(transition&&transition.elapsed>=runtime.durationMs)finish();
   if(mode!=='none'){
    demoElapsed+=dt;if(ready&&!transition&&demoElapsed>=nextAt){demoSteps++;const to=mode==='once'&&demoSteps===2?originIndex:target+1;choose(to,1,false);nextAt=demoElapsed+runtime.durationMs+Math.max(400,settings.interval*.45);if(mode==='once'&&demoSteps===2)mode='none'}
   }
   paint();return !!transition||mode!=='none';
  }
  const clock=tools.clock(runtime,tick,host);
  function load(){
   const token=++generation;ready=false;for(const s of surfaces)if(s.texture)gl?.deleteTexture(s.texture);if(transition)release(transition.from);surfaces=[];transition=null;index=target=Math.min(settings.selectedIndex,items.length-1);paint();
   Promise.all(items.map(item=>new Promise<Surface>((resolve,reject)=>{
    const image=new Image();image.onload=()=>{const prepared=document.createElement('canvas');prepared.width=item.src.startsWith('data:image/svg+xml,')?640:image.naturalWidth;prepared.height=item.src.startsWith('data:image/svg+xml,')?640:image.naturalHeight;const context=prepared.getContext('2d')!;context.drawImage(image,0,0,prepared.width,prepared.height);

     resolve({image:prepared,aspect:prepared.width/prepared.height,texture:null});};image.onerror=()=>reject(Error('Image decode failed'));image.src=item.src;
   }))).then(next=>{if(dead||generation!==token)return;surfaces=next.map(surface=>({...surface,texture:texture(surface.image)}));ready=true;paint();if(mode!=='none')clock.wake()}).catch(()=>{if(dead||generation!==token)return;host.dataset.error='image';clock.sleep()});
  }
  const clickPrevious=(e:Event)=>{e.stopPropagation();choose(target-1,-1)},clickNext=(e:Event)=>{e.stopPropagation();choose(target+1,1)};
  const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();choose(e.key==='Home'?0:e.key==='End'?items.length-1:target+(e.key==='ArrowRight'?1:-1),e.key==='ArrowLeft'||e.key==='Home'?-1:1)};
  const down=(e:PointerEvent)=>{e.stopPropagation();if(e.button===0&&!(e.target as Element).closest('button'))drag={x:e.clientX,y:e.clientY,id:e.pointerId}};
  const up=(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;if(Math.abs(dx)>24&&Math.abs(dx)>Math.abs(dy)*1.3){e.stopPropagation();choose(target+(dx<0?1:-1),dx<0?1:-1)}};
  const stopClick=(e:Event)=>e.stopPropagation();
  const listeners:[EventTarget,string,EventListener][]=[[previous,'click',clickPrevious],[next,'click',clickNext],[frame,'keydown',key as EventListener],[frame,'pointerdown',down as EventListener],[frame,'pointerup',up as EventListener],[frame,'pointercancel',()=>{drag=null}],[frame,'click',stopClick]];
  listeners.forEach(([node,event,handler])=>node.addEventListener(event,handler));clock.update(runtime);load();if(runtime.gallery)startDemo('gallery');else if(!runtime.managed&&settings.autoplay)startDemo('auto');
  return {update(nextSettings:LiquidCarouselSettings,nextRuntime:LiquidRuntime){const old=settings,oldRuntime=runtime;settings=nextSettings;runtime=nextRuntime;const changed=JSON.stringify(old.items)!==JSON.stringify(settings.items);items=settings.items;if(changed)load();else if(old.selectedIndex!==settings.selectedIndex){target=settings.selectedIndex;finish();index=target}
   clock.update(runtime);if(!runtime.enabled||settings.disabled)settle();else if(runtime.reduced)settle();else if(runtime.gallery&&!oldRuntime.gallery)startDemo('gallery');else if(!runtime.gallery&&oldRuntime.gallery){mode='none';if(!transition)clock.sleep()}else if(!runtime.managed&&settings.autoplay&&(!old.autoplay||old.disabled||!oldRuntime.enabled||oldRuntime.reduced))startDemo('auto');else if(!settings.autoplay&&mode==='auto'){mode='none';if(!transition)clock.sleep()}paint();
  },demonstrate(){if(runtime.reduced)choose(target+1,1);else startDemo('once')},settle,getValue:()=>({index:target,title:items[target].title}),destroy(){dead=true;generation++;clock.destroy();listeners.forEach(([node,event,handler])=>node.removeEventListener(event,handler));for(const s of surfaces)if(s.texture)gl?.deleteTexture(s.texture);if(transition)release(transition.from);if(gl){gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}host.replaceChildren();host.classList.remove('liquid-carousel');void style}};
 }
 return {create};
}
const engine=liquidCarouselEngine(nativeEffectTools(),liquidIndex,liquidRadius);
export const createLiquidCarousel=engine.create;
export const liquidCarouselEngineCode=`${nativeToolsCode}\nconst liquidIndex=${liquidIndex.toString()};\nconst liquidRadius=${liquidRadius.toString()};\nconst liquidEngine=((__name)=>(${liquidCarouselEngine.toString()}))((fn)=>fn)(tools,liquidIndex,liquidRadius);\nconst createLiquidCarousel=liquidEngine.create;`;
