import test from 'node:test';
import assert from 'node:assert/strict';
import {createTorsoTracker} from './torsoTracker.js';
import {createJangguLayout} from './jangguLayout.js';
import {createStickHitEngine} from './stickHitEngine.js';
import {createStickTracker, trackStick, projectStick} from './stickTracker.js';
import {JANGGU_CONFIG} from '../config/stickInteractionConfig.js';
const pose = (dx = 0, dy = 0, hips = true, size = .2) => {
  const points = Array.from({length: 33}, () => ({x: .5, y: .5, visibility: 0}));
  points[11] = {x: .5 + size / 2 + dx, y: .3 + dy, visibility: 1};
  points[12] = {x: .5 - size / 2 + dx, y: .3 + dy, visibility: 1};
  points[23] = {x: .55 + dx, y: .8 + dy, visibility: hips ? 1 : 0};
  points[24] = {x: .45 + dx, y: .8 + dy, visibility: hips ? 1 : 0};
  return {landmarks: [points]};
};
const sample = (tracker, now) => tracker.layout(now, 1280, 720, 1280, 720);
test('no fixed fallback: pose is required and torso follows mirrored horizontal and vertical movement', () => {
  const tracker = createTorsoTracker();
  assert.equal(sample(tracker, 0), null);
  tracker.update(pose(), 0, 1280 / 720);
  const initial = sample(tracker, 0);
  assert.ok(Math.abs(initial.y - (.3 + .5 * JANGGU_CONFIG.torsoFraction)) < 1e-9);
  tracker.update(pose(.1, .1), 100, 1280 / 720);
  const next = sample(tracker, 100);
  assert.ok(next.x < initial.x && next.x > initial.x - .1);
  assert.ok(next.y > initial.y && next.y < initial.y + .1);
  assert.ok(next.debug.shoulder && next.debug.hip && next.debug.target);
});
test('missing hips use shoulders, short loss holds and long loss hides', () => {
  const tracker = createTorsoTracker(); tracker.update(pose(0, 0, false), 0, 1280 / 720);
  assert.ok(sample(tracker, 0).y > .3); assert.equal(sample(tracker, 0).debug.hip, null);
  tracker.update({landmarks: []}, 50);
  assert.equal(sample(tracker, 50).stale, true);
  assert.equal(sample(tracker, 400), null);
  tracker.update(pose(.2), 450, 1280 / 720);
  assert.ok(Math.abs(sample(tracker, 450).x - .3) < 1e-9);
});
test('body size scales independently and jitter is attenuated', () => {
  const tracker = createTorsoTracker(); tracker.update(pose(), 0);
  const old = sample(tracker, 0);
  tracker.update(pose(.001, .001, true, .3), 50);
  const next = sample(tracker, 50);
  assert.ok(Math.abs(next.x - old.x) < .001);
  assert.ok(next.width > old.width && next.width < .3 * JANGGU_CONFIG.scaleMultiplier);
  tracker.reset(); assert.equal(sample(tracker, 60), null);
});
test('torso EMA gives the same result across different sampling subdivisions', () => {
  const a = createTorsoTracker(), b = createTorsoTracker();
  a.update(pose(), 0); b.update(pose(), 0);
  a.update(pose(.1), 100); b.update(pose(.1), 50); b.update(pose(.1), 100);
  assert.ok(Math.abs(sample(a, 100).x - sample(b, 100).x) < 1e-10);
});
test('moving body transforms preserve collision history and stationary tips do not hit moving drums', () => {
  const engine = createStickHitEngine(), hits = [];
  const layout = (x) => createJangguLayout(1280, 720, JANGGU_CONFIG, {x, y: .5, width: .4});
  const a = layout(.5), b = layout(.51);
  const stick = (x, y, timestamp) => ({tipX: x, tipY: y, timestamp, grip: {grabbed: true}});
  engine.update(a, {left: stick(a.zones.left.x, .1, 0)}, (h) => hits.push(h));
  engine.update(b, {left: stick(b.zones.left.x, .8, 100)}, (h) => hits.push(h));
  assert.equal(hits.length, 1);
  engine.reset(); hits.length = 0;
  engine.update(a, {left: stick(.1, .5, 0)}, (h) => hits.push(h));
  engine.update(layout(.2), {left: stick(.1, .5, 100)}, (h) => hits.push(h));
  assert.equal(hits.length, 0);
});
test('stick length and tip do not depend on torso scale', () => {
  const points = Array.from({length: 21}, (_, i) => ({x: .4 + i * .005, y: .5 - i * .003, z: 0}));
  const tracker = createStickTracker(); const raw = trackStick(tracker, points, 'left', 0, 1, 1280 / 720);
  const a = createJangguLayout(1280, 720, JANGGU_CONFIG, {x: .5, y: .5, width: .3});
  const b = createJangguLayout(1280, 720, JANGGU_CONFIG, {x: .6, y: .6, width: .6});
  const first = projectStick(raw, 1280, 720, a), second = projectStick(raw, 1280, 720, b);
  assert.equal(first.width, second.width); assert.equal(first.tipX, second.tipX); assert.equal(first.tipY, second.tipY);
});
