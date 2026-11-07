/** Skiper UI references: https://skiper-ui.com/v1/skiper{106,46,98,92}.
 * 106 adapts the publicly supplied SmoothInput implementation; other effects are
 * independent implementations of the accessible demonstrations (Pro source gated).
 * Preserve this attribution in redistributed source. */
import type {SkiperDefinition} from './skiper-types';
type ASettings=Record<string,string|number|boolean>;
type ARuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;gallery:boolean;managed:boolean;language:'zh'|'en';durationMs:number;delayMs:number;onRunning?:(running:boolean)=>void};
type AControl={key:string;label:string;labelEn:string;kind:'range'|'text'|'textarea'|'color'|'select'|'checkbox';min?:number;max?:number;step?:number;options?:{value:string;label:string;labelEn:string}[];hint?:string;hintEn?:string};
const range=(key:string,label:string,labelEn:string,min:number,max:number,step=1):AControl=>({key,label,labelEn,kind:'range',min,max,step});
const text=(key:string,label:string,labelEn:string):AControl=>({key,label,labelEn,kind:'text'});
const color=(key:string,label:string,labelEn:string):AControl=>({key,label,labelEn,kind:'color'});
export const skiperGroupA:SkiperDefinition[]=[
 {id:'skiper-106',number:106,sourceAvailable:true,title:'平滑光标输入框',titleEn:'Smooth Caret Input',summary:'弹簧光标跟随原生文本选区，保留标准输入作对照。',summaryEn:'A spring-driven caret follows native text selection, beside a regular input for comparison.',width:520,height:360,defaults:{placeholder:'smooth input',comparisonPlaceholder:'normal input',initialValue:'',inputType:'text',fontSize:24,fieldWidth:420,stiffness:500,damping:30,mass:.5,background:'#f5f4f3',fieldBackground:'#fcfcfc',textColor:'#121212'},controls:[text('placeholder','平滑输入占位文字','Smooth input placeholder'),text('comparisonPlaceholder','普通输入占位文字','Regular input placeholder'),text('initialValue','默认文字','Initial text'),{key:'inputType',label:'输入类型',labelEn:'Input type',kind:'select',options:[{value:'text',label:'文本',labelEn:'Text'},{value:'password',label:'密码',labelEn:'Password'}]} as AControl,range('fontSize','文字大小','Font size',12,48,2),range('fieldWidth','输入框宽度','Field width',240,460),range('stiffness','弹簧刚度','Spring stiffness',50,1000,10),range('damping','阻尼','Damping',5,100),range('mass','质量','Mass',.1,3,.1),color('background','背景颜色','Background'),color('fieldBackground','输入背景','Field background'),color('textColor','文字颜色','Text color')]},
 {id:'skiper-46',number:46,sourceAvailable:false,title:'黏连状态菜单',titleEn:'Next.js Gooey Menu',summary:'黑色圆形标志与三行状态气泡通过 SVG 黏连滤镜展开和收合。',summaryEn:'A black circular mark and three-row status tooltip expand through a gooey SVG filter.',width:440,height:380,defaults:{name:'Next.js',version:'v13.4.8',errorLabel:'Errors',errors:'3',routeLabel:'Route',route:'Static',buttonSize:40,panelWidth:200,gooBlur:4.4,lift:50,background:'#ffffff',panelColor:'#000000',textColor:'#ffffff',errorColor:'#fb2c36'},controls:[text('name','框架名称','Framework'),text('version','版本','Version'),text('errorLabel','错误标签','Error label'),text('errors','错误数量','Error count'),text('routeLabel','路由标签','Route label'),text('route','路由状态','Route value'),range('buttonSize','圆形按钮直径','Button diameter',28,64),range('panelWidth','气泡宽度','Panel width',160,260),range('gooBlur','黏连模糊','Goo blur',0,10,.1),range('lift','展开距离','Expansion distance',35,85),color('background','背景颜色','Background'),color('panelColor','菜单颜色','Menu color'),color('textColor','文字颜色','Text color'),color('errorColor','错误提示颜色','Error color')]},
 {id:'skiper-98',number:98,sourceAvailable:false,title:'竖向裁切提示菜单',titleEn:'Vertical Tooltip Menu',summary:'三枚竖向图标共享一个裁切提示层，提示随悬停和键盘聚焦滑动。',summaryEn:'Three vertically stacked icons share a clipped tooltip that follows hover and keyboard focus.',width:360,height:300,defaults:{comment:'Comment',share:'Share',menu:'Menu',side:'left',badge:true,iconSize:32,gap:8,background:'#f5f4f3',menuColor:'#000000',textColor:'#ffffff',badgeColor:'#00a6f4'},controls:[text('comment','评论标签','Comment label'),text('share','分享标签','Share label'),text('menu','菜单标签','Menu label'),{key:'side',label:'提示位置',labelEn:'Tooltip side',kind:'select',options:[{value:'left',label:'左侧',labelEn:'Left'},{value:'right',label:'右侧',labelEn:'Right'}]} as AControl,{key:'badge',label:'显示菜单蓝点',labelEn:'Show menu badge',kind:'checkbox'} as AControl,range('iconSize','每项尺寸','Item size',28,44),range('gap','提示间距','Tooltip gap',4,24),color('background','背景颜色','Background'),color('menuColor','菜单颜色','Menu color'),color('textColor','文字颜色','Text color'),color('badgeColor','提示点颜色','Badge color')]},
 {id:'skiper-92',number:92,sourceAvailable:false,title:'变形命令搜索',titleEn:'Vercel Command Search',summary:'紧凑搜索入口变形成分组命令面板，可搜索、方向键选择、Esc 收起。',summaryEn:'A compact search trigger morphs into a grouped command panel with filtering, arrow-key selection and Escape.',width:660,height:820,defaults:{placeholder:'Find...',shortcut:'F',suggestions:'Calendar\nSearch Emoji\nCalculator\nDocuments\nImages\nMusic',settings:'Profile\nBilling\nSettings\nNotifications\nMessages\nSecurity',help:'FAQ\nContact Support',docs:'Documentation\nTutorials',panelWidth:384,listHeight:300,background:'#f5f4f3',panelColor:'#f5f4f3',textColor:'#121212'},controls:[text('placeholder','搜索占位文字','Search placeholder'),text('shortcut','打开快捷键','Open shortcut'),{key:'suggestions',label:'建议命令（每行一项）',labelEn:'Suggested commands (one per line)',kind:'textarea'} as AControl,{key:'settings',label:'设置命令（每行一项）',labelEn:'Settings commands (one per line)',kind:'textarea'} as AControl,{key:'help',label:'帮助命令（每行一项）',labelEn:'Help commands (one per line)',kind:'textarea'} as AControl,{key:'docs',label:'文档命令（每行一项）',labelEn:'Documentation commands (one per line)',kind:'textarea'} as AControl,range('panelWidth','展开面板宽度','Panel width',280,440),range('listHeight','命令列表最大高度','List maximum height',160,360),color('background','背景颜色','Background'),color('panelColor','面板颜色','Panel color'),color('textColor','文字颜色','Text color')]},
];

/** No imports or closure dependencies: shared verbatim by preview and offline export. */
export function createSkiperA(container:HTMLElement,id:string,settings:ASettings,runtime:ARuntime){
 let s={...settings},r={...runtime},destroyed=false,version=0,open=false,active=0,demoStep=0,lastSettings=JSON.stringify(s),value=String(s.initialValue??''),userActed=false;
 let raf=0,demoTimer:ReturnType<typeof setTimeout>|undefined,finishTimer:ReturnType<typeof setTimeout>|undefined;
 const uid='ska'+Math.random().toString(36).slice(2),root=document.createElement('div');root.className='skiper-effect sk-a';root.dataset.instance=uid;root.dataset.skiper=id;root.dataset.running='false';root.dataset.state='idle';root.dataset.attribution='Skiper UI';root.tabIndex=-1;container.append(root);
 const escape=(v:unknown)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 const num=(key:string,fallback:number)=>{const n=Number(s[key]);return Number.isFinite(n)?n:fallback};
 const str=(key:string,fallback='')=>String(s[key]??fallback);
 const live=()=>!destroyed&&!document.hidden&&r.enabled&&!r.paused&&!r.reduced&&r.speed>0&&(!r.managed||r.gallery||userActed);
 const ms=()=>r.reduced?0:Math.max(60,r.durationMs||350)/Math.max(.05,r.speed);
 const setRunning=(v:boolean)=>{if(root.dataset.running!==String(v)){root.dataset.running=String(v);r.onRunning?.(v)}};
 const cancelTimers=()=>{clearTimeout(demoTimer);clearTimeout(finishTimer);cancelAnimationFrame(raf);raf=0;stopMotion();demoTimer=undefined;finishTimer=undefined;setRunning(false)};
 const transition=()=>{clearTimeout(finishTimer);if(ms()&&live()){setRunning(true);finishTimer=setTimeout(()=>{setRunning(false)},ms()+40)}};
 const css=`
 .sk-a{position:relative;width:100%;height:100%;overflow:hidden;isolation:isolate;display:grid;place-items:center;font-family:"Skiper Inter",Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-size:14px;line-height:1.5;font-weight:400;letter-spacing:normal;text-align:left;background:var(--ska-bg);color:var(--ska-ink);box-sizing:border-box}
 .sk-a *,.sk-a *:before,.sk-a *:after{box-sizing:border-box}.sk-a button,.sk-a input{font:inherit;line-height:inherit;color:inherit;margin:0}.sk-a button{border:0;background:none;padding:0;cursor:pointer;transition:none}.sk-a button:focus-visible{outline:2px solid #909090;outline-offset:3px}.sk-a button:hover{background:none}.sk-a input{min-width:0;outline:none;border:none;padding:0;background:transparent}.sk-a input::placeholder{color:currentColor;opacity:.4}.sk-a svg{display:block;flex-shrink:0}.sk-a kbd{font-family:inherit;font-weight:400}.sk-a .ska-note{font-size:12px;line-height:15px;text-align:center;text-transform:uppercase;opacity:.4;max-width:12ch;position:relative}.sk-a .ska-note:after{content:'';position:absolute;top:100%;left:50%;width:1px;height:64px;background:linear-gradient(transparent,currentColor)}
 .sk-a .ska-inputs{width:min(var(--ska-width),calc(100% - 40px));display:grid;gap:16px;position:absolute;top:calc(50% - 39px);left:50%;transform:translateX(-50%)}.sk-a .ska-input-note{position:absolute;top:calc(50% - 149px);left:50%;transform:translateX(-50%)}.sk-a .ska-field{background:var(--ska-field);border-radius:16px;padding:16px;position:relative}.sk-a .ska-field:has(input:focus-visible){outline:2px solid #d8d5d1;outline-offset:2px}.sk-a .ska-inputline{position:relative;font-size:var(--ska-font);line-height:1.5}.sk-a .ska-inputline input{width:100%;height:1.5em;display:block;caret-color:transparent}.sk-a .ska-normal{display:block;width:100%;font-size:24px;line-height:32px}.sk-a .ska-caret{position:absolute;pointer-events:none;left:0;top:50%;height:.9em;width:2px;background:var(--ska-ink);transform:translateY(-50%);opacity:0}.sk-a .ska-measure{position:absolute;visibility:hidden;white-space:pre;pointer-events:none;left:0;top:0}
 .sk-a .ska-goo-anchor{position:absolute;left:calc(50% - max(0px,var(--ska-panelwidth) - 210px));bottom:40%;transform:translateX(-50%);filter:url(#${uid}-goo)}.sk-a .ska-goo-button{position:relative;width:var(--ska-button);height:var(--ska-button);border-radius:50%;background:var(--ska-panel)!important;color:var(--ska-ink);display:grid;place-items:center;z-index:2}.sk-a .ska-goo-button svg{width:16px;height:16px;transform:translateX(-.5px)}.sk-a .ska-goo-panel{transition:none!important;position:absolute;bottom:0;left:0;width:var(--ska-button);height:var(--ska-button);border-radius:50%;background:var(--ska-panel);overflow:hidden;transform:translateY(0);transition:width var(--ska-ms) cubic-bezier(.2,.8,.2,1),height var(--ska-ms) cubic-bezier(.2,.8,.2,1),border-radius var(--ska-ms),transform var(--ska-ms) cubic-bezier(.16,1.3,.3,1)}.sk-a[data-open=true] .ska-goo-panel{width:var(--ska-panelwidth);height:116px;border-radius:10px;transform:translateY(calc(-1 * var(--ska-lift)))}.sk-a .ska-goo-content{transition:none!important;width:var(--ska-panelwidth);padding:16px;display:grid;gap:12px;opacity:0;filter:blur(4px);transition:opacity var(--ska-ms),filter var(--ska-ms);font-size:14px;line-height:20px}.sk-a[data-open=true] .ska-goo-content{opacity:1;filter:blur(0)}.sk-a .ska-row{display:flex;align-items:center;justify-content:space-between;gap:12px;white-space:nowrap}.sk-a .ska-goo-version{font-family:"Skiper Geist Mono","SFMono-Regular",Consolas,monospace;letter-spacing:-.7px;opacity:.5}.sk-a .ska-goo-strong{font-family:"Skiper Geist",Arial,sans-serif;font-weight:600}.sk-a .ska-error{color:var(--ska-error);position:relative;z-index:1}.sk-a .ska-error:before{content:'';position:absolute;width:24px;height:24px;background:currentColor;border-radius:50%;opacity:.2;left:50%;top:50%;transform:translate(-50%,-50%);z-index:-1}.sk-a .ska-goo-route{opacity:.45}
 .sk-a .ska-vmenu{position:relative}.sk-a .ska-icons{position:relative;z-index:1;display:flex;flex-direction:column;padding:8px;background:var(--ska-panel);border-radius:999px;color:var(--ska-ink)}.sk-a .ska-icon{width:var(--ska-item);height:var(--ska-item);border-radius:50%;padding:6px;position:relative;display:grid;place-items:center}.sk-a .ska-icon:hover,.sk-a .ska-icon:focus-visible{background:#ffffff26}.sk-a .ska-icon svg{width:100%;height:100%;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}.sk-a .ska-badge{position:absolute;right:6px;top:6px;width:8px;height:8px;background:var(--ska-badge);border:1.7px solid var(--ska-panel);border-radius:50%}.sk-a .ska-tooltip{transition:none!important;position:absolute;right:calc(100% + var(--ska-gap));top:0;background:var(--ska-panel);color:var(--ska-ink);border-radius:10px;opacity:0;pointer-events:none;clip-path:inset(0 0 67% round 10px);transform:translateX(4px);transition:clip-path var(--ska-ms) cubic-bezier(.16,1,.3,1),opacity 120ms,transform var(--ska-ms) cubic-bezier(.16,1,.3,1)}.sk-a[data-side=right] .ska-tooltip{right:auto;left:calc(100% + var(--ska-gap));transform:translateX(-4px)}.sk-a[data-tip=true] .ska-tooltip{opacity:1;transform:translateX(0)}.sk-a .ska-tip-row{height:var(--ska-item);padding:0 8px;display:flex;align-items:center;gap:8px;white-space:nowrap;font-size:14px;font-weight:500;line-height:1.25;letter-spacing:-.35px}.sk-a .ska-tip-keys{display:inline-flex;align-items:center;gap:4px}.sk-a .ska-tip-keys svg{width:10px;height:10px;stroke:currentColor;stroke-width:2;fill:none}.sk-a .ska-tip-row kbd{font-family:inherit;display:inline-grid;place-items:center;min-width:20px;height:20px;border:1px solid #ffffff4d;border-radius:3px;font-size:12px;line-height:16px;padding:2px}
 .sk-a .ska-search-note{position:absolute;left:50%;top:calc(50% - 182.5px);transform:translateX(-50%)}.sk-a .ska-search{position:relative;width:192px;height:32px;margin-top:45px}.sk-a .ska-search-trigger{width:192px;height:32px;display:flex;align-items:center;border:1px solid #12121215;border-radius:6px;font-size:14px;text-align:left}.sk-a .ska-search-trigger:hover{border-color:#12121233}.sk-a .ska-search-icon{width:32px;height:32px;display:grid;place-items:center;opacity:.5}.sk-a .ska-search-icon svg{width:16px;height:16px}.sk-a .ska-search-placeholder{flex:1;opacity:.4}.sk-a .ska-key{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:12px;display:grid;place-items:center;width:22px;height:22px;border:1px solid #12121218;border-radius:3px;margin:0 5px}.sk-a .ska-command{transition:none!important;position:absolute;z-index:3;left:-16px;top:-8px;width:var(--ska-panelwidth);border:0;outline:1px solid #12121218;border-radius:8px;background:var(--ska-panel);box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -2px #0000001a;overflow:hidden;transform-origin:0 0;opacity:0;pointer-events:none;transform:none;transition:transform var(--ska-ms) cubic-bezier(.16,1,.3,1),opacity calc(var(--ska-ms)*.4)}.sk-a[data-open=true] .ska-command{opacity:1;pointer-events:auto;transform:none}.sk-a[data-open=true] .ska-search-trigger{opacity:0;pointer-events:none}.sk-a[data-open=true] .ska-search{transform:none}.sk-a .ska-command-head{height:49px;border-bottom:1px solid #12121218;display:flex;align-items:center}.sk-a .ska-command-head .ska-search-icon{width:48px;height:48px;opacity:1}.sk-a .ska-command-head input{flex:1;width:0;font-size:14px;line-height:20px;height:40px}.sk-a .ska-command-head input::placeholder{color:var(--ska-muted);opacity:1}.sk-a .ska-command-esc{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:12px;line-height:16px;letter-spacing:-.6px;border:1px solid #12121218;border-radius:3px;padding:2px 4px;margin:0 12px 0 8px}.sk-a .ska-command-list{-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 40px),transparent 100%);mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 40px),transparent 100%);max-height:var(--ska-listheight);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:0}.sk-a .ska-command-group{padding:4px}.sk-a .ska-command-group+.ska-command-group{border-top:1px solid #12121218}.sk-a .ska-group-title{padding:6px 8px;font-size:12px;line-height:16px;font-weight:500;color:var(--ska-muted);opacity:1}.sk-a .ska-command-item{display:flex;align-items:center;gap:8px;width:100%;border-radius:3px;padding:6px 8px;text-align:left;font-size:14px;line-height:20px;min-height:32px}.sk-a .ska-command-item:hover,.sk-a .ska-command-item[data-selected=true]{background:#12121219}.sk-a .ska-command-item svg{width:16px;height:16px;color:var(--ska-muted);opacity:1}.sk-a .ska-command-shortcut{margin-left:auto;font-size:12px;line-height:16px;letter-spacing:1.2px;color:var(--ska-muted);opacity:1}.sk-a .ska-search-shade{position:absolute;inset:0;z-index:2;background:var(--ska-bg);opacity:.8}.sk-a .ska-search{z-index:3}.sk-a .ska-command-empty{padding:24px;text-align:center;font-size:14px;line-height:20px;opacity:.5}.sk-a .ska-status{position:absolute;left:20px;right:20px;bottom:14px;font-size:12px;text-align:center;opacity:.5;pointer-events:none}
 `;
 const projectionCSS=`.sk-a .ska-search-trigger{border:0;border-radius:0;overflow:visible;position:relative}.sk-a .ska-search-trigger:before{content:'';position:absolute;inset:0;border:1px solid #12121215;border-radius:6px;pointer-events:none}.sk-a .ska-search-trigger:hover:before{border-color:#12121233}.sk-a .ska-search-trigger .ska-search-icon{opacity:1}.sk-a .ska-search-trigger .ska-search-icon svg{opacity:.5}.sk-a .ska-search-placeholder{position:relative;height:32px}.sk-a .ska-search-center-label{position:absolute;display:grid;align-items:center;left:0;top:0;width:286px;height:32px;transform-origin:0 0;white-space:nowrap}.sk-a .ska-key{position:absolute;left:165px;top:5px;margin:0}.sk-a .ska-command{left:0;top:0;transform-origin:0 0}.sk-a .ska-command-center{display:flex;align-items:center;flex:1;height:36px;min-width:0;transform-origin:0 0}.sk-a .ska-command-center input{width:100%;flex:1}.sk-a .ska-command-word{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:48px;height:48px;padding-right:4px;transform-origin:0 0}.sk-a .ska-command-word .ska-command-esc{margin:0;flex-shrink:0}.sk-a .ska-command-list{transform-origin:0 0;flex-shrink:0}`;
 const style=document.createElement('style');style.textContent=(css+projectionCSS).replaceAll('.sk-a','.sk-a[data-instance="'+uid+'"]');root.append(style);
 const stage=document.createElement('div');stage.style.display='contents';root.append(stage);
 const searchIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>';
 const paths=['<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>','<g transform="rotate(-90 12 12)"><path d="m16 17 5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></g>','<path d="M4 6h16M4 12h16M4 18h16"/>'];
 const icon=(path:string)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 let input:HTMLInputElement|null=null,caret:HTMLElement|null=null,measure:HTMLElement|null=null,normal:HTMLInputElement|null=null,caretX=0,caretTarget=0,caretVelocity=0,caretTime=0,items:{group:string;label:string;index:number;shortcut:string}[]=[],filtered:typeof items=[];
 const disposers:(()=>void)[]=[];
 const listen=(target:EventTarget,type:string,fn:(event:any)=>void)=>{target.addEventListener(type,fn);disposers.push(()=>target.removeEventListener(type,fn))};
 const q=(sel:string)=>root.querySelector<HTMLElement>(sel)!;
 function props(){
  root.style.setProperty('--ska-bg',str('background','#f5f4f3'));root.style.setProperty('--ska-muted','color-mix(in srgb,var(--ska-ink) 73.2%,var(--ska-bg))');root.style.setProperty('--ska-ink',str('textColor','#121212'));root.style.setProperty('--ska-field',str('fieldBackground','#fcfcfc'));root.style.setProperty('--ska-font',num('fontSize',24)+'px');root.style.setProperty('--ska-width',num('fieldWidth',420)+'px');root.style.setProperty('--ska-panel',str('panelColor',str('menuColor','#000000')));root.style.setProperty('--ska-panelwidth',num('panelWidth',200)+'px');root.style.setProperty('--ska-button',num('buttonSize',40)+'px');root.style.setProperty('--ska-lift',num('lift',50)+'px');root.style.setProperty('--ska-error',str('errorColor','#fb2c36'));root.style.setProperty('--ska-item',num('iconSize',32)+'px');root.style.setProperty('--ska-gap',num('gap',8)+'px');root.style.setProperty('--ska-badge',str('badgeColor','#00a6f4'));root.style.setProperty('--ska-listheight',num('listHeight',300)+'px');root.style.setProperty('--ska-ms',ms()+'ms');
 }
 function markUser(){userActed=true;props();clearTimeout(demoTimer);demoTimer=undefined}
 function inputCaret(){
  if(!input||!caret||!measure)return;
  const focused=document.activeElement===input,selected=input.selectionStart!==input.selectionEnd;
  const cs=getComputedStyle(input),index=input.selectionDirection==='backward'?input.selectionStart??0:input.selectionEnd??0;
  let fontSize=cs.fontSize;
  const bullet=/firefox|fxios/i.test(navigator.userAgent)?'●':'•';
  if(input.type==='password'&&bullet==='•'&&!/chrome|chromium|crios/i.test(navigator.userAgent))fontSize=(parseFloat(fontSize)+6.25)+'px';
  measure.style.font=`${cs.fontStyle} ${cs.fontWeight} ${fontSize} ${cs.fontFamily}`;measure.style.letterSpacing=cs.letterSpacing;measure.style.fontFeatureSettings=cs.fontFeatureSettings;measure.style.fontVariationSettings=cs.fontVariationSettings;
  measure.textContent=input.type==='password'?bullet.repeat(index):input.value.slice(0,index);
  const paddingLeft=parseFloat(cs.paddingLeft)||0,paddingRight=parseFloat(cs.paddingRight)||0,absolute=index?measure.offsetWidth+paddingLeft:paddingLeft-1;
  const maxScroll=Math.max(0,input.scrollWidth-input.clientWidth);
  if(absolute>input.scrollLeft+input.clientWidth-paddingRight)input.scrollLeft=Math.min(absolute-input.clientWidth+paddingRight,maxScroll);
  if(absolute<input.scrollLeft+paddingLeft)input.scrollLeft=Math.max(0,absolute-paddingLeft);
  caretTarget=Math.min(input.clientWidth-paddingRight,absolute-input.scrollLeft);
  caret.style.opacity=focused&&!selected&&caretTarget>=paddingLeft-1?'1':'0';
  root.dataset.value=input.value;value=input.value;
  if(!live()){caretX=caretTarget;caretVelocity=0;caret.style.left=caretX+'px';return}
  if(Math.abs(caretTarget-caretX)>.01&&!raf){caretTime=performance.now();setRunning(true);raf=requestAnimationFrame(animateCaret)}
 }
 function springStep(x:number,v:number,target:number,dt:number,k:number,damping:number,mass:number):[number,number]{
  // Exact damped harmonic oscillator flow; no frame-size-dependent Euler error.
  if(dt<=0)return [x,v];
  const w=Math.sqrt(k/mass),a=damping/(2*mass),delta=x-target,discriminant=w*w-a*a;
  if(Math.abs(discriminant)<1e-7){const b=v+a*delta,e=Math.exp(-a*dt);return [target+e*(delta+b*dt),e*(v-a*b*dt)]}
  if(discriminant>0){const b=Math.sqrt(discriminant),sin=Math.sin(b*dt),cos=Math.cos(b*dt),e=Math.exp(-a*dt),c=(v+a*delta)/b;return [target+e*(delta*cos+c*sin),e*((-a*delta+b*c)*cos+(-a*c-b*delta)*sin)]}
  const b=Math.sqrt(-discriminant),slow=-a+b,fast=-a-b,c=(v-fast*delta)/(slow-fast),d=delta-c,e1=Math.exp(slow*dt),e2=Math.exp(fast*dt);return [target+c*e1+d*e2,slow*c*e1+fast*d*e2];
 }
 function animateCaret(now:number){
  raf=0;if(!live()||!caret){setRunning(false);return}
  const dt=Math.max(0,(now-caretTime)/1000*r.speed);caretTime=now;
  [caretX,caretVelocity]=springStep(caretX,caretVelocity,caretTarget,dt,num('stiffness',500),num('damping',30),Math.max(.05,num('mass',.5)));
  caret.style.left=caretX+'px';root.dataset.frame=String(now);
  if(Math.abs(caretTarget-caretX)<.001&&Math.abs(caretVelocity)<.01){caretX=caretTarget;caretVelocity=0;caret.style.left=caretX+'px';setRunning(false)}else raf=requestAnimationFrame(animateCaret);
 }
 type Channel={x:number;v:number;target:number;k:number;damping:number;delay:number;restDelta:number;restSpeed:number;kind:'spring'|'tween';from:number;elapsed:number;duration:number;easing?:'motion'|'easeOut'};
 const channels:Record<string,Channel>={},channelDefaults:Record<string,number>={width:num('buttonSize',40),height:num('buttonSize',40),radius:20,y:0,content:0,tipTop:0,tipBottom:79,tipY:0,tipOpacity:0,command:0,word:0,listOpacity:0,listY:-50};
 let motionRaf=0,motionTime=0;
 function channel(key:string){return channels[key]??(channels[key]={x:channelDefaults[key]??0,v:0,target:channelDefaults[key]??0,k:400,damping:35,delay:0,restDelta:.001,restSpeed:.01,kind:'spring',from:0,elapsed:0,duration:0})}
 function motionScale(){return Math.max(.16,r.durationMs/500)}
 function startChannel(c:Channel){
  if(r.reduced||!r.enabled){c.x=c.target;c.v=0;c.delay=0;c.elapsed=c.duration;paintMotion();return}
  if(live()&&!motionRaf){motionTime=performance.now();setRunning(true);motionRaf=requestAnimationFrame(animateMotion)}
 }
 function movePhysical(key:string,target:number,stiffness:number,damping:number,mass=1,delayMs=0,regularRest=false){
  const c=channel(key);if(Math.abs(c.target-target)<1e-7&&c.kind==='spring')return;
  const granular=Math.abs(c.x-target)<5;c.target=target;c.kind='spring';c.k=stiffness/mass;c.damping=damping/mass;c.delay=Math.max(0,delayMs/1000);
  c.restDelta=regularRest?(granular?.005:.5):.001;c.restSpeed=regularRest?(granular?.01:2):.01;startChannel(c);
 }
 function motionEase(progress:number){
  // Public Motion non-transform default: cubic-bezier(.25,.1,.35,1).
  let t=progress,low=0,high=1;
  for(let i=0;i<20;i++){const q=1-t,x=3*q*q*t*.25+3*q*t*t*.35+t*t*t;if(Math.abs(x-progress)<1e-8)break;if(x<progress)low=t;else high=t;t=(low+high)/2}
  const q=1-t;return 3*q*q*t*.1+3*q*t*t+t*t*t;
 }
 function tween(key:string,target:number,durationMs:number,easing:'motion'|'easeOut'='motion'){
  const c=channel(key);if(Math.abs(c.target-target)<1e-7&&c.kind==='tween')return;
  c.kind='tween';c.easing=easing;c.from=c.x;c.target=target;c.v=0;c.delay=0;c.elapsed=0;c.duration=durationMs/1000;startChannel(c);
 }
 function commandEaseOut(progress:number){
  // Motion's explicit {duration} transition keeps animateMotionValue's easeOut.
  let t=progress,low=0,high=1;for(let i=0;i<20;i++){const q=1-t,x=3*q*t*t*.58+t*t*t;if(Math.abs(x-progress)<1e-8)break;if(x<progress)low=t;else high=t;t=(low+high)/2}return 3*(1-t)*t*t+t*t*t;
 }
 function moveCommandLayout(key:string,target:number){
  const c=channel(key),changed=c.target!==target;movePhysical(key,target,450,25,.1);
  // Public projection.startAnimation animates [0,1000] with velocity:0 on every snapshot.
  if(changed){c.v=0;c.from=c.x;c.restDelta=.0005;c.restSpeed=.002}
 }
 function commandProjection(p:number,word:number,width:number,height:number){
  // Source shared-layout children correct the ancestor's projection scale independently.
  const panel={x:-16*p,y:-8*p,w:192+(width-192)*p,h:32+(height-32)*p};
  return {panel,icon:{x:8-8*p,y:8,w:16,h:16},center:{x:32,y:-2*p,w:286+(width-96-286)*p,h:32+4*p},word:{x:160+(width-224)*word,y:-8*word,w:32+16*word,h:32+16*word}};
 }
 function projectCommandChild(element:HTMLElement|SVGElement,natural:{x:number;y:number;w:number;h:number},target:{x:number;y:number;w:number;h:number},parent:{x:number;y:number;w:number;h:number},width:number,height:number){
  const sx=parent.w/width,sy=parent.h/height;const x=(target.x-parent.x)/sx-natural.x,y=(target.y-parent.y)/sy-natural.y;
  element.style.transformOrigin='0 0';element.style.transform=`translate(${x}px,${y}px) scale(${target.w/natural.w/sx},${target.h/natural.h/sy})`;
 }
 function paintMotion(){
  if(id==='skiper-46'){
   const panel=root.querySelector<HTMLElement>('.ska-goo-panel'),content=root.querySelector<HTMLElement>('.ska-goo-content');if(!panel||!content)return;
   panel.style.width=channel('width').x+'px';panel.style.height=channel('height').x+'px';panel.style.borderRadius=Math.max(0,channel('radius').x)+'px';panel.style.transform=`translateY(${channel('y').x}px)`;
   const opacity=Math.max(0,Math.min(1,channel('content').x));content.style.opacity=String(opacity);content.style.filter=`blur(${4*(1-opacity)}px)`;
  }else if(id==='skiper-98'){
   const tip=root.querySelector<HTMLElement>('.ska-tooltip');if(!tip)return;tip.style.clipPath=`inset(${channel('tipTop').x}% 0px ${channel('tipBottom').x}% round 10px)`;tip.style.transform=`translateY(${channel('tipY').x}px)`;tip.style.opacity=String(Math.max(0,Math.min(1,channel('tipOpacity').x)));
  }else if(id==='skiper-92'){
   const panel=root.querySelector<HTMLElement>('.ska-command'),head=root.querySelector<HTMLElement>('.ska-command-head'),list=root.querySelector<HTMLElement>('.ska-command-list');if(!panel||!head||!list)return;
   const p=Math.max(0,Math.min(1,channel('command').x)),word=Math.max(0,Math.min(1,channel('word').x)),width=num('panelWidth',384),listHeight=Math.min(num('listHeight',300),list.scrollHeight),height=49+listHeight;
   const geometry=commandProjection(p,word,width,height),bounds=geometry.panel,sx=bounds.w/width,sy=bounds.h/height;
   panel.style.width=width+'px';panel.style.height=height+'px';panel.style.left=bounds.x+'px';panel.style.top=bounds.y+'px';panel.style.transformOrigin='0 0';panel.style.transform=`scale(${sx},${sy})`;head.style.height='49px';
   // Public crossfade uses circOut on [0,.5] for the lead and linear [.5,.95] for the follow.
   const c=channel('command'),progress=c.target===c.from?1:Math.max(0,Math.min(1,(c.x-c.from)/(c.target-c.from))),lead=Math.sqrt(1-Math.pow(Math.min(1,progress*2)-1,2)),follow=1-Math.max(0,Math.min(1,(progress-.5)/.45));
   panel.style.opacity=String(open?lead:(p>.0001?follow:0));const trigger=q('.ska-search-trigger');trigger.style.opacity=String(open?follow:lead);trigger.style.transformOrigin='0 0';trigger.style.transform=`translate(${bounds.x}px,${bounds.y}px) scale(${bounds.w/192},${bounds.h/32})`;
   const source={x:bounds.x,y:bounds.y,w:bounds.w,h:bounds.h};
   projectCommandChild(head.querySelector<SVGElement>('.ska-search-icon svg')!,{x:16,y:16,w:16,h:16},geometry.icon,source,width,height);
   projectCommandChild(q('.ska-command-center'),{x:48,y:6,w:width-96,h:36},geometry.center,source,width,height);
   projectCommandChild(q('.ska-command-word'),{x:width-48,y:0,w:48,h:48},geometry.word,source,width,height);
   projectCommandChild(trigger.querySelector<SVGElement>('svg')!,{x:8,y:8,w:16,h:16},geometry.icon,source,192,32);
   projectCommandChild(q('.ska-search-center-label'),{x:32,y:0,w:286,h:32},geometry.center,source,192,32);
   const keyScale=geometry.word.w/32;projectCommandChild(q('.ska-key'),{x:165,y:5,w:22,h:22},{x:geometry.word.x+5*keyScale,y:geometry.word.y+5*keyScale,w:22*keyScale,h:22*keyScale},source,192,32);
   list.style.opacity=String(Math.max(0,Math.min(1,channel('listOpacity').x)));projectCommandChild(list,{x:0,y:49,w:width,h:Math.max(1,listHeight)},{x:bounds.x,y:bounds.y+49+channel('listY').x,w:width,h:Math.max(1,listHeight)},source,width,height);
  }
 }
 function animateMotion(now:number){
  motionRaf=0;if(!live()||document.hidden){setRunning(false);return}
  const dt=Math.max(0,(now-motionTime)/1000*r.speed/motionScale());motionTime=now;let moving=false;
  for(const c of Object.values(channels)){
   let elapsed=dt;if(c.delay>0){const skipped=Math.min(c.delay,elapsed);c.delay-=skipped;elapsed-=skipped;if(c.delay>0)moving=true}
   if(c.kind==='tween'){c.elapsed=Math.min(c.duration,c.elapsed+elapsed);const p=c.duration>0?c.elapsed/c.duration:1;c.x=c.from+(c.target-c.from)*(c.easing==='easeOut'?commandEaseOut(p):motionEase(p));if(p<1)moving=true;else c.x=c.target}
   else{if(elapsed>0)[c.x,c.v]=springStep(c.x,c.v,c.target,elapsed,c.k,c.damping,1);if(Math.abs(c.x-c.target)<c.restDelta&&Math.abs(c.v)<c.restSpeed){c.x=c.target;c.v=0}else moving=true;}
  }
  paintMotion();root.dataset.frame=String(now);if(moving){setRunning(true);motionRaf=requestAnimationFrame(animateMotion)}else setRunning(false);
 }
 function stopMotion(){cancelAnimationFrame(motionRaf);motionRaf=0}
 function resumeMotion(){if(live()&&id==='skiper-106'&&caret&&!raf&&(Math.abs(caretX-caretTarget)>.001||Math.abs(caretVelocity)>.01)){caretTime=performance.now();setRunning(true);raf=requestAnimationFrame(animateCaret)}if(live()&&!motionRaf&&Object.values(channels).some(c=>c.delay>0||(c.kind==='tween'&&c.elapsed<c.duration)||Math.abs(c.x-c.target)>c.restDelta||Math.abs(c.v)>c.restSpeed)){motionTime=performance.now();setRunning(true);motionRaf=requestAnimationFrame(animateMotion)}}
 function setOpen(next:boolean,focus=false){
  if(id==='skiper-92'&&next&&!open&&channel('command').x<=.0005&&input){input.value='';active=0;buildList();q('.ska-command-list').scrollTop=0}
  open=next;root.dataset.open=String(open);root.dataset.state=open?'open':'closed';
  if(id==='skiper-46'){
   q('.ska-goo-panel').setAttribute('aria-hidden',String(!open));const size=num('buttonSize',40),delay=open?150:0;movePhysical('width',open?num('panelWidth',200):size,300,30,1,delay,true);movePhysical('height',open?116:size,300,30,1,delay,true);movePhysical('radius',open?10:size/2,300,30,1,delay,true);movePhysical('y',open?-num('lift',50):0,300,30,1,open?0:150,true);tween('content',open?1:0,300);
  }else if(id==='skiper-92'){moveCommandLayout('command',open?1:0);if(open)moveCommandLayout('word',1);else tween('word',0,100,'easeOut');movePhysical('listOpacity',open?1:0,450,25,.1);movePhysical('listY',open?0:-50,450,25,.1)}
  const trigger=root.querySelector<HTMLElement>('.ska-goo-button,.ska-search-trigger');trigger?.setAttribute('aria-expanded',String(open));
  if(id==='skiper-92'){
   const command=q('.ska-command');command.inert=!open;command.setAttribute('aria-hidden',String(!open));let shade=root.querySelector('.ska-search-shade');
   if(open&&!shade){shade=document.createElement('div');shade.className='ska-search-shade';stage.append(shade);shade.addEventListener('click',()=>{markUser();setOpen(false);q('.ska-search-trigger').focus()})}
   if(!open)shade?.remove();if(focus&&open)input?.focus({preventScroll:true});
  }
 }
 function showTip(index:number,show=true){
  active=index;root.dataset.tip=String(show);root.dataset.state=show?'tooltip-'+index:'idle';q('.ska-tooltip').setAttribute('aria-hidden',String(!show));root.querySelectorAll('.ska-tip-row').forEach((row,i)=>row.setAttribute('aria-hidden',String(i!==index)));
  if(show){
   const button=root.querySelectorAll<HTMLElement>('.ska-icon')[index],row=root.querySelectorAll<HTMLElement>('.ska-tip-row')[index];
   const position=button.offsetTop+button.offsetHeight/2-row.offsetTop-row.offsetHeight/2;
   movePhysical('tipTop',index*100/3,400,30,.8);movePhysical('tipBottom',(2-index)*100/3,400,30,.8);movePhysical('tipY',position,350,30);
  }
  movePhysical('tipOpacity',show?1:0,300,30,.8);
 }
 function buildList(query=''){
  if(id!=='skiper-92')return;
  const list=q('.ska-command-list');list.replaceChildren();filtered=items.filter(item=>item.label.toLowerCase().includes(query.toLowerCase()));active=Math.min(active,Math.max(0,filtered.length-1));
  if(!filtered.length){const empty=document.createElement('div');empty.className='ska-command-empty';empty.textContent=r.language==='zh'?'没有找到命令':'No results found.';list.append(empty);paintMotion();return}
  for(const group of ['Suggestions','Settings','Help','Docs']){
   const grouped=filtered.filter(item=>item.group===group);if(!grouped.length)continue;
   const section=document.createElement('div');section.className='ska-command-group';const title=document.createElement('div');title.className='ska-group-title';title.textContent=group;section.append(title);
   grouped.forEach(item=>{
    const index=filtered.indexOf(item),button=document.createElement('button');button.type='button';button.className='ska-command-item';button.setAttribute('role','option');button.dataset.index=String(index);button.id=uid+'-item-'+index;button.setAttribute('aria-selected',String(index===active));button.dataset.selected=String(index===active);
    const p=group==='Suggestions'?'<path d="M5 12h14m-7-7 7 7-7 7"/>':group==='Docs'?'<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z"/>':group==='Help'?'<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>':'<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/>';
    button.innerHTML=icon(p)+'<span>'+escape(item.label)+'</span>'+(item.shortcut?'<span class="ska-command-shortcut">'+escape(item.shortcut)+'</span>':'');
    button.addEventListener('pointerenter',()=>{active=index;selectItem()});button.addEventListener('click',()=>choose(index));section.append(button);
   });list.append(section);
  }
  selectItem();paintMotion();
 }
 function selectItem(){root.querySelectorAll<HTMLElement>('.ska-command-item').forEach((button,index)=>{button.dataset.selected=String(index===active);button.setAttribute('aria-selected',String(index===active))});input?.setAttribute('aria-activedescendant',uid+'-item-'+active)}
 function choose(index:number){markUser();const selected=filtered[index];if(!selected)return;value=selected.label;root.dataset.value=value;setOpen(false);q('.ska-search-trigger').focus();const status=q('.ska-status');status.textContent=(r.language==='zh'?'已选择：':'Selected: ')+value;root.dataset.state='selected'}
 function render(){
  version++;cancelTimers();for(const key of Object.keys(channels))delete channels[key];channelDefaults.width=num('buttonSize',40);channelDefaults.height=num('buttonSize',40);channelDefaults.radius=num('buttonSize',40)/2;disposers.splice(0).forEach(fn=>fn());props();stage.replaceChildren();open=false;root.dataset.open='false';root.dataset.state='idle';root.dataset.tip='false';input=null;normal=null;caret=null;measure=null;
  if(id==='skiper-106'){
   stage.innerHTML='<div class="ska-note ska-input-note">Try typing below</div><div class="ska-inputs"><div class="ska-field"><div class="ska-inputline"><input aria-label="Smooth caret input" autocomplete="off" spellcheck="false"><span class="ska-measure" aria-hidden="true"></span><span class="ska-caret" aria-hidden="true"></span></div></div><div class="ska-field"><input class="ska-normal" aria-label="Normal input" autocomplete="off"></div></div>';
   input=root.querySelector('input');normal=root.querySelector('.ska-normal');caret=q('.ska-caret');measure=q('.ska-measure');input!.type=str('inputType','text');input!.placeholder=str('placeholder','smooth input');normal!.placeholder=str('comparisonPlaceholder','normal input');input!.value=value;normal!.value='';
   ['input','click','keyup','select','focus','scroll','compositionend'].forEach(type=>listen(input!,type,()=>{if(type==='input'||type==='click'||type==='keyup')markUser();inputCaret()}));listen(input!,'blur',()=>{caret!.style.opacity='0'});listen(document,'selectionchange',()=>{if(document.activeElement===input)inputCaret()});
   const observer=new ResizeObserver(()=>inputCaret());observer.observe(root);disposers.push(()=>observer.disconnect());const epoch=version;document.fonts.ready.then(()=>{if(!destroyed&&epoch===version)inputCaret()});listen(document.fonts,'loadingdone',()=>inputCaret());
   root.dataset.value=value;caretX=0;caretTarget=0;caretVelocity=0;
  }else if(id==='skiper-46'){
   stage.innerHTML=`<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><filter id="${uid}-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="${num('gooBlur',4.4)}" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -7" result="goo"/><feBlend in="SourceGraphic" in2="goo"/></filter></defs></svg><div class="ska-goo-anchor"><div class="ska-goo-panel" role="tooltip" aria-hidden="true"><div class="ska-goo-content"><div class="ska-row ska-goo-version"><span>${escape(str('name','Next.js'))}</span><span>${escape(str('version','v13.4.8'))}</span></div><div class="ska-row ska-goo-strong"><span>${escape(str('errorLabel','Errors'))}</span><span class="ska-error">${escape(str('errors','3'))}</span></div><div class="ska-row ska-goo-strong"><span>${escape(str('routeLabel','Route'))}</span><span class="ska-goo-route">${escape(str('route','Static'))}</span></div></div></div><button class="ska-goo-button" type="button" aria-label="Toggle framework status" aria-expanded="false"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><defs><linearGradient id="${uid}-next" x1="10.9558" y1="12.1216" x2="16.478" y2="18.9661" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor"/><stop offset=".604072" stop-color="currentColor" stop-opacity="0"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient><linearGradient id="${uid}-next-i" x1="12.8225" y1="2.39941" x2="12.7912" y2="10.6244" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient><clipPath id="${uid}-next-clip"><rect width="16" height="16"/></clipPath></defs><g clip-path="url(#${uid}-next-clip)"><path d="M17.257 18.503 4.756 2.4H2.4v11.195h1.884V4.792l11.494 14.85Z" fill="url(#${uid}-next)"/><path d="M11.8892 2.39941h1.86667v11.2h-1.86667Z" fill="url(#${uid}-next-i)"/></g></svg></button></div>`;
   let focusOpenedAt=-Infinity;const anchor=q('.ska-goo-anchor');listen(anchor,'pointerenter',()=>{markUser();setOpen(true)});listen(anchor,'pointerleave',()=>{if(!anchor.contains(document.activeElement)){setOpen(false)}});listen(anchor,'focusin',()=>{markUser();focusOpenedAt=performance.now();setOpen(true)});listen(anchor,'focusout',e=>{if(!anchor.contains(e.relatedTarget))setOpen(false)});listen(q('.ska-goo-button'),'click',()=>{markUser();setOpen(performance.now()-focusOpenedAt<150?true:!open)});listen(anchor,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false)}});listen(document,'pointerdown',e=>{if(open&&!root.contains(e.target))setOpen(false)});
  }else if(id==='skiper-98'){
   root.dataset.side=str('side','left');const labels=[str('comment','Comment'),str('share','Share'),str('menu','Menu')];
   stage.innerHTML='<div class="ska-vmenu"><div class="ska-tooltip" role="tooltip" aria-hidden="true" id="'+uid+'-tip">'+labels.map((label,i)=>'<div class="ska-tip-row"><span>'+escape(label)+'</span>'+(i===0?'<kbd>C</kbd>':i===2?'<span class="ska-tip-keys"><kbd><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg></kbd><kbd>K</kbd></span>':'')+'</div>').join('')+'</div><div class="ska-icons">'+labels.map((label,i)=>'<button class="ska-icon" type="button" aria-label="'+escape(label)+'" aria-describedby="'+uid+'-tip" data-index="'+i+'">'+icon(paths[i])+(i===2&&s.badge?'<i class="ska-badge" aria-hidden="true"></i>':'')+'</button>').join('')+'</div></div>';
   root.querySelectorAll<HTMLElement>('.ska-icon').forEach((button,i)=>{listen(button,'pointerenter',()=>{markUser();showTip(i)});listen(button,'focus',()=>{markUser();showTip(i)});listen(button,'click',()=>{markUser();value=labels[i];root.dataset.value=value;showTip(i)});listen(button,'keydown',e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowDown'?1:2))%3;root.querySelectorAll<HTMLElement>('.ska-icon')[next].focus()}if(e.key==='Escape'){showTip(i,false);button.blur()}})});listen(q('.ska-vmenu'),'pointerleave',()=>{if(!q('.ska-vmenu').contains(document.activeElement))showTip(active,false)});listen(q('.ska-vmenu'),'focusout',e=>{if(!q('.ska-vmenu').contains(e.relatedTarget))showTip(active,false)});
  }else if(id==='skiper-92'){
   stage.innerHTML='<div class="ska-note ska-search-note">Press '+escape(str('shortcut','F'))+' or click in input</div><div class="ska-search"><button type="button" class="ska-search-trigger" aria-expanded="false" aria-controls="'+uid+'-command"><span class="ska-search-icon">'+searchIcon+'</span><span class="ska-search-placeholder"><span class="ska-search-center-label">'+escape(str('placeholder','Find...'))+'</span></span><kbd class="ska-key">'+escape(str('shortcut','F'))+'</kbd></button><div class="ska-command" id="'+uid+'-command"><div class="ska-command-head"><span class="ska-search-icon">'+searchIcon+'</span><span class="ska-command-center"><input role="combobox" aria-label="Find a command" aria-expanded="true" aria-controls="'+uid+'-list" autocomplete="off" spellcheck="false"></span><span class="ska-command-word"><button type="button" class="ska-command-esc" aria-label="Close command search">Esc</button></span></div><div class="ska-command-list" role="listbox" id="'+uid+'-list" aria-label="Commands"></div></div></div><div class="ska-status" role="status" aria-live="polite"></div>';
   input=root.querySelector('input');input!.placeholder=str('placeholder','Find...');q('.ska-command').inert=true;q('.ska-command').setAttribute('aria-hidden','true');
   items=[];for(const [key,group] of [['suggestions','Suggestions'],['settings','Settings'],['help','Help'],['docs','Docs']])str(key).split('\n').map(v=>v.trim()).filter(Boolean).forEach((label,index)=>items.push({group,label,index:items.length,shortcut:group==='Settings'?'⌘'+(['P','B','S','N','M','T'][index]??''):''}));active=0;buildList();
   listen(q('.ska-search-trigger'),'click',()=>{markUser();setOpen(true,true)});listen(q('.ska-command-esc'),'click',()=>{markUser();setOpen(false);q('.ska-search-trigger').focus()});listen(input!,'input',()=>{markUser();active=0;buildList(input!.value)});
   listen(root,'keydown',e=>{if(e.key==='Escape'&&open){e.preventDefault();markUser();setOpen(false);q('.ska-search-trigger').focus()}else if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&!e.shiftKey){e.preventDefault();markUser();active=e.key==='Home'?0:e.key==='End'?filtered.length-1:(active+(e.key==='ArrowDown'?1:Math.max(1,filtered.length)-1))%Math.max(1,filtered.length);selectItem();root.querySelector<HTMLElement>('#'+uid+'-item-'+active)?.scrollIntoView({block:'nearest'})}else if(open&&e.key==='Enter'){e.preventDefault();choose(active)}else if(!open&&e.key.toLowerCase()===str('shortcut','F').toLowerCase()&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();markUser();setOpen(true,true)}});
   listen(document,'pointerdown',e=>{if(open&&!root.contains(e.target)){setOpen(false)}});
  }
  paintMotion();
 }
 function demoAction(){
  if(!live()||userActed||document.hidden)return;
  demoStep++;
  if(id==='skiper-106'&&input&&document.activeElement!==input){
   const sample=str('initialValue')||'smooth input',n=(demoStep% (sample.length+8));input.value=sample.slice(0,Math.min(sample.length,n));value=input.value;input.setSelectionRange(input.value.length,input.value.length);inputCaret();if(caret)caret.style.opacity='1';root.dataset.state='typing-'+n;root.dataset.value=input.value;
  }else if(id==='skiper-46'){setOpen(demoStep%2===1)}else if(id==='skiper-98'){showTip((demoStep-1)%3)}else if(id==='skiper-92'){if(demoStep%3===1)setOpen(true);else if(demoStep%3===2){active=1;selectItem();root.dataset.state='highlight-1';transition()}else setOpen(false)}
 }
 function schedule(){clearTimeout(demoTimer);demoTimer=undefined;if(!live()||!r.gallery||userActed)return;const interval=id==='skiper-106'?180:id==='skiper-98'?950:1700;demoTimer=setTimeout(()=>{demoAction();schedule()},Math.max(60,interval/Math.max(.05,r.speed))+Math.max(0,r.delayMs||0)/Math.max(.05,r.speed))}
 const visibility=()=>{if(document.hidden){cancelTimers();root.getAnimations({subtree:true}).forEach(animation=>animation.pause())}else{root.getAnimations({subtree:true}).forEach(animation=>{if(live())animation.play()});resumeMotion();schedule()}};
 document.addEventListener('visibilitychange',visibility);
 render();schedule();
 return {
  update(next:ASettings,nextRuntime:ARuntime){const wasGallery=r.gallery,wasLive=live(),previousInitial=s.initialValue;s={...next};r={...nextRuntime};const serialized=JSON.stringify(s);if(serialized!==lastSettings){lastSettings=serialized;const initialChanged=s.initialValue!==previousInitial;if(initialChanged)value=str('initialValue');
   if(id==='skiper-106'&&input&&normal){props();if(input.type!==str('inputType','text'))input.type=str('inputType','text');input.placeholder=str('placeholder','smooth input');normal.placeholder=str('comparisonPlaceholder','normal input');if(initialChanged)input.value=value;inputCaret()}
   else{userActed=false;render()}
  }else props();if(r.reduced){for(const c of Object.values(channels)){c.x=c.target;c.v=0;c.delay=0;c.elapsed=c.duration}paintMotion();if(caret){caretX=caretTarget;caretVelocity=0;caret.style.left=caretX+'px'}}if(!live()){cancelTimers();root.getAnimations({subtree:true}).forEach(animation=>animation.pause())}else{root.getAnimations({subtree:true}).forEach(animation=>animation.play());resumeMotion();if(!wasLive||(!wasGallery&&r.gallery)){userActed=false;demoStep=id==='skiper-98'&&root.dataset.tip==='true'?(active+1)%3:(id==='skiper-46'||id==='skiper-92')&&open?1:0}}schedule()},
  demonstrate(){cancelTimers();userActed=false;demoStep=id==='skiper-98'&&root.dataset.tip==='true'?(active+1)%3:(id==='skiper-46'||id==='skiper-92')&&open?1:0;if(!live()){if(id==='skiper-46'||id==='skiper-92')setOpen(true);else if(id==='skiper-98')showTip(0);else inputCaret();return}const start=()=>{demoAction();schedule()};if(r.delayMs>0)demoTimer=setTimeout(start,r.delayMs/Math.max(.05,r.speed));else start()},
  settle(){cancelTimers();if(id==='skiper-46'||id==='skiper-92')setOpen(false);else if(id==='skiper-98')showTip(active,false);if(caret&&document.activeElement!==input)caret.style.opacity='0';for(const c of Object.values(channels)){c.x=c.target;c.v=0;c.delay=0;c.elapsed=c.duration}paintMotion();root.getAnimations({subtree:true}).forEach(animation=>animation.finish());cancelTimers()},
  getValue(){return id==='skiper-106'?input?.value??value:value},
  destroy(){destroyed=true;cancelTimers();disposers.splice(0).forEach(fn=>fn());document.removeEventListener('visibilitychange',visibility);root.remove()},
 };
}
export const skiperAEngineCode='function createSkiperA(container,id,settings,runtime){const __name=(fn)=>fn;return ('+createSkiperA.toString()+')(container,id,settings,runtime)}';
