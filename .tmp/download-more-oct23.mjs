import fs from 'node:fs/promises';
for(const [base,files] of [
 ['https://www.figma.com/api/mcp/asset/4d9d49a6-fe3f-4873-8a05-f0c52b33cd40',['f5287.png','6635d.png','181d1.png','140b8.png']],
 ['https://www.figma.com/api/mcp/asset/23953560-815f-4cde-a474-c53803027e23',['d416f.svg','71e01.svg','32fcf.svg','16c15.svg','4d7ec.svg','3b2f6.svg']]]){
 await Promise.all(files.map(async file=>{const r=await fetch(base+'/'+file);if(!r.ok)throw Error(r.status);await fs.writeFile('public/assets/figma/'+(file.endsWith('.png')?'story/oct23/':'oct23/')+file,Buffer.from(await r.arrayBuffer()));}));
}console.log('Downloaded 10 assets');
