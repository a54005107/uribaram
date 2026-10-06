import test from 'node:test';
import assert from 'node:assert/strict';
import {ringWave} from './ringWave.js';
import {createStickHitEngine} from './stickHitEngine.js';

test('wave travels outward from the impact point and responds to strike strength', () => {
  const point = {x: 0, y: 50};
  const near = {x: 0, y: 0, width: 100, height: 100};
  const far = {x: 200, y: 0, width: 100, height: 100};
  const first = ringWave(near, point, 400);
  const next = ringWave(far, point, 400);
  assert.ok(first.delay < next.delay);
  assert.ok(first.x > 0);
  const weak = ringWave(near, point, 400, 'weak');
  const strong = ringWave(near, point, 400, 'strong');
  assert.ok(strong.x > weak.x);
  assert.ok(strong.scale > weak.scale);
  assert.ok(Object.values(ringWave(near, {x: 50, y: 50}, 400)).every(Number.isFinite));
});

test('fast crossing emits the entry point instead of the end of the stroke', () => {
  const engine = createStickHitEngine(), hits = [];
  const layout = {viewportWidth: 1000, viewportHeight: 1000, zones: {center: {x: .5, y: .5, radiusX: .1, radiusY: .1}}};
  const stick = (x, timestamp) => ({tipX: x, tipY: .5, timestamp, grip: {grabbed: true}, stale: false});
  engine.update(layout, {right: stick(.1, 0)}, hit => hits.push(hit));
  engine.update(layout, {right: stick(.9, 100)}, hit => hits.push(hit));
  assert.equal(hits.length, 1);
  assert.ok(hits[0].point.x > .3 && hits[0].point.x < .5);
  assert.equal(hits[0].point.y, .5);
});
