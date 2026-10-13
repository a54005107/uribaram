import test from 'node:test';
import assert from 'node:assert/strict';
import {launchStar, stepStar} from './starBounce.js';

test('floor launch survives zero-time first frame, rises and lands on every hit', () => {
  const p = {y: 300, floor: 300, velocity: 0, angle: 0, index: 5};
  for (let hit = 0; hit < 5; hit++) {
    p.velocity = -900;
    assert.equal(stepStar(p, 0), true);
    assert.equal(p.velocity, -900);
    let highest = p.y;
    for (let frame = 0; frame < 100; frame++) { stepStar(p, 1 / 60); highest = Math.min(highest, p.y); }
    assert.ok(highest < p.floor - 150);
    assert.equal(p.y, p.floor);
    assert.equal(p.velocity, 0);
  }
});

test('airborne hits preserve position, queue one hop, drift sideways and settle inside walls', () => {
  const p = {x: 0, y: 300, floor: 300, velocity: 0, angle: 0, index: 1, minX: -50, maxX: 50};
  launchStar(p, 1, () => .9);
  for (let i = 0; i < 12; i++) stepStar(p, 1 / 60);
  assert.ok(p.y < p.floor - 100);
  assert.ok(p.x > 0);
  const before = {x: p.x, y: p.y, velocity: p.velocity};
  for (let hit = 0; hit < 100; hit++) launchStar(p, 1, () => .1);
  assert.deepEqual({x: p.x, y: p.y, velocity: p.velocity}, before);
  let secondLaunch = false;
  for (let i = 0; i < 480; i++) {
    const pending = p.pending;
    stepStar(p, 1 / 60);
    if (pending && !p.pending && p.velocity < 0) secondLaunch = true;
    assert.ok(p.x >= p.minX && p.x <= p.maxX);
  }
  assert.equal(secondLaunch, true);
  assert.equal(p.y, p.floor);
  assert.equal(p.velocity, 0);
  assert.equal(p.vx, 0);
});
