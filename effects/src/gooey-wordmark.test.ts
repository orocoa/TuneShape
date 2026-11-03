import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultHistory,serializeHistory,parseHistory,historyMotion} from './history-model';
import {gooeyEntrance} from './gooey-wordmark';
import {validateTypography,typographyDefaults} from './typography-settings';

test('the entrance resolves the actual glyph blur without scaling, rotation or a surrogate ribbon',()=>{
 const start=gooeyEntrance(0,0,9),end=gooeyEntrance(1,8,9);
 assert.equal(start.yPercent,18);assert.equal(start.blur,14);assert.equal(start.captionOpacity,0);
 assert.notEqual(gooeyEntrance(.3,0,9).yPercent,gooeyEntrance(.3,8,9).yPercent);
 let previous=14;
 for(let step=0;step<=100;step++){const state=gooeyEntrance(step/100,4,9);assert.equal(state.scaleX,1);assert.equal(state.scaleY,1);assert.equal(state.rotation,0);assert.equal(state.opacity,1);assert.ok(state.blur<=previous);previous=state.blur;assert.ok(state.yPercent>=0&&state.yPercent<=18)}
 assert.equal(gooeyEntrance(750/1600,0,9).blur>0,true);assert.equal(gooeyEntrance(1200/1600,0,9).blur,0);
 assert.equal(gooeyEntrance(879/1600,0,9).captionOpacity,0);assert.ok(gooeyEntrance(1000/1600,0,9).captionOpacity>0);
 assert.deepEqual(end,{scaleX:1,scaleY:1,rotation:0,opacity:1,yPercent:0,blur:0,captionOpacity:1,captionY:0,hintOpacity:1});
});
test('wordmark content and appearance round trip to the same portable engine without pointer state',()=>{
 const c=defaultHistory('gooey-wordmark');c.typography={...c.typography!,text:'tune shape',caption:'A new rhythm.',radius:160,intensity:1.4,annotations:false};c.durationMs=3100;c.delayMs=220;
 assert.deepEqual(parseHistory(serializeHistory(c)),c);
 const adapter=(historyMotion(c).adapters as any).typography;
 assert.deepEqual(adapter.settings,c.typography);assert.equal(adapter.runtime.durationMs,3100);assert.equal(adapter.runtime.delayMs,220);
 assert.equal(typeof new Function(adapter.engineCode+';return createTypography;')(),'function');
 assert.equal('pointerEnergy' in adapter.settings,false);assert.equal('hit' in adapter.settings,false);
 assert.match(adapter.engineCode,/data:font\/woff2;base64,/);assert.doesNotMatch(adapter.engineCode,/https:\/\/www\.hipuku/);
});
test('wordmark schema rejects malformed, unsafe and unsupported settings',()=>{
 const d=typographyDefaults['gooey-wordmark'];
 for(const part of [{radius:0},{intensity:3},{grid:'false'},{caption:'a'.repeat(65)},{caption:'line\nbreak'},{text:'x'.repeat(33)},{backgroundColor:'url(https://example.com)'}])assert.throws(()=>validateTypography({...d,...part}));
 assert.deepEqual(validateTypography({...d,text:'随形 tuneshape',caption:''}),{...d,text:'随形 tuneshape',caption:''});
});
