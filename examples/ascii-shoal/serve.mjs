import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=import.meta.dirname,port=Number(process.env.PORT||5188);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!path.startsWith(root+sep)){res.writeHead(403).end();return}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'text/plain; charset=utf-8','Cache-Control':'no-store'}).end(data)}catch{res.writeHead(404).end('Not found')}});
server.listen(port,'127.0.0.1',()=>console.log(`ASCII Shoal: http://127.0.0.1:${port}`));
