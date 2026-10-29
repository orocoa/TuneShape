import {isStudioEffect} from './orbit-typography-spec';
import {isWatercolorRecipe,isReelRecipe} from './effect-variants';
export type EffectTrigger='press'|'click'|'hover'|'loading';
export function galleryPlayback(id:string):'loading'|'cycle'|'direct'{
 if(id==='ascii-sharks'||id==='coffee-selector')return 'loading';
 if(isStudioEffect(id))return 'loading';
 if(['encrypted-text','flip-words'].includes(id))return 'loading';
 if(['spinner','dots','finger-tap','typewriter','yin-yang','glyph-wall','particle-tide','album-rail','orbit-reel','watercolor','watercolor-original','watercolor-flow','pulse','wave','progress'].includes(id))return 'loading';
 return ['toast','card-morph','sheet','blur-panel','breality-sheet','page-fade','stagger','text-rise'].includes(id)?'cycle':'direct';
}
export function interactionSelector(id:string){
 if(id==='ascii-sharks')return '.ascii-sharks';
 if(id==='coffee-selector')return '.coffee-selector';
 if(isStudioEffect(id))return id==='app-orbit'?'.app-orbit':'.type-motion';
 if(id==='glass-folder')return '.glass-folder-hit';
 if(id==='scroll-progress')return '.reading-progress-stage';
 if(id==='hook-sidebar')return '.hook-sidebar-nav';
 if(id==='rail-toc')return '.rail-toc-stage';
 if(id==='expandable-sidebar')return '.expandable-sidebar';
 if(id==='encrypted-text')return '.encrypted-text';
 if(id==='gooey-input')return '.gooey-input';
 if(id==='flip-words')return '.flip-words';
 if(id==='rounded-checks')return '.rounded-checks';
 if(id==='duration-picker')return '.duration-picker';
 if(id==='album-rail')return '.album-rail';
 if(id==='hover-preview')return '.hover-target';
 if(id==='orbit-reel')return '.orbit-reel';
 if(isReelRecipe(id))return '.elastic-reel';
 if(id==='particle-tide')return '.particle-tide-art';
 if(id==='glyph-wall')return '.glyph-wall-art';
 if(id==='glass-radio')return '.glass-radio-group';
 if(id==='mini-sidebar')return '.mini-sidebar-rail';
 if(id==='basic-button')return '[data-demo-button]';
 if(id==='switch')return '.sculpt-switch';
 if(id==='dropdown')return '.sculpt-trigger,.sculpt-menu-item';
 if(['sheet','blur-panel','breality-sheet'].includes(id))return '[data-activation],.sculpt-shade';
 return '[data-gallery-control]';
}
export function effectTrigger(id:string):EffectTrigger{
 if(id==='ascii-sharks')return 'loading';
 if(id==='basic-button')return 'press';
 if(['spinner','dots','finger-tap','typewriter','yin-yang','glyph-wall','particle-tide','album-rail','orbit-reel','watercolor','watercolor-original','watercolor-flow','pulse','wave','progress'].includes(id))return 'loading';
 if(['hover-lift','hover-invert','tooltip','mini-sidebar','folder','glass-folder','expandable-sidebar','text-scramble','ascii-wave','hover-preview'].includes(id))return 'hover';
 return 'click';
}
export const hoverTarget:Record<string,string>={
 'hover-lift':'[data-part="face"]','hover-invert':'[data-part="face"]',
 tooltip:'.sculpt-tooltip-anchor',folder:'.sculpt-folder',
 'text-scramble':'[data-part="scramble"]','ascii-wave':'[data-part="ascii"]',
};
export const clickTarget:Record<string,string>={
 dropdown:'.sculpt-trigger,.sculpt-menu-item',toast:'.sculpt-document,.sculpt-toast',
 sheet:'.sculpt-shade','blur-panel':'.sculpt-shade','breality-sheet':'.sculpt-shade',
 switch:'.sculpt-switch','card-morph':'.sculpt-morph','page-fade':'.sculpt-pages',
 stagger:'.sculpt-stagger','text-rise':'.sculpt-letters',progress:'.sculpt-progress',
};
export function triggerDescription(id:string){
 if(id==='ascii-sharks')return '详情自动游动；目录悬停、聚焦或手机预览时播放。离开且失焦、离屏或后台时停止；暂停保留鱼群进度，速度为 0 冻结当前画面。';
 if(id==='coffee-selector')return '点击展开直列滚轮，滚轮、上下拖动或方向键选择；松手惯性吸附，点击选项或 Enter 确认，Escape 撤回。';
 if(id==='glass-folder')return '悬停或聚焦时轻展卡片，点击、Enter / 空格展开；移开、离焦、点击外部或 Escape 收合。';
 if(id==='scroll-progress')return '滚动阅读区同步圆环与当前章节，鼠标悬停胶囊自动展开目录，移出胶囊和菜单区域自动收合，点击章节定位并收合；触屏点按胶囊展开，点击外部或 Escape 关闭。';
 if(id==='hook-sidebar')return '点击菜单项确认选择，悬停或键盘聚焦另一项显示灰色钩线；方向键与 Home / End 移动焦点，Enter / 空格确认。';
 if(id==='rail-toc')return '点击目录或使用方向键切换，纸飞机沿层级轨道跟随；单独预览时滚轮沿轨道移动，开启联动阅读预览后可滚动真实章节。';
 if(id==='expandable-sidebar')return '悬停或聚焦展开侧栏，手机点击菜单打开抽屉；点击条目选择本地内容，Escape 关闭。';
 if(id==='encrypted-text')return '详情自动解码一次，点击文字或播放按钮重播；完成后保留原文。';
 if(id==='gooey-input')return '点击胶囊展开输入，空值失焦后收起；Escape 或图标按钮清除收起，Enter 本地确认。';
 if(id==='flip-words')return '详情自动切换词语，点击文字切换下一项，工具栏支持暂停与接续。';
 if(id==='rounded-checks')return '点击方框或整行文字独立勾选，Tab 聚焦后按空格切换；多项可以同时选中。';
 if(id==='duration-picker')return '点击铅笔展开并编辑小时、分钟，点击勾号或 Enter 确认收合；Escape 撤回到上次确认值。超出上限自动修正并轻晃。';
 if(id==='album-rail')return '点击侧面封套定位到中央，悬停中央封套让黑胶探出；点击中央封套或旋转按钮抽出唱片，再次点击或 Escape 收回。拖动、方向键、刻度条和左右按钮可切换，悬停或聚焦暂停自动轮播。';
 if(id==='hover-preview')return '悬停或聚焦文字时显示对应图片，移动指针带动偏移与倾斜；移开关闭。触屏点按固定预览，再次点按、点击空白或 Escape 关闭。';
 if(id==='orbit-reel')return '详情自动转动，目录悬停演示；点击卡片展开弧形，拖动、方向键或左右按钮切换，点击空白或 Escape 返回圆环。';
 if(isReelRecipe(id))return '悬停或横向拖动带动相片切片联动放大；点击展开完整画面，再次点击或按 Escape 收起。左右方向键与横向滑动切换相片，纵向滚动保留给页面；聚焦时暂停自动扫动或轮播。';
 if(isWatercolorRecipe(id))return '详情自动流动，目录悬停播放；开启指针交互后，移动指针或键盘聚焦在局部加强晕染，离开清除；暂停保留纹理，继续从当前进度流动。';
 if(id==='particle-tide')return '详情中自动流动，目录中悬停播放；指针移动抬起局部涌浪，点击叠加涟漪；暂停保留海面与涟漪进度，速度为 0 冻结当前帧。';
 if(id==='glyph-wall')return '目录中进入预览播放扫描，详情中自动运行；词组可悬停或键盘聚焦，点击空白重新排布。';
 if(id==='glass-radio')return '点击或使用键盘切换 Silver、Gold、Platinum 单选项，滑块、配色与文字同步响应；选择当前项不重播，悬停不触发切换。';
 if(id==='mini-sidebar')return '内容与动效库的用途分类同步，所有分类处于同一层。进入导航区域查看名称，点击直接选中分类，再次点击保持选择。支持触屏点按；方向键和 Home/End 在同一层移动焦点。移开、离焦或 Escape 后平滑收回横线并隐藏文字，保留当前选择。';
 if(['sheet','blur-panel','breality-sheet'].includes(id))return '点击打开面板按钮进入，点击关闭按钮或遮罩退出；点击面板内容不关闭。';
 if(id==='dropdown')return '点击菜单触发器展开或收起，选择菜单项后收起；悬停不自动播放。';
 if(id==='progress')return '详情页自动从起始进度填充到目标进度；开启循环时，填满后立即复位到起始进度，再次正向填充，不反向回退。详情页工具栏可暂停并保持当前进度，再次播放从暂停处继续；一轮完成后仍从配置起点重新填充。列表中悬停播放，移开复位。';
 if(id==='text-rise')return '点击组件、播放按钮或按 Enter / 空格，从遮罩下方逐字向上揭示；随后在原位淡出，完全不可见后才复位并开始下一轮。文字不会向下退回；工具栏可暂停和继续。';
 if(id==='stagger')return '点击组件或按 Enter / 空格从初态重新揭示，悬停不自动播放。';
 switch(effectTrigger(id)){
  case 'press':return '按钮按下触发，松开或取消后恢复；卡片悬停不触发。';
  case 'loading':return '列表中指针进入预览区域后播放，按配置的循环选项重复，离开即停止；详情中自动播放加载效果；播放期间按钮显示暂停，暂停后保留当前画面，再次播放从暂停处继续。';
  case 'hover':return id==='ascii-wave'?'指针进入字符画区域时流动，移动指针产生局部扰动，离开停止并清除扰动；键盘聚焦可播放。':id==='text-scramble'?'指针在文字区域内移到哪里，只扰动附近字符；停住或移开后各字符独立恢复，其他文字保持可读。卡片空白处不触发；Enter / 空格演示一次局部扰动。':'指针进入实际组件区域时进入，离开时退出；卡片空白处不触发，键盘聚焦与离焦等效。';
  default:return '点击实际组件或按 Enter / 空格切换进入和退出，悬停不自动播放。';
 }
}
