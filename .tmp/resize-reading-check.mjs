import fs from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:2560,height:1440,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});await wait(800);
await evaluate("document.querySelector('.story-page').scrollTop=3890.727");await wait(350);
const before=await evaluate("document.querySelector('.story-page').scrollTop/Number(getComputedStyle(document.querySelector('.story-page')).getPropertyValue('--story-scale'))");
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await wait(350);
const after=await evaluate("document.querySelector('.story-page').scrollTop/Number(getComputedStyle(document.querySelector('.story-page')).getPropertyValue('--story-scale'))");
console.log({before,after});if(Math.abs(before-after)>3)throw Error('Resize lost reading position');
console.log(await evaluate("({header:document.querySelector('.story-scroll-header').dataset.color,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,snaps:document.querySelectorAll('.story-snap-point').length})"));ws.close();
