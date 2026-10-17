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
await wait(1200);
const result = await evaluate(`(async()=>{
 const {offerPhoto,receivePhoto}=await import('/src/camera/photoTransfer.js');
 return new Promise(resolve=>{
  const events=[]; let receiveStop, done=false;
  const timer=setTimeout(()=>finish('timeout'),35000);
  const finish=status=>{if(done)return;done=true;clearTimeout(timer);sendStop();receiveStop?.();resolve({status,events});};
  const sendStop=offerPhoto(new Blob(['synthetic-photo-test'],{type:'image/jpeg'}),state=>{
   events.push('sender:'+state.status);
   if(state.status==='ready'){
    const params=new URLSearchParams(new URL(state.url).hash.slice(1));
    receiveStop=receivePhoto(params.get('photo'),params.get('token'),async data=>{
      events.push('receiver:'+data.status);
      if(data.blob) {const text=await data.blob.text();setTimeout(()=>finish(text==='synthetic-photo-test'?'pass':'mismatch'),500);}
    });
   }
   if(state.status==='error')finish('connection-error');
  });
 });
})()`);
console.log(JSON.stringify(result));
ws.close();
