import fs from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

await call('Page.enable');
await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});await wait(1200);
for(const [width,height] of [[2560,1440],[1920,1080],[1536,864],[1366,768],[1440,900],[1024,768],[390,844]]){
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(250);
 const r=await evaluate(`(()=>{const p=document.querySelector('.story-page'),a=document.querySelector('.story-artwork'),b=document.querySelector('.story-brand'),m=document.querySelector('.site-menu'); const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {p:rect(p),a:rect(a),b:rect(b),m:rect(m),sw:p.scrollWidth,cw:p.clientWidth,scale:getComputedStyle(p).getPropertyValue('--story-scale')};})()`);
 if(Math.abs(r.p.w/r.p.h-16/9)>.01||r.sw!==r.cw||Math.abs(r.b.w/138-Number(r.scale))>.01)throw Error(JSON.stringify(r));
 console.log(width,height,JSON.stringify(r));
 if(width===1366){const shot=await call('Page.captureScreenshot');await fs.writeFile('.tmp/responsive-story.png',Buffer.from(shot.data,'base64'));}
}
for(const path of ['trumpet','ending']){
 await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:5182/'+path});await wait(800);
 const r=await evaluate(`({counter:!!document.querySelector('.trumpet-progress'),photo:!!document.querySelector('.ending-photo-link'),menu:!!document.querySelector('.site-menu'),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`);
 if(r.counter||r.photo||r.broken.length||(path==='ending'&&r.menu))throw Error(JSON.stringify(r));
 const shot=await call('Page.captureScreenshot');await fs.writeFile('.tmp/clean-'+path+'.png',Buffer.from(shot.data,'base64'));
 console.log(path,r);
}
ws.close();
