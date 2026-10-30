import test from 'node:test';
import assert from 'node:assert/strict';
import {attachVideo} from './attachVideo.js';
test('retries interrupted playback without reopening capture', async () => {
  let calls=0;
  const stream={};
  const video={isConnected:true,play:async()=>{if(++calls<3)throw Object.assign(new Error(),{name:'AbortError'});}};
  assert.equal(await attachVideo(video,stream,()=>true,async()=>{}),true);
  assert.equal(calls,3);assert.equal(video.srcObject,stream);assert.equal(video.muted,true);
});
test('does not hide permission errors or revive a detached video', async () => {
  const video={isConnected:true,play:async()=>{throw Object.assign(new Error(),{name:'NotAllowedError'});}};
  await assert.rejects(attachVideo(video,{},()=>true),{name:'NotAllowedError'});
  video.isConnected=false;
  assert.equal(await attachVideo(video,{},()=>true),false);
});
