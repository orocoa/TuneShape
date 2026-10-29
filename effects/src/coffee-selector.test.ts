import test from 'node:test';
import assert from 'node:assert/strict';
import {coffeeWheelDelta,coffeeSnapTarget,coffeeClosingFrame,defaultCoffeeSelector,validateCoffeeSelector,coffeeSelectorEngineCode} from './coffee-selector';
import {defaultHistory,parseHistory,serializeHistory,historyMotion,validateHistory} from './history-model';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {galleryPlayback,interactionSelector} from './effect-behavior';

test('coffee wheel crosses the seam continuously and release momentum is bounded',()=>{
 assert.equal(coffeeWheelDelta(4,0,5),-1);assert.equal(coffeeWheelDelta(0,4.9,5),.09999999999999964);
 assert.equal(coffeeWheelDelta(1,5000.25,5),.75);
 assert.equal(coffeeSnapTarget(1.2,0),1);assert.equal(coffeeSnapTarget(1.2,.006),2);
 assert.equal(coffeeSnapTarget(1.2,10),4);assert.equal(coffeeSnapTarget(1.2,-10),-2);
});
test('selector collapse uses its full response time with soft endpoints and continuous interrupted velocity',()=>{
 for(const duration of [160,460,900]){
  assert.deepEqual(coffeeClosingFrame(1,0,0,duration),{position:1,velocity:0,done:false});
  assert.equal(coffeeClosingFrame(1,0,duration/2,duration).position,.5);
  assert.deepEqual(coffeeClosingFrame(1,0,duration,duration),{position:0,velocity:0,done:true});
  let previous=1;
  for(let i=1;i<=100;i++){const frame=coffeeClosingFrame(1,0,duration*i/100,duration);assert.ok(frame.position<=previous+1e-12&&frame.position>=-1e-12);previous=frame.position}
 }
 const interrupted=coffeeClosingFrame(.4,1.2,0,460);assert.equal(interrupted.position,.4);assert.equal(interrupted.velocity,1.2);
 assert.ok(coffeeClosingFrame(1,0,46,460).position>.99);
});
test('leaving during opening dissipates outward momentum without hitting the full-size clamp',()=>{
 for(const [position,velocity] of [[.2,4],[.45,8],[.68,7],[.9,3],[.999,.1]]){
  assert.equal(coffeeClosingFrame(position,velocity,0,460).velocity,velocity);
  const frames=Array.from({length:461},(_,elapsed)=>coffeeClosingFrame(position,velocity,elapsed,460));
  assert.ok(frames.every(frame=>frame.position<1&&frame.position>=0));
  assert.ok(frames[80].velocity<0,'outward momentum must reverse promptly');
  assert.deepEqual(frames.at(-1),{position:0,velocity:0,done:true});
 }
});
test('coffee settings reject unsafe labels, sparse arrays, invalid default and unknown fields',()=>{
 const initial=structuredClone(defaultCoffeeSelector);assert.deepEqual(validateCoffeeSelector(initial),initial);
 for(const bad of [{...initial,items:['Geisha','Geisha','SL28']},{...initial,items:['Geisha','<img>','SL28']},{...initial,selectedIndex:5},{...initial,blur:NaN},{...initial,unexpected:true},{...initial,items:new Array(5)}])assert.throws(()=>validateCoffeeSelector(bad));
 const clone=validateCoffeeSelector(initial);clone.items[0]='changed';assert.equal(initial.items[0],'Geisha');
});
test('coffee defaults, JSON, description adapter and standalone engine share one configuration',()=>{
 const config=defaultHistory('coffee-selector'),json=serializeHistory(config),motion=historyMotion(config);
 assert.deepEqual(parseHistory(json),config);assert.deepEqual(motion.adapters.coffeeSelector.settings,config.coffeeSelector);
 assert.throws(()=>validateHistory({...config,loop:true}));assert.throws(()=>validateHistory({...defaultHistory('toast'),coffeeSelector:config.coffeeSelector}));
 const factory=Function('__name',coffeeSelectorEngineCode+'; return createCoffeeSelector;')((fn:unknown)=>fn);assert.equal(typeof factory,'function');
 assert.match(json,/Geisha/);assert.doesNotMatch(json,/position|openness|manualSession|gallery|velocity/);
});
test('coffee native gallery activation preserves manual accessibility and reduced-motion settings',()=>{
 const config=defaultHistory('coffee-selector'),before=serializeHistory(config);
 const runtime={enabled:true,paused:false,reduced:false,speed:1,durationMs:config.durationMs,language:'zh' as const};
 for(const active of [false,true,false,true]){const effective=nativeGalleryRuntime(runtime,true,active);assert.equal(effective.enabled,active);assert.equal(effective.reduced,false)}
 assert.equal(nativeGalleryRuntime({...runtime,reduced:true},true,false).enabled,true);
 assert.equal(galleryPlayback(config.recipeId),'loading');assert.equal(interactionSelector(config.recipeId),'.coffee-selector');assert.equal(serializeHistory(config),before);
});
