import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {interactionEffects,validateInteractionEffects} from './lightning-island/interaction-effects.ts';

test('extended island configuration matches the implementation Prompt and is independently copied',()=>{
 const prompt=readFileSync(new URL('../prompts/lightning-island/interaction-effects.md',import.meta.url),'utf8');
 const match=prompt.match(/```json\r?\n([\s\S]*?)\r?\n```/);
 assert.ok(match,'the Prompt includes the complete extension configuration');
 assert.deepEqual(validateInteractionEffects(JSON.parse(match[1])),interactionEffects);
 const copy=validateInteractionEffects(interactionEffects);
 copy.oven.ready.keyframes[1].filter='none';
 assert.notEqual(copy.oven.ready.keyframes[1].filter,interactionEffects.oven.ready.keyframes[1].filter);
});

test('extended animation config rejects invalid timing, offsets and properties before playback',()=>{
 for(const change of [
  (c:any)=>c.oven.ready.durationMs=-1,
  (c:any)=>c.feeding.sparkles.delayMs=Infinity,
  (c:any)=>c.label.steps=1.5,
  (c:any)=>c.oven.baking.keyframes[1].offset=0,
  (c:any)=>c.live.keyframes[2].offset=.9,
  (c:any)=>c.feeding.heart.keyframes[1].opacity=2,
  (c:any)=>c.feeding.bounce.keyframes[0].width='100px',
  (c:any)=>c.highlights[1].id=c.highlights[0].id,
  (c:any)=>c.kind='basic-modal',
 ]){
  const candidate=structuredClone(interactionEffects);change(candidate);
  assert.throws(()=>validateInteractionEffects(candidate));
 }
});

test('source-derived highlight and feedback timing contracts remain distinct',()=>{
 assert.deepEqual(interactionEffects.highlights.map(p=>[p.id,p.durationMs,p.easing]),[
  ['building',120,'ease'],['furniture',160,'ease'],['cafe',140,'linear'],
 ]);
 assert.equal(interactionEffects.oven.baking.durationMs,900);
 assert.equal(interactionEffects.oven.ready.durationMs,700);
 assert.equal(interactionEffects.feeding.bounce.durationMs,550);
 assert.equal(interactionEffects.feeding.sparkles.delayMs,350);
 assert.equal(interactionEffects.feeding.sparkles.durationMs,2100);
 assert.equal(interactionEffects.feeding.heart.durationMs,2200);
});
