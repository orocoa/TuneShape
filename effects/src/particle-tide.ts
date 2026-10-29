/** Original particle ocean. Public Customize controls inform the API, not the implementation. */
type TideRenderSettings={backgroundColor:string;waterColor:string;crestColor:string;density:number;particleSize:number;waveHeight:number;choppiness:number;wavelength:number;windAngle:number;horizon:number;fog:number;glow:number;foam:number;speed:number;parallax:number;swell:number;swellRadius:number;seed:number;interactive:boolean;clickRipples:boolean};
export type TideSettings=Pick<TideRenderSettings,'backgroundColor'|'waterColor'|'crestColor'|'density'|'particleSize'|'waveHeight'|'wavelength'|'speed'|'interactive'|'clickRipples'>;
export const defaultTide:Readonly<TideSettings>={backgroundColor:'#242426',waterColor:'#B9B9C2',crestColor:'#FFFFFF',density:1,particleSize:1,waveHeight:1,wavelength:1,speed:1,interactive:true,clickRipples:true};
export const tideRanges={density:[.3,2,.05],particleSize:[.3,3,.05],waveHeight:[0,2,.05],wavelength:[.4,3,.05],speed:[0,3,.05]} as const;
export const tidePresets={
 Graphite:{backgroundColor:'#242426',waterColor:'#B9B9C2',crestColor:'#FFFFFF'},
 Paper:{backgroundColor:'#FAFAFA',waterColor:'#A9A9B8',crestColor:'#1C1C28'},
 Silver:{backgroundColor:'#0A0A0A',waterColor:'#6E6E80',crestColor:'#FFFFFF'},
 Violet:{backgroundColor:'#100C1C',waterColor:'#67528B',crestColor:'#D6B8FF'},
 Aqua:{backgroundColor:'#061819',waterColor:'#2C7276',crestColor:'#ACF9E2'},
 Ember:{backgroundColor:'#1C0C08',waterColor:'#8A4933',crestColor:'#FFD19A'},
 Lilac:{backgroundColor:'#F4F0FA',waterColor:'#B4A5CA',crestColor:'#655080'},
} as const;
export function validateTide(value:unknown):TideSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('粒子海浪设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultTide);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('粒子海浪设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(tideRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`粒子海浪 ${key} 超出范围。`);
 for(const key of ['interactive','clickRipples'])if(typeof v[key]!=='boolean')throw Error('粒子海浪开关无效。');
 for(const key of ['backgroundColor','waterColor','crestColor'])if(typeof v[key]!=='string'||!/^#[\da-f]{6}$/i.test(v[key] as string))throw Error('粒子海浪颜色须为六位十六进制。');
 return structuredClone(v) as TideSettings;
}
export type TidePointer={x:number;z:number;viewX:number;viewY:number;strength?:number;onSurface?:boolean};
export type TideRipple={x:number;z:number;time:number};
export type TidePoint={x:number;z:number;jitter:number};
export type TideDot={x:number;y:number;size:number;ink:number;alpha:number};

// Self-contained factory: reusable renderer exports survive production minification.
function createTideEngine(){
 return {
  near:-.7,
  settings(s:TideSettings):TideRenderSettings{return {choppiness:.8,windAngle:0,horizon:.1,fog:1,glow:.35,foam:1,parallax:1,swell:1,swellRadius:.9,seed:0,...s}},
  random(index:number,seed:number){let n=Math.imul(index+1,1597334677)^Math.imul(seed+1,3812015801);n=Math.imul(n^(n>>>16),2246822519);return ((n^(n>>>13))>>>0)/4294967296},
  plan(s:TideRenderSettings):TidePoint[]{
   const columns=Math.round(420*Math.sqrt(s.density)),rows=Math.round(300*Math.sqrt(s.density)),points:TidePoint[]=[];
   for(let row=rows-1;row>=0;row--)for(let col=0;col<columns;col++){
    const id=row*columns+col,jitter=this.random(id,s.seed),u=(row+this.random(id+31,s.seed))/rows,z=this.near+4*(1/(1-u*.975)-1),depth=1+z*.25;
    points.push({x:((col+this.random(id+17,s.seed))/columns*2-1)*4.8*depth,z,jitter});
   }
   return points;
  },
  pointer(x:number,y:number,s:TideRenderSettings,time=0,pointer:TidePointer|null=null,ripples:TideRipple[]=[]):TidePointer{
   // Intersect the screen ray with the displaced wave surface, not a flat plane.
   const viewX=(x-160)/160,viewY=(y-115)/115;
   const at=(z:number)=>{const depth=1+z*.25;const camera=s.interactive&&pointer?s.parallax:0,viewShift=(pointer?.viewX??0)*camera*.15;let worldX=(x-160)*depth/40+viewShift;for(let i=0;i<4;i++)worldX=(x-160)*depth/40+viewShift-this.sample(worldX,z,time,s,pointer,ripples).displacement;const wave=this.sample(worldX,z,time,s,pointer,ripples);return {x:worldX,z,error:s.horizon*230+(210-wave.height*32+(pointer?.viewY??0)*camera*4)/depth-y}};
   let previous=at(this.near),best=previous;
   for(let i=1;i<=128;i++){const current=at(this.near+4*(1/(1-i/128*.975)-1));if(Math.abs(current.error)<Math.abs(best.error))best=current;
    if(previous.error*current.error<=0){let lo=previous,hi=current;for(let j=0;j<12;j++){const mid=at((lo.z+hi.z)/2);if(lo.error*mid.error<=0)hi=mid;else lo=mid}best=at((lo.z+hi.z)/2);break}previous=current;
   }
   return {x:best.x,z:best.z,viewX,viewY,onSurface:Math.abs(best.error)<1};
  },
  sample(x:number,z:number,time:number,s:TideRenderSettings,pointer:TidePointer|null,ripples:TideRipple[]){
   const angle=s.windAngle*Math.PI/180,dx=Math.sin(angle),dz=Math.cos(angle),seed=s.seed*.817;
   const u=(x*dx+z*dz)/s.wavelength,v=(x*dz-z*dx)/s.wavelength;
   const a=u*1.15+Math.sin(v*.55+u*.12)*.55-time*.75+seed,b=u*.62+v*.12-time*.48-seed*.7,c=v*.48+u*.23+time*.27+seed*1.9;
   const primary=Math.sin(a),secondary=Math.sin(b),cross=Math.cos(c),detail=Math.sin(u*2.8+Math.sin(v*.8)*.3-time*.85);
   let height=s.waveHeight*(primary*.57+secondary*.28+cross*.18+detail*.06+s.choppiness*.18*(primary*primary-.5));
   if(s.interactive&&pointer){const distance=(x-pointer.x)**2+(z-pointer.z)**2;height+=(pointer.strength??1)*s.swell*.32*Math.exp(-distance/(s.swellRadius*s.swellRadius*2))}
   let rippleLight=0,rippleDisplacement=0;
   if(s.clickRipples)for(const ripple of ripples){const age=time-ripple.time;if(age<0||age>6)continue;const distance=Math.hypot(x-ripple.x,z-ripple.z),front=distance-age*3.3,attack=1-Math.exp(-age*16),envelope=Math.exp(-front*front/1.4-age*.6)*attack,phase=front*4.2;
    height+=Math.cos(phase)*envelope*1.05-1.3*Math.exp(-distance*distance/.5-age*3)*attack;
    rippleLight+=Math.max(0,Math.cos(phase))**2*envelope;
    rippleDisplacement+=distance>.001?(x-ripple.x)/distance*Math.sin(phase)*envelope*.16:0;
   }

   const ridge=Math.max(0,(primary*.65+secondary*.25+cross*.1-.08)/.92);
   const slope=Math.abs(Math.cos(a)*.6555+Math.cos(b)*.1736-Math.sin(c)*.0414);
   const fold=Math.min(1,(Math.pow(ridge,4.2)*2*(.6+.4*slope)+Math.pow(Math.max(0,secondary),8)*.15+Math.pow(Math.max(0,detail),12)*.04)*Math.min(1,s.waveHeight));
   return {height,crest:Math.min(1,fold+rippleLight*.95),displacement:s.waveHeight*s.choppiness*Math.cos(a)*.35+rippleDisplacement};
  },
  dot(point:TidePoint,time:number,s:TideRenderSettings,pointer:TidePointer|null,ripples:TideRipple[]):TideDot{
   const wave=this.sample(point.x,point.z,time,s,pointer,ripples),depth=1+point.z*.25;
   const camera=s.interactive&&pointer?s.parallax*(pointer.strength??1):0;
   const x=160+(point.x+wave.displacement)*40/depth-(pointer?.viewX??0)*camera*6/depth;
   const y=s.horizon*230+(210-wave.height*32)/depth+(pointer?.viewY??0)*camera*4/depth;
   const alpha=Math.min(.98,(.035+wave.crest*s.foam*1.5)*Math.exp(-point.z*s.fog*.026)*(.7+point.jitter*.65));
   return {x,y,size:s.particleSize*(.12+.3/depth)*(.75+point.jitter*.5),ink:Math.min(1,.18+Math.sqrt(wave.crest*s.foam)*.82),alpha};
  },
  paint(ctx:CanvasRenderingContext2D,points:TidePoint[],time:number,s:TideRenderSettings,pointer:TidePointer|null,ripples:TideRipple[]){
   const width=ctx.canvas.width,height=ctx.canvas.height;ctx.setTransform(width/320,0,0,height/230,0,0);ctx.clearRect(0,0,320,230);ctx.fillStyle=s.backgroundColor;ctx.fillRect(0,0,320,230);
   const water=[1,3,5].map(i=>parseInt(s.waterColor.slice(i,i+2),16)),crest=[1,3,5].map(i=>parseInt(s.crestColor.slice(i,i+2),16));
   const buckets:TideDot[][]=Array.from({length:96},()=>[]);
   const keep=Math.min(1,32000/points.length);
   for(let index=0;index<points.length;index++){if(this.random(index+371,s.seed)>keep)continue;const point=points[index],dot=this.dot(point,time,s,pointer,ripples);if(dot.y>232||dot.y<0||dot.x< -3||dot.x>323)continue;const tone=Math.min(7,Math.floor(dot.ink*8)),alpha=Math.min(11,Math.floor(dot.alpha*12));buckets[tone*12+alpha].push(dot)}
   for(let i=0;i<buckets.length;i++){
    const bucket=buckets[i];if(!bucket.length)continue;const mix=Math.floor(i/12)/7,opacity=(i%12+.5)/12;
    ctx.fillStyle=`rgb(${water.map((n,c)=>Math.round(n+(crest[c]-n)*mix)).join(',')})`;
    if(s.glow>0){ctx.globalAlpha=opacity*s.glow*.12;ctx.beginPath();for(const dot of bucket){const r=dot.size*(1.2+s.glow);ctx.moveTo(dot.x+r,dot.y);ctx.arc(dot.x,dot.y,r,0,Math.PI*2)}ctx.fill()}
    ctx.globalAlpha=opacity;ctx.beginPath();for(const dot of bucket){const r=dot.size*.45;ctx.moveTo(dot.x+r,dot.y);ctx.arc(dot.x,dot.y,r,0,Math.PI*2)}ctx.fill();
   }
   ctx.globalAlpha=1;
  },
  create(host:HTMLElement){
   const engine=this;let canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true}),ctx:CanvasRenderingContext2D|null=null;
   let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,points:TidePoint[]=[],density=-1,width=480,height=345,lastPaint=-Infinity,disposed=false;
   const shaders:WebGLShader[]=[],locations:Record<string,WebGLUniformLocation|null>={};
   const state={time:0,settings:null as TideSettings|null,pointer:null as TidePointer|null,ripples:[] as TideRipple[]};
   const vertex=`precision highp float;
    attribute vec3 point; uniform vec2 resolution; uniform float time,waveHeight,wavelength,particleSize,interaction,pointerWeight;
    uniform vec4 pointer; uniform vec3 ripples[12]; uniform int rippleCount; varying float ink,alpha;
    void main(){
     float x=point.x,z=point.y,jitter=point.z,depth=1.+z*.25,u=z/wavelength,v=x/wavelength;
     float a=u*1.15+sin(v*.55+u*.12)*.55-time*.75,b=u*.62+v*.12-time*.48,c=v*.48+u*.23+time*.27;
     float primary=sin(a),secondary=sin(b),cross=cos(c),detail=sin(u*2.8+sin(v*.8)*.3-time*.85);
     float h=waveHeight*(primary*.57+secondary*.28+cross*.18+detail*.06+.8*.18*(primary*primary-.5));
     vec2 delta=vec2(x,z)-pointer.xy;h+=interaction*pointerWeight*.32*exp(-dot(delta,delta)/1.62);
     float light=0.,displacement=waveHeight*.8*cos(a)*.35;
     for(int i=0;i<12;i++){
      if(i>=rippleCount)break;float age=time-ripples[i].z;if(age<0.||age>6.)continue;
      vec2 diff=vec2(x,z)-ripples[i].xy;float distance=length(diff),front=distance-age*3.3,attack=1.-exp(-age*16.),envelope=exp(-front*front/1.4-age*.6)*attack,phase=front*4.2;
      h+=cos(phase)*envelope*1.05-1.3*exp(-distance*distance/.5-age*3.)*attack;
      light+=pow(max(0.,cos(phase)),2.)*envelope;
      if(distance>.001)displacement+=diff.x/distance*sin(phase)*envelope*.16;
     }
     float ridge=max(0.,(primary*.65+secondary*.25+cross*.1-.08)/.92),slope=abs(cos(a)*.6555+cos(b)*.1736-sin(c)*.0414),fold=min(1.,(pow(ridge,4.2)*2.*(.6+.4*slope)+pow(max(0.,secondary),8.)*.15+pow(max(0.,detail),12.)*.04)*min(1.,waveHeight)),crest=min(1.,fold+light*.95);
     vec2 screen=vec2(160.+(x+displacement)*40./depth-pointer.z*interaction*pointerWeight*6./depth,23.+(210.-h*32.)/depth+pointer.w*interaction*pointerWeight*4./depth);
     gl_Position=vec4(screen.x/160.-1.,1.-screen.y/115.,0.,1.);
     float footprint=particleSize*(.12+.3/depth)*(.75+jitter*.5)*resolution.x/320.;
     gl_PointSize=clamp(footprint,1.,12.);
     ink=min(1.,.18+sqrt(crest)*.82);alpha=min(.98,(.035+crest*1.5)*exp(-z*.026)*(.7+jitter*.65))*min(1.,footprint*footprint);
    }`;
   const fragment=`precision mediump float;uniform vec3 waterColor,crestColor;varying float ink,alpha;
    void main(){float radius=length(gl_PointCoord-.5);if(radius>.5)discard;float edge=1.-smoothstep(.22,.5,radius);gl_FragColor=vec4(mix(waterColor,crestColor,ink),alpha*edge);}`;
   const release=()=>{if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);for(const shader of shaders)gl.deleteShader(shader)}buffer=null;program=null};
   if(gl){
    try{
     program=gl.createProgram();if(!program)throw Error('program');
     for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const){const shader=gl.createShader(type);if(!shader)throw Error('shader');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)??'compile');gl.attachShader(program,shader)}
     gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');
     gl.useProgram(program);buffer=gl.createBuffer();if(!buffer)throw Error('buffer');gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const attribute=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,3,gl.FLOAT,false,0,0);
     for(const name of ['resolution','time','waveHeight','wavelength','particleSize','interaction','pointerWeight','pointer','ripples[0]','rippleCount','waterColor','crestColor'])locations[name]=gl.getUniformLocation(program,name);
     gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
    }catch{release();gl=null}
   }
   const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
   canvas.setAttribute('aria-hidden','true');host.append(canvas);
   const renderer={
    get backend(){return gl&&program?'webgl':'canvas2d'},get particleCount(){return points.length},
    resize(cssWidth:number,cssHeight:number,dpr=Math.min(window.devicePixelRatio||1,1.5)){
     const ratio=Math.min(1.5,Math.max(1,dpr));width=Math.max(1,Math.round(cssWidth*ratio));height=Math.max(1,Math.round(cssHeight*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
    },
    render(time:number,settings:TideSettings,pointer:TidePointer|null=null,ripples:TideRipple[]=[],force=true){
     if(disposed)return;Object.assign(state,{time,settings,pointer,ripples});
     if(density!==settings.density){density=settings.density;points=engine.plan(engine.settings(settings));if(gl&&buffer){const vertices=new Float32Array(points.length*3);points.forEach((p,i)=>vertices.set([p.x,p.z,p.jitter],i*3));gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)}}
     if(gl&&program){
      gl.viewport(0,0,width,height);const bg=rgb(settings.backgroundColor);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      gl.uniform2f(locations.resolution,width,height);gl.uniform1f(locations.time,time);gl.uniform1f(locations.waveHeight,settings.waveHeight);gl.uniform1f(locations.wavelength,settings.wavelength);gl.uniform1f(locations.particleSize,settings.particleSize);gl.uniform1f(locations.interaction,settings.interactive&&pointer?1:0);gl.uniform1f(locations.pointerWeight,pointer?.strength??1);gl.uniform4f(locations.pointer,pointer?.x??0,pointer?.z??0,pointer?.viewX??0,pointer?.viewY??0);
      const active=settings.clickRipples?ripples.filter(r=>time-r.time>=0&&time-r.time<6).slice(-12):[],values=new Float32Array(36);active.forEach((r,i)=>values.set([r.x,r.z,r.time],i*3));gl.uniform3fv(locations['ripples[0]'],values);gl.uniform1i(locations.rippleCount,active.length);gl.uniform3fv(locations.waterColor,rgb(settings.waterColor));gl.uniform3fv(locations.crestColor,rgb(settings.crestColor));gl.drawArrays(gl.POINTS,0,points.length);
     }else if(ctx){const now=performance.now();if(!force&&now-lastPaint<50)return;lastPaint=now;engine.paint(ctx,points,time,engine.settings(settings),pointer,ripples)}
    },
    fallback(){release();gl=null;const replacement=document.createElement('canvas');replacement.setAttribute('aria-hidden','true');canvas.replaceWith(replacement);canvas=replacement;canvas.width=width;canvas.height=height;ctx=canvas.getContext('2d');if(state.settings)this.render(state.time,state.settings,state.pointer,state.ripples)},
    dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);release();gl?.getExtension?.('WEBGL_lose_context')?.loseContext();canvas.remove()},
   };
   const lost=(event:Event)=>{event.preventDefault();renderer.fallback()};
   canvas.addEventListener('webglcontextlost',lost,{once:true});if(!gl||!program)renderer.fallback();renderer.resize(320,230);return renderer;
  },

 };
}
const engine=createTideEngine();
export const planTide=(s:TideSettings)=>engine.plan(engine.settings(s));
export const tidePointer=(x:number,y:number,s:TideSettings,time=0,pointer:TidePointer|null=null,ripples:TideRipple[]=[])=>engine.pointer(x,y,engine.settings(s),time,pointer,ripples);
export const sampleTide=(x:number,z:number,time:number,s:TideSettings,pointer:TidePointer|null=null,ripples:TideRipple[]=[])=>engine.sample(x,z,time,engine.settings(s),pointer,ripples);
export const projectTide=(point:TidePoint,time:number,s:TideSettings,pointer:TidePointer|null=null,ripples:TideRipple[]=[])=>engine.dot(point,time,engine.settings(s),pointer,ripples);
export const paintTide=(ctx:CanvasRenderingContext2D,points:TidePoint[],time:number,s:TideSettings,pointer:TidePointer|null=null,ripples:TideRipple[]=[])=>engine.paint(ctx,points,time,engine.settings(s),pointer,ripples);
export const createTideRenderer=(host:HTMLElement)=>engine.create(host);
export const tideEngineCode=`const tideEngine=((__name)=>(${createTideEngine.toString()}))((fn)=>fn)();\nconst createTideRenderer=host=>tideEngine.create(host);\nconst planTide=settings=>tideEngine.plan(tideEngine.settings(settings));\nconst paintTide=(ctx,points,time,settings,pointer=null,ripples=[])=>tideEngine.paint(ctx,points,time,tideEngine.settings(settings),pointer,ripples);\nconst tidePointer=(x,y,settings,time=0,pointer=null,ripples=[])=>tideEngine.pointer(x,y,tideEngine.settings(settings),time,pointer,ripples);`;
