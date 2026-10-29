/** Preserved original pigment field from the first UiWeb watercolor. */
import type {WatercolorSettings,WatercolorPointer} from './watercolor';
// The entire renderer lives inside this factory so copied exports remain standalone.
function createWatercolorEngine(){
 const vertex=`attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
 const fragment=`precision highp float;
 uniform vec2 resolution; uniform float time; uniform float patternScale; uniform float warpSpeed;
 uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float brightness; uniform vec3 pointer;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 float wash(vec2 p){float v=0.,a=.48,n=0.;for(int i=0;i<6;i++){v+=a*noise(p);n+=a;p=mat2(.8,-.6,.6,.8)*p*2.4+vec2(3.1,7.4);a*=.6;}return v/n;}
 void main(){
  vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
  vec2 p=uv*2.2/patternScale+vec2(2.7,5.3);
  vec2 cursor=(pointer.xy-.5)*vec2(resolution.x/resolution.y,-1.);
  float local=exp(-dot(uv-cursor,uv-cursor)*8.)*pointer.z;
  p+=vec2(sin(p.y+time*.13),cos(p.x-time*.11))*local*.42;
  vec2 drift=vec2(time*.04,-time*.026);
  vec2 q=vec2(wash(p+drift),wash(p+vec2(7.2,3.8)-drift));
  vec2 w=vec2(wash(p+q*2.0+vec2(time*warpSpeed,1.7)),wash(p+q*2.0+vec2(5.8,-time*warpSpeed*.7)));
  float pigment=wash(p+2.4*w+q*.5);
  float blend=smoothstep(.2,.8,pigment);
  blend+=sin(pigment*56.)*.035*(1.-abs(blend*2.-1.));
  blend=clamp((blend-.5)*(1.+local*.35)+.5,0.,1.);
  vec3 ink=mix(color1,color2,blend);
  float grain=(hash(gl_FragCoord.xy)-.5)*.025;
  gl_FragColor=vec4(clamp(ink+brightness+grain,0.,1.),opacity);
 }`;
 return {
  hash(x:number,y:number){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)},
  noise(x:number,y:number){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return (this.hash(ix,iy)*(1-fx)+this.hash(ix+1,iy)*fx)*(1-fy)+(this.hash(ix,iy+1)*(1-fx)+this.hash(ix+1,iy+1)*fx)*fy},
  wash(x:number,y:number){let v=0,a=.48,n=0;for(let i=0;i<6;i++){v+=a*this.noise(x,y);n+=a;const nextX=(.8*x+.6*y)*2.4+3.1;y=(-.6*x+.8*y)*2.4+7.4;x=nextX;a*=.6}return v/n},
  rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)},
  field(x:number,y:number,time:number,s:WatercolorSettings,pointer:WatercolorPointer|null){
   const ux=(x-.5)*320/230,uy=.5-y;
   const local=s.cursorInteraction&&pointer?Math.exp(-((ux-(pointer.x-.5)*320/230)**2+(uy-(.5-pointer.y))**2)*8)*s.cursorIntensity:0;
   let px=ux*2.2/s.scale+2.7,py=uy*2.2/s.scale+5.3;
   px+=Math.sin(py+time*.13)*local*.42;py+=Math.cos(ux*2.2/s.scale+2.7-time*.11)*local*.42;
   const qx=this.wash(px+time*.04,py-time*.026),qy=this.wash(px+7.2-time*.04,py+3.8+time*.026);
   const wx=this.wash(px+qx*2.0+time*s.warpSpeed,py+qy*2.0+1.7),wy=this.wash(px+qx*2.0+5.8,py+qy*2.0-time*s.warpSpeed*.7);
   const pigment=this.wash(px+2.4*wx+qx*.5,py+2.4*wy+qy*.5),u=Math.max(0,Math.min(1,(pigment-.2)/.6));
   let blend=u*u*(3-2*u);blend+=Math.sin(pigment*56)*.035*(1-Math.abs(blend*2-1));
   return Math.max(0,Math.min(1,(blend-.5)*(1+local*.35)+.5));
  },
  sample(x:number,y:number,time:number,s:WatercolorSettings,pointer:WatercolorPointer|null=null){
   const blend=this.field(x,y,time,s,pointer),a=this.rgb(s.color1),b=this.rgb(s.color2),grain=(this.hash(x*320,y*230)-.5)*.025;
   return [...a.map((v,i)=>Math.max(0,Math.min(1,v+(b[i]-v)*blend+s.brightness+grain))),s.opacity];
  },
  create(host:HTMLElement){
   const engine=this;let canvas=document.createElement('canvas');
   let gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false});
   let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;const shaders:WebGLShader[]=[];
   if(gl){
    program=gl.createProgram();
    for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const){const shader=gl.createShader(type);if(!shader)continue;gl.shaderSource(shader,source);gl.compileShader(shader);shaders.push(shader);if(program)gl.attachShader(program,shader)}
    if(program){gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);program=null}}
    if(program){gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const location=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0)}
   }
   const locations:Record<string,WebGLUniformLocation|null>={};if(gl&&program)for(const key of ['resolution','time','patternScale','warpSpeed','color1','color2','opacity','brightness','pointer'])locations[key]=gl.getUniformLocation(program,key);
   let ctx:CanvasRenderingContext2D|null=null,image:ImageData|null=null,backend='webgl',lastMs=-Infinity;
   const state={time:0,settings:null as WatercolorSettings|null,pointer:null as WatercolorPointer|null};let disposed=false;
   const renderer={
    get backend(){return backend},
    render(time:number,s:WatercolorSettings,pointer:WatercolorPointer|null=null,force=true){
     if(disposed)return;state.time=time;state.settings=s;state.pointer=pointer;
     if(gl&&program&&backend==='webgl'){
      const dpr=Math.min(window.devicePixelRatio||1,1.5),width=Math.round(320*dpr),height=Math.round(230*dpr);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
      gl.viewport(0,0,width,height);gl.uniform2f(locations.resolution,width,height);gl.uniform1f(locations.time,time);gl.uniform1f(locations.patternScale,s.scale);gl.uniform1f(locations.warpSpeed,s.warpSpeed);gl.uniform3fv(locations.color1,engine.rgb(s.color1));gl.uniform3fv(locations.color2,engine.rgb(s.color2));gl.uniform1f(locations.opacity,s.opacity);gl.uniform1f(locations.brightness,s.brightness);gl.uniform3f(locations.pointer,pointer?.x??.5,pointer?.y??.5,s.cursorInteraction&&pointer?s.cursorIntensity:0);gl.drawArrays(gl.TRIANGLES,0,6);
     }else if(ctx&&image){
      const now=performance.now();if(!force&&now-lastMs<66)return;lastMs=now;
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const pixel=engine.sample((x+.5)/canvas.width,(y+.5)/canvas.height,time,s,pointer),index=(y*canvas.width+x)*4;for(let c=0;c<4;c++)image.data[index+c]=Math.round(pixel[c]*255)}
      ctx.putImageData(image,0,0);
     }
    },
    fallback(){
     if(disposed)return;const replacement=document.createElement('canvas');canvas.replaceWith(replacement);canvas=replacement;canvas.width=112;canvas.height=80;canvas.setAttribute('aria-hidden','true');ctx=canvas.getContext('2d');image=ctx?.createImageData(canvas.width,canvas.height)??null;backend='canvas2d';if(state.settings)this.render(state.time,state.settings,state.pointer);
    },
    dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl!.deleteShader(shader));gl.getExtension?.('WEBGL_lose_context')?.loseContext()}canvas.remove()},
   };
   const lost=(event:Event):void=>{event.preventDefault();if(!disposed)renderer.fallback()};
   canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
   if(!gl||!program)renderer.fallback();
   else canvas.addEventListener('webglcontextlost',lost,{once:true});
   return renderer;
  },
 };
}
const engine=createWatercolorEngine();
export const sampleOriginalWatercolor=(x:number,y:number,time:number,s:WatercolorSettings,pointer:WatercolorPointer|null=null)=>engine.sample(x,y,time,s,pointer);
export const createOriginalWatercolorRenderer=(host:HTMLElement)=>engine.create(host);
export const originalWatercolorEngineCode=`const watercolorEngine=((__name)=>(${createWatercolorEngine.toString()}))((fn)=>fn)();\nconst createWatercolorRenderer=host=>watercolorEngine.create(host);\nconst sampleWatercolor=(x,y,time,settings,pointer=null)=>watercolorEngine.sample(x,y,time,settings,pointer);`;
