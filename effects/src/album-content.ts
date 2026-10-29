import {albumItems} from './album-rail-art';
import type {AlbumItem} from './album-rail';
export type AlbumCover={src:string;title:string};
export const maxAlbumCovers=12;
export function validateAlbumCovers(value:unknown):AlbumCover[]{
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>maxAlbumCovers||Reflect.ownKeys(value).length!==value.length+1)throw Error('最多上传 12 张封面。');
 for(let i=0;i<value.length;i++){
  const descriptor=Object.getOwnPropertyDescriptor(value,String(i));if(!descriptor||!Object.hasOwn(descriptor,'value'))throw Error('封面数组必须是连续数据。');
  const item=descriptor.value;if(!item||typeof item!=='object'||Object.getPrototypeOf(item)!==Object.prototype||Reflect.ownKeys(item).length!==2||['src','title'].some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(item,key)??{},'value')))throw Error('封面只能包含图片和名称。');
  if(typeof item.title!=='string'||Array.from(item.title).length>80||/[\u0000-\u001f\u007f]/u.test(item.title))throw Error('名称最多 80 个可见字符。');
  if(typeof item.src!=='string'||item.src.length>180000||!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(item.src))throw Error('封面须为本地 PNG、JPEG 或 WebP 图片。');
 }
 return structuredClone(value);
}
export function resolveAlbumItems(covers?:AlbumCover[]):AlbumItem[]{
 return covers?.length?covers.map(item=>({...item,title:item.title.trim()||'Untitled',artist:'',alt:item.title.trim()||'Untitled',accent:'#6f7180'})):albumItems;
}
// Decode locally and resize; source files on the user's device are never changed.
export async function readAlbumCover(file:File):Promise<AlbumCover>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('请选择 10 MB 以内的 PNG、JPEG 或 WebP 图片。');
 const image=await createImageBitmap(file);
 try{
  if(!image.width||!image.height||image.width*image.height>40_000_000)throw Error('封面分辨率过大，请缩小后重试。');
  const fit=Math.min(1,512/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*fit));canvas.height=Math.max(1,Math.round(image.height*fit));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('无法读取封面，请更换浏览器后重试。');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const title=file.name.replace(/\.[^.]+$/,'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80)||'Untitled';
  return validateAlbumCovers([{src:canvas.toDataURL('image/jpeg',.8),title}])[0];
 }finally{image.close()}
}
