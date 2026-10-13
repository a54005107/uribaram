import test from 'node:test';
import assert from 'node:assert/strict';
import {createStickHitEngine, forgivingHitZone} from './stickHitEngine.js';

const zone = {x: .5, y: .5, radiusX: .2, radiusY: .2};
const layout = {viewportWidth: 1000, viewportHeight: 1000, zones: {center: zone}};
const sample = (timestamp, radius, extra = {}) => ({timestamp, tipX: .5,
  tipY: .5 - radius * forgivingHitZone(zone).radiusY, grip: {grabbed: true}, stale: false, ...extra});

test('strokes entirely across the center hit once per direction without touching a rim', () => {
  const engine = createStickHitEngine(), hits = [];
  let time = 0;
  for (const x of [-.18, -.06, .06, .18, .06, -.06, -.18, -.06, .06, .18]) {
    engine.update(layout, {right: sample(time, 0, {tipX: .5 + x * forgivingHitZone(zone).radiusX})}, hit => hits.push(hit));
    time += 40;
  }
  assert.equal(hits.length, 3);
  assert.ok(hits.every(hit => Math.abs(hit.point.x - .5) < .06));
});

test('ten short lift-and-return strokes inside the surface produce ten hits', () => {
  const engine = createStickHitEngine(), hits = [];
  const update = (time, r) => engine.update(layout, {right: sample(time, r)}, hit => hits.push(hit));
  update(0, .4);
  for (let i = 0; i < 10; i++) {
    update(i * 100 + 30, .75);
    update(i * 100 + 60, .55);
    update(i * 100 + 90, .4);
  }
  assert.equal(hits.length, 10);
});

test('small stationary noise and stale recovery cannot produce rebound hits', () => {
  const engine = createStickHitEngine(), hits = [];
  for (let i = 0; i < 120; i++) {
    engine.update(layout, {right: sample(i * 16, .5 + .015 * Math.sin(i))}, hit => hits.push(hit));
  }
  engine.update(layout, {right: sample(2000, .9, {stale: true})}, hit => hits.push(hit));
  engine.update(layout, {right: sample(2033, .4)}, hit => hits.push(hit));
  assert.equal(hits.length, 0);
});
