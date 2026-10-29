/** Ariadne homepage flow field, scaled to the shared 320 × 230 teaching canvas. */
export type AsciiSettings={characters:string;opacity:number;fontSize:number;density:number;speed:number;direction:number;twist:number;tension:number;color:string;pointerStrength:number;pointerRadius:number};
export type AsciiPointer={x:number;y:number;vx:number;vy:number;energy:number};
export const defaultAsciiSettings:Readonly<AsciiSettings>=Object.freeze({characters:'cyslap',opacity:.77,fontSize:6.8,density:1.1,speed:2.8,direction:65,twist:2,tension:.4,color:'#212121',pointerStrength:1,pointerRadius:100});
/** Keep the field's time continuous when the Motion progress track wraps. */
export function createPhaseAccumulator(start:number,end:number,offset=0){
 let previous=start,total=offset;
 return (value:number)=>{if(value<previous-.000001)total+=end-start;previous=value;return value+total};
}
export function paintAscii(context:CanvasRenderingContext2D,phase:number,settings:AsciiSettings,pointer:AsciiPointer={x:-1000,y:-1000,vx:0,vy:0,energy:0}){
 const {width,height}=context.canvas,glyphs=Array.from(settings.characters),time=phase*4/(Math.PI*2)*settings.speed;
 const cellWidth=Math.max(2.6,settings.fontSize*1.2/settings.density),cellHeight=Math.max(3.2,settings.fontSize*1.4/settings.density);
 const tension=.72+settings.tension*.56,warp=49/(.86+settings.tension*.34),angle=settings.direction*Math.PI/180;
 context.clearRect(0,0,width,height);context.font=`${settings.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;context.textBaseline='top';context.fillStyle=settings.color;
 for(let y=-cellHeight*2;y<height+cellHeight*2;y+=cellHeight)for(let x=-cellWidth*2;x<width+cellWidth*2;x+=cellWidth){
  let flowX=x,flowY=y,drawX=x,drawY=y;
  if(pointer.energy>0&&settings.pointerStrength>0){
   const dx=x-pointer.x,dy=y-pointer.y,influence=Math.exp(-(dx*dx+dy*dy)/(settings.pointerRadius**2*1.9))*pointer.energy*settings.pointerStrength;
   const wake=influence*(Math.sin(dx*.047+dy*.023-time*2.55)*52+Math.cos(dy*.041-dx*.019+time*2.18)*24),push=influence*184;
   const offsetX=-pointer.vx*push-pointer.vy*wake,offsetY=-pointer.vy*push+pointer.vx*wake;
   flowX+=offsetX;flowY+=offsetY;drawX+=Math.tanh(offsetX/28)*cellWidth*1.6;drawY+=Math.tanh(offsetY/28)*cellHeight*1.45;
  }
  const localTwist=settings.twist*(Math.sin((flowX+flowY)*.0032+time*.11)*.72+Math.cos(flowY*.0044-flowX*.0017-time*.08)*.38);
  const a=angle+localTwist,rx=(flowX-width/2)*Math.cos(a)-(flowY-height/2)*Math.sin(a)+width/2,ry=(flowX-width/2)*Math.sin(a)+(flowY-height/2)*Math.cos(a)+height/2;
  const river=Math.sin(ry*.009*tension-time*.42)*warp+Math.cos(ry*.004*tension+time*.25)*warp*.44;
  const s1=Math.sin((rx+river)*.036*tension+time*.35),s2=Math.sin((rx*.61-ry*.48+Math.sin(ry*.014*tension-time*.18)*26)*.044*tension-time*.27),s3=Math.sin((rx*.34+ry*.72+Math.cos(rx*.009*tension+time*.12)*24)*.052*tension+time*.21);
  const fine=Math.sin(rx*.11*tension+ry*.067*tension+time*.48)*.09+Math.cos(ry*.093*tension-rx*.041*tension-time*.36)*.06;
  const shade=s1*.28+s2*.24+s3*.22+Math.sin((rx-ry*.21)*.018*tension+time*.3)*.26,density=Math.max(.03,Math.min(.98,.52+shade*.35+fine));
  context.globalAlpha=settings.opacity*Math.round(Math.max(.04,Math.min(.95,.2+density*.43+(density-.5)*.1))*20)/20;
  context.fillText(glyphs[Math.min(glyphs.length-1,Math.floor(density*glyphs.length))],drawX,drawY);
 }
 context.globalAlpha=1;
}
