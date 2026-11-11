import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultLiquidCarousel,validateLiquidCarousel,liquidIndex,liquidRadius,liquidBoundaryProfile,liquidBoundaryOffset,liquidCarouselEngineCode,liquidCarouselLayout} from './liquid-carousel';
import {defaultHistory,parseHistory,serializeHistory,historyMotion,validateHistory} from './history-model';
import {reelItems} from './elastic-reel-art';
import {galleryPlayback,interactionSelector} from './effect-behavior';

test('liquid carousel wraps both directions and the reveal radius covers the complete image',()=>{
 assert.equal(liquidIndex(-1,4),3);assert.equal(liquidIndex(4,4),0);assert.equal(liquidIndex(-9,4),3);
 assert.ok(liquidRadius(0)<0);assert.ok(liquidRadius(1)>Math.hypot(.889*.756,.5));
 let last=liquidRadius(0);for(let p=.01;p<=1;p+=.01){assert.ok(liquidRadius(p)>last);last=liquidRadius(p)}
 for(const aspect of [.6,1,1.5])assert.ok(liquidRadius(1,aspect)>Math.hypot(.889*aspect,.5));
 assert.equal(liquidRadius(-1),liquidRadius(0));assert.equal(liquidRadius(2),liquidRadius(1));
});
test('liquid carousel validates strict local media and preserves independent saved defaults',()=>{
 const settings=structuredClone(defaultLiquidCarousel);assert.equal(validateLiquidCarousel(settings).items.length,6);
 const copy=validateLiquidCarousel(settings);copy.items[0].title='Changed';assert.notEqual(copy.items[0].title,settings.items[0].title);
 for(const bad of [{...settings,distortion:NaN},{...settings,items:[]},{...settings,items:settings.items.slice(0,1)},{...settings,items:new Array(4)},{...settings,selectedIndex:6},{...settings,autoplay:1},{...settings,unknown:true},{...settings,items:[{src:'https://example.com/image.jpg',title:'Remote'},settings.items[1]]}])assert.throws(()=>validateLiquidCarousel(bad));
 assert.throws(()=>validateLiquidCarousel({...settings,items:[{src:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'),title:'Untrusted'},settings.items[1]]}));
 const unsafe=structuredClone(settings);Object.defineProperty(unsafe.items[0],'src',{get(){throw Error('getter was invoked')}});assert.throws(()=>validateLiquidCarousel(unsafe),/图片只可/);
});
test('liquid carousel JSON, Motion adapter and portable factory use the same complete content',()=>{
 const config=defaultHistory('liquid-carousel'),json=serializeHistory(config),motion=historyMotion(config);
 assert.equal(config.liquidCarousel?.edge,.1);assert.equal(config.liquidCarousel?.distortion,.2);
 assert.equal(config.liquidCarousel?.autoplay,true);assert.equal(config.liquidCarousel?.interval,3600);
 assert.deepEqual(parseHistory(json),config);assert.deepEqual(motion.adapters.liquidCarousel.settings,config.liquidCarousel);
 assert.equal(motion.adapters.liquidCarousel.runtime.durationMs,1600);
 assert.equal(typeof Function('__name',liquidCarouselEngineCode+';return createLiquidCarousel')((fn:unknown)=>fn),'function');
 assert.throws(()=>validateHistory({...config,loop:true}));assert.throws(()=>validateHistory({...defaultHistory('toast'),liquidCarousel:config.liquidCarousel}));
 assert.equal(galleryPlayback('liquid-carousel'),'loading');assert.equal(interactionSelector('liquid-carousel'),'.liquid-carousel');
 assert.doesNotMatch(json,/"progress"|"frame"|"target"|"gallery"|"velocity"/);
});

test('liquid carousel reuses the original Orbit Reel artwork and exports no reference video stills',()=>{
 assert.deepEqual(defaultLiquidCarousel.items,reelItems.slice(0,6).map(({src,title})=>({src,title})));
 assert.ok(defaultLiquidCarousel.items.every(item=>item.src.startsWith('data:image/svg+xml,')));
 assert.doesNotMatch(liquidCarouselEngineCode,/data:image\/jpeg|Harmonic fill|Reference controls/);
});

test('coherent liquid boundary closes smoothly and advances without retreat at the requested preset',()=>{
 assert.equal(liquidBoundaryProfile.length,8);
 const exported=Function('__name',liquidCarouselEngineCode+';return liquidBoundaryOffset')((fn:unknown)=>fn);
 for(let i=0;i<=32;i++){
  const angle=i/32*Math.PI*2;assert.equal(liquidBoundaryOffset(angle,0,.1),0);assert.equal(Math.abs(liquidBoundaryOffset(angle,1,.1)),0);
  let previous=-Infinity;
  for(let n=0;n<=100;n++){const p=n/100,offset=liquidBoundaryOffset(angle,p,.1),radius=liquidRadius(p)-offset;assert.ok(radius>=previous,'front must not flicker backwards');previous=radius;assert.ok(Math.abs(offset)<=.1*liquidBoundaryProfile.reduce((sum,v)=>sum+Math.abs(v),0));assert.equal(exported(angle,p,.1),offset)}
  assert.ok(Math.abs(liquidBoundaryOffset(angle,.5,.1)-liquidBoundaryOffset(angle+2*Math.PI,.5,.1))<1e-14);
 }
});


test('bottom navigation and image remain inside the fitted scene for every supported extreme',()=>{
 const portable=Function('__name',liquidCarouselEngineCode+';return liquidCarouselLayout')((fn:unknown)=>fn);
 for(const count of [2,6,8])for(const height of [150,202,280])for(const aspect of [.6,350/463,1.5])for(const border of [0,4.5,12])for(const buttonSize of [16,24,36]){
  const settings={...defaultLiquidCarousel,items:Array.from({length:count},(_,i)=>defaultLiquidCarousel.items[i%6]),height,aspect,border,buttonSize},layout=liquidCarouselLayout(settings);
  assert.deepEqual(portable(settings),layout);
  assert.ok(layout.frameWidth+40<=layout.width);assert.ok(layout.navWidth+40<=layout.width);
  assert.ok(layout.imageY-height/2>=20);assert.ok(layout.navTop>=layout.imageY+height/2+buttonSize*2/3-1e-9);
  assert.ok(layout.navTop+buttonSize<=layout.height-20+1e-9);
  assert.equal(layout.pagerWidth,(count-1)*layout.dot+layout.active+(count-1)*layout.dotGap);
 }
});
