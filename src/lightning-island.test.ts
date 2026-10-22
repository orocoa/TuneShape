import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {motionSpec,parseConfig,serializeConfig} from './model.ts';

for(const [name,component] of [
 ['event-button','button'],
 ['live-drawer','modal'],
 ['update-board','modal'],
] as const){
 test(`Lightning Island ${name}: reusable preset and Prompt stay in sync`,()=>{
  const config=parseConfig(readFileSync(new URL(`../configs/lightning-island/${name}.json`,import.meta.url),'utf8'));
  assert.equal(config.component,component);
  assert.deepEqual(parseConfig(serializeConfig(config)),config);
  const prompt=readFileSync(new URL(`../prompts/lightning-island/${name}.md`,import.meta.url),'utf8');
  const blocks=[...prompt.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(match=>JSON.parse(match[1]));
  assert.equal(blocks.length,2,'Prompt must include the exact configuration and the motion contract');
  assert.deepEqual(blocks[0],config,'Prompt configuration must match the preset used by the demo');
  assert.deepEqual(blocks[1],motionSpec(config),'Prompt motion contract must match the shared renderer');
 });
}
