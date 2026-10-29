import test from 'node:test';
import assert from 'node:assert/strict';
import {historyMotion,defaultHistory,serializeHistoryMotion} from './history-model';
import {sourceNotices} from './source-notices';
test('attributed MIT adaptations carry their permission and attribution into reusable exports',()=>{
 for(const id of ['finger-tap','typewriter','glass-radio','yin-yang','rounded-checks']){
  const motion=historyMotion(defaultHistory(id));assert.deepEqual(motion.sourceNotice,sourceNotices[id]);
  assert.match(serializeHistoryMotion(defaultHistory(id)),/Permission is hereby granted/);assert.match(serializeHistoryMotion(defaultHistory(id)),/THE SOFTWARE IS PROVIDED/);
 }
});
