import test from 'node:test';
import assert from 'node:assert/strict';
import {createNativeGalleryReplay,nativeGalleryRuntime} from './native-gallery-playback';
import type {NativeEffectRuntime} from './native-effect-tools';

test('an idle native card regains its real runtime on hover; reduced motion and saved loop are preserved',()=>{
 const saved:NativeEffectRuntime={enabled:true,paused:false,reduced:false,speed:1,durationMs:2000,loop:false,language:'zh'};
 const before=structuredClone(saved);
 assert.equal(nativeGalleryRuntime(saved,true,false).enabled,false);
 const hovered=nativeGalleryRuntime(saved,true,true);
 assert.equal(hovered.enabled,true);assert.equal(hovered.reduced,false);assert.equal(hovered.loop,false);
 assert.equal(nativeGalleryRuntime(saved,false,false).enabled,true); // Direct inputs remain available.
 for(const enabled of [true,false])for(const autoPlay of [true,false]){
  assert.equal(nativeGalleryRuntime({...saved,enabled},true,autoPlay).enabled,enabled&&autoPlay);
  const reduced=nativeGalleryRuntime({...saved,enabled,reduced:true},true,autoPlay);
  assert.equal(reduced.enabled,enabled);assert.equal(reduced.reduced,true); // Static controls still work.
 }
 assert.deepEqual(saved,before);
});

function fixture(){
 let starts=0,settles=0,id=0;
 const pending=new Map<ReturnType<typeof setTimeout>,{fn:()=>void;ms:number}>();
 const playback=createNativeGalleryReplay({replay:()=>{starts++},settle:()=>{settles++;playback.onRunning(false)},delay:()=>700,
  schedule:(fn,ms)=>{const handle=++id as unknown as ReturnType<typeof setTimeout>;pending.set(handle,{fn,ms});return handle},cancel:handle=>{pending.delete(handle)}});
 const complete=()=>playback.onRunning(false),start=()=>playback.onRunning(true);
 function flush(){const jobs=[...pending.values()];pending.clear();for(const job of jobs)job.fn()}
 return {playback,pending,complete,start,flush,counts:()=>({starts,settles})};
}

test('finite native cards repeat only after actual completion and a readable dwell',()=>{
 const f=fixture();f.playback.setActive(false);assert.deepEqual(f.counts(),{starts:0,settles:0});
 f.playback.setActive(true);f.start();assert.equal(f.pending.size,0);
 f.playback.setActive(true);assert.equal(f.counts().starts,1);
 f.complete();assert.deepEqual([...f.pending.values()].map(job=>job.ms),[700]);
 f.flush();assert.equal(f.counts().starts,2);
});

test('leave, offscreen/background deactivation and unmount cancel pending repeats and settle readable content',()=>{
 const f=fixture();f.playback.setActive(true);f.start();f.complete();assert.equal(f.pending.size,1);
 f.playback.setActive(false);assert.equal(f.pending.size,0);assert.equal(f.counts().settles,1);
 f.flush();f.complete();f.flush();assert.equal(f.counts().starts,1);
 f.playback.setActive(true);assert.equal(f.counts().starts,2);
 f.start();f.playback.setActive(false);assert.equal(f.counts().settles,2);
});

test('manual replay during dwell cancels the old timer instead of interrupting the new entrance',()=>{
 const f=fixture();f.playback.setActive(true);f.start();f.complete();assert.equal(f.pending.size,1);
 f.start();assert.equal(f.pending.size,0);f.flush();assert.equal(f.counts().starts,1);
 f.complete();f.flush();assert.equal(f.counts().starts,2);
});
