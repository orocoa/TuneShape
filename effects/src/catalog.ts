// Navigation metadata only. Animation configs and export schemas stay in their existing models.
import {retiredEffectIds} from './effect-terms';
export type CatalogCategory={label:string;symbol:string;featured:string;children:{label:string;ids:string[]}[]};
const originalCatalog:CatalogCategory[]=[
 {label:'按钮与输入',symbol:'button',featured:'basic-button',children:[{label:'按钮反馈',ids:['basic-button','hover-lift','hover-invert','submit']},{label:'开关控件',ids:['switch']},{label:'复选框',ids:['rounded-checks']},{label:'选择器',ids:['coffee-selector']},{label:'数值输入',ids:['duration-picker']},{label:'搜索输入',ids:['gooey-input']}]},
 {label:'导航与切换',symbol:'tabs',featured:'basic-tabs',children:[{label:'标签与菜单',ids:['basic-tabs','dropdown','glass-radio']},{label:'导航反馈',ids:['mini-sidebar','expandable-sidebar','scroll-progress','hook-sidebar','rail-toc','arrow','nav-label']}]},
 {label:'弹窗与浮层',symbol:'modal',featured:'basic-modal',children:[{label:'弹窗与抽屉',ids:['basic-modal','sheet','blur-panel','breality-sheet']},{label:'提示与说明',ids:['toast','tooltip']}]},
 {label:'卡片与布局',symbol:'grid',featured:'card-morph',children:[{label:'展开与折叠',ids:['accordion','card-morph','news-morph','folder','glass-folder']},{label:'边界与分栏',ids:['grid-collapse','border-lines','divider-merge']},{label:'列表入场',ids:['stagger']}]},
 {label:'文字效果',symbol:'text',featured:'text-rise',children:[{label:'文字出现',ids:['text-rise','scroll-mask','flip-words','typewriter-text','soft-blur-in','short-slide-down','kinetic-center-build','period-drop','outline-trace','glyph-anatomy']},{label:'字符变化',ids:['text-scramble','glyph-wall','encrypted-text']}]},
 {label:'图片与媒体',symbol:'image',featured:'image-zoom',children:[{label:'图片过渡',ids:['album-rail','elastic-reel','orbit-reel','hover-preview','app-orbit','image-zoom','image-flight']},{label:'点云聚合',ids:['pointcloud']}]},
 {label:'加载与状态',symbol:'loader',featured:'wave',children:[{label:'等待与进度',ids:['progress','spinner','dots','finger-tap','typewriter','yin-yang','wave']},{label:'状态反馈',ids:['pulse','message']}]},
 {label:'页面与背景',symbol:'page',featured:'page-swap',children:[{label:'页面转场',ids:['page-fade','page-swap']},{label:'动态背景',ids:['ascii-wave','ascii-sharks','particle-tide','watercolor','watercolor-original','watercolor-flow']}]},
 {label:'手势与系统',symbol:'pointer',featured:'three-finger',children:[{label:'点击与指针',ids:['tap','press','ripple','pointer']},{label:'窗口与文件',ids:['minimize','three-finger','hotcorner-upload']},{label:'步骤与设备',ids:['workflow','proximity','hotcorner-sleep']}]},
];
export const catalog:CatalogCategory[]=originalCatalog.flatMap(category=>{
 const children=category.children.map(child=>({...child,ids:child.ids.filter(id=>!retiredEffectIds.has(id))})).filter(child=>child.ids.length);
 if(!children.length)return [];
 const ids=children.flatMap(child=>child.ids);
 return [{...category,children,featured:ids.includes(category.featured)?category.featured:ids[0]}];
});
export const catalogIds=(label:string)=>catalog.flatMap(c=>c.label===label?c.children.flatMap(s=>s.ids):c.children.filter(s=>s.label===label).flatMap(s=>s.ids));
export const catalogParent=(label:string)=>catalog.find(c=>c.label===label||c.children.some(s=>s.label===label));
