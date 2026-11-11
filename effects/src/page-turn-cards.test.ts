import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultPageTurn,validatePageTurn,pageTurnGeometry} from './page-turn-cards-settings';
import {pageTurnEngineCode,pageTurnSourceNotices} from './page-turn-engine-source';
import {defaultHistory,parseHistory,serializeHistory,historyDescription,historyMotion} from './history-model';
test('page turn accepts only independent stable card identities and gray-only content',()=>{
 const copy=validatePageTurn(defaultPageTurn);copy.cards[0].label='Draft';assert.equal(defaultPageTurn.cards[0].label,'1');
 for(const bad of [{...defaultPageTurn,unknown:true},{...defaultPageTurn,cards:Array(2)},{...defaultPageTurn,cards:[]},{...defaultPageTurn,cards:[defaultPageTurn.cards[0],defaultPageTurn.cards[0]]},{...defaultPageTurn,cards:[{...defaultPageTurn.cards[0],color:'#ff0022'}]},{...defaultPageTurn,cards:[{...defaultPageTurn.cards[0],label:'<img>'}]},{...defaultPageTurn,initialIndex:6},{...defaultPageTurn,width:NaN}])assert.throws(()=>validatePageTurn(bad));
 for(const n of [1,2,6,8])assert.equal(validatePageTurn({...defaultPageTurn,cards:Array.from({length:n},(_,i)=>({id:'card-'+i,label:String(i),color:'#242424'}))}).cards.length,n);
});
test('page turn preview, JSON, timing and executable export share a strict contract',()=>{
 const c=defaultHistory('page-turn-cards');c.durationMs=850;c.pageTurnCards!.cards[1]={id:'review',label:'Review',color:'#707070'};c.pageTurnCards!.initialIndex=1;c.pageTurnCards!.width=320;c.pageTurnCards!.height=380;
 assert.deepEqual(parseHistory(serializeHistory(c)),c);
 const motion=historyMotion(c) as ReturnType<typeof import('./page-turn-cards-spec').pageTurnMotion>;
 assert.deepEqual(motion.adapters.pageTurnCards.settings,c.pageTurnCards);assert.equal(motion.adapters.pageTurnCards.runtime.durationMs,850);assert.deepEqual(motion.adapters.pageTurnCards.geometry,pageTurnGeometry);
 assert.match(historyDescription(c).sections.find(s=>s.label==='时序')!.text,/850 ms/);
 assert.equal(typeof Function('__name',pageTurnEngineCode+';return createPageTurnCards')((v:unknown)=>v),'function');
 for(const p of [{loop:true},{delayMs:50},{easing:[0,0,1,1]},{durationMs:80},{durationMs:2100},{interruption:'restart'}])assert.throws(()=>parseHistory(JSON.stringify({...c,...p})));
 assert.doesNotMatch(pageTurnEngineCode,/\/Users\/|PersonalWeb|journeyDemo|chapterDemo|https?:\/\/[^\s"']+\.(png|jpg|webp)/);
 assert.match(pageTurnSourceNotices,/@gurvinder-singh02/);assert.match(pageTurnSourceNotices,/Swiper 14\.4\.0/);assert.match(pageTurnEngineCode,/THE SOFTWARE IS PROVIDED/);
});
test('page turn retains coupled projected-gap geometry and a standalone engine with no imported media',()=>{
 const css=readFileSync(new URL('./page-turn-runtime/page-turn.css',import.meta.url),'utf8');
 for(const fragment of ['--turn-camera:2.8','--turn-retreat:.10','--turn-ease:cubic-bezier(.42,0,.58,1)','--contact-correction:'])assert(css.includes(fragment));
 const coordinator=readFileSync(new URL('./page-turn-runtime/fold-handoff.js',import.meta.url),'utf8');assert.match(coordinator,/Math\.sqrt\(Math\.min\(1,Math\.abs\(start-end\)\)\)/);assert.match(coordinator,/preventInteractionOnTransition=far/);
});
