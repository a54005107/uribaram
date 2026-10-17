import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const tabs = await (await fetch('http://127.0.0.1:9338/json')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
let id = 0; const pending = new Map(), errors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text); });
const call = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, {resolve,reject}); ws.send(JSON.stringify({id:next,method,params})); });
const evaluate = async expression => { const r = await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true}); if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
const wait = ms => new Promise(r => setTimeout(r,ms));
await call('Runtime.enable'); await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});await wait(1000);
for(const [width,height] of [[1280,720],[1920,1080],[1024,768],[390,844]]) {
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(300);
 const geometry=await evaluate(`(()=>{const el=document.querySelector('.story-page'),r=el.getBoundingClientRect();return {ratio:r.width/r.height,width:r.width,height:r.height,snap:getComputedStyle(el).scrollSnapType}})()`);
 assert.ok(Math.abs(geometry.ratio-2240/1260)<.01);assert.ok(geometry.width<=width+1&&geometry.height<=height+1);assert.equal(geometry.snap,'y mandatory');
 await evaluate("document.querySelector('.story-page').scrollTo({top:document.querySelector('.story-page').clientHeight*.8,behavior:'smooth'})");await wait(900);
 const distance=await evaluate(`(()=>{const root=document.querySelector('.story-page'),r=root.getBoundingClientRect();return Math.min(...[...document.querySelectorAll('.story-snap-point')].map(p=>Math.abs(p.getBoundingClientRect().top-r.top)));})()`);
 assert.ok(distance<2, 'snap distance '+distance);
}
await call('Page.navigate',{url:'http://127.0.0.1:5182/photo'});await wait(5000);
assert.ok(await evaluate("document.querySelector('.photo-preview').width===960"));
assert.ok(await evaluate("!document.querySelector('.photo-shutter').disabled"));
assert.deepEqual(errors,[]);console.log('PASS: four viewport ratios, scroll settles at markers, virtual camera renders without runtime exceptions');await call('Browser.close');
