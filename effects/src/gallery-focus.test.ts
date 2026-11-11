import test from 'node:test';
import assert from 'node:assert/strict';
import {galleryFocus as g,galleryFocusCode} from './gallery-focus';

test('focused photos fit above readable controls without losing their natural ratio',()=>{
 for(const [w,h,footer,ui] of [[720,420,64,1],[720,840,180,2.1],[720,360,144,2.8],[320,180,56,1]]){
  for(const aspect of [.2,.5,1,2,5]){
   const f=g.frame(w,h,aspect,footer,ui);
   assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=w+.001&&f.y+f.h<=h-footer+.001,JSON.stringify({w,h,aspect,f}));
   assert.ok(Math.abs(f.w/f.h-aspect)<1e-10);
   const focal=g.distance(.8,60,f.h,h),projected=.8*h/(2*Math.tan(Math.PI/6)*focal);
   assert.ok(Math.abs(projected-f.h)<1e-8,'camera projection must match the fitted image height');
  }
 }
});
test('gallery selection wraps in either direction and the portable helper is self-contained',()=>{
 assert.equal(g.wrap(-17,8),7);assert.equal(g.wrap(25,8),1);assert.equal(g.wrap(0,1),0);
 const exported=Function(galleryFocusCode+';return galleryFocus')();
 assert.deepEqual(exported.frame(720,420,1.5,64),g.frame(720,420,1.5,64));
});
test('small catalog focus fits around the independent close target',()=>{
 for(const physicalWidth of [138,158,173,240])for(const aspect of [.33,1,5]){
  const ui=720/physicalWidth,h=147*ui,f=g.frame(720,h,aspect,40*ui,ui,true);
  const overlaps=f.x+f.w>720-50*ui&&f.y<50*ui;
  assert.equal(overlaps,false,JSON.stringify({physicalWidth,aspect,f}));
  assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=720&&f.y+f.h<h-40*ui);
 }
});
