import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraErrorMessage, createCameraCapture} from './cameraCapture.js';

const fakeStream = () => {
  const track = {readyState: 'live', stop() { this.readyState = 'ended'; }};
  return {getTracks: () => [track], getVideoTracks: () => [track]};
};
const failure = (name, message = name) => Object.assign(new Error(message), {name});
const immediately = async () => {};

test('timeout retries once using native defaults on the same selected camera', async () => {
  const calls = [], waits = [], stream = fakeStream();
  const capture = createCameraCapture(async constraints => {
    calls.push(constraints);
    if (calls.length === 1) throw failure('NotReadableError', 'Timeout starting video source');
    return stream;
  }, async ms => { waits.push(ms); });
  assert.equal(await capture.start('lge-camera'), stream);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], {video: {deviceId: {exact: 'lge-camera'}}, audio: false});
  assert.deepEqual(waits, [800]);
});

test('reconnect releases the existing camera and waits before reopening it', async () => {
  const first = fakeStream(), second = fakeStream(), events = [];
  let count = 0;
  const capture = createCameraCapture(async () => {
    events.push('open');
    if (++count === 2) assert.equal(first.getVideoTracks()[0].readyState, 'ended');
    return count === 1 ? first : second;
  }, async ms => { events.push(ms); });
  await capture.start('camera');
  await Promise.resolve();
  await capture.start('camera');
  assert.deepEqual(events, ['open', 400, 'open']);
  capture.stop();
  assert.equal(second.getVideoTracks()[0].readyState, 'ended');
});

test('duplicate pending connections share one hardware request', async () => {
  let resolve, calls = 0;
  const capture = createCameraCapture(() => { calls++; return new Promise(done => { resolve = done; }); }, immediately);
  const first = capture.start('camera'), second = capture.start('camera');
  assert.equal(first, second);
  await Promise.resolve();
  assert.equal(calls, 1);
  resolve(fakeStream());
  await first;
  capture.stop();
});

test('a cancelled pending capture closes its late stream before the next request starts', async () => {
  let resolve;
  const oldStream = fakeStream(), nextStream = fakeStream(), calls = [];
  const capture = createCameraCapture(constraints => {
    calls.push(constraints.video.deviceId.exact);
    if (calls.length === 1) return new Promise(done => { resolve = done; });
    assert.equal(oldStream.getVideoTracks()[0].readyState, 'ended');
    return Promise.resolve(nextStream);
  }, immediately);
  const old = capture.start('old');
  await Promise.resolve();
  capture.stop();
  const next = capture.start('new');
  await Promise.resolve();
  assert.deepEqual(calls, ['old']);
  resolve(oldStream);
  assert.equal(await old, null);
  assert.equal(await next, nextStream);
  assert.deepEqual(calls, ['old', 'new']);
  capture.stop();
});

test('permission refusal and unavailable device do not repeatedly request access', async () => {
  for (const name of ['NotAllowedError', 'NotFoundError', 'OverconstrainedError']) {
    let calls = 0;
    const capture = createCameraCapture(async () => { calls++; throw failure(name); }, immediately);
    await assert.rejects(capture.start(), {name});
    assert.equal(calls, 1);
  }
});

test('persistent startup errors stop after two attempts and allow a manual retry', async () => {
  let calls = 0;
  const stream = fakeStream();
  const capture = createCameraCapture(async () => {
    if (++calls <= 2) throw failure('AbortError', 'Timeout starting video source');
    return stream;
  }, immediately);
  await assert.rejects(capture.start(), /Timeout/);
  await Promise.resolve();
  assert.equal(await capture.start(), stream);
  assert.equal(calls, 3);
  capture.stop();
});

test('leaving during recovery cancels retries and the timeout message is actionable', async () => {
  let calls = 0, capture;
  capture = createCameraCapture(async () => { calls++; throw failure('AbortError'); }, async () => { capture.stop(); });
  assert.equal(await capture.start(), null);
  assert.equal(calls, 1);
  const message = cameraErrorMessage(failure('AbortError', 'Timeout starting video source'));
  assert.match(message, /시간이 초과/);
  assert.match(message, /다시 연결/);
});
