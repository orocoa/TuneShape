import {SOUNDS,schedule,type SoundName} from './sounds';
let context:AudioContext|undefined;
/** Source synthesis, with an instance gain bus. Never unlock on mount/autoplay. */
export function createBenchAudio(){
 let bus:GainNode|undefined,dead=false,last=-Infinity,count=0;const nodes=new Set<AudioScheduledSourceNode>();
 const mute=()=>{for(const src of nodes){try{src.stop()}catch{}}nodes.clear();if(bus&&context){bus.gain.cancelScheduledValues(context.currentTime);bus.gain.setValueAtTime(0,context.currentTime)}};
 return {play(name:SoundName,volume:number,event?:Event){if(dead||!event?.isTrusted||document.hidden||volume<=0||performance.now()-last<65)return;last=performance.now();try{context??=new AudioContext();if(context.state==='suspended')void context.resume();bus??=context.createGain();bus.disconnect();bus.connect(context.destination);bus.gain.setValueAtTime(volume,context.currentTime);
   // schedule() accepts a destination bridge so every source remains under this instance's mute bus.
   const sources=schedule(context,SOUNDS[name],context.currentTime+.005,1,1,bus);sources.forEach(src=>{nodes.add(src);src.addEventListener('ended',()=>nodes.delete(src),{once:true})});count++;
  }catch{/* Audio is optional; native interaction still completes. */}},mute,getState:()=>({created:Boolean(bus),count,contextState:context?.state??'uncreated'}),destroy(){dead=true;mute();bus?.disconnect()} };
}
