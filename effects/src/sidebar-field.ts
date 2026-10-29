import type {HistoryConfig} from './history-model';
import type {SidebarRow} from './mini-sidebar-model';

export type SidebarFieldLine={id:string;index:number;position:number;visible:boolean;restWidth:number;maxWidth:number;restOpacity:number};
export type SidebarFieldProfile={lines:SidebarFieldLine[];radius:number;lowOpacity:number;highOpacity:number;lowScale:number;highScale:number;spacing:number;center:number;labelLimit:number;durationMs:number;delayMs:number};
export type SidebarFieldPaint={index:number;width:number;opacity:number;scaleY:number};

/** Compile once when configuration, selection or the tree changes, never on pointer movement. */
export function sidebarFieldProfile(config:HistoryConfig,rows:SidebarRow[],selected:number):SidebarFieldProfile{
 const value=(part:string,property:string,last=false)=>Number(config.tracks.find(track=>track.part===part&&track.property===property)!.values.at(last?-1:0));
 const normal=value('line0','width'),current=value('line1','width'),reach=value('line2','width',true),neighbor=(value('line3','width',true)-normal)/(reach-normal),lowOpacity=value('line0','opacity'),currentOpacity=value('line1','opacity');
 const count=rows.filter(row=>row.visible).length;
 return {lines:rows.map((row,index)=>({id:row.id,index,position:row.position,visible:row.visible,restWidth:row.visible&&row.position===selected?current:normal,maxWidth:Math.max(row.visible&&row.position===selected?current:normal,reach*Math.pow(.82,row.depth)),restOpacity:row.visible&&row.position===selected?currentOpacity:lowOpacity})),radius:neighbor>0&&neighbor<1?1/Math.sqrt(-2*Math.log(neighbor)):13/12,lowOpacity,highOpacity:value('line2','opacity',true),lowScale:value('line0','scaleY'),highScale:value('line2','scaleY',true),spacing:Math.min((value('item3','y',true)-value('item0','y',true))/3,176/Math.max(1,count-1)),center:(count-1)/2,labelLimit:Math.max(0,115/config.scale-28),durationMs:config.durationMs,delayMs:config.delayMs};
}

/** One interruptible frame clock. Springs preserve velocity while targets change;
 * leaving snapshots the current frame and returns using the configured curve. */
export function createSidebarField(options:{paint:(lines:SidebarFieldPaint[],panelY:number)=>void;running:(value:boolean)=>void;readPointer?:()=>number|undefined;driver?:{request:(callback:(time:number)=>void)=>number;cancel:(id:number)=>void}}){
 const driver=options.driver??{request:(callback:(time:number)=>void)=>requestAnimationFrame(callback),cancel:(id:number)=>cancelAnimationFrame(id)};
 type RecordLine={line:SidebarFieldLine;values:number[];velocity:number[];from:number[];closing:boolean};
 let profile:SidebarFieldProfile|null=null,records=new Map<string,RecordLine>(),pointer=2,panelY=0,panelVelocity=0,active=false,reduced=false,paused=false,alive=false,frame=0,last:number|null=null,elapsed=0,delay=0,rate=1;
 let ease=(value:number)=>value;
 const rest=(line:SidebarFieldLine)=>[line.restWidth,line.restOpacity,profile!.lowScale];
 const label=()=>Math.max(-profile!.labelLimit,Math.min(profile!.labelLimit,(pointer-profile!.center)*profile!.spacing));
 const spring=(value:number,velocity:number,target:number,dt:number)=>{const omega=48,delta=value-target,term=velocity+omega*delta,decay=Math.exp(-omega*dt);return [target+(delta+term*dt)*decay,(velocity-omega*term*dt)*decay]};
 function paint(all=false){
  const lines:SidebarFieldPaint[]=[];
  for(const record of records.values())if(all||record.line.visible||record.closing)lines.push({index:record.line.index,width:record.values[0],opacity:record.values[1],scaleY:record.values[2]});
  options.paint(lines,panelY);
 }
 function finish(){if(frame)driver.cancel(frame);frame=0;last=null;if(alive){alive=false;options.running(false)}}
 function schedule(){if(alive&&!paused&&!frame)frame=driver.request(tick)}
 function wake(){if(!profile)return;if(!alive){alive=true;last=null;options.running(true)}schedule()}
 function tick(time:number){
  frame=0;if(!alive||paused||!profile)return;
  const input=options.readPointer?.();if(input!==undefined)pointer=input;
  const dt=last===null?0:Math.max(0,(time-last)/1000)*rate;last=time;
  let settled=true;
  if(active){
   if(delay>0){delay=Math.max(0,delay-dt*1000);settled=false}
   else{
    for(const record of records.values()){
     const {line}=record;if(!line.visible&&!record.closing)continue;
     const influence=line.visible?Math.exp(-.5*((line.position-pointer)/profile.radius)**2):0;
     const target=[line.restWidth+(line.maxWidth-line.restWidth)*influence,Math.max(line.restOpacity,profile.lowOpacity+(profile.highOpacity-profile.lowOpacity)*influence),profile.lowScale+(profile.highScale-profile.lowScale)*influence];
     for(let i=0;i<3;i++){
      const next=reduced?[target[i],0]:spring(record.values[i],record.velocity[i],target[i],dt);
      record.values[i]=next[0];record.velocity[i]=next[1];
      if(Math.abs(next[0]-target[i])>(i===0?.01:.001)||Math.abs(next[1])>.05)settled=false;
      else{record.values[i]=target[i];record.velocity[i]=0}
     }
     if(!line.visible&&record.values.every((v,i)=>Math.abs(v-rest(line)[i])<.001))record.closing=false;
    }
    const target=label(),next=reduced?[target,0]:spring(panelY,panelVelocity,target,dt);panelY=next[0];panelVelocity=next[1];
    if(Math.abs(panelY-target)>.01||Math.abs(panelVelocity)>.05)settled=false;else{panelY=target;panelVelocity=0}
   }
  }else{
   elapsed+=dt*1000;const progress=reduced?1:Math.min(1,elapsed/Math.max(1,profile.durationMs)),amount=ease(progress);
   for(const record of records.values())if(record.line.visible||record.closing){const target=rest(record.line);record.values=record.from.map((value,index)=>progress===1?target[index]:value+(target[index]-value)*amount);record.velocity=[0,0,0]}
   settled=progress===1;
  }
  paint();if(settled)finish();else schedule();
 }
 const control={
  get speed(){return rate},set speed(value:number){rate=value},
  get state(){return paused&&alive?'paused':alive?'running':'finished'},
  configure(next:SidebarFieldProfile,nextPointer:number,returnEase:(value:number)=>number,instant=false){
   profile=next;pointer=nextPointer;ease=returnEase;reduced=instant;
   const updated=new Map<string,RecordLine>();
   for(const line of next.lines){const previous=records.get(line.id);updated.set(line.id,previous?{...previous,line,closing:!line.visible&&(previous.line.visible||previous.closing)}:{line,values:rest(line),velocity:[0,0,0],from:rest(line),closing:false})}
   const initial=records.size===0;records=updated;if(initial){panelY=label();paint(true)}else if(active)wake();
  },
  enter(nextPointer?:number){if(nextPointer!==undefined)pointer=nextPointer;if(!active){active=true;delay=profile?.delayMs??0}wake()},
  point(){wake()},
  leave(){if(!active)return;active=false;elapsed=0;panelVelocity=0;for(const record of records.values()){record.from=[...record.values];record.velocity=[0,0,0]}wake()},
  reset(nextPointer=pointer){finish();active=false;paused=false;pointer=nextPointer;elapsed=0;panelVelocity=0;if(profile){panelY=label();for(const record of records.values()){record.values=rest(record.line);record.velocity=[0,0,0];record.from=[...record.values];record.closing=false}paint(true)}},
  pause(){paused=true;if(frame)driver.cancel(frame);frame=0;last=null},
  play(){paused=false;last=null;schedule()},
  stop(){finish();active=false;paused=false},
 };
 return control;
}
