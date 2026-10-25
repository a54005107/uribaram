import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPhotoRelay,startPhotoRelay} from './photoRelay.js';
test('missing relay never produces an unusable QR connection',async()=>{
 await assert.rejects(loadPhotoRelay(undefined,async()=>({ok:false,status:503,json:async()=>({code:'relay-not-configured'})})),{type:'relay-not-configured'});
});
test('credential endpoint must provide TURN, not only STUN',async()=>{
 await assert.rejects(loadPhotoRelay(undefined,async()=>({ok:true,json:async()=>({iceServers:[{urls:'stun:example.com'}]})})),{type:'relay-unavailable'});
 const result=await loadPhotoRelay(undefined,async()=>({ok:true,json:async()=>({iceServers:[{urls:'turns:example.com:443',username:'temporary',credential:'short-lived'}]})}));
 assert.equal(result.config.iceTransportPolicy,'all');assert.equal(result.config.iceServers.length,1);
});
test('unmount while credentials load does not create a peer',async()=>{
 let resolve,started=false;const stop=startPhotoRelay(()=>{started=true;},()=>{},()=>new Promise(r=>{resolve=r;}));stop();resolve({});await Promise.resolve();assert.equal(started,false);
});
test('unmount closes peer created after credentials load',async()=>{
 let closed=false;const stop=startPhotoRelay(()=>()=>{closed=true;},()=>{},async()=>({}));await Promise.resolve();stop();assert.equal(closed,true);
});
