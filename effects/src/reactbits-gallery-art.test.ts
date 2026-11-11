import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reactbitsGallerySamples as images} from './reactbits-gallery-art';
import {passageGalleryEngineCode} from './passage-gallery';
import {depthRibbonEngineCode} from './depth-ribbon';
test('independent gallery samples retain original image provenance and identical offline bytes',()=>{
 const root=new URL('../public/images/reactbits-gallery/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('SOURCES.json',root),'utf8'));
 assert.equal(images.length,8);assert.equal(new Set(images.map(i=>i.src)).size,8);assert.equal(manifest.entries.length,8);
 for(let i=0;i<images.length;i++){const image=images[i],entry=manifest.entries[i],bytes=readFileSync(new URL(entry.file,root));assert.equal(image.title,entry.title);assert.match(image.src,/^data:image\/jpeg;base64,/);assert.equal(Buffer.from(image.src.split(',')[1],'base64').compare(bytes),0);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.ok(passageGalleryEngineCode.includes(image.src));assert.ok(depthRibbonEngineCode.includes(image.src));assert.match(entry.generator,/image_gen/)}
});
