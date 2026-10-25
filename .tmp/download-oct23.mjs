import fs from 'node:fs/promises';
const {base,files}=JSON.parse(await fs.readFile('.tmp/oct23-story-assets.json','utf8'));
await fs.mkdir('public/assets/figma/story/oct23',{recursive:true});
const queue=[...new Set(files)];let total=0;
await Promise.all(Array.from({length:5},async()=>{while(queue.length){const file=queue.pop(),res=await fetch(base+'/'+file);if(!res.ok)throw Error(file+': '+res.status);await fs.writeFile('public/assets/figma/story/oct23/'+file,Buffer.from(await res.arrayBuffer()));total++;}}));
console.log({downloaded:total});
