import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEasing,evaluateBezier,motionEasing,easingCode,curvePoints,curveNodes,curveSegments,addCurveAnchor,addCurveControl,removeCurvePoint,moveCurvePoint,translateCurve} from './easing.ts';
import type {EasingCurve} from './easing.ts';
import {defaultConfig,parseConfig,serializeConfig,transitionFor,motionSpec,describe} from './model.ts';
import {defaultHistory,parseHistory,serializeHistory,compiledTracks,serializeHistoryMotion,historyDescription} from './history-model.ts';
import {galleryPlayback,interactionSelector} from './effect-behavior.ts';

test('任意数量贝塞尔控制点保持正确数学定义，线性、平方、四次曲线均可重现',()=>{
 for(const p of [0,.1,.25,.5,.8,1]){
  assert.ok(Math.abs(evaluateBezier(p,[])-p)<1e-6);
  assert.ok(Math.abs(evaluateBezier(p,[.5,0])-p*p)<1e-6);
  const curve=[.25,0,.5,0,.75,0],ease=motionEasing(curve);
  assert.equal(typeof ease,'function');assert.ok(Math.abs((ease as Function)(p)-p**4)<1e-6);
  assert.ok(Math.abs(Function('return '+easingCode(curve))()(p)-p**4)<1e-6);
 }
 for(const invalid of [[0,1,2],[0,0,NaN,1],Array(4),[.8,0,.2,0,.7,1],Array(26).fill(0)])assert.throws(()=>validateEasing(invalid));
 const getter=[0,0,1,1];Object.defineProperty(getter,0,{get(){throw Error('getter was read')}});assert.throws(()=>validateEasing(getter),/easing/);
});
test('多点曲线导出再导入保留全部控制点，导出的 Motion JS 可直接执行同一缓动',()=>{
 const curves:EasingCurve[]=[[],[.5,0],[.2,-.4,.5,1.4,.8,.8],[.1,0,.3,.4,.5,.5,.7,1.2,.9,1],{start:[.1,.2],handles:[.3,.5,.6,1.1],end:[.9,.8]}];
 for(const curve of curves){
  const config=defaultHistory('card-morph');config.easing=curve;
  const restored=parseHistory(serializeHistory(config));assert.deepEqual(restored,config);assert.deepEqual(historyDescription(restored),historyDescription(config));
  const exported=Function(serializeHistoryMotion(restored).replace('export default','return'))();
  const runtime=compiledTracks(config)[0].transition.ease;
  for(const p of [0,.17,.5,.83,1])assert.equal(exported.forward[0].transition.ease(p),(runtime as Function)(p));
  const basic=defaultConfig('button');basic.animation='tween';basic.easing=curve;
  const next=parseConfig(serializeConfig(basic));assert.deepEqual(next,basic);assert.deepEqual(describe(next),describe(basic));
  const spec=JSON.parse(JSON.stringify(motionSpec(next)));assert.equal(spec.transition.ease.type,'function');
  const restoredEase=Function('return '+spec.transition.ease.source)();
  for(const p of [0,.3,.7,1])assert.equal(restoredEase(p),(transitionFor(next).ease as Function)(p));
 }
});
test('自定义端点参与实际缓动，端点时间范围外保持端点进度',()=>{
 const curve:EasingCurve={start:[.2,.1],handles:[],end:[.8,.7]};
 for(const [x,y] of [[0,.1],[.2,.1],[.35,.25],[.5,.4],[.8,.7],[1,.7]]){
  assert.ok(Math.abs(evaluateBezier(x,curve)-y)<1e-6);
  assert.ok(Math.abs((motionEasing(curve) as Function)(x)-y)<1e-6);
 }
 const copied=validateEasing(curve);assert.deepEqual(copied,curve);assert.notEqual(copied,curve);
 assert.match(historyDescription({...defaultHistory('card-morph'),easing:curve}).sections.find(s=>s.label==='时序')!.text,/起点 \(0.2, 0.1\).*终点 \(0.8, 0.7\)/);
});
test('端点移动和整条曲线平移保持时间顺序、曲线形状和原始数据',()=>{
 const original:EasingCurve={start:[.1,.2],handles:[.3,.5,.6,.8],end:[.9,1]};
 const moved=translateCurve(original,.05,.2);
 assert.deepEqual(curvePoints(moved),[[.15,.4],[.35,.7],[.65,1],[.95,1.2]]);
 for(const x of [.15,.3,.6,.9])assert.ok(Math.abs(evaluateBezier(x,moved)-evaluateBezier(x-.05,original)-.2)<1e-6);
 assert.deepEqual(curvePoints(translateCurve(original,10,10)),[[.2,1.2],[.4,1.5],[.7,1.8],[1,2]]);
 const start=moveCurvePoint(original,0,.95,-10);validateEasing(start);assert.deepEqual(curvePoints(start)[0],[.3,-1]);
 const end=moveCurvePoint(original,3,0,10);validateEasing(end);assert.deepEqual(curvePoints(end).at(-1),[.6,2]);
 assert.deepEqual(original,{start:[.1,.2],handles:[.3,.5,.6,.8],end:[.9,1]});
 const crossed:EasingCurve={start:[.1,0],handles:[.8,.2,.2,.8],end:[.9,1]};assert.deepEqual(validateEasing(crossed),crossed);
});
test('自定义端点拒绝非法范围、倒序、额外字段、访问器和稀疏数组',()=>{
 const base={start:[.1,.2],handles:[.3,.5,.6,.8],end:[.9,1]};
 for(const value of [
  {...base,start:[.95,0]}, {...base,end:[.1,1]}, {...base,start:[-.1,0]}, {...base,end:[1,NaN]},
  {...base,end:[.9,3]}, {...base,start:[.1,0,0,0]}, {...base,handles:[0,0]}, {...base,handles:[.3,.5,.2,.7,.8,1]},
  {...base,extra:true}, {...base,start:Array(2)}, Object.assign(Object.create({}),base),
 ])assert.throws(()=>validateEasing(value),/easing/);
 const getter={...base};Object.defineProperty(getter,'start',{get(){throw Error('getter was read')}});assert.throws(()=>validateEasing(getter),/easing/);
 const copy=validateEasing(base);if(!Array.isArray(copy)&&'handles' in copy){copy.start[1]=.8;copy.handles[0]=.4;copy.end[1]=.6}assert.deepEqual(base,{start:[.1,.2],handles:[.3,.5,.6,.8],end:[.9,1]});
});
test('在实际曲线上加点保留原形，拖动新增曲线点后准确经过该点',()=>{
 for(const original of [[.16,1,.3,1],[.9,.1,.1,.9],[.2,-.3,.5,1.4,.8,.8],[]]){
  const snapshot=JSON.stringify(original),split=addCurveAnchor(original,.37);validateEasing(split);
  assert.equal(curveSegments(split).length,2);
  const nodes=curveNodes(split),index=nodes.findIndex((n,i)=>n.kind==='anchor'&&i>0&&i<nodes.length-1);
  assert.ok(Math.abs(nodes[index].point[0]-.37)<1e-7);
  for(let i=0;i<=200;i++)assert.ok(Math.abs(evaluateBezier(i/200,split)-evaluateBezier(i/200,original))<1e-6,'添加曲线点不能改变原形');
  const moved=moveCurvePoint(split,index,.43,.65);validateEasing(moved);
  assert.ok(Math.abs(evaluateBezier(.43,moved)-.65)<1e-6,'曲线必须经过移动后的曲线点');
  assert.equal(JSON.stringify(original),snapshot);
  for(const [i,n] of nodes.entries())if(n.kind==='control')for(const x of [-1,.5,2])validateEasing(moveCurvePoint(split,i,x,1));
  const removed=removeCurvePoint(moved,index);validateEasing(removed);assert.equal(curveSegments(removed).length,1);
  assert.deepEqual(curvePoints(removed)[0],[0,0]);assert.deepEqual(curvePoints(removed).at(-1),[1,1]);
 }
});
test('分段曲线的控制点、平移、边界和 JSON/Motion 导出使用相同数据',()=>{
 let curve=addCurveAnchor([.16,1,.3,1],.4);curve=addCurveAnchor(curve,.75);curve=addCurveControl(curve,.2,.7);validateEasing(curve);
 const control=curveNodes(curve).findIndex(n=>n.kind==='control');curve=removeCurvePoint(curve,control);validateEasing(curve);
 for(const node of curveNodes(curve).flatMap((n,i)=>n.kind==='anchor'?[i]:[]))for(const x of [-10,10])validateEasing(moveCurvePoint(curve,node,x,.5));
 assert.equal(addCurveAnchor(curve,0),curve);assert.equal(addCurveAnchor(curve,1),curve);
 const translated=translateCurve(curve,0,-.1);validateEasing(translated);assert.equal(curveSegments(translated).length,3);
 const history={...defaultHistory('dropdown'),easing:curve};assert.deepEqual(parseHistory(serializeHistory(history)),history);
 const exported=Function(serializeHistoryMotion(history).replace('export default','return'))();
 const basic={...defaultConfig('button'),animation:'tween' as const,easing:curve};assert.deepEqual(parseConfig(serializeConfig(basic)),basic);
 const basicSpec=JSON.parse(JSON.stringify(motionSpec(basic))),restored=Function('return '+basicSpec.transition.ease.source)();
 assert.equal(basicSpec.transition.ease.segments.length,3);
 for(let i=0;i<=100;i++){const x=i/100;assert.equal(exported.forward[0].transition.ease(x),evaluateBezier(x,curve));assert.equal(restored(x),evaluateBezier(x,curve))}
 assert.match(historyDescription(history).sections.find(s=>s.label==='时序')!.text,/2 个可拖动锚点/);
});
test('分段曲线拒绝不连续时间、越界、额外字段、稀疏段与访问器',()=>{
 const base={start:[0,0],segments:[{handles:[.1,.3],end:[.5,.5]},{handles:[.8,.7],end:[1,1]}]};
 for(const value of [
  {...base,segments:[]},{...base,segments:Array(2)}, {...base,segments:[{handles:[.7,0],end:[.5,.5]}]},
  {...base,segments:[{handles:[],end:[.5,.5]},{handles:[],end:[.5,1]}]},
  {...base,extra:true},{...base,segments:[{handles:[],end:[1,1],extra:true}]},
 ])assert.throws(()=>validateEasing(value),/easing/);
 const getter={...base};Object.defineProperty(getter,'segments',{get(){throw Error('getter was read')}});assert.throws(()=>validateEasing(getter),/easing/);
 const copy=validateEasing(base);assert.deepEqual(copy,base);assert.notEqual(copy,base);
});
test('文件夹由已有配置派生三层纸张与错峰时序，原有 JSON 轨道数量不增加',()=>{
 const config=defaultHistory('folder'),snapshot=serializeHistory(config),tracks=compiledTracks(config);
 assert.equal(config.tracks.length,4);
 for(const [part,y,z,scale] of [['paper',-7,-1,.98],['paper2',-16,-2,.96],['paper3',-26,-3,.94]] as const){
  const find=(property:string)=>tracks.find(t=>t.target===`[data-part="${part}"]`&&t.property===property)!;
  assert.equal(find('y').values.at(-1),y);assert.equal(find('z').values.at(-1),z);assert.equal(find('scale').values.at(-1),scale);
 }
 assert.equal(tracks.find(t=>t.target==='[data-part="paper2"]'&&t.property==='y')!.transition.delay,.032);
 assert.equal(tracks.find(t=>t.target==='[data-part="paper3"]'&&t.property==='y')!.transition.delay,.064);
 assert.equal(serializeHistory(config),snapshot);assert.deepEqual(parseHistory(snapshot),config);
});
test('展示型卡片悬停演示，文件夹和提示保持对准目标的交互',()=>{
 for(const id of ['toast','card-morph'])assert.equal(galleryPlayback(id),'cycle');
 for(const id of ['dropdown','folder','tooltip','basic-button'])assert.equal(galleryPlayback(id),'direct');
 assert.equal(interactionSelector('basic-button'),'[data-demo-button]');
 assert.equal(interactionSelector('folder'),'[data-gallery-control]');
});
