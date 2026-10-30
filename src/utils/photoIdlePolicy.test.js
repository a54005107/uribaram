import test from 'node:test';
import assert from 'node:assert/strict';
import {photoIdlePolicy, photoIdleDelay} from './photoIdlePolicy.js';
test('QR preparation and scanning have their own window; completion restores normal idle', () => {
  const phases = [];
  const unsubscribe = photoIdlePolicy.subscribe(() => phases.push(photoIdlePolicy.snapshot()));
  for (const phase of ['connecting', 'preparing', 'ready', 'sending']) {
    photoIdlePolicy.set(phase);
    assert.equal(photoIdleDelay(phase), 300000);
  }
  assert.deepEqual(phases, ['connecting', 'preparing', 'ready', 'sending']);
  for (const phase of ['sent', 'error', 'expired', 'closed', 'idle']) assert.equal(photoIdleDelay(phase), 20000);
  unsubscribe();
  photoIdlePolicy.set('idle');
  assert.equal(phases.length, 4);
});
