import {reelItems} from './elastic-reel-art';
import {validateAlbumCovers} from './album-content';
import type {SkiperSettings} from './skiper-types';
/** Additional content constraints for the four public scroll components. */
export function validateScrollSkiper(id:string,s:SkiperSettings){
 if(id==='skiper-28'){
  if(typeof s.content!=='string'||s.content.trim().length<1||s.content.length>5000||/[<>\u0000-\u001f]/.test(s.content.replace(/[\r\n\t]/g,'')))throw Error('请填写1–5000个可见文字字符。');
  if(!Number.isInteger(s.fontWeight))throw Error('字重必须为整数。');return;
 }
 const images=String(s.images).split('\n').map(x=>x.trim()).filter(Boolean),labels=String(s.labels).split('\n');
 if(images.length<1||images.length>12)throw Error('图片数量须为1–12张。');
 if(labels.length!==images.length||labels.some(x=>x.trim().length<1||Array.from(x).length>80||/[<>\u0000-\u001f]/.test(x)))throw Error('每张图片须有逐行对应的1–80字说明。');
 for(const src of images){if(reelItems.some(x=>x.src===src))continue;if(/^data:/i.test(src))validateAlbumCovers([{src,title:'Image'}]);else{let u:URL;try{u=new URL(src,'https://tuneshape.kai-nex.com')}catch{throw Error('图片地址无效。')}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||/[<>\u0000-\u001f]/.test(src))throw Error('图片须为有效图片数据或 HTTP(S) 地址。')}}
 if(id==='skiper-30'&&!Number.isInteger(s.columns))throw Error('列数必须为整数。');
}
