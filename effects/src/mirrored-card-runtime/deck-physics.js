export const mod=(value,count)=>((value%count)+count)%count;
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// Screen-pixel input history, independent of frame rate and card dimensions.
// Stationary release events never dilute the most recent movement velocity.
export class PointerVelocity {
 constructor(){this.reset(0,0);}
 reset(x,time){this.points=[{x,time}];this.lastMove=time;this.direction=0;this.turn=null;}
 add(x,time){
  const last=this.points.at(-1);
  if(time<last.time)return;
  const delta=x-last.x;
  if(Math.abs(delta)<.1)return;
  const direction=Math.sign(delta),point={x,time};
  if(time-last.time>140||!this.direction){
   // Sparse input after a hold still carries its last physical movement.
   this.points=[{x:last.x,time:Math.max(last.time,time-32)}];
   this.direction=direction;this.turn=null;
  }else if(direction!==this.direction){
   // A 1px release tremor must not erase a throw. A real reversal takes over
   // from its turning point as soon as it travels 3px in the new direction.
   this.turn??={start:last,points:[]};this.turn.points.push(point);
   if(Math.abs(x-this.turn.start.x)>=3){
    this.points=[this.turn.start,...this.turn.points.slice(0,-1)];
    this.direction=direction;this.turn=null;
   }
  }else this.turn=null;
  this.lastMove=time;this.points.push(point);
  while(this.points.length>2&&this.points[1].time<time-70)this.points.shift();
 }
 read(time){
  const age=time-this.lastMove;
  if(age>=180)return 0;
  const first=this.points[0],last=this.points.at(-1);
  const velocity=(last.x-first.x)/Math.max(8,last.time-first.time);
  // A touch release can arrive one or more display frames after the final
  // movement. Preserve the throw briefly, then dissipate it if the hand stops.
  return clamp(velocity,-4,4)*clamp((180-age)/100,0,1);
 }
}

export function releaseTarget({position,start,velocity,distance,width,cancelled=false}){
 if(cancelled)return Math.round(position);
 const origin=Math.round(start),direction=Math.sign(-velocity);
 const flick=Math.abs(velocity)>=.22&&Math.abs(distance)>=6;
 if(flick){
  const nearest=Math.round(position);
  if(nearest!==origin&&Math.sign(nearest-origin)===direction&&Math.abs(position-nearest)<.025)return nearest;
  return direction>0?Math.floor(position)+1:Math.ceil(position)-1;
 }
 const travel=position-start,threshold=Math.min(.17,72/width);
 if(Math.abs(travel)>=threshold)return origin+Math.sign(travel)*Math.max(1,Math.round(Math.abs(travel)));
 return Math.round(position);
}

export const THROW_SPRING=Object.freeze({stiffness:190,damping:26});
export const RETURN_SPRING=Object.freeze({stiffness:420,damping:40});

// Brake a fast release near its landing more firmly without truncating its
// incoming velocity. Choose this once per release; no per-frame retuning.
export function settleProfile(position,target,velocity,returning=false){
 const base=returning?RETURN_SPRING:THROW_SPRING,distance=target-position;
 if(velocity*distance<=0)return base;
 const frequency=clamp(Math.abs(velocity)*.65/Math.max(Math.abs(distance),.06),Math.sqrt(base.stiffness),100);
 if(frequency===Math.sqrt(base.stiffness))return base;
 return {stiffness:frequency*frequency,damping:frequency*1.98};
}

// Exact solution: position and velocity belong to one spring, never to a
// competing CSS/WAAPI animation. A new pointer can take over at any instant.
export function advanceSpring(position,velocity,target,dt,profile=THROW_SPRING){
 const decay=profile.damping/2,frequency=Math.sqrt(profile.stiffness-decay*decay),offset=position-target;
 const envelope=Math.exp(-decay*dt),cos=Math.cos(frequency*dt),sin=Math.sin(frequency*dt);
 const b=(velocity+decay*offset)/frequency;
 return {
  position:target+envelope*(offset*cos+b*sin),
  velocity:envelope*(-offset*frequency*sin+b*frequency*cos-decay*(offset*cos+b*sin))
 };
}

// Buttons and autoplay describe a deliberate placement, not a physical throw.
// A quintic trajectory keeps the same position/RAF owner and can be regrabbed.
export function createControlMotion(start,target,velocity=0){
 const distance=target-start,length=Math.abs(distance);
 const duration=length<1e-9?0:.98+.16*Math.min(Math.max(length-1,0),4);
 // Carry an aligned control retarget, bounded to keep the path monotone.
 const speed=velocity*distance>0?Math.sign(distance)*Math.min(Math.abs(velocity),2*length/duration):0;
 const tangent=speed*duration;
 return {start,target,duration,tangent,a:10*distance-6*tangent,b:-15*distance+8*tangent,c:6*distance-3*tangent};
}
export function sampleControlMotion(plan,elapsed){
 const t=plan.duration?clamp(elapsed/plan.duration,0,1):1;
 if(t===1)return {position:plan.target,velocity:0,done:true};
 return {
  position:plan.start+plan.tangent*t+plan.a*t**3+plan.b*t**4+plan.c*t**5,
  velocity:(plan.tangent+3*plan.a*t*t+4*plan.b*t**3+5*plan.c*t**4)/plan.duration,
  done:false
 };
}
