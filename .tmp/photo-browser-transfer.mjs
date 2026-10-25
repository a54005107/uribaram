import fs from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9338/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

await call('Page.enable');await call('Page.navigate',{url:'http://127.0.0.1:5182/photo'});await wait(700);
console.log(await evaluate(`(async()=>{
 const {offerPhoto,receivePhoto}=await import('/src/camera/photoTransfer.js');
 const options={secure:true,config:{iceServers:[]}};
 const original=Uint8Array.from({length:1024*1024+713},(_,i)=>i%251);
 return await new Promise(resolve=>{
 let stopSend,stopReceive,done=false;
 const finish=result=>{if(done)return;done=true;clearTimeout(timeout);stopSend?.();stopReceive?.();resolve(result);};
 const timeout=setTimeout(()=>finish({error:'browser-test-timeout'}),55000);
 stopSend=offerPhoto(new Blob([original]),s=>{
  if(s.status==='error')finish({senderError:s.code});
  if(s.status==='ready'){
   const p=new URLSearchParams(new URL(s.url).hash.slice(1));
   stopReceive=receivePhoto(p.get('photo'),p.get('token'),async r=>{
    if(r.status==='error')finish({receiverError:r.code});
    if(r.status==='received'){
     const bytes=new Uint8Array(await r.blob.arrayBuffer());
     setTimeout(()=>finish({size:bytes.length,equal:bytes.length===original.length&&bytes.every((v,i)=>v===original[i])}),500);
    }
   },undefined,options);
  }
 },undefined,options);
 });
})()`));ws.close();
