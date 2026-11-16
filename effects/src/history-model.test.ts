import {glyphPlaybackMs,defaultGlyphWall} from './glyph-wall';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {recipes,defaultHistory,validateHistory,parseHistory,serializeHistory,compiledTracks,historyDescription,historyMotion,serializeHistoryMotion} from './history-model.ts';
import {catalog,catalogIds,catalogParent} from './browse-catalog';
import {orbFace,orbParticleFrame,orbParticleSpawn,orbParticles,orbScrollMetrics} from './pixel-scroll-orb';
import {pixelScrollOrbDescription,pixelScrollOrbMotion} from './pixel-scroll-orb-spec';
import {monochromeOrbDash,monochromeOrbGeometry,monochromeOrbReading,monochromeOrbSpring} from './monochrome-scroll-orb';
import {monochromeOrbMotion} from './monochrome-scroll-orb-spec';
import {gaugeKeyProgress,gaugeTrackPosition} from './vertical-scroll-gauge';
import {verticalGaugeDescription,verticalGaugeMotion} from './vertical-scroll-gauge-spec';
import verticalGaugeConfig from '../examples/vertical-scroll-gauge/config.json';
import {clampConicProgress,conicOrbReading,conicOrbStepTop} from './conic-scroll-orb';
import {conicOrbDescription,conicOrbMotion} from './conic-scroll-orb-spec';
import conicOrbConfig from '../examples/conic-scroll-orb/config.json';
import orbConfig from '../examples/pixel-scroll-orb/config.json';
import monochromeOrbConfig from '../examples/monochrome-scroll-orb/config.json';
import publicCatalog from '../catalog.json';

test('pixel scroll orb keeps the original visibility, rounding and digit alignment',()=>{
 assert.equal(orbScrollMetrics(90,520,200).visible,false);
 assert.equal(orbScrollMetrics(72,600,200).visible,false);
 assert.equal(orbScrollMetrics(73,600,200).visible,true);
 assert.deepEqual(orbScrollMetrics(NaN,200,400),{distance:0,percent:0,visible:false});
 assert.equal(orbScrollMetrics(-40,1200,200).percent,0);
 assert.deepEqual(orbScrollMetrics(600,2500,500),{distance:2000,percent:30,visible:true});
 assert.equal(orbScrollMetrics(2000,1200,200).percent,100);
 for(const [percent,digits,digitX,activeSegments] of [
  [0,'00',17.5,0],[3,'03',17.5,1],[50,'50',17.5,12],[99,'99',17.5,24],[100,'100',11.5,24],
 ] as const)assert.deepEqual(orbFace(percent),{digits,digitX,activeSegments});
});

test('pixel scroll orb default preset, Scrolling catalog and motion specification agree',()=>{
 const config=defaultHistory('pixel-scroll-orb');
 assert.deepEqual(parseHistory(JSON.stringify(orbConfig)),config);
 assert.throws(()=>validateHistory({...config,loop:true}),/不支持循环/);
 assert.throws(()=>validateHistory({...config,scrollTop:100}));
 assert.deepEqual(catalogIds('scrolling'),[config.recipeId,'monochrome-scroll-orb','vertical-scroll-gauge','conic-scroll-orb']);
 assert.deepEqual(catalogIds('滚动'),catalogIds('scrolling'));
 assert.deepEqual(catalogIds('滚动交互'),catalogIds('scrolling'));
 assert.equal(catalogParent('滚动交互')?.label,'滚动');
 assert.equal(catalogParent('scrolling')?.featured,config.recipeId);
 assert.equal(historyDescription(config).title,'像素滚动球');
 assert.equal(pixelScrollOrbDescription(config,'en').title,'Pixel Scroll Orb');
 assert.deepEqual(historyMotion(config),pixelScrollOrbMotion(config));
 const exportedMotion=Function(serializeHistoryMotion(config).replace('export default','return'))();
 assert.deepEqual(exportedMotion,pixelScrollOrbMotion(config));
 const adapter=pixelScrollOrbMotion(config).adapters.pixelScrollOrb;
 assert.equal(adapter.size,56);
 assert.equal(adapter.segments.length,24);
 assert.equal(adapter.particles.length,7);
 assert.equal(adapter.returnToTop.durationMs,config.durationMs);
});

test('all public effects have exactly their indexed browse category',()=>{
 const browseEntries=catalog.flatMap(category=>category.ids.map(id=>[id,category.label].join(':')));
 const indexEntries=publicCatalog.effects.map(effect=>[effect.id,effect.category].join(':'));
 assert.deepEqual(browseEntries.sort(),indexEntries.sort());
});

test('the monochrome orb follows real scroll travel with separate entry and exit thresholds',()=>{
 assert.equal(monochromeOrbReading(150,520,200,false).visible,false);
 assert.equal(monochromeOrbReading(80,620,200,false).visible,false);
 assert.equal(monochromeOrbReading(81,620,200,false).visible,true);
 assert.equal(monochromeOrbReading(41,620,200,true).visible,true);
 assert.equal(monochromeOrbReading(40,620,200,true).visible,false);
 assert.equal(monochromeOrbReading(250,700,200,false).percent,50);
 assert.equal(monochromeOrbReading(700,700,200,true).percent,100);
 assert.equal(monochromeOrbReading(-10,700,200,false).percent,0);
 assert.deepEqual(monochromeOrbReading(0,200,200,true),{percent:0,visible:false});
 const circumference=2*Math.PI*monochromeOrbGeometry.trackRadius;
 assert.equal(monochromeOrbDash(0),`0 ${circumference}`);
 const [halfArc, gapLength]=monochromeOrbDash(50).split(' ').map(Number);
 assert.ok(Math.abs(halfArc-circumference/2)<.001);
 assert.equal(gapLength,circumference);
 assert.equal(monochromeOrbDash(100),'none');
 assert.equal(monochromeOrbDash(105),'none');
});

test('the monochrome orb saves a theme and exports the specified geometry and spring',()=>{
 const config=defaultHistory('monochrome-scroll-orb');
 assert.deepEqual(parseHistory(JSON.stringify(monochromeOrbConfig)),config);
 const dark={...config,monochromeScrollOrb:{theme:'dark' as const}};
 assert.deepEqual(parseHistory(serializeHistory(dark)),dark);
 assert.throws(()=>validateHistory({...config,monochromeScrollOrb:{theme:'blue'}}));
 assert.throws(()=>validateHistory({...config,monochromeScrollOrb:{theme:'light',stiffness:120}}));
 assert.throws(()=>validateHistory({...config,monochromeScrollOrb:undefined}));
 assert.throws(()=>validateHistory({...config,loop:true}));
 assert.throws(()=>validateHistory({...defaultHistory('pixel-scroll-orb'),monochromeScrollOrb:{theme:'light'}}));
 const exported=Function(serializeHistoryMotion(dark).replace('export default','return'))();
 assert.deepEqual(exported,monochromeOrbMotion(dark));
 assert.deepEqual(exported.adapters.monochromeScrollOrb.spring,monochromeOrbSpring);
 assert.deepEqual(exported.adapters.monochromeScrollOrb.geometry,{size:64,innerDiameter:36,trackRadius:22.5,trackWidth:2,arcWidth:3});
});

test('vertical gauge mirrors the fill endpoint and inverse drag mapping in the reverse direction',()=>{
 for(const [input,forward,reverse] of [[-1,0,1],[0,0,1],[.25,.25,.75],[.75,.75,.25],[1,1,0],[2,1,0]]){
  assert.equal(gaugeTrackPosition(input,'top-to-bottom'),forward);
  assert.equal(gaugeTrackPosition(input,'bottom-to-top'),reverse);
  assert.equal(gaugeTrackPosition(reverse,'bottom-to-top'),forward);
 }
 for(const [key,expected] of [['ArrowUp',.475],['ArrowDown',.525],['ArrowLeft',.475],['ArrowRight',.525],
  ['PageUp',.4],['PageDown',.6],['Home',0],['End',1],['Tab',undefined]] as const){
  assert.equal(gaugeKeyProgress(key,.5),expected);
 }
 assert.equal(gaugeKeyProgress('ArrowUp',0),0);
 assert.equal(gaugeKeyProgress('ArrowDown',1),1);
});

test('vertical gauge saves only direction and exports its spring and geometry',()=>{
 const config=defaultHistory('vertical-scroll-gauge');
 assert.deepEqual(parseHistory(JSON.stringify(verticalGaugeConfig)),config);
 const reverse={...config,verticalScrollGauge:{direction:'bottom-to-top' as const}};
 assert.deepEqual(parseHistory(serializeHistory(reverse)),reverse);
 assert.throws(()=>validateHistory({...config,verticalScrollGauge:{direction:'left-to-right'}}),/方向无效/);
 assert.throws(()=>validateHistory({...config,verticalScrollGauge:{direction:'top-to-bottom',theme:'dark'}}));
 const {verticalScrollGauge,...withoutDirection}=config;
 assert.throws(()=>validateHistory(withoutDirection),/须有方向设置/);
 assert.throws(()=>validateHistory({...config,loop:true}),/不支持循环/);
 assert.throws(()=>validateHistory({...defaultHistory('scroll-progress'),verticalScrollGauge}));
 assert.equal(historyDescription(config).title,'竖向滚动刻度');
 assert.equal(verticalGaugeDescription(reverse,'en').title,'Vertical Scroll Gauge');
 const exported=Function(serializeHistoryMotion(reverse).replace('export default','return'))();
 assert.deepEqual(exported,verticalGaugeMotion(reverse));
 const gauge=exported.adapters.verticalScrollGauge;
 assert.deepEqual(gauge.settings,{direction:'bottom-to-top'});
 assert.deepEqual(gauge.spring,{stiffness:300,damping:36,mass:.6,restDelta:.001,skipInitialAnimation:true});
 assert.equal(gauge.geometry.trackWidthPx,6);
});

test('conic orb measures actual reading progress and uses strict visibility thresholds',()=>{
 assert.deepEqual(conicOrbReading(0,180,200),{distance:0,percent:0,visible:false});
 assert.equal(conicOrbReading(200,520,200).visible,false);
 assert.equal(conicOrbReading(72,521,200).visible,false);
 assert.equal(conicOrbReading(73,521,200).visible,true);
 assert.equal(conicOrbReading(250,700,200).percent,50);
 assert.equal(conicOrbReading(-10,700,200).percent,0);
 assert.equal(conicOrbReading(510,700,200).percent,100);
 assert.equal(clampConicProgress(-.01),0);
 assert.equal(clampConicProgress(100.01),100);
});

test('conic orb takes quarter steps from the current position within the reading pane',()=>{
 assert.equal(conicOrbStepTop(500,500),375);
 assert.equal(conicOrbStepTop(300,500),175);
 assert.equal(conicOrbStepTop(240,500),115);
 assert.equal(conicOrbStepTop(73,500),0);
 assert.equal(conicOrbStepTop(0,0),0);
});

test('conic orb uses the standard preset and exports its fixed spring, geometry and step',()=>{
 const config=defaultHistory('conic-scroll-orb');
 assert.deepEqual(parseHistory(JSON.stringify(conicOrbConfig)),config);
 assert.deepEqual(parseHistory(serializeHistory(config)),config);
 assert.throws(()=>validateHistory({...config,loop:true}),/不支持循环/);
 assert.throws(()=>validateHistory({...config,theme:'dark'}));
 assert.equal(historyDescription(config).title,'环形渐变滚动球');
 assert.equal(conicOrbDescription('en').title,'Conic Scroll Orb');
 const exported=Function(serializeHistoryMotion(config).replace('export default','return'))();
 assert.deepEqual(exported,conicOrbMotion(config));
 const orb=exported.adapters.conicScrollOrb;
 assert.deepEqual(orb.spring,{stiffness:210,damping:25,mass:.85});
 assert.deepEqual(orb.geometry,{size:46,coreInset:4,startAngle:220});
 assert.deepEqual(orb.visibility,{minimumTravel:320,revealOffset:72,durationMs:180,opacity:.78,hoverOpacity:.93});
 assert.equal(orb.stepBackFraction,.25);
});

test('orb hover particles vary between launches and enter, slow, and fade within each cycle',()=>{
 const anchor=orbParticles[0];
 const spawns=[.1,.65,.95].map(value=>orbParticleSpawn(anchor,()=>value));
 assert.deepEqual(spawns.map(spawn=>spawn.size),[2,3,4]);
 assert.equal(new Set(spawns.map(spawn=>`${spawn.x},${spawn.y}`)).size,3);
 assert.ok(spawns.every(spawn=>Number.isInteger(spawn.x)&&Number.isInteger(spawn.y)&&spawn.drift<0));
 assert.deepEqual(orbParticleFrame(anchor,0),{travel:0,opacity:0});
 assert.equal(orbParticleFrame(anchor,100/anchor.duration).opacity,anchor.opacity);
 assert.ok(orbParticleFrame(anchor,.2).travel>1/3);
 assert.ok(orbParticleFrame(anchor,.6).opacity<orbParticleFrame(anchor,.2).opacity);
 assert.deepEqual(orbParticleFrame(anchor,1),{travel:1,opacity:0});
});
for(const recipe of recipes)test(recipe.label+'：完整轨道、时序和描述可往返还原',()=>{const config=defaultHistory(recipe.id);config.durationMs=1800;config.delayMs=['depth-ribbon','passage-gallery','waving-card','glass-generate','expanding-menu','reelfolio-rig','bencho-card-swap','bencho-wake-slider','bencho-image-compare','bencho-label-input','bencho-carousel','bencho-upload-dropzone','bencho-slide-confirm','bencho-aspect','bencho-liq-create','bencho-eye-tracker','bencho-context-meter','infinite-photo-wall','page-turn-cards','mirrored-card-stack'].includes(recipe.id)?0:90;config.offsetX=-15;config.offsetY=12;config.scale=.93;if(!['depth-ribbon','passage-gallery','waving-card','glass-generate','expanding-menu','reelfolio-rig','bencho-card-swap','bencho-wake-slider','bencho-image-compare','bencho-label-input','bencho-carousel','bencho-upload-dropzone','bencho-slide-confirm','bencho-aspect','bencho-liq-create','bencho-eye-tracker','bencho-context-meter','infinite-photo-wall','page-turn-cards','mirrored-card-stack'].includes(recipe.id))config.easing=[.3,-.2,.7,1.2];config.loop=!recipe.id.startsWith('skiper-')&&!recipe.id.startsWith('bencho-')&&!recipe.id.startsWith('reelfolio-')&&!['depth-ribbon','passage-gallery','waving-card','glass-generate','expanding-menu','infinite-photo-wall','mirrored-card-stack','page-turn-cards','chapter-progress-nav','liquid-glass-logo','chromatic-button','topographic-flow','gooey-wordmark','liquid-carousel','coffee-selector','hover-invert','glass-radio','hover-preview','duration-picker','rail-toc','hook-sidebar','scroll-progress','pixel-scroll-orb','monochrome-scroll-orb','vertical-scroll-gauge','conic-scroll-orb','glass-folder','rounded-checks','expandable-sidebar','encrypted-text','gooey-input','app-orbit','typewriter-text','soft-blur-in','short-slide-down','kinetic-center-build','period-drop','outline-trace','glyph-anatomy'].includes(recipe.id);const restored=parseHistory(serializeHistory(config));assert.deepEqual(restored,config);assert.deepEqual(compiledTracks(restored),compiledTracks(config));assert.deepEqual(compiledTracks(restored,true),compiledTracks(config,true));assert.deepEqual(historyDescription(restored),historyDescription(config));assert.deepEqual(historyMotion(restored),historyMotion(config));assert.notEqual(restored.tracks,config.tracks);});
test('所有预设进入退出阶段时序有效；文字揭示淡出，其余反向轨道保留关键帧关系',()=>{
 for(const recipe of recipes){
  const config=defaultHistory(recipe.id),forward=compiledTracks(config),exit=compiledTracks(config,true);
  for(const track of [...forward,...exit]){assert.equal(track.transition.times.length,track.values.length);assert.ok(track.transition.delay>=0);assert.ok(track.transition.delay+track.transition.duration<=(config.recipeId==='glyph-wall'?glyphPlaybackMs(config.durationMs,config.wall??defaultGlyphWall,config.loop):config.durationMs)/1000+.001)}
  if(recipe.id==='text-rise'){assert.equal(exit.length,1);assert.equal(exit[0].property,'opacity');assert.deepEqual(exit[0].values,[1,0]);continue}
  for(const [index,track] of forward.entries()){assert.deepEqual(exit[index].values,[...track.values].reverse());assert.deepEqual(exit[index].transition.times,track.transition.times.map(time=>1-time).reverse())}
 }
});
test('Reprise 目录先运行620ms，之后200ms呈现内容',()=>{const c=defaultHistory('grid-collapse');const tracks=compiledTracks(c);assert.equal(tracks[0].transition.duration,.62);assert.equal(tracks[1].transition.delay,.62);assert.equal(tracks[1].transition.duration,.2);});
test('观察倍速不能导入；未知轨道目标和危险CSS、无效透明度全部拒绝',()=>{const c=defaultHistory('toast');assert.throws(()=>validateHistory({...c,speed:.5}));assert.throws(()=>validateHistory({...c,loop:'true'}));const bad=structuredClone(c);bad.tracks[0].part='body';assert.throws(()=>validateHistory(bad));const invalid=structuredClone(c);invalid.tracks[1].values=[0,2];assert.throws(()=>validateHistory(invalid));const css=defaultHistory('hover-invert');css.tracks[0].values=['#fff','url(https://example.com)'];assert.throws(()=>validateHistory(css));});
test('缺失字段、稀疏数组、额外属性、乱序时间点及超出时长均拒绝',()=>{const c=defaultHistory('toast');assert.throws(()=>parseHistory('{}'));const sparse=structuredClone(c);sparse.easing.length=5;assert.throws(()=>validateHistory(sparse));const order=structuredClone(c);order.tracks[0].times=[1,0];assert.throws(()=>validateHistory(order));const beyond=structuredClone(c);beyond.tracks[0].start=.5;assert.throws(()=>validateHistory(beyond));assert.throws(()=>parseHistory('{broken'));assert.throws(()=>parseHistory(serializeHistory(c).replace('"schemaVersion": 2','"schemaVersion": 9')));});
test('循环在JavaScript参数中保留Infinity，各轨道循环周期一致',()=>{const c=defaultHistory('dots');c.loop=true;const text=serializeHistoryMotion(c);const output=Function(text.replace('export default','return'))();assert.equal(output.forward[0].transition.repeat,Infinity);for(const t of compiledTracks(c))assert.ok(Math.abs(t.transition.duration+t.transition.repeatDelay-c.durationMs/1000)<1e-9);assert.ok(historyDescription(c).sections.some(s=>s.text.includes('无限循环')));});
test('颜色反转有过渡时长，所有动效支持完整动效契约',()=>{const c=defaultHistory('hover-invert');assert.equal(compiledTracks(c)[0].transition.duration,c.durationMs/1000);for(const r of recipes){const text=historyDescription(defaultHistory(r.id)).sections.map(s=>s.label+' '+s.text).join('\n');for(const label of ['触发方式','起点与终点','时序','进入与退出','重复操作与打断','减少动态效果','来源'])assert.ok(text.includes(label));}});
