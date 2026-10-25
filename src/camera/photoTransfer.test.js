import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {offerPhoto, receivePhoto, PHOTO_TTL, PHOTO_CHUNK_BYTES} from './photoTransfer.js';

class FakePeer extends EventEmitter {
  static instances = [];
  constructor() { super(); FakePeer.instances.push(this); }
  destroy() { this.destroyed = true; }
  connect(id, options) { this.target = id; this.options = options; return this.conn = new FakeConnection(options.metadata); }
}
class FakeConnection extends EventEmitter {
  constructor(metadata) { super(); this.metadata = metadata; this.sent = []; }
  send(value) { this.sent.push(value); }
  close() { this.closed = true; }
}
globalThis.location = {href: 'https://example.com/photo'};
test('chunked photo waits for each acknowledgement and reconstructs exact bytes', async () => {
  const original = Uint8Array.from({length:PHOTO_CHUNK_BYTES*3+137},(_,i)=>i%251);
  const senderStates=[], receiverStates=[];
  const stopSender=offerPhoto(new Blob([original]),s=>senderStates.push(s),FakePeer);
  const sender=FakePeer.instances.at(-1);sender.emit('open','sender');
  const token=new URLSearchParams(new URL(senderStates[0].url).hash.slice(1)).get('token');
  const stopReceiver=receivePhoto('sender',token,s=>receiverStates.push(s),FakePeer);
  const receiver=FakePeer.instances.at(-1);receiver.emit('open');
  const out=new FakeConnection({token});sender.emit('connection',out);out.emit('open');
  receiver.conn.emit('open');out.emit('data',receiver.conn.sent.shift());
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(out.sent.length,2); // Header + one chunk, no unbounded burst.
  receiver.conn.emit('data',out.sent.shift());
  for(let index=0;index<4;index++) {
    const chunk=out.sent.shift();assert.equal(chunk.index,index);
    receiver.conn.emit('data',chunk);
    out.emit('data',receiver.conn.sent.shift());
  }
  assert.equal(senderStates.at(-1).status,'sent');
  assert.deepEqual(new Uint8Array(await receiverStates.at(-1).blob.arrayBuffer()),original);
  stopSender();stopReceiver();
});

test('chunk receiver rejects an out-of-order payload', () => {
  const states=[];const stop=receivePhoto('sender','token',s=>states.push(s),FakePeer);
  const peer=FakePeer.instances.at(-1);peer.emit('open');
  peer.conn.emit('data',{type:'photo-start',size:3,mime:'image/jpeg'});
  peer.conn.emit('data',{type:'photo-chunk',index:1,bytes:new ArrayBuffer(3)});
  assert.equal(states.at(-1).code,'invalid-photo');assert.ok(peer.destroyed);stop();
});
test('sender requires token, accepts only one receiver, expires and releases session', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  const states = [];
  const stop = offerPhoto(new Blob(['test'], {type: 'image/jpeg'}), s => states.push(s), FakePeer);
  const peer = FakePeer.instances.at(-1);
  peer.emit('open', 'sender');
  const params = new URLSearchParams(new URL(states.at(-1).url).hash.slice(1));
  assert.equal(params.get('photo'), 'sender');
  const bad = new FakeConnection({token: 'incorrect'}); peer.emit('connection', bad);
  assert.ok(bad.closed);
  const good = new FakeConnection({token: params.get('token')}); peer.emit('connection', good);
  good.emit('open');
  assert.equal(good.sent.length,0);
  good.emit('data',{type:'ready'});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(new TextDecoder().decode(good.sent[1].bytes), 'test');
  const duplicate = new FakeConnection(good.metadata); peer.emit('connection', duplicate);
  assert.ok(duplicate.closed);
  good.emit('data', {type: 'received'});
  assert.equal(states.at(-1).status, 'sent');
  t.mock.timers.tick(300);
  assert.ok(peer.destroyed); stop();
});
test('unclaimed QR expires after five minutes', t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  const states = [];
  offerPhoto(new Blob(['test']), s => states.push(s), FakePeer);
  const peer = FakePeer.instances.at(-1); peer.emit('open', 'sender');
  t.mock.timers.tick(PHOTO_TTL);
  assert.equal(states.at(-1).status, 'expired');
  assert.ok(peer.destroyed);
});
test('receiver validates binary data and acknowledges only one photo', () => {
  const states = [];
  const stop = receivePhoto('sender', 'token', s => states.push(s), FakePeer);
  const peer = FakePeer.instances.at(-1); peer.emit('open');
  assert.equal(peer.options.metadata.token, 'token');
  const data = {type: 'photo', mime: 'image/jpeg', bytes: new Uint8Array([1, 2, 3]).buffer};
  peer.conn.emit('data', data); peer.conn.emit('data', data);
  assert.equal(states.length, 1);
  assert.equal(states[0].blob.size, 3);
  assert.deepEqual(peer.conn.sent, [{type: 'received'}]);
  stop(); assert.ok(peer.destroyed);
});
test('receiver rejects malformed payload and closes connection', () => {
  const states = [];
  receivePhoto('sender', 'token', s => states.push(s), FakePeer);
  const peer = FakePeer.instances.at(-1); peer.emit('open');
  peer.conn.emit('data', {type: 'photo', mime: 'text/html', bytes: new ArrayBuffer(5)});
  assert.equal(states.at(-1).status, 'error'); assert.ok(peer.destroyed);
});

test('default TURN configuration is not overwritten and errors keep a distinct cause', () => {
  class OptionsPeer extends FakePeer { constructor(id, options) { super(); this.options = options; } }
  const states=[];
  const stop=offerPhoto(new Blob(['test']),state=>states.push(state),OptionsPeer);
  const peer=FakePeer.instances.at(-1);
  assert.equal(peer.options.config,undefined);
  assert.equal(peer.options.secure,true);
  peer.emit('error',{type:'peer-unavailable'});
  assert.equal(states.at(-1).code,'peer-unavailable');
  assert.ok(states.at(-1).message.includes('촬영 화면'));
  assert.ok(peer.destroyed);stop();
});

test('receiver distinguishes signaling, connection and data transfer timeouts', t => {
  t.mock.timers.enable({apis:['setTimeout']});
  for (const phase of ['signaling','connection','data']) {
    const states=[];
    const stop=receivePhoto('sender','token',s=>states.push(s),FakePeer);
    const peer=FakePeer.instances.at(-1);
    if(phase!=='signaling')peer.emit('open');
    if(phase==='data')peer.conn.emit('open');
    t.mock.timers.tick(45000);
    assert.equal(states.at(-1).code,{signaling:'signaling-timeout',connection:'relay-connect-timeout',data:'transfer-timeout'}[phase]);
    assert.ok(peer.destroyed);stop();
  }
});

test('sender reports connection-stage failure instead of an unexplained closure', () => {
  const states=[];
  const stop=offerPhoto(new Blob(['test']),s=>states.push(s),FakePeer);
  const peer=FakePeer.instances.at(-1);peer.emit('open','sender');
  const token=new URLSearchParams(new URL(states.at(-1).url).hash.slice(1)).get('token');
  const conn=new FakeConnection({token});peer.emit('connection',conn);conn.emit('close');
  assert.equal(states.at(-1).code,'relay-connect-timeout');assert.ok(peer.destroyed);stop();
});
