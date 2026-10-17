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
await call('Page.navigate',{url:'http://127.0.0.1:5182/'});
await wait(1000);
await evaluate("document.querySelector('.waiting-flag').click()");
await wait(200);
const transition=await evaluate(`({
 current:getComputedStyle(document.querySelector('.route-current')).transform,
 outgoing:getComputedStyle(document.querySelector('.route-outgoing')).transform,
 background:getComputedStyle(document.querySelector('.route-outgoing main')).backgroundColor,
 moving:document.querySelector('.title-content').getAnimations().length
})`);
assert.equal(transition.current,'matrix(1, 0, 0, 1, 0, 0)');
assert.equal(transition.outgoing,'matrix(1, 0, 0, 1, 0, 0)');
assert.equal(transition.background,'rgba(0, 0, 0, 0)');
assert.equal(transition.moving,1);
await wait(900);
await evaluate("document.querySelector('.title-next').click()");
await wait(1000);
await evaluate("document.querySelector('.trumpet-instrument').click()");
await wait(100);
assert.equal(await evaluate("document.querySelector('.trumpet-blowing').getAnimations().length"),1);
await call('Page.navigate',{url:'http://127.0.0.1:5182/flag'});
await wait(1000);
assert.equal(await evaluate("document.querySelectorAll('textarea,input').length"),0);
assert.ok(await evaluate("document.querySelector('.flag-word-art').naturalWidth>0"));
await evaluate("document.querySelector('.site-menu-toggle').click()");
await wait(500);
assert.equal(await evaluate("document.querySelectorAll('.site-menu-clip .is-open').length"),3);
assert.ok(await evaluate("[...document.querySelectorAll('.site-menu-clip img')].every(i=>i.naturalWidth>0)"));
await call('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile('.tmp/feedback-flag.png',Buffer.from(r.data,'base64')));
await call('Page.navigate',{url:'http://127.0.0.1:5182/photo'});
await wait(10000);
const photo=await evaluate(`({ready:!document.querySelector('.photo-shutter').disabled,width:document.querySelector('.photo-preview').width,text:document.querySelector('.photo-help').textContent})`);
console.log('Camera:',photo);
assert.ok(photo.ready);
await evaluate("document.querySelector('.photo-shutter').click()");
await wait(600);
assert.ok(await evaluate("document.querySelector('.photo-result-image').naturalWidth>0"));
await call('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile('.tmp/feedback-photo.png',Buffer.from(r.data,'base64')));
assert.deepEqual(errors,[]);
console.log('PASS: fixed background, content movement, trumpet click motion, fixed flag image, menu, virtual camera capture');
ws.close();
