import {catalog as authoredCatalog} from './catalog';
import {retiredEffectIds} from './effect-terms';

export type BrowseCategory={key:string;label:string;english:string;symbol:string;featured:string;ids:string[]};
/** Browse metadata is separate from the category fixtures inside authored effects. */
const definitions:BrowseCategory[]=[
 {key:'controls',label:'控件',english:'Controls',symbol:'button',featured:'basic-button',ids:['bencho-slide-confirm','glass-generate','skiper-106','skiper-82','skiper-91','coffee-selector','bencho-wake-slider','basic-button','hover-invert','dropdown','glass-radio','rounded-checks','skiper-46','skiper-98','skiper-43']},
 {key:'inputs',label:'输入',english:'Inputs',symbol:'input',featured:'skiper-81',ids:['bencho-upload-dropzone','bencho-label-input','skiper-81','skiper-83','skiper-56','chromatic-button','skiper-92','gooey-input']},
 {key:'navigation',label:'导航',english:'Navigation',symbol:'tabs',featured:'mini-sidebar',ids:['bencho-liq-create','expanding-menu','skiper-75','mini-sidebar','expandable-sidebar','scroll-progress','hook-sidebar','chapter-progress-nav','rail-toc']},
 {key:'containers',label:'容器',english:'Containers',symbol:'grid',featured:'card-morph',ids:['bencho-eye-tracker','waving-card','card-morph','folder','glass-folder','duration-picker']},
 {key:'text',label:'文字',english:'Text',symbol:'text',featured:'liquid-glass-logo',ids:['skiper-28','liquid-glass-logo','gooey-wordmark','text-rise','text-scramble','glyph-wall','encrypted-text','flip-words','typewriter-text','soft-blur-in','short-slide-down','kinetic-center-build','period-drop','outline-trace','glyph-anatomy','hover-preview']},
 {key:'images',label:'画廊',english:'Galleries',symbol:'image',featured:'infinite-photo-wall',ids:['skiper-30','skiper-17','skiper-16','bencho-aspect','depth-ribbon','passage-gallery','reelfolio-rig','bencho-card-swap','bencho-image-compare','bencho-carousel','infinite-photo-wall','page-turn-cards','mirrored-card-stack','skiper-48','skiper-50','skiper-78','skiper-77','liquid-carousel','album-rail','elastic-reel','orbit-reel','app-orbit']},
 {key:'indicators',label:'加载',english:'Loading',symbol:'loader',featured:'progress',ids:['bencho-context-meter','progress','dots','finger-tap','typewriter','yin-yang','pulse']},
 {key:'backgrounds',label:'背景',english:'Backgrounds',symbol:'page',featured:'topographic-flow',ids:['skiper-41','topographic-flow','ascii-wave','ascii-sharks','particle-tide','watercolor','watercolor-original','watercolor-flow']},
];
export const catalog=definitions.flatMap(category=>{
 const ids=category.ids.filter(id=>!retiredEffectIds.has(id));
 return ids.length?[{...category,ids,featured:ids.includes(category.featured)?category.featured:ids[0]}]:[];
});
const current=new Map<string,BrowseCategory>();
for(const category of catalog){current.set(category.key,category);current.set(category.label,category)}
const cardCategory=current.get('containers');
if(cardCategory)current.set('卡片与文件夹',cardCategory);
const galleryCategory=current.get('images');
if(galleryCategory)current.set('图片',galleryCategory);
const loadingCategory=current.get('indicators');
if(loadingCategory){current.set('状态指示',loadingCategory);current.set('加载状态',loadingCategory)}

/** Old links retain their exact member sets, even when a group crossed new categories. */
export const legacyBrowseGroups=authoredCatalog.flatMap(category=>[
 {label:category.label,ids:category.children.flatMap(child=>child.ids)},
 ...category.children.map(child=>({label:child.label,ids:[...child.ids]})),
]);
const legacy=new Map(legacyBrowseGroups.map(group=>[group.label,group.ids]));
const aliases=new Map<string,string[]>();
for(const group of legacyBrowseGroups)for(const id of group.ids){
 const labels=aliases.get(id)??[];labels.push(group.label);aliases.set(id,labels);
}
export const browseGroupLabels=[...catalog.map(category=>category.label),...legacy.keys()];
export const catalogParent=(label:string)=>current.get(label);
export const catalogIds=(label:string)=>[...(current.get(label)?.ids??legacy.get(label)??[])];
export const legacyLabelsForEffect=(id:string)=>[...(aliases.get(id)??[]),...(cardCategory?.ids.includes(id)?['卡片与文件夹','Cards & Folders']:[])];
