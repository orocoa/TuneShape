import type {NativeEffectRuntime} from '../native-effect-tools';
/** Per-instance virtual time: source RAFs and intervals consume one rate, and
 * pause keeps their pending callbacks without advancing elapsed time. */
export function createBenchClock(initial:NativeEffectRuntime,onChange:(running:boolean)=>void){
 let runtime=initial,frame=0,last=0,waitingLast=0,time=0,waitingTime=0,id=0,dead=false,activity=0,reported=false;
 const queue=new Map<number,FrameRequestCallback>(),timers=new Map<number,{fn:()=>void;at:number;ms:number;repeat:boolean;durationIndependent:boolean}>();
 const allowed=()=>!dead&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&!document.hidden&&runtime.speed>0;
 let observedAllowed=allowed();
 const report=()=>{const busy=allowed()&&(queue.size>0||activity>time);if(busy!==reported){reported=busy;onChange(busy)}};
 function wake(){report();if(!frame&&allowed()&&(queue.size||timers.size||activity>time))frame=requestAnimationFrame(tick)}
 function tick(now:number){frame=0;if(!allowed()){observedAllowed=false;last=waitingLast=0;report();return}const elapsed=last?Math.max(0,now-last):0,dt=Math.min(48,elapsed),waitingElapsed=waitingLast?Math.max(0,now-waitingLast):0;last=waitingLast=now;waitingTime+=waitingElapsed*runtime.speed;time+=dt*runtime.speed*600/Math.max(120,runtime.durationMs);const batch=[...queue.values()];queue.clear();batch.forEach(fn=>fn(time));for(const [key,t]of timers){const elapsed=t.durationIndependent?waitingTime:time;if(elapsed>=t.at){if(t.repeat)t.at=elapsed+t.ms;else timers.delete(key);t.fn()}}wake()}
 const cancel=(handle:number)=>{queue.delete(handle);timers.delete(handle);if(!queue.size&&!timers.size&&activity<=time){cancelAnimationFrame(frame);frame=0;last=waitingLast=0}report()};
 const timer=(fn:()=>void,ms:number,repeat:boolean,durationIndependent=false)=>{const key=++id;timers.set(key,{fn,at:(durationIndependent?waitingTime:time)+ms,ms,repeat,durationIndependent});wake();return key};
 return {performance:{now:()=>time},request:(fn:FrameRequestCallback)=>{const key=++id;queue.set(key,fn);wake();return key},cancel,setInterval:(fn:()=>void,ms:number,options?:{durationIndependent?:boolean})=>timer(fn,ms,true,options?.durationIndependent),clearInterval:cancel,setTimeout:(fn:()=>void,ms:number)=>timer(fn,ms,false),
  activity(ms=600){activity=time+ms;wake()},
  update(next:NativeEffectRuntime){
   const activationChanged=next.enabled!==runtime.enabled||next.paused!==runtime.paused||next.reduced!==runtime.reduced,speedChanged=next.speed!==runtime.speed,durationChanged=next.durationMs!==runtime.durationMs;
   runtime=next;const available=allowed(),availabilityChanged=available!==observedAllowed;observedAllowed=available;
   // React/CSS synchronization can run every frame. Preserve both anchors and
   // the already scheduled RAF unless the actual playback inputs change.
   if(activationChanged||availabilityChanged||speedChanged||durationChanged){cancelAnimationFrame(frame);frame=0;last=0}
   if(activationChanged||availabilityChanged||speedChanged)waitingLast=0;
   wake();
  },
  reset(){queue.clear();timers.clear();activity=0;cancelAnimationFrame(frame);frame=0;last=waitingLast=0;report()},
  getState:()=>({time,pending:queue.size,timers:timers.size,running:reported}),
  destroy(){dead=true;queue.clear();timers.clear();cancelAnimationFrame(frame);frame=0;onChange(false)},
 };
}
