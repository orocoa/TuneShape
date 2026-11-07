import {clamp} from './deck-physics.js';

// Pull just clear of the receiving card, then tuck into the gap below it.
// All values describe the apparent pose, independent of CSS perspective depth.
export const CARD_HANDOFF=.58;
export const CARD_DEPTH_START=.545,CARD_DEPTH_END=.615;
const JOIN=.24;
const keys=['x','y','rotate','scale'],rest={x:0,y:0,rotate:0,scale:1};
const peak={x:-.90,y:-.065,rotate:-12,scale:.84};
const smooth=t=>t*t*t*(10+t*(-15+6*t));
function lead(p){
 const bend=Math.sqrt(2*p),projection=1+p/12;
 return {
  x:-(8-.75*p+96*bend)*p/(100*projection),
  y:(-.25*bend*p-p/24)/projection,
  rotate:-2*p-28*p*bend,
  scale:(1-.5*bend*p)/projection
 };
}
const join=lead(JOIN),epsilon=1e-4;
const tangent=Object.fromEntries(keys.map(key=>[key,(lead(JOIN+epsilon)[key]-lead(JOIN-epsilon)[key])/(2*epsilon)]));
const curvature=Object.fromEntries(keys.map(key=>[key,(lead(JOIN+epsilon)[key]-2*join[key]+lead(JOIN-epsilon)[key])/(epsilon*epsilon)]));
const zero={x:0,y:0,rotate:0,scale:0};
const left=CARD_HANDOFF-JOIN,right=1-CARD_HANDOFF;
// A shared turning acceleration makes the reversal round, rather than a stop
// followed by a separate return. Match acceleration at both joins as well.
const turning=Object.fromEntries(keys.map(key=>[key,(6*(join[key]-peak[key])/(left*left)+2*tangent[key]/left+6*(rest[key]-peak[key])/(right*right))/2]));
function blend(a,b,va,vb,aa,ab,t,span){
 return Object.fromEntries(keys.map(key=>{
  const d=b[key]-a[key],v0=va[key]*span,v1=vb[key]*span,a0=aa[key]*span*span,a1=ab[key]*span*span;
  const c3=10*d-6*v0-4*v1-1.5*a0+.5*a1,c4=-15*d+8*v0+7*v1+1.5*a0-a1,c5=6*d-3*v0-3*v1-.5*a0+.5*a1;
  return [key,a[key]+t*(v0+t*(a0/2+t*(c3+t*(c4+t*c5))))];
 }));
}
export function extractionPose(progress,direction=1){
 const p=clamp(progress,0,1);
 const pose=p<=JOIN?lead(p):p<=CARD_HANDOFF?
  blend(join,peak,tangent,zero,curvature,turning,(p-JOIN)/left,left):
  blend(peak,rest,zero,zero,turning,zero,(p-CARD_HANDOFF)/right,right);
 const fan=Math.sin(Math.PI*p),front=24*smooth(clamp(p/JOIN,0,1));
 // The receiving card is the closest neighbour after halfway. Its following
 // neighbour is one card deeper, so the midpoint is a stable insertion slot.
 const receiver=-(1-p)*100*fan,insertion=receiver-50*fan;
 const approaching=smooth(clamp((p-CARD_DEPTH_START)/(CARD_HANDOFF-CARD_DEPTH_START),0,1));
 const returning=smooth(clamp((p-CARD_HANDOFF)/(CARD_DEPTH_END-CARD_HANDOFF),0,1));
 const z=p<=CARD_HANDOFF?front+(receiver-front)*approaching:receiver+(insertion-receiver)*returning;
 const depth=p<=CARD_HANDOFF?approaching*.5:.5+returning*.5;
 // Tilt while lifted, then become coplanar before passing between neighbours.
 const lift=p<CARD_DEPTH_START?Math.sin(Math.PI*p/CARD_DEPTH_START)**3:0;
 const tuck=p>CARD_DEPTH_END?Math.sin(Math.PI*(p-CARD_DEPTH_END)/(1-CARD_DEPTH_END))**3:0;
 return {...pose,x:pose.x*direction,rotate:pose.rotate*direction,z,behind:p>=CARD_HANDOFF,depth,lift,tuck,rotateX:-1.6*lift-.25*tuck,rotateY:direction*(2.8*lift+.45*tuck)};
}

// Compensate centre depth while retaining the slight foreshortening from tilt.
// At handoff the card is flat, so switching layers cannot change its size.
export function extractionTransform(pose,offset,perspective=1200){
 const inverse=1-pose.z/perspective;
 const x=pose.x*inverse*100,y=(pose.y*inverse+.5*(inverse-1))*100;
 return `translate3d(calc(${-offset}px + (${x}%)),${y}%,${pose.z}px) rotateZ(${pose.rotate}deg) rotateY(${pose.rotateY}deg) rotateX(${pose.rotateX}deg) scale(${pose.scale*inverse})`;
}
