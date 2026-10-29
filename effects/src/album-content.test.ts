import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAlbumCovers,resolveAlbumItems} from './album-content';
import {defaultHistory,parseHistory,serializeHistory,historyMotion,validateHistory} from './history-model';
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==';
test('custom cover and name travel together through configuration, render data and standalone export',()=>{
 const c={...defaultHistory('album-rail'),albumCovers:[{src:png,title:'My record <3'}]};
 assert.deepEqual(parseHistory(serializeHistory(c)),c);assert.deepEqual(historyMotion(c).adapters.albumRail.items,resolveAlbumItems(c.albumCovers));
 assert.equal(resolveAlbumItems(c.albumCovers)[0].title,'My record <3');assert.equal(resolveAlbumItems(c.albumCovers)[0].artist,'');
 assert.equal(resolveAlbumItems([]).length,12);assert.equal(resolveAlbumItems([{src:png,title:''}])[0].title,'Untitled');
 assert.throws(()=>validateHistory({...defaultHistory('spinner'),albumCovers:c.albumCovers}));
});
test('cover import rejects remote URLs, SVG, unknown data, sparse/accessor arrays and oversized payloads',()=>{
 for(const src of ['https://example.com/cover.jpg','data:image/svg+xml;base64,PHN2Zz4=','javascript:alert(1)','data:image/png;base64,'+'A'.repeat(180001)])assert.throws(()=>validateAlbumCovers([{src,title:'test'}]));
 assert.throws(()=>validateAlbumCovers(new Array(1)));assert.throws(()=>validateAlbumCovers(Array.from({length:13},()=>({src:png,title:'x'}))));
 assert.throws(()=>validateAlbumCovers([{src:png,title:'x',artist:'x'}]));assert.throws(()=>validateAlbumCovers([{src:png,title:'x'.repeat(81)}]));
 const getter={src:png,title:'x'};Object.defineProperty(getter,'src',{get(){throw Error('getter invoked')}});assert.throws(()=>validateAlbumCovers([getter]),/只能/);
 assert.deepEqual(validateAlbumCovers([{src:png,title:'Hello'}]),[{src:png,title:'Hello'}]);
});
