import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';
test('retired tabs and dialog have no basic demo selectors or published presets',async()=>{
 const main=await readFile(new URL('./main.tsx',import.meta.url),'utf8');
 assert(main.includes("(['button'] as const)"));
 for(const kind of ['tabs','modal']){
  for(const path of [`configs/${kind}.json`,`prompts/${kind}.md`])await assert.rejects(access(new URL('../'+path,import.meta.url)));
  for(const file of ['README.md','README.zh-CN.md'])assert(!(await readFile(new URL('../'+file,import.meta.url),'utf8')).includes(`(${`configs/${kind}.json`})`));
 }
});
