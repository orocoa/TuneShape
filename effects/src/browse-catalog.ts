import {catalog as authoredCatalog} from './catalog';
import {retiredEffectIds} from './effect-terms';

export type BrowseCategory={key:string;label:string;english:string;symbol:string;featured:string;ids:string[]};
/** Browse metadata is separate from the category fixtures inside authored effects. */
const definitions:BrowseCategory[]=[
 {key:'controls',label:'控件',english:'Controls',symbol:'button',featured:'coffee-selector',ids:['coffee-selector','basic-button','hover-invert','dropdown','glass-radio','duration-picker','rounded-checks','gooey-input']},
 {key:'navigation',label:'导航',english:'Navigation',symbol:'tabs',featured:'mini-sidebar',ids:['mini-sidebar','expandable-sidebar','scroll-progress','hook-sidebar','rail-toc']},
 {key:'containers',label:'容器',english:'Containers',symbol:'grid',featured:'card-morph',ids:['card-morph','folder','glass-folder']},
 {key:'text',label:'文字',english:'Text',symbol:'text',featured:'text-rise',ids:['text-rise','text-scramble','glyph-wall','encrypted-text','flip-words','typewriter-text','soft-blur-in','short-slide-down','kinetic-center-build','period-drop','outline-trace','glyph-anatomy']},
 {key:'images',label:'图片',english:'Images',symbol:'image',featured:'album-rail',ids:['album-rail','elastic-reel','orbit-reel','hover-preview','app-orbit']},
 {key:'indicators',label:'状态指示',english:'Indicators',symbol:'loader',featured:'progress',ids:['progress','dots','finger-tap','typewriter','yin-yang','pulse']},
 {key:'backgrounds',label:'背景',english:'Backgrounds',symbol:'page',featured:'ascii-wave',ids:['ascii-wave','ascii-sharks','particle-tide','watercolor','watercolor-original','watercolor-flow']},
];
export const catalog=definitions.flatMap(category=>{
 const ids=category.ids.filter(id=>!retiredEffectIds.has(id));
 return ids.length?[{...category,ids,featured:ids.includes(category.featured)?category.featured:ids[0]}]:[];
});
const current=new Map<string,BrowseCategory>();
for(const category of catalog){current.set(category.key,category);current.set(category.label,category)}

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
export const legacyLabelsForEffect=(id:string)=>aliases.get(id)??[];
