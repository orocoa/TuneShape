import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterReadingMetrics,chapterReadingProgress,chapterProgressEngineCode} from './chapter-progress-nav';
import {defaultChapterProgress,validateChapterProgress} from './chapter-progress-nav-settings';
import {defaultHistory,historyDescription,historyMotion,parseHistory,serializeHistory} from './history-model';
test('chapter progress follows real scroll anchors forward and backward, including the final viewport',()=>{
 const anchors=chapterReadingMetrics([0,480,960],1100);assert.deepEqual(anchors,[0,480,960]);
 assert.deepEqual(chapterReadingProgress(anchors,240,1100),{active:0,values:[.5,0,0]});
 assert.deepEqual(chapterReadingProgress(anchors,720,1100),{active:1,values:[1,.5,0]});
 assert.deepEqual(chapterReadingProgress(anchors,1030,1100),{active:2,values:[1,1,.5]});
 assert.deepEqual(chapterReadingProgress(anchors,1100,1100),{active:2,values:[1,1,1]});
 assert.deepEqual(chapterReadingProgress(anchors,120,1100),{active:0,values:[.25,0,0]});
 assert.deepEqual(chapterReadingMetrics([0,480,960],900),[0,480,900]);
 assert.throws(()=>chapterReadingMetrics([0,NaN],100));
});
test('chapter settings preserve IDs, reject unknown fields, duplicate IDs, sparse arrays and invalid themes',()=>{
 const copy=validateChapterProgress(defaultChapterProgress);copy.sections[0].label='Changed';assert.notEqual(copy.sections[0].label,defaultChapterProgress.sections[0].label);
 for(const bad of [{...defaultChapterProgress,unknown:true},{...defaultChapterProgress,sections:[defaultChapterProgress.sections[0],defaultChapterProgress.sections[0]]},{...defaultChapterProgress,theme:'made-up'},{...defaultChapterProgress,fontSize:NaN},{...defaultChapterProgress,sections:Array(2)}])assert.throws(()=>validateChapterProgress(bad));
});
test('chapter configuration, timings and portable engine stay aligned without portfolio dependencies',()=>{
 const c=defaultHistory('chapter-progress-nav');assert.deepEqual(parseHistory(serializeHistory(c)),c);assert.equal(c.durationMs,370);assert.equal(c.chapterProgressNav!.fadeOutMs,140);
 const motion=historyMotion(c) as ReturnType<typeof import('./chapter-progress-nav-spec').chapterProgressMotion>;assert.deepEqual(motion.adapters.chapterProgressNav.settings,c.chapterProgressNav);assert.equal(motion.adapters.chapterProgressNav.runtime.durationMs,370);
 assert.match(historyDescription(c).sections.find(s=>s.label==='时序')!.text,/230 ms/);
 assert.equal(typeof Function('__name',chapterProgressEngineCode+';return createChapterProgressNav')((v:unknown)=>v),'function');
 assert.doesNotMatch(chapterProgressEngineCode,/\/Users\/|journeyDemo|chapterDemo|profileDemo|PersonalWeb|requestAnimationFrame\(render\)/);
 const bad={...c,durationMs:80};assert.throws(()=>parseHistory(JSON.stringify(bad)));assert.throws(()=>parseHistory(JSON.stringify({...c,loop:true})));
});
