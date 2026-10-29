import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultHistory,historyMotion} from './history-model.ts';
import {sidebarTree,sidebarTreeRows,sidebarInteractionConfig} from './mini-sidebar-model.ts';
import {createSidebarField,sidebarFieldProfile} from './sidebar-field.ts';
import {evaluateBezier} from './easing.ts';

function setup(factory=createSidebarField){
 let time=0,id=0,frame:any,queue=new Map<number,(time:number)=>void>();const running:boolean[]=[];
 const driver={request:(callback:(time:number)=>void)=>{queue.set(++id,callback);return id},cancel:(id:number)=>{queue.delete(id)}};
 const field=factory({driver,paint:(lines,y)=>{frame={lines,y}},running:value=>running.push(value)});
 const config=defaultHistory('mini-sidebar'),rows=sidebarTreeRows(sidebarTree),profile=sidebarFieldProfile(config,rows,1);
 field.configure(profile,2,value=>evaluateBezier(value,config.easing));
 function advance(ms:number,hz=60){for(let t=0;t<ms-.0001;t+=1000/hz){time+=Math.min(1000/hz,ms-t);const callbacks=[...queue.values()];queue.clear();callbacks.forEach(callback=>callback(time))}}
 const line=(position:number)=>frame.lines.find((line:any)=>line.index===rows.findIndex(row=>row.visible&&row.position===position));
 return {field,profile,config,rows,advance,line,frame:()=>structuredClone(frame),running,scheduled:()=>queue.size};
}

test('持续指针跟随在原位置和速度上接续，稳定后停止帧循环',()=>{
 const s=setup();s.field.enter(2);s.advance(80);const before=s.line(2).width;
 s.field.enter(3);assert.equal(s.line(2).width,before);
 s.advance(16);assert.ok(Math.abs(s.line(2).width-before)<6);
 s.advance(600);assert.ok(Math.abs(s.line(3).width-38)<.01);assert.equal(s.scheduled(),0);assert.equal(s.field.state,'finished');
 assert.deepEqual(s.running,[true,false]);
});

test('收回从当前帧开始，在配置时长内精确归位，再进入可连续打断',()=>{
 const s=setup();s.field.enter(2);s.advance(80);const width=s.line(2).width;s.field.leave();assert.equal(s.line(2).width,width);
 s.advance(120);assert.ok(s.line(2).width<width&&s.line(2).width>8);
 const mid=s.line(2).width;s.field.enter(2);assert.equal(s.line(2).width,mid);s.advance(80);assert.ok(s.line(2).width>mid);
 s.field.leave();s.advance(450);assert.equal(s.line(2).width,8);assert.equal(s.line(1).width,18);assert.equal(s.scheduled(),0);
});

test('暂停和观察倍速控制同一持续时钟，隐藏期间不积累跳变',()=>{
 const s=setup();s.field.enter(2);s.advance(80);s.field.pause();const before=s.frame();s.advance(700);assert.deepEqual(s.frame(),before);
 s.field.play();s.advance(16);assert.deepEqual(s.frame(),before);s.advance(120);assert.ok(s.line(2).width>before.lines.find((line:any)=>line.index===s.rows.findIndex(row=>row.position===2&&row.visible)).width);
 s.field.speed=.5;s.field.leave();s.advance(450);assert.ok(s.line(2).width>8);s.advance(450);assert.equal(s.line(2).width,8);
});

test('解析弹簧对不同刷新率保持一致，目标值与导出的配置轨道一致',()=>{
 const samples=[30,60,120].map(hz=>{const s=setup();s.field.enter(2);s.advance(1000/hz,hz);s.advance(200,hz);return s.line(2).width});
 assert.ok(Math.max(...samples)-Math.min(...samples)<.001);
 const s=setup();s.field.enter(2.4);s.advance(600);const adapted=sidebarInteractionConfig(s.config,2.4,1,s.rows);
 for(const line of s.frame().lines){const track=adapted.tracks.find(track=>track.part==='line'+line.index&&track.property==='width')!;assert.ok(Math.abs(line.width-Number(track.values.at(-1)))<.01)}
});

test('持续引擎与字段模型可独立导出，不改写 JSON 配置',()=>{
 const adapter=historyMotion(defaultHistory('mini-sidebar')).adapters.sidebar!;
 const profileCode=Function('return ('+adapter.fieldProfileCode+')')(),engineCode=Function('return ('+adapter.fieldEngineCode+')')();
 const s=setup(engineCode);assert.deepEqual(profileCode(s.config,s.rows,1),s.profile);s.field.enter(2);s.advance(600);assert.equal(s.line(2).width,38);
 const flat=sidebarTreeRows(sidebarTree);s.field.configure(sidebarFieldProfile(s.config,flat,5),5,value=>value);s.advance(600);assert.equal(s.field.state,'finished');
});
