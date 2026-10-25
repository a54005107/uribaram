import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});await wait(1800);
for(const [name,top] of [['intro',0],['flag',2434],['people',3890.727],['places',6152.895],['regions',8433.5],['ending',13600]]){
 await evaluate(`document.querySelector('.story-page').scrollTop=${top}*.5`);await wait(450);
 const shot=await call('Page.captureScreenshot');await fs.writeFile('.tmp/story-oct23-'+name+'.png',Buffer.from(shot.data,'base64'));
 console.log(name,await evaluate("({scroll:document.querySelector('.story-page').scrollTop,color:document.querySelector('.story-scroll-header').dataset.color})"));
}
await evaluate("document.querySelector('[aria-label=\"다음 농기 보기\"]').click();document.querySelector('.story-place-next').click()");await wait(200);
assert.deepEqual(await evaluate("[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)"),[]);
for(const [width,height] of [[1920,1080],[1024,768],[390,844]]){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(120);const r=await evaluate("(()=>{const p=document.querySelector('.story-page');return {w:p.clientWidth,h:p.clientHeight,sw:p.scrollWidth};})()");assert.ok(Math.abs(r.w/r.h-16/9)<.01);assert.equal(r.sw,r.w);}
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:5182/flag'});await wait(700);assert.equal(await evaluate("document.querySelectorAll('.flag-wishes button').length"),10);
await evaluate("document.querySelectorAll('.flag-wishes button')[3].click()");await wait(50);await evaluate("document.querySelector('.flag-submit').click()");await wait(200);assert.equal(await evaluate("sessionStorage.getItem('uribaram-flag-wish')"),'취업성공');
await call('Page.navigate',{url:'http://127.0.0.1:5182/experience?instrument=janggu'});await wait(2000);
assert.equal(await evaluate("getComputedStyle(document.querySelector('.camera-play-video')).opacity"),'1');
const shot=await call('Page.captureScreenshot');await fs.writeFile('.tmp/oct23-play-final.png',Buffer.from(shot.data,'base64'));
assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: asset loads, 10 wishes, persistence, responsive 16:9, camera background, no runtime exceptions');ws.close();
