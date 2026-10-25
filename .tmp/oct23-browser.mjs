import fs from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
for(const path of ['flag','story','experience?instrument=janggu']){
 await call('Page.navigate',{url:'http://127.0.0.1:5182/'+path});await wait(2500);
 console.log(path,await evaluate("({title:document.title,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),text:document.body.innerText.slice(0,150)})"));
 const shot=await call('Page.captureScreenshot');await fs.writeFile('.tmp/oct23-'+path.split('?')[0]+'.png',Buffer.from(shot.data,'base64'));
}
ws.close();
