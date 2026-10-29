export type CurvePoint=[number,number];
/** Legacy arrays keep fixed endpoints; custom endpoints are explicit, serializable data. */
export type BezierCurve=number[]|{start:CurvePoint;handles:number[];end:CurvePoint};
export type SegmentedCurve={start:CurvePoint;segments:{handles:number[];end:CurvePoint}[]};
export type EasingCurve=BezierCurve|SegmentedCurve;
type BezierSegment={start:CurvePoint;handles:number[];end:CurvePoint};
function hasKeys(value:unknown,keys:string[]):value is Record<string,unknown>{
 return !!value&&typeof value==='object'&&Object.getPrototypeOf(value)===Object.prototype&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>Object.hasOwn(Object.getOwnPropertyDescriptor(value,key)??{},'value'));
}
function validSegmentTime(start:number,end:number,handles:number[]){
 if(handles.length!==4)return handles.every((x,i)=>i%2!==0||x>=start&&x<=end);
 // A subdivided crossed cubic can have a handle outside its anchor interval while x(t) stays monotone.
 const p=handles[0],q=handles[2],a=end-3*q+3*p-start,b=2*(q-2*p+start),c=p-start;
 const derivative=(t:number)=>a*t*t+b*t+c,vertex=a>0?-b/(2*a):-1;
 return Math.min(c,derivative(1),vertex>0&&vertex<1?derivative(vertex):Infinity)>=-1e-9;
}
function validateHandles(value:unknown):number[]{
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>24||value.length%2!==0||Reflect.ownKeys(value).length!==value.length+1||Array.from({length:value.length},(_,i)=>i).some(i=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,String(i))??{},'value')))throw Error('easing 必须是连续的 x/y 控制点数组，最多 12 个控制点。');
 value.forEach((v,i)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<(i%2?-1:0)||v>(i%2?2:1))throw Error('easing 控制点超出允许范围。');if(value.length!==4&&i%2===0&&i>0&&v<value[i-2])throw Error('easing 控制点必须按时间排列。')});
 return [...value];
}
export function validateEasing(value:unknown):EasingCurve{
 if(Array.isArray(value))return validateHandles(value);
 if(hasKeys(value,['start','segments'])){
  const endpoint=(point:unknown):CurvePoint=>{const pair=validateHandles(point);if(pair.length!==2)throw Error('easing 端点须为一组 x/y 坐标。');return pair as CurvePoint};
  const start=endpoint(value.start),source=value.segments;
  if(!Array.isArray(source)||Object.getPrototypeOf(source)!==Array.prototype||source.length<1||source.length>12||Reflect.ownKeys(source).length!==source.length+1||Array.from({length:source.length},(_,i)=>i).some(i=>!Object.hasOwn(Object.getOwnPropertyDescriptor(source,String(i))??{},'value')))throw Error('easing 须包含 1–12 段连续曲线。');
  let previous=start,total=0;
  const segments=source.map(segment=>{
   if(!hasKeys(segment,['handles','end']))throw Error('easing 分段须包含 handles 和 end。');
   const handles=validateHandles(segment.handles),end=endpoint(segment.end);total+=handles.length/2;
   if(end[0]-previous[0]<.009999||!validSegmentTime(previous[0],end[0],handles)||total>48)throw Error('easing 分段时间或控制点超出范围。');
   previous=end;return {handles,end};
  });
  return {start,segments};
 }
 const keys=['start','handles','end'];
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,key)??{},'value')))throw Error('easing 自定义曲线须包含 start、handles 和 end。');
 const source=value as Record<string,unknown>,handles=validateHandles(source.handles);
 const endpoint=(point:unknown):CurvePoint=>{const pair=validateHandles(point);if(pair.length!==2)throw Error('easing 端点须为一组 x/y 坐标。');return pair as CurvePoint};
 const start=endpoint(source.start),end=endpoint(source.end);
 if(end[0]-start[0]<.009999||handles.some((x,i)=>i%2===0&&(x<start[0]||x>end[0])))throw Error('easing 终点须晚于起点，控制点须位于两个端点之间。');
 return {start,handles,end};
}
export function curvePoints(curve:EasingCurve):CurvePoint[]{
 if(!Array.isArray(curve)&&'segments' in curve)return [[...curve.start],...curve.segments.flatMap(segment=>[...Array.from({length:segment.handles.length/2},(_,i):CurvePoint=>[segment.handles[i*2],segment.handles[i*2+1]]),[...segment.end] as CurvePoint])];
 const handles=Array.isArray(curve)?curve:curve.handles;
 return [Array.isArray(curve)?[0,0]:[...curve.start],...Array.from({length:handles.length/2},(_,i):CurvePoint=>[handles[i*2],handles[i*2+1]]),Array.isArray(curve)?[1,1]:[...curve.end]];
}
export function curveFromPoints(points:CurvePoint[]):EasingCurve{
 const start=points[0],end=points.at(-1)!,handles=points.slice(1,-1).flat();
 return start[0]===0&&start[1]===0&&end[0]===1&&end[1]===1?handles:{start:[...start],handles,end:[...end]};
}
const rounded=(value:number)=>Math.round(value*1000)/1000||0;
export function curveSegments(curve:EasingCurve):BezierSegment[]{
 if(Array.isArray(curve))return [{start:[0,0],handles:[...curve],end:[1,1]}];
 if(!('segments' in curve))return [structuredClone(curve)];
 let start=curve.start;
 return curve.segments.map(segment=>{const next={start:[...start] as CurvePoint,handles:[...segment.handles],end:[...segment.end] as CurvePoint};start=segment.end;return next});
}
function fromSegments(segments:BezierSegment[]):EasingCurve{
 if(segments.length===1&&segments[0].handles.every((x,i)=>i%2||x>=segments[0].start[0]&&x<=segments[0].end[0]))return curveFromPoints([segments[0].start,...Array.from({length:segments[0].handles.length/2},(_,i):CurvePoint=>[segments[0].handles[i*2],segments[0].handles[i*2+1]]),segments[0].end]);
 return {start:[...segments[0].start],segments:segments.map(s=>({handles:[...s.handles],end:[...s.end]}))};
}
export function curveNodes(curve:EasingCurve){
 const segments=curveSegments(curve),nodes:{point:CurvePoint;kind:'anchor'|'control';segment:number;handle:number}[]=[{point:segments[0].start,kind:'anchor',segment:0,handle:-1}];
 segments.forEach((segment,index)=>{
  for(let i=0;i<segment.handles.length;i+=2)nodes.push({point:[segment.handles[i],segment.handles[i+1]],kind:'control',segment:index,handle:i/2});
  nodes.push({point:segment.end,kind:'anchor',segment:index,handle:-1});
 });return nodes;
}
/** Split at the actual curve point using de Casteljau; adding an anchor preserves the path. */
export function addCurveAnchor(curve:EasingCurve,x:number):EasingCurve{
 const segments=curveSegments(curve),index=segments.findIndex(s=>x>s.start[0]+.01&&x<s.end[0]-.01);
 if(index<0||segments.length>=12)return curve;
 const segment=segments[index],points=[segment.start,...Array.from({length:segment.handles.length/2},(_,i):CurvePoint=>[segment.handles[i*2],segment.handles[i*2+1]]),segment.end];
 if(curveNodes(curve).filter(n=>n.kind==='control').length+segment.handles.length/2>48)return curve;
 let low=0,high=1;
 for(let step=0;step<30;step++){
  const t=(low+high)/2,values=points.map(p=>p[0]);
  for(let n=values.length-1;n>0;n--)for(let i=0;i<n;i++)values[i]+=(values[i+1]-values[i])*t;
  if(values[0]<x)low=t;else high=t;
 }
 const t=(low+high)/2,left:CurvePoint[]=[points[0]],right:CurvePoint[]=[points.at(-1)!];let level=points;
 while(level.length>1){level=level.slice(0,-1).map((p,i):CurvePoint=>[p[0]+(level[i+1][0]-p[0])*t,p[1]+(level[i+1][1]-p[1])*t]);left.push(level[0]);right.unshift(level.at(-1)!)}
 const make=(p:CurvePoint[]):BezierSegment=>({start:p[0],handles:p.slice(1,-1).flat(),end:p.at(-1)!});
 segments.splice(index,1,make(left),make(right));return fromSegments(segments);
}
export function addCurveControl(curve:EasingCurve,x:number,y:number):EasingCurve{
 const segments=curveSegments(curve),found=segments.findIndex(s=>x<=s.end[0]),index=found<0?segments.length-1:found,segment=segments[index];
 if(segment.handles.length>=24||curveNodes(curve).filter(n=>n.kind==='control').length>=48)return curve;
 const handles=Array.from({length:segment.handles.length/2},(_,i):CurvePoint=>[segment.handles[i*2],segment.handles[i*2+1]]);
 handles.push([rounded(Math.max(segment.start[0],Math.min(segment.end[0],x))),rounded(Math.max(-1,Math.min(2,y)))]);
 segment.handles=handles.map(([x,y]):CurvePoint=>[Math.max(segment.start[0],Math.min(segment.end[0],x)),y]).sort((a,b)=>a[0]-b[0]).flat();return fromSegments(segments);
}
/** Removing an inner anchor joins the neighboring pieces using their outer tangent handles. */
export function removeCurvePoint(curve:EasingCurve,index:number):EasingCurve{
 const nodes=curveNodes(curve);if(index<=0||index>=nodes.length-1)return curve;
 if(Array.isArray(curve)||!('segments' in curve))return curveFromPoints(curvePoints(curve).filter((_,i)=>i!==index));
 const segments=curveSegments(curve),node=nodes[index];
 if(node.kind==='control'){
  const segment=segments[node.segment];segment.handles.splice(node.handle*2,2);
  if(segment.handles.length!==4)segment.handles=segment.handles.map((n,i)=>i%2?n:Math.max(segment.start[0],Math.min(segment.end[0],n)));
 }
 else{
  const left=segments[node.segment],right=segments[node.segment+1];
  const handles=[...left.handles.slice(0,2),...right.handles.slice(-2)].map((n,i)=>i%2?n:Math.max(left.start[0],Math.min(right.end[0],n)));
  segments.splice(node.segment,2,{start:left.start,handles,end:right.end});
 }
 return fromSegments(segments);
}
export function pointBounds(points:CurvePoint[],index:number):CurvePoint{
 const last=points.length-1;
 if(index===0)return [0,Math.min(points[last][0]-.01,...points.slice(1,last).map(p=>p[0]))];
 if(index===last)return [Math.max(points[0][0]+.01,...points.slice(1,last).map(p=>p[0])),1];
 // Cubic handles may cross in x while their curve remains a valid time function.
 return points.length===4?[points[0][0],points[last][0]]:[points[index-1][0],points[index+1][0]];
}
export function moveCurvePoint(curve:EasingCurve,index:number,x:number,y:number):EasingCurve{
 if(!Array.isArray(curve)&&'segments' in curve){
  const segments=curveSegments(curve),nodes=curveNodes(curve),node=nodes[index];if(!node)return curve;
  if(node.kind==='control'){
   const s=segments[node.segment],local=[s.start,...Array.from({length:s.handles.length/2},(_,i):CurvePoint=>[s.handles[i*2],s.handles[i*2+1]]),s.end],bounds=pointBounds(local,node.handle+1);
   s.handles.splice(node.handle*2,2,Math.max(bounds[0],Math.min(bounds[1],rounded(x))),rounded(Math.max(-1,Math.min(2,y))));
   if(!validSegmentTime(s.start[0],s.end[0],s.handles))s.handles=s.handles.map((n,i)=>i%2?n:Math.max(s.start[0],Math.min(s.end[0],n)));
  }else{
   const first=index===0,last=index===nodes.length-1;
   const min=first?0:segments[node.segment].start[0]+.01,max=last?1:segments[first?0:node.segment+1].end[0]-.01;
   const next:CurvePoint=[Math.max(min,Math.min(max,rounded(x))),rounded(Math.max(-1,Math.min(2,y)))];
   if(first)segments[0].start=next;else{segments[node.segment].end=next;if(!last)segments[node.segment+1].start=next}
   for(const s of segments)s.handles=s.handles.map((n,i)=>i%2?n:Math.max(s.start[0],Math.min(s.end[0],n)));
  }
  return fromSegments(segments);
 }
 const points=curvePoints(curve),[min,max]=pointBounds(points,index);
 points[index]=[rounded(Math.max(min,Math.min(max,x))),rounded(Math.max(-1,Math.min(2,y)))];
 return curveFromPoints(points);
}
export function translateCurve(curve:EasingCurve,dx:number,dy:number):EasingCurve{
 const points=curvePoints(curve),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 dx=Math.max(-Math.min(...xs),Math.min(1-Math.max(...xs),dx));
 dy=Math.max(-1-Math.min(...ys),Math.min(2-Math.max(...ys),dy));
 const move=([x,y]:CurvePoint):CurvePoint=>[rounded(x+dx),rounded(y+dy)];
 if(!Array.isArray(curve)&&'segments' in curve){
  const precise=([x,y]:CurvePoint):CurvePoint=>[Math.max(0,Math.min(1,x+dx)),Math.max(-1,Math.min(2,y+dy))];
  return fromSegments(curveSegments(curve).map(s=>({start:precise(s.start),handles:Array.from({length:s.handles.length/2},(_,i)=>precise([s.handles[i*2],s.handles[i*2+1]])).flat(),end:precise(s.end)})));
 }
 return curveFromPoints(points.map(move));
}
/** Parametric Bezier of arbitrary degree, inverted on x by bisection. Self-contained for export. */
export function evaluateBezier(progress:number,curve:EasingCurve):number{
 let points:number[];
 if(!Array.isArray(curve)&&'segments' in curve){
  let start=curve.start,segment=curve.segments[0];
  for(const candidate of curve.segments){segment=candidate;if(progress<=candidate.end[0])break;start=candidate.end}
  points=[...start,...segment.handles,...segment.end];
 }else points=Array.isArray(curve)?[0,0,...curve,1,1]:[...curve.start,...curve.handles,...curve.end];
 const xs=[],ys=[];
 if(progress<=points[0])return points[1];if(progress>=points[points.length-2])return points[points.length-1];
 for(let i=0;i<points.length;i+=2){xs.push(points[i]);ys.push(points[i+1])}
 let low=0,high=1;
 for(let step=0;step<26;step++){
  const t=(low+high)/2,values=xs.slice();
  for(let n=values.length-1;n>0;n--)for(let i=0;i<n;i++)values[i]+=(values[i+1]-values[i])*t;
  if(values[0]<progress)low=t;else high=t;
 }
 const t=(low+high)/2;
 for(let n=ys.length-1;n>0;n--)for(let i=0;i<n;i++)ys[i]+=(ys[i+1]-ys[i])*t;
 return ys[0];
}
const cache=new Map<string,(progress:number)=>number>();
export function motionEasing(curve:EasingCurve):[number,number,number,number]|((progress:number)=>number){
 if(Array.isArray(curve)&&curve.length===4)return [...curve] as [number,number,number,number];
 const key=JSON.stringify(curve);let ease=cache.get(key);
 if(!ease){const points=structuredClone(curve);ease=(progress:number)=>evaluateBezier(progress,points);cache.set(key,ease);if(cache.size>512)cache.delete(cache.keys().next().value!)}
 return ease;
}
export const easingCode=(curve:EasingCurve)=>`(progress) => (${evaluateBezier.toString()})(progress, ${JSON.stringify(curve)})`;
export function easingDescription(curve:EasingCurve){
 if(!Array.isArray(curve)&&'segments' in curve)return `分段贝塞尔曲线，${curve.segments.length-1} 个可拖动锚点、${curve.segments.length} 段；经过 [${[curve.start,...curve.segments.map(s=>s.end)].map(p=>`(${p.map(rounded).join(', ')})`).join(' → ')}]；${curve.segments.reduce((n,s)=>n+s.handles.length/2,0)} 个控制点。X 为时间比例，Y 为进度；端点时间范围外保持端点进度，播放完成时落到目标关键帧`;
 if(!Array.isArray(curve))return `自定义贝塞尔曲线，起点 (${curve.start.join(', ')})、终点 (${curve.end.join(', ')})，${curve.handles.length/2} 个控制点（x/y：[${curve.handles.join(', ')}]）；X 为时间比例，Y 为每段关键帧之间的进度，端点时间范围外保持相应端点的 Y 值；播放完成时落到目标关键帧`;
 return curve.length===4?`三次贝塞尔曲线 cubic-bezier(${curve.join(', ')})`:`自定义 ${curve.length/2} 个控制点的 ${curve.length/2+1} 次贝塞尔曲线（x/y：[${curve.join(', ')}]）`;
}
/** JavaScript export preserves runtime easing functions and Infinity without executable user strings. */
export function stringifyMotion(value:unknown,curve:EasingCurve){
 const functions:string[]=[];
 let text=JSON.stringify(value,(_key,v)=>{if(v===Infinity)return '__TUNESHAPE_INFINITY__';if(typeof v==='function'){functions.push(easingCode(curve));return '__TUNESHAPE_EASING_'+(functions.length-1)+'__'}return v},2);
 text=text.replaceAll('"__TUNESHAPE_INFINITY__"','Infinity');
 functions.forEach((code,i)=>{text=text.replaceAll(JSON.stringify('__TUNESHAPE_EASING_'+i+'__'),code)});return text;
}
