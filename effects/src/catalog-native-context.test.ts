import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogEngine} from './catalog-native-context';
import type {CatalogNativeControl} from './catalog-native-context';

function fixture(){
 const seen:{runtime?:Record<string,unknown>;settings?:unknown;settles:number;manual:number;running:boolean[]}={settles:0,manual:0,running:[]};
 const control:CatalogNativeControl={state:{current:{available:true,playing:false,manualAllowed:true,preserveManual:false}},engines:{current:new Set()},interact(){seen.manual++;control.state.current.preserveManual=true},report(value){seen.running.push(value)}};
 const instance={update(settings:unknown,runtime:Record<string,unknown>){seen.settings=settings;seen.runtime=runtime},settle(){seen.settles++},destroy(){}};
 return{seen,control,engine:catalogEngine(instance,()=>control),instance};
}
test('an idle catalog control accepts the first native interaction without starting a gallery demo',()=>{
 const {seen,engine}=fixture();let original=0;const settings={value:17};
 engine.update(settings,{enabled:false,paused:false,reduced:false,speed:1,gallery:true,onInteract:()=>original++});
 assert.equal(seen.runtime?.enabled,true);assert.equal(seen.runtime?.gallery,false);assert.equal(seen.settings,settings);
 (seen.runtime?.onInteract as ()=>void)();assert.equal(original,1);assert.equal(seen.manual,1);
});
test('manual takeover preserves the engine inertia until an explicit stop or departure',()=>{
 const {seen,engine,control}=fixture();control.interact();engine.settle();assert.equal(seen.settles,0);
 control.state.current.preserveManual=false;engine.settle();assert.equal(seen.settles,1);
 control.state.current.preserveManual=true;control.state.current.available=false;engine.settle();assert.equal(seen.settles,2);
});
test('actual engine motion reaches both the catalog transport and its original renderer callback',()=>{
 const {seen,engine}=fixture(),original:boolean[]=[];
 engine.update({}, {enabled:true,speed:1,onRunning:(value:boolean)=>original.push(value)});
 const report=seen.runtime?.onRunning as (value:boolean)=>void;report(true);report(false);
 assert.deepEqual(seen.running,[true,false]);assert.deepEqual(original,[true,false]);
});
test('offscreen catalog engines stay disabled, including manual controls',()=>{
 const {seen,engine,control}=fixture();control.state.current.available=false;control.state.current.playing=true;
 engine.update({}, {enabled:true,speed:1});assert.equal(seen.runtime?.enabled,false);
});
test('the detail runtime and settings pass through unchanged outside a catalog',()=>{
 const {instance,seen}=fixture(),engine=catalogEngine(instance,()=>null),settings={value:4},runtime={enabled:false,speed:1,gallery:true};
 engine.update(settings,runtime);assert.equal(seen.runtime,runtime);assert.equal(seen.settings,settings);engine.settle();assert.equal(seen.settles,1);
});
