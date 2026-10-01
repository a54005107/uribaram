import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3, Euler} from 'three';
import {createGripState, updateGrip, gripScore} from './gripAnalyzer.js';
import {createStickTracker, trackStick, sampleStick, projectStick} from './stickTracker.js';
import {createJangguLayout, videoPointToViewport} from './jangguLayout.js';
import {createStickHitEngine, segmentEntry} from './stickHitEngine.js';
import {TRACKING_CONFIG, JANGGU_CONFIG} from '../config/stickInteractionConfig.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
function hand(folded = false) {
  const points = Array.from({length: 21}, () => ({x: .5, y: .6, z: 0}));
  for (const [i, id] of [5, 9, 13, 17].entries()) {
    const x = .44 + i * .04;
    points[id] = {x, y: .5, z: 0};
    points[id + 1] = {x, y: .44, z: 0};
    points[id + 2] = {x, y: folded ? .49 : .38, z: 0};
    points[id + 3] = {x, y: folded ? .54 : .32, z: 0};
  }
  return points;
}

test('grip score separates synthetic extended and curled fingers, including rotated hands', () => {
  assert.ok(gripScore(hand()) < .28);
  assert.ok(gripScore(hand(true)) > .62);
  const rotated = hand(true).map((p) => ({x: -p.y, y: p.x, z: p.z}));
  near(gripScore(rotated), gripScore(hand(true)));
});
test('grab and release debounce with hysteresis and OPENING cancellation', () => {
  let state = updateGrip(createGripState(), .9, 0);
  assert.equal(state.state, 'CLOSING'); assert.equal(state.grabbed, false);
  state = updateGrip(state, .9, 60);
  assert.equal(state.state, 'FIST'); assert.equal(state.grabbed, true);
  state = updateGrip(state, .1, 90);
  assert.equal(state.state, 'OPENING'); assert.equal(state.grabbed, true);
  state = updateGrip(state, .5, 120);
  assert.equal(state.state, 'FIST'); assert.equal(state.grabbed, true);
  state = updateGrip(state, .1, 150); state = updateGrip(state, .1, 330);
  assert.equal(state.state, 'OPEN'); assert.equal(state.grabbed, false);
});
test('anchor stays near palm-based grip during a fast strike and tip matches rendered rotation', () => {
  const tracker = createStickTracker();
  trackStick(tracker, hand(true), 'right', 0, .95, 1);
  const moved = hand(true).map((p) => ({...p, x: p.x + .2}));
  const sample = trackStick(tracker, moved, 'right', 60, .95, 1);
  assert.ok(Math.hypot(sample.anchor.x - sample.rawGrip.x, sample.anchor.y - sample.rawGrip.y) <= TRACKING_CONFIG.maxAnchorLag + 1e-10);
  assert.notEqual(sample.rawGrip.y, sample.wrist.y);
  const layout = createJangguLayout(1280, 720);
  const stick = projectStick(sample, 1280, 720, layout);
  const lengthPx = stick.width * 1280, distancePx = lengthPx * (1 - stick.gripOffset);
  near(stick.tipX * 1280, stick.gripX * 1280 + Math.cos(stick.rotation) * distancePx);
  near(stick.tipY * 720, stick.gripY * 720 + Math.sin(stick.rotation) * distancePx);
});
test('gungulchae round tip points below the grip in neutral pose without moving the handle', () => {
  const points = hand(true), layout = createJangguLayout(1280, 720);
  const left = trackStick(createStickTracker(), points, 'left', 0, .95, 1280 / 720);
  const right = trackStick(createStickTracker(), points, 'right', 0, .95, 1280 / 720);
  const stick = projectStick(left, 1280, 720, layout);
  assert.ok(stick.tipY > stick.gripY);
  near(left.anchor.x, right.anchor.x); near(left.anchor.y, right.anchor.y);
  near(Math.cos(left.rotation), -Math.cos(right.rotation));
  near(Math.sin(left.rotation), -Math.sin(right.rotation));
});
test('brief occlusion coasts within bounds then expires, reacquisition clears old velocity', () => {
  const tracker = createStickTracker();
  trackStick(tracker, hand(true), 'left', 0, .9, 1);
  trackStick(tracker, hand(true).map((p) => ({...p, x: p.x + .1})), 'left', 60, .9, 1);
  tracker.missing = true;
  const sample = sampleStick(tracker, 120);
  assert.equal(sample.stale, true); assert.equal(sample.grip.grabbed, true);
  assert.ok(Math.hypot(sample.anchor.x - tracker.output.anchor.x, sample.anchor.y - tracker.output.anchor.y) <= TRACKING_CONFIG.maxCoastDistance + 1e-10);
  assert.equal(sampleStick(tracker, 400), null);
  const recovered = trackStick(tracker, hand(true), 'left', 450, .9, 1);
  assert.equal(recovered.velocity.x, 0); assert.equal(recovered.grip.grabbed, false);
});
test('angle crossing +/-pi does not reverse and palm degeneracy retains orientation', () => {
  const tracker = createStickTracker();
  const base = hand(true);
  const rotate = (r) => base.map((p) => ({x: .5 + (p.x - .5) * Math.cos(r) - (p.y - .6) * Math.sin(r), y: .6 + (p.x - .5) * Math.sin(r) + (p.y - .6) * Math.cos(r), z: 0}));
  const a = trackStick(tracker, rotate(Math.PI / 2 - .02), 'right', 0, .9, 1);
  const b = trackStick(tracker, rotate(Math.PI / 2 + .02), 'right', 33, .9, 1);
  assert.ok(Math.abs(a.rotation - b.rotation) < .1);
  const degenerate = base.map(() => ({x: .5, y: .6, z: 0}));
  const c = trackStick(tracker, degenerate, 'right', 66, .9, 1);
  assert.ok(Math.abs(b.rotation - c.rotation) < .1);
});
test('body transform is preserved at different viewport sizes; projected rims agree with hit ellipses', () => {
  for (const [w, h] of [[1920, 1080], [1366, 768], [1024, 600], [390, 844]]) {
    const layout = createJangguLayout(w, h, JANGGU_CONFIG, {x: .42, y: .46, width: .35});
    near(layout.x, .42); near(layout.y, .46); near(layout.width, .35);
    const euler = new Euler(0, layout.yaw * Math.PI / 180, 0);
    for (const [side, sign] of [['left', -1], ['right', 1]]) {
      const zone = layout.zones[side];
      for (const theta of [0, Math.PI / 3, Math.PI / 2, Math.PI]) {
        const p = new Vector3(sign * JANGGU_CONFIG.rimX, JANGGU_CONFIG.rimRadius * Math.cos(theta), JANGGU_CONFIG.rimRadius * Math.sin(theta)).applyEuler(euler);
        const x = layout.x + p.x * layout.zoom / w, y = layout.y - p.y * layout.zoom / h;
        near(((x - zone.x) / zone.radiusX) ** 2 + ((y - zone.y) / zone.radiusY) ** 2, 1);
      }
    }
  }
});
test('cover crop maps video points into viewport consistently', () => {
  const layout = createJangguLayout(100, 100);
  assert.deepEqual(videoPointToViewport({x: .25, y: .5}, 200, 100, layout), {x: 0, y: .5});
});
test('swept tip detects a complete crossing but not a near miss', () => {
  const zone = {x: .5, y: .7, radiusX: .1, radiusY: .1};
  assert.ok(segmentEntry({x: .5, y: .4}, {x: .5, y: .9}, zone) !== null);
  assert.equal(segmentEntry({x: .7, y: .4}, {x: .7, y: .9}, zone), null);
});
test('forgiving hits accept a near-rim slower strike but reject a distant pass', () => {
  const layout = createJangguLayout(1280, 720, JANGGU_CONFIG, {x: .5, y: .5, width: .35});
  const zone = layout.zones.left;
  for (const [offset, expected] of [[1.1, 1], [1.5, 0]]) {
    const engine = createStickHitEngine(), hits = [];
    const stick = (y, timestamp) => ({tipX: zone.x + zone.radiusX * offset, tipY: y, timestamp, grip: {grabbed: true}});
    engine.update(layout, {left: stick(zone.y - zone.radiusY * 1.3, 0)}, (h) => hits.push(h));
    const travel = zone.radiusY * 1.3;
    engine.update(layout, {left: stick(zone.y, travel / .23 * 1000)}, (h) => hits.push(h));
    assert.equal(hits.length, expected);
  }
});
test('hit loop prevents duplicate/stale/released hits and resets on resize', () => {
  const engine = createStickHitEngine(), layout = createJangguLayout(1280, 720), hits = [];
  const z = layout.zones.left;
  const stick = (timestamp, y, extra = {}) => ({tipX: z.x, tipY: y, timestamp, grip: {grabbed: true}, stale: false, ...extra});
  engine.update(layout, {left: stick(0, z.y - z.radiusY * 2)}, (hit) => hits.push(hit));
  engine.update(layout, {left: stick(50, z.y + z.radiusY * 2)}, (hit) => hits.push(hit));
  engine.update(layout, {left: stick(50, z.y + z.radiusY * 2)}, (hit) => hits.push(hit));
  assert.equal(hits.length, 1); assert.equal(hits[0].side, 'left');
  engine.update(layout, {left: stick(100, z.y, {stale: true})}, (hit) => hits.push(hit));
  engine.update(layout, {left: stick(150, z.y, {grip: {grabbed: false}})}, (hit) => hits.push(hit));
  engine.update(createJangguLayout(1000, 600), {left: stick(200, z.y)}, (hit) => hits.push(hit));
  assert.equal(hits.length, 1);
});
