import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {offerPhoto, receivePhoto, PHOTO_TTL} from './photoTransfer.js';

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
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(new TextDecoder().decode(good.sent[0].bytes), 'test');
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
