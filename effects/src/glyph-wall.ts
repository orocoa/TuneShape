/** Original deterministic glyph-wall engine. No React Bits Pro implementation is used. */
import {defaultGlyphPhrases,glyphPhraseLimits} from './glyph-phrases';
export type GlyphWallSettings={words:string;layout:'scatter'|'diagonal'|'list'|'center';direction:'down'|'up'|'right'|'left';charset:'letters'|'digits'|'binary'|'symbols';fontSize:number;density:number;wallOpacity:number;scrambleHz:number;holdMs:number;restMs:number;stagger:number;bandWidth:number;shuffle:boolean;color:string;noiseColor:string};
export const defaultGlyphWall:Readonly<GlyphWallSettings>={words:defaultGlyphPhrases.join('|'),layout:'scatter',direction:'down',charset:'letters',fontSize:14,density:.7,wallOpacity:.10,scrambleHz:12,holdMs:5000,restMs:800,stagger:.5,bandWidth:.09,shuffle:true,color:'#171717',noiseColor:'#777777'};
const sets={letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',digits:'0123456789',binary:'01',symbols:'<>/{}[]+=*#%&?'};
export const wallWords=(settings:GlyphWallSettings)=>settings.words.split('|').map(word=>word.trim()).filter(Boolean);
export function validateGlyphWall(value:unknown):GlyphWallSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('文字墙设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultGlyphWall);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('文字墙设置字段不完整或含未知字段。');
 if(typeof v.words!=='string'||/[\u0000-\u001f\u007f<>]/u.test(v.words))throw Error('请输入有效词组。');
 const words=v.words.split('|').map(word=>word.trim());
 if(words.length<glyphPhraseLimits.min||words.length>glyphPhraseLimits.max||words.some(word=>!word||Array.from(word).length>glyphPhraseLimits.length))throw Error('请输入 1–8 个词组，每个最多 20 个字符。');
 if(!['scatter','diagonal','list','center'].includes(v.layout as string)||!['down','up','right','left'].includes(v.direction as string)||!Object.hasOwn(sets,v.charset as string))throw Error('文字墙排布、方向或字符集无效。');
 const ranges={fontSize:[8,16],density:[.1,1],wallOpacity:[0,.6],scrambleHz:[2,30],holdMs:[0,8000],restMs:[0,3000],stagger:[0,1],bandWidth:[.04,.3]};
 for(const [key,[min,max]] of Object.entries(ranges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`文字墙 ${key} 超出范围。`);
 if(typeof v.shuffle!=='boolean'||![v.color,v.noiseColor].every(color=>typeof color==='string'&&/^#[\da-f]{6}$/i.test(color)))throw Error('文字墙颜色或重排设置无效。');
 return structuredClone(v) as GlyphWallSettings;
}
export type WallWord={label:string;x:number;y:number;width:number;height:number;row:number;column:number};
export type WallPlan={width:number;height:number;margin:number;words:WallWord[];columns:number;rows:number;fontSize:number;cellWidth:number;rowHeight:number};
export type WallFrame={words:{text:string;opacity:number;progress:number}[];glyphs:{x:number;y:number;text:string;opacity:number}[];stage:'scan'|'hold'|'dissolve'|'rest';scan:number};

// A self-contained factory keeps exported code valid after bundler minification.
function createGlyphWallEngine(){
 const charsets={letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',digits:'0123456789',binary:'01',symbols:'<>/{}[]+=*#%&?'};
 return {
  random(index:number,seed:number){let n=Math.imul(index+1,374761393)^Math.imul(seed+1,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296},
  units(text:string){return Array.from(text).reduce((n,c)=>n+(c.codePointAt(0)!>255?2:1),0)},
  cycle(scanMs:number,s:GlyphWallSettings){return scanMs*1.25+s.holdMs+s.restMs},
  playback(scanMs:number,s:GlyphWallSettings,loop:boolean){return loop?this.cycle(scanMs,s):scanMs},
  position(x:number,y:number,direction:GlyphWallSettings['direction'],width=640,height=360){return direction==='down'?y/height:direction==='up'?1-y/height:direction==='right'?x/width:1-x/width},
  plan(s:GlyphWallSettings,seed=0,viewport={width:640,height:360}):WallPlan{
   const width=Math.max(80,viewport.width),height=Math.max(80,viewport.height),margin=Math.min(24,width*.05,height*.07),areaWidth=width-margin*2,areaHeight=height-margin*2;
   const words=s.words.split('|').map(word=>word.trim()).filter(Boolean),fontSize=Math.min(s.fontSize,areaWidth/Math.max(...words.map(word=>this.units(word)))/.72,areaHeight/(words.length*1.8)),cellWidth=fontSize*.72;
   const columns=Math.floor(areaWidth/cellWidth),rows=Math.max(words.length,Math.floor(areaHeight/(fontSize*1.8))),rowHeight=areaHeight/rows;
   const slots=Array.from({length:rows},(_,i)=>i);
   if(s.layout==='scatter')slots.sort((a,b)=>this.random(a,seed)-this.random(b,seed));
   const placed=words.map((label,i)=>{
    const width=this.units(label)*cellWidth,max=Math.max(0,columns-this.units(label)),rank=(i+seed)%words.length;
    const row=s.layout==='scatter'?slots[i]:(words.length===1?Math.floor(rows/2):Math.round(rank*(rows-1)/(words.length-1)));
    const column=s.layout==='list'?0:s.layout==='center'?Math.floor(max/2):s.layout==='diagonal'?Math.round(max*rank/Math.max(1,words.length-1)):Math.floor(this.random(i+51,seed)*max);
    return {label,x:margin+column*cellWidth,y:margin+row*rowHeight,width,height:fontSize*1.8,row,column};
   });
   return {words:placed,columns,rows,fontSize,cellWidth,rowHeight,width,height,margin};
  },
  frame(plan:WallPlan,s:GlyphWallSettings,phase:number,scanMs:number,loop:boolean,seed=0,focused:number|null=null):WallFrame{
   const elapsed=Math.max(0,Math.min(1,phase))*this.playback(scanMs,s,loop),scan=Math.min(1,elapsed/scanMs);
   const dissolve=Math.max(0,Math.min(1,(elapsed-scanMs-s.holdMs)/(scanMs*.25)));
   const stage=elapsed<scanMs?'scan':!loop||elapsed<scanMs+s.holdMs?'hold':dissolve<1?'dissolve':'rest';
   const opacity=loop?1-dissolve:1,charset=charsets[s.charset],tick=Math.floor(elapsed/1000*s.scrambleHz);
   const words=plan.words.map((word,index)=>{
    const arrival=Math.min(.78,Math.max(.04,this.position(word.x+word.width/2,word.y,s.direction,plan.width,plan.height))),span=.035+s.stagger*.18;
    const progress=Math.max(0,Math.min(1,(scan-arrival)/span));
    const text=Array.from(word.label).map((character,i)=>i<Math.ceil(progress*Array.from(word.label).length)&&this.random(index*100+i,seed+73)>=dissolve?character:charset[Math.floor(this.random(index*100+i,tick+seed*97)*charset.length)]).join('');
    return {text,progress:progress*(1-dissolve),opacity:progress<=0?0:opacity*(focused===null||focused===index?1:.25)};
   });
   const glyphs:WallFrame['glyphs']=[];
   for(let row=0;row<plan.rows;row++)for(let col=0;col<plan.columns;col++){
    const id=row*plan.columns+col,x=plan.margin+col*plan.cellWidth,y=plan.margin+row*plan.rowHeight;
    if(this.random(id,seed)>s.density)continue;
    const covering=plan.words.findIndex(word=>row===word.row&&x>=word.x-plan.cellWidth*.2&&x<word.x+word.width);
    const covered=covering<0?0:words[covering].opacity;
    const band=stage==='scan'?Math.max(0,1-Math.abs(this.position(x,y,s.direction,plan.width,plan.height)-scan)/s.bandWidth):0;
    const focus=focused===null?null:plan.words[focused];
    const distance=focus?Math.max(Math.abs(y-focus.y)/22,Math.max(0,focus.x-x,x-focus.x-focus.width)/24):2;
    const clear=focus?Math.max(0,Math.min(1,distance-1)):1;
    const edge=Math.min(1,(col+1)/3,(plan.columns-col)/3,(row+1)/2,(plan.rows-row)/2);
    const change=band>.1?tick:Math.floor(elapsed*.00035+this.random(id,seed)*5);
    glyphs.push({x,y,text:charset[Math.floor(this.random(id+seed*101,change)*charset.length)],opacity:Math.min(.85,s.wallOpacity+band*.4)*clear*edge*(1-covered)});
   }
   return {words,glyphs,stage,scan};
  },
 };
}
const engine=createGlyphWallEngine();
export const glyphCycleMs=(scanMs:number,s:GlyphWallSettings)=>engine.cycle(scanMs,s);
export const glyphPlaybackMs=(scanMs:number,s:GlyphWallSettings,loop:boolean)=>engine.playback(scanMs,s,loop);
export const glyphPosterPhase=(scanMs:number,s:GlyphWallSettings,loop:boolean)=>loop?(scanMs+s.holdMs/2)/glyphCycleMs(scanMs,s):1;
export const planGlyphWall=(s:GlyphWallSettings,seed=0,viewport={width:640,height:360})=>engine.plan(s,seed,viewport);
export const frameGlyphWall=(plan:WallPlan,s:GlyphWallSettings,phase:number,scanMs:number,loop:boolean,seed=0,focused:number|null=null)=>engine.frame(plan,s,phase,scanMs,loop,seed,focused);

export const glyphWallSpecification={authorship:'Original UiWeb implementation; no React Bits Pro source or registry dependency.',font:'500 14px ui-monospace, SFMono-Regular, Menlo, monospace; use the configured fontSize with 1.8 row height and .12em letter spacing',coordinateSystem:{width:640,height:360},responsive:'Call planGlyphWall(settings, seed, {width, height}) with actual displayed dimensions to fill the preview without shrinking the configured type size. Resize the canvas backing store for DPR and position word buttons using the same plan.',phase:'glyphPhase is a normalized Motion clock. A loop is scan + hold + dissolve (25% of scan) + rest. With loop disabled, decode once and retain all words.',interaction:'Hover or keyboard focus clears nearby noise, dims other words and holds the clock. Click blank canvas to choose a new deterministic layout and restart scanning. Selection, seed, focus and preview speed are transient.',reducedMotion:'Show all words immediately; no loop, scan or scramble.'};
export const glyphWallEngineCode=`const glyphWallEngine=(${createGlyphWallEngine.toString()})();\nconst planGlyphWall=(settings,seed=0,viewport={width:640,height:360})=>glyphWallEngine.plan(settings,seed,viewport);\nconst frameGlyphWall=(plan,settings,phase,scanMs,loop,seed=0,focused=null)=>glyphWallEngine.frame(plan,settings,phase,scanMs,loop,seed,focused);`;
