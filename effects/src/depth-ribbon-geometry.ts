/** Original closed curves and constant-distance sampling, shared by runtime and export. */
function depthRibbonGeometry(){
 type V={x:number;y:number;z:number};
 const add=(a:V,b:V):V=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),sub=(a:V,b:V):V=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),mul=(a:V,n:number):V=>({x:a.x*n,y:a.y*n,z:a.z*n});
 const length=(a:V)=>Math.hypot(a.x,a.y,a.z),unit=(a:V):V=>length(a)>1e-8?mul(a,1/length(a)):{x:1,y:0,z:0},dot=(a:V,b:V)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a:V,b:V):V=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
 const mix=(a:V,b:V,t:number)=>add(mul(a,1-t),mul(b,t));
 function point(kind:string,t:number,count=72):V{const k=count/72;if(kind==='knot')return {x:Math.sin(t*2)*(2+Math.cos(t*3))*2.7*k,y:Math.sin(t*3)*2*k,z:Math.cos(t*2)*(2+Math.cos(t*3))*2.7*k};if(kind==='wave')return {x:8*Math.cos(t)*k,y:1.6*Math.sin(t*3)*k,z:5*Math.sin(t)*k};return {x:8*Math.sin(t)*k,y:(Math.cos(t)*1.3+Math.sin(t+.5)*.6)*k,z:4.5*Math.sin(t*2)*k}}
 function arc(kind:string,count=72){
  const points=Array.from({length:769},(_,i)=>point(kind,i/768*Math.PI*2,count)),distances=[0];for(let i=1;i<points.length;i++)distances.push(distances[i-1]+length(sub(points[i],points[i-1])));const total=distances.at(-1)!;
  const at=(distance:number)=>{const d=((distance%total)+total)%total;let lo=0,hi=distances.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(distances[mid]<=d)lo=mid;else hi=mid}return mix(points[lo],points[hi],(d-distances[lo])/(distances[hi]-distances[lo]))};
  return {points,total,spacing:total/count,at,tangent:(d:number)=>unit(sub(at(d+total*.0002),at(d-total*.0002)))};
 }
 function order(count:number,size:number,seed:number){let state=(seed+1)*2654435761>>>0;const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296};const result:number[]=[];while(result.length<count){const pass=Array.from({length:size},(_,i)=>i);for(let i=pass.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[pass[i],pass[j]]=[pass[j],pass[i]]}result.push(...pass)}return result.slice(0,count)}
 return {point,arc,order,add,sub,mul,length,unit,dot,cross,mix};
}
export const ribbonGeometry=depthRibbonGeometry();
export const depthRibbonGeometryCode=`const ribbonGeometry=((__name)=>(${depthRibbonGeometry.toString()}))((fn)=>fn)();`;
