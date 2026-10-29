import type {HistoryConfig,Track} from './history-model';
import {tuneShapeNavigation} from './tuneshape-navigation';

export type SidebarNode={id:string;label:string};
export type SidebarRow={id:string;label:string;depth:number;parentId?:string;path:string[];branch:boolean;open:boolean;visible:boolean;position:number};
// Demo content stays English independently of the surrounding interface language.
export const sidebarTree:SidebarNode[]=tuneShapeNavigation.map(({id,label})=>({id,label}));
export const sidebarItems=sidebarTree.map(node=>node.label);
export const sidebarDefaultPose=Object.freeze({pointerIndex:2,selectedIndex:1,expanded:false});

/** Single-level categories retain stable row indexes for the motion adapters. */
export function sidebarTreeRows(tree:SidebarNode[]):SidebarRow[]{
 return tree.map((node,position)=>({id:node.id,label:node.label,depth:0,path:[],branch:false,open:false,visible:true,position}));
}

// Compare authored goals, including non-serializable compiled easing functions' source curve.
export function sidebarTrackSignature(track:{values:unknown[];transition:unknown},config:Pick<HistoryConfig,'easing'>,reduced:boolean){
 return JSON.stringify([track.values,track.transition,config.easing,reduced]);
}

/** Keep independent transform tracks on native, typed CSS properties. */
export function sidebarNativeTrack(property:string,values:(number|string|null)[]){
 const names:Record<string,string>={x:'--mini-x',y:'--mini-y',scale:'--mini-scale',scaleY:'--mini-scale-y',width:'--mini-scale-x',centerInset:'--mini-center-inset'};
 return {property:names[property]??property,values:values.map(value=>property==='width'&&typeof value==='number'?value/80:['x','y','centerInset'].includes(property)&&typeof value==='number'?`${value}px`:value)};
}

/** Direct pointer feedback finishes sooner than the full, soft return gesture. */
export function sidebarHoverTransition<T extends {duration:number;delay:number;ease:unknown}>(transition:T,following:boolean):T{
 return {...transition,duration:Math.min(transition.duration,following?.08:.16),delay:following?0:transition.delay,...(following?{ease:[.16,1,.3,1]}:{})};
}

/** Reposition the saved personal-profile pose around the pointer and current item. */
export function sidebarInteractionConfig(config:HistoryConfig,pointerIndex=2,selectedIndex=1,rows?:SidebarRow[]):HistoryConfig{
 const saved=(part:string,property:string)=>config.tracks.find(track=>track.part===part&&track.property===property)!;
 const end=(part:string,property:string)=>Number(saved(part,property).values.at(-1));
 const start=(part:string,property:string)=>Number(saved(part,property).values[0]);
 const normalWidth=start('line0','width'),currentWidth=start('line1','width'),hoverWidth=end('line2','width');
 const lowOpacity=start('line0','opacity'),currentOpacity=start('line1','opacity'),highOpacity=end('line2','opacity');
 const lowScale=start('line0','scaleY'),highScale=end('line2','scaleY');
 // The neighboring line's saved width defines the Gaussian field radius.
 const neighbor=(end('line3','width')-normalWidth)/(hoverWidth-normalWidth);
 const radius=neighbor>0&&neighbor<1?1/Math.sqrt(-2*Math.log(neighbor)):13/12;
 const count=rows?rows.filter(row=>row.visible).length:4;
 const pointer=Math.max(0,Math.min(count-1,pointerIndex)),nearest=Math.round(pointer);
 if(rows){
  const spacing=Math.min((end('item3','y')-end('item0','y'))/3,176/Math.max(1,count-1));
  const restSpacing=Math.min((start('item3','y')-start('item0','y'))/3,110/Math.max(1,count-1));
  const center=(count-1)/2,template=saved('item0','y'),line=saved('line0','width');
  const make=(part:string,property:string,values:(number|string)[],base=template):Track=>({...base,part,property,values,times:[0,1]});
  const tracks:Track[]=[];
  // Keep the marks centered at rest and the label-plus-marks centered when open.
  // Only their inset moves; the rail's pointer hit area covers both positions.
  tracks.push(make('rail','centerInset',[(hoverWidth+144+15-Math.max(normalWidth,currentWidth))/2,0]));
  rows.forEach((row,index)=>{
   const current=row.visible&&row.position===selectedIndex,field=row.visible?Math.exp(-.5*((row.position-pointer)/radius)**2):0,influence=field<.002?0:field,depthScale=Math.pow(.82,row.depth);
   // At rest every mark shares one right edge.
   const rest=current?currentWidth:normalWidth,activeWidth=Math.max(rest,hoverWidth*depthScale);
   tracks.push(make('item'+index,'y',[(row.position-center)*restSpacing,(row.position-center)*spacing]));
   tracks.push(make('item'+index,'x',[0,-row.depth*7]));
   tracks.push(make('item'+index,'opacity',[row.visible?1:0,row.visible?1:0]));
   tracks.push(make('line'+index,'width',[rest,Number((rest+(activeWidth-rest)*influence).toFixed(3))],line));
   tracks.push(make('line'+index,'opacity',[current?currentOpacity:lowOpacity,Number(Math.max(current?currentOpacity:lowOpacity,lowOpacity+(highOpacity-lowOpacity)*influence).toFixed(3))],saved('line0','opacity')));
   tracks.push(make('line'+index,'scaleY',[lowScale,Number((lowScale+(highScale-lowScale)*influence).toFixed(3))],saved('line0','scaleY')));
  });
  // Keep the label inside the shared 230px stage even at the largest size.
  const labelLimit=Math.max(0,115/config.scale-28),labelY=Math.max(-labelLimit,Math.min(labelLimit,(nearest-center)*spacing));
  for(const original of config.tracks.filter(track=>track.part==='panel'))tracks.push(original.property==='y'?{...original,values:original.times.map(()=>labelY)}:{...original});
  return {...config,tracks};
 }
 const tracks=config.tracks.map((track):Track=>{
  const match=track.part.match(/^line([0-3])$/);
  if(match){
   const index=Number(match[1]),current=index===selectedIndex;
   const influence=Math.exp(-.5*((index-pointer)/radius)**2);
   const rest=track.property==='width'?(current?currentWidth:normalWidth):track.property==='opacity'?(current?currentOpacity:lowOpacity):lowScale;
   const target=track.property==='width'?rest+(hoverWidth-rest)*influence:track.property==='opacity'?Math.max(current?currentOpacity:lowOpacity,lowOpacity+(highOpacity-lowOpacity)*influence):lowScale+(highScale-lowScale)*influence;
   return {...track,values:track.times.map(time=>Number((rest+(target-rest)*time).toFixed(6)))};
  }
  if(track.part==='panel'&&track.property==='y')return {...track,values:track.times.map(()=>end('item'+nearest,'y'))};
  return track;
 });
 return {...config,tracks};
}
