import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};const wait=ms=>new Promise(r=>setTimeout(r,ms));
await call('Emulation.setFocusEmulationEnabled',{enabled:true});await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});await wait(1000);
await evaluate("document.querySelector('.story-page').scrollTop=4488;document.querySelector('[aria-label=\"평택농악 소개\"]').focus()");await wait(900);
assert.equal(await evaluate("getComputedStyle(document.querySelector('[aria-label=\"평택농악 소개\"]>.story-region-hover')).opacity"),'1');
await evaluate("document.querySelector('[aria-label=\"메뉴 펼치기\"]').click()");await wait(450);assert.equal(await evaluate("document.querySelectorAll('.site-menu-clip button').length"),4);
const image=await evaluate(`(async()=>{
 const {loadHeadwearArtwork,drawHeadwear}=await import('/src/camera/drawHeadwear.js');const parts=loadHeadwearArtwork();await Promise.all(parts.map(p=>p.image.decode()));
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=650;const ctx=canvas.getContext('2d');ctx.fillStyle='#aaa';ctx.fillRect(0,0,1000,650);ctx.fillStyle='#ddd';for(const x of [250,750]){ctx.beginPath();ctx.ellipse(x,430,100,116,0,0,Math.PI*2);ctx.fill();}
 const video=document.createElement('canvas');video.width=1000;video.height=650;video.getContext('2d').drawImage(canvas,0,0);
 const ribbon=Array.from({length:29},(_,i)=>({x:i/28*.3,y:-i/28*.6}));
 drawHeadwear(ctx,video,{x:250,y:430,w:200,angle:0,opacity:1,ribbon},'sangmo',parts,1000,650);
 drawHeadwear(ctx,video,{x:750,y:430,w:200,angle:0,opacity:1,ribbon},'gokkal',parts,1000,650);
 return canvas.toDataURL().split(',')[1];})()`);
await fs.writeFile('.tmp/oct23-hats.png',Buffer.from(image,'base64'));console.log('PASS: region focus reveal, four menu items, layered headwear canvas render');ws.close();
