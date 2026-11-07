import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultMirroredStack,validateMirroredStack,mirroredStackCards,mirroredStackGeometry} from './mirrored-card-stack-settings';
import {mirroredStackEngineCode,mirroredStackSourceNotices} from './mirrored-stack-engine-source';
import {defaultHistory,parseHistory,serializeHistory,historyMotion,historyDescription} from './history-model';
import {extractionPose,extractionTransform} from './mirrored-card-runtime/cards-path.js';
import {advanceSpring,createControlMotion,sampleControlMotion} from './mirrored-card-runtime/deck-physics.js';
test('mirrored stack keeps a gray-only, independently editable configuration and generated neutral cards',()=>{
 const c=validateMirroredStack(defaultMirroredStack);c.cards[0].label='A & B';assert.equal(defaultMirroredStack.cards[0].label,'1');
 const cards=mirroredStackCards(c),svg=decodeURIComponent(cards[0].src.split(',')[1]);assert.match(svg,/A &amp; B/);assert.match(svg,/#424242/);assert.doesNotMatch(svg,/<image|<script|href=/);
 for(const bad of [{...c,unknown:true},{...c,cards:[]},{...c,cards:Array(2)},{...c,cards:[c.cards[0],c.cards[0]]},{...c,cards:[{...c.cards[0],color:'#ff0011'}]},{...c,initialIndex:8}])assert.throws(()=>validateMirroredStack(bad));
});
test('original mirrored extraction is symmetric and uses the current top-card pose in either direction',()=>{
 for(const p of [.1,.24,.32,.58,.75,.99]){const a=extractionPose(p,1),b=extractionPose(p,-1);assert.equal(a.x,-b.x);assert.equal(a.rotate,-b.rotate);for(const key of ['y','scale','z','depth','lift','tuck'])assert.equal(a[key],b[key]);assert.equal(a.behind,p>=.58)}
 const peak=extractionPose(.58,1);assert(Math.abs(peak.x+.9)<1e-9);assert(Math.abs(peak.scale-.84)<1e-9);assert(Math.abs(peak.rotate+12)<1e-9);assert.match(extractionTransform(peak,100),/rotateY\(0deg\) rotateX\(0deg\)/);
 const controller=readFileSync(new URL('./mirrored-card-runtime/portfolio-deck.js',import.meta.url),'utf8');assert.equal(controller.match(/requestAnimationFrame\(/g)?.length,1);assert.doesNotMatch(controller,/setTimeout\(|Project images|项目图片|查看案例/);
});
test('controlled timing and the original analytic spring retain their exact trajectories',()=>{
 const one=createControlMotion(0,1);assert.equal(one.duration,.98);assert.equal(createControlMotion(0,2).duration,1.14);assert.deepEqual(sampleControlMotion(one,0),{position:0,velocity:0,done:false});assert.deepEqual(sampleControlMotion(one,.98),{position:1,velocity:0,done:true});
 const whole=advanceSpring(0,2,1,.12);let split={position:0,velocity:2};for(let i=0;i<6;i++)split=advanceSpring(split.position,split.velocity,1,.02);assert(Math.abs(whole.position-split.position)<1e-10);assert(Math.abs(whole.velocity-split.velocity)<1e-10);
});
test('mirrored JSON, Motion, description and standalone renderer agree without reverse-mode or personal dependencies',()=>{
 const c=defaultHistory('mirrored-card-stack');c.durationMs=1450;c.mirroredCardStack!.cards[1]={id:'b',label:'B',color:'#707070'};assert.deepEqual(parseHistory(serializeHistory(c)),c);
 const m=historyMotion(c) as ReturnType<typeof import('./mirrored-card-stack-spec').mirroredCardStackMotion>;assert.deepEqual(m.adapters.mirroredCardStack.settings,c.mirroredCardStack);assert.equal(m.adapters.mirroredCardStack.runtime.durationMs,1450);assert.deepEqual(m.adapters.mirroredCardStack.geometry,mirroredStackGeometry);assert.match(historyDescription(c).sections.find(s=>s.label==='时序')!.text,/1450 ms/);
 assert.equal(typeof Function('__name',mirroredStackEngineCode+';return createMirroredCardStack')((v:unknown)=>v),'function');assert.match(mirroredStackEngineCode,/Skiper UI/);assert.match(mirroredStackSourceNotices,/THE SOFTWARE IS PROVIDED/);assert.doesNotMatch(mirroredStackEngineCode,/\/Users\/|PersonalWeb|https?:\/\/[^\s"']+\.(png|jpg|webp)/);
 for(const p of [{loop:true},{delayMs:17},{durationMs:80},{easing:[.42,0,.58,1]},{interruption:'restart'},{mirroredCardStack:{...c.mirroredCardStack,reverse:true}}])assert.throws(()=>parseHistory(JSON.stringify({...c,...p})));
});
