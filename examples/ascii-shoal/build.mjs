import {readFile,mkdir,copyFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=import.meta.dirname,out=resolve(root,'dist');
const files=['index.html','style.css','demo.js','src/ascii-shoal.js','src/ascii-shoal.d.ts','LICENSE'];
for(const file of files){await mkdir(resolve(out,file,'..'),{recursive:true});await copyFile(resolve(root,file),resolve(out,file))}
const css=await readFile(resolve(root,'style.css'),'utf8'),engine=await readFile(resolve(root,'src/ascii-shoal.js'),'utf8');
const license=await readFile(resolve(root,'LICENSE'),'utf8');
const demo=(await readFile(resolve(root,'demo.js'),'utf8')).replace("import {createAsciiShoal, defaults} from './src/ascii-shoal.js';",'');
const html=(await readFile(resolve(root,'index.html'),'utf8')).replace('<head>','<!--\n'+license+'-->\n<head>').replace('<link rel="stylesheet" href="./style.css">','<style>'+css.replaceAll('</style','<\\/style')+'</style>').replace('<script type="module" src="./demo.js"></script>','<script type="module">\n'+(engine+'\n'+demo).replaceAll('</script','<\\/script')+'\n</script>');
await writeFile(resolve(out,'offline.html'),html);
console.log('Built dist/ and self-contained dist/offline.html (no network dependencies).');
