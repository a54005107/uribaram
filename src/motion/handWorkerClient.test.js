import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandWorkerClient} from './handWorkerClient.js';
import {predictDisplayPose} from './displayPrediction.js';

const fakeWorker=()=>({messages:[],postMessage(message){this.messages.push(message)},terminate(){this.terminated=true}});
test('worker allows one frame in flight, rejects stale replies, and releases each request',async()=>{
 const worker=fakeWorker(),client=createHandWorkerClient(worker);
 const first=client.request('frame',{timestamp:10});
 await assert.rejects(client.request('frame',{timestamp:20}),/in flight/);
 worker.onmessage({data:{id:0,result:'old'}});
 worker.onmessage({data:{id:1,result:'current'}});
 assert.equal((await first).result,'current');
 const next=client.request('frame',{timestamp:30});worker.onmessage({data:{id:2,result:'next'}});
 assert.equal((await next).result,'next');client.close();assert.equal(worker.terminated,true);
});
test('worker cleanup and timeout reject pending work without leaving a queued request',async()=>{
 const worker=fakeWorker(),client=createHandWorkerClient(worker,{timeoutMs:5});
 await assert.rejects(client.request('init',{}),/timed out/);
 const pending=client.request('frame',{});client.close();await assert.rejects(pending,/closed/);
 await assert.rejects(client.request('frame',{}),/closed/);
});
test('render prediction fills gaps, is bounded, and never mutates hit coordinates',()=>{
 const pose={anchor:{x:.4,y:.5},velocity:{x:2,y:0},timestamp:100,stale:false};
 const a=predictDisplayPose(pose,110),b=predictDisplayPose(pose,125);
 assert.ok(a.anchor.x>.4);assert.ok(b.anchor.x>a.anchor.x);
 assert.ok(predictDisplayPose(pose,190).anchor.x<=.4250001);
 assert.deepEqual(pose.anchor,{x:.4,y:.5});
 assert.equal(predictDisplayPose(pose,201),pose);
 for(const state of [{stale:true},{recovering:true},{velocity:{x:0,y:0}}]){
  assert.deepEqual(predictDisplayPose({...pose,...state},130).anchor,pose.anchor);
 }
});
