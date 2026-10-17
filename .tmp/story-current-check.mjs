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
await call('Page.navigate',{url:'http://127.0.0.1:5182/story'});for(let n=0;n<30;n++){if(await evaluate("document.querySelectorAll('.story-section').length===6"))break;await wait(200);} await evaluate("document.fonts.ready");
assert.ok(await evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"));
const colors=['pink','sky','yellow','green','blue','pink'];
for(const index of [0,1,2,3,4,5,3,1,0]){
 await evaluate(`document.querySelectorAll('.story-section')[${index}].scrollIntoView({behavior:'instant'})`);await wait(300);
 assert.equal(await evaluate("document.querySelector('.story-scroll-header').dataset.color"),colors[index]);
 if(index<3) await call('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(`.tmp/story-current-${index}.png`,Buffer.from(r.data,'base64')));
}
await evaluate("document.querySelector('[aria-label=\"다음 농기 보기\"]').click()");await wait(500);
assert.ok(await evaluate("document.querySelector('.story-flag-photo img').naturalWidth>0"));
await evaluate("document.querySelector('[aria-label=\"다음 농기 보기\"]').click()");await wait(500);
assert.ok(await evaluate("document.querySelector('.story-flag-photo img').src.endsWith('623b8.png')"));
await evaluate("document.querySelector('[aria-label=\"다음 농기 보기\"]').click()");
assert.equal(await evaluate("document.querySelectorAll('.story-flag-photo').length"),0);
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(300);
assert.ok(await evaluate("document.querySelector('.story-page').scrollWidth <= 390"));
assert.deepEqual(errors,[]);
console.log('PASS: six sections, forward/reverse colors, all local artwork, flag slides, mobile width');
await call('Browser.close');

