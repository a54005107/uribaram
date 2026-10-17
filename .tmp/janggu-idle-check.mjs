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
await call('Page.navigate',{url:'http://127.0.0.1:5182/'});await wait(1000);
await evaluate(`(async()=>{const {default:React}=await import('/node_modules/.vite/deps/react.js');const {default:{createRoot}}=await import('/node_modules/.vite/deps/react-dom_client.js');const {default:Janggu}=await import('/src/components/sticks/FigmaJanggu.jsx');window.jangguRef=React.createRef();window.testHost=document.createElement('div');document.body.append(testHost);window.testRoot=createRoot(testHost);testRoot.render(React.createElement(Janggu,{ref:jangguRef,layout:{left:0,top:0,scale:.5}}));})()`);
await wait(300);
assert.equal(await evaluate('testHost.getAnimations({subtree:true}).length'),0);
await wait(4300);
assert.equal(await evaluate('testHost.getAnimations({subtree:true}).length'),0);
await evaluate("jangguRef.current.strike({side:'left',strength:'strong'})");
const hit=await evaluate('testHost.getAnimations({subtree:true}).map(a=>({duration:a.effect.getTiming().duration,delay:a.effect.getTiming().delay,peak:a.effect.getKeyframes()[1].transform}))');
assert.equal(hit.length,15);assert.ok(hit.every(a=>a.duration===280&&a.delay<=42&&a.peak==='scale(1.032)'));
await wait(400);assert.equal(await evaluate('testHost.getAnimations({subtree:true}).length'),0);
await evaluate("jangguRef.current.strike({side:'right',strength:'normal'});testRoot.unmount()");
assert.equal(await evaluate('testHost.getAnimations({subtree:true}).length'),0);
assert.deepEqual(errors,[]);console.log('PASS: idle across 4s, small hit only, 322ms settle, unmount cleanup');await call('Browser.close');


