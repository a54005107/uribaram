import test from 'node:test';
import assert from 'node:assert/strict';
import {OneEuroFilter} from '../utils/oneEuroFilter.js';
import {createStickTracker, trackStick, sampleStick, markStickMissing, projectStick} from './stickTracker.js';
import {associateHands} from './handAssociation.js';
import {createStickHitEngine} from './stickHitEngine.js';
import {TRACKING_CONFIG as config} from '../config/stickInteractionConfig.js';

function hand(x = .5, y = .6, rotation = 0, identity = 'test') {
  const points = Array.from({length: 21}, () => ({x: .5, y: .6, z: 0, identity}));
  for (const [i, id] of [5, 9, 13, 17].entries()) {
    const px = .44 + i * .04;
    for (const [offset, py] of [[0, .5], [1, .44], [2, .49], [3, .54]]) points[id + offset] = {x: px, y: py, z: 0, identity};
  }
  return points.map(p => ({...p, x: x + (p.x - .5) * Math.cos(rotation) - (p.y - .6) * Math.sin(rotation),
    y: y + (p.x - .5) * Math.sin(rotation) + (p.y - .6) * Math.cos(rotation)}));
}
const deviation = values => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
};
const prime = tracker => { for (let t = 0; t <= 495; t += 33) trackStick(tracker, hand(), 'right', t, .95, 1); };

test('One Euro uses real milliseconds converted to seconds and ignores duplicate / older frames', () => {
  const filter = new OneEuroFilter({minCutoff: 1.2, beta: 0, dCutoff: 1});
  filter.filter(0, 100);
  const expected = 1 / (1 + 1 / (2 * Math.PI * 1.2 * .001));
  const first = filter.filter(1, 101);
  assert.ok(Math.abs(first - expected) < 1e-12);
  assert.equal(filter.filter(999, 101), first);
  assert.equal(filter.filter(999, 99), first);
  const longExpected = expected + (1 - expected) / (1 + 1 / (2 * Math.PI * 1.2 * .25));
  assert.ok(Math.abs(filter.filter(1, 351) - longExpected) < 1e-12);
  assert.ok(Math.abs(filter.filter(NaN, 400) - longExpected) < 1e-12);
  const adaptive = new OneEuroFilter({minCutoff: 1.2, beta: .04, dCutoff: 1});
  adaptive.filter(0, 0); adaptive.filter(10, 100);
  const previousDerivative = adaptive.derivative;
  adaptive.filter(10, 200);
  const derivativeAlpha = 1 / (1 + 1 / (2 * Math.PI * .1));
  assert.ok(Math.abs(adaptive.derivative - previousDerivative * (1 - derivativeAlpha)) < 1e-10);
});

test('stationary two-hand noise is attenuated without a raw-coordinate lag override', () => {
  for (const side of ['left', 'right']) {
    const tracker = createStickTracker(), raw = [], filtered = [], angles = [];
    for (let i = 0; i < 150; i++) {
      const noise = .003 * Math.sin(i * 2.1) + .0015 * Math.cos(i * 1.3);
      const s = trackStick(tracker, hand(.5 + noise, .6 - noise * .8, .012 * Math.sin(i * 1.7)), side, i * 33, .95, 16 / 9);
      if (i > 30) { raw.push(s.rawGrip.x); filtered.push(s.anchor.x); angles.push(s.rotation); }
      assert.equal(tracker.debug.outlier, false);
    }
    assert.ok(deviation(filtered) < deviation(raw) * .4);
    assert.ok(deviation(angles) < .004);
    console.log(`${side} stationary standard deviation: raw=${deviation(raw).toFixed(6)}, filtered=${deviation(filtered).toFixed(6)}`);
  }
});

test('slow motion follows continuously and fast repeated strikes stay within one inference frame', () => {
  const slow = createStickTracker(), fast = createStickTracker(), raw = [], output = [];
  let slowLag = 0, fastLag = 0;
  for (let i = 0; i < 120; i++) {
    const t = i * 33;
    const a = trackStick(slow, hand(.35 + t / 1000 * .06), 'right', t, .95, 1);
    if (i > 15) slowLag = Math.max(slowLag, Math.abs(a.anchor.x - a.rawGrip.x));
    const b = trackStick(fast, hand(.5, .6 + .12 * Math.sin(t / 1000 * Math.PI * 6)), 'right', t, .95, 1);
    assert.equal(fast.debug.outlier, false);
    raw.push(b.rawGrip.y); output.push(b.anchor.y);
    if (i > 15) fastLag = Math.max(fastLag, Math.abs(b.anchor.y - b.rawGrip.y));
  }
  const errors = [0, 1, 2, 3].map(lag => output.slice(20).reduce((sum, value, i) => sum + (value - raw[i + 20 - lag]) ** 2, 0));
  assert.ok(errors.indexOf(Math.min(...errors)) <= 1);
  assert.ok(slowLag < .012); assert.ok(fastLag < .04);
  console.log(`slow max lag=${slowLag.toFixed(5)}, 3 Hz strike max lag=${fastLag.toFixed(5)}, best lag=${errors.indexOf(Math.min(...errors))} frames`);
});

test('isolated teleport is rejected before filters and velocity are contaminated', () => {
  const tracker = createStickTracker(); prime(tracker);
  const previous = {...tracker.output.anchor}, value = tracker.gripFilter.x.value;
  const bad = trackStick(tracker, hand(.95, .2), 'right', 528, .95, 1);
  assert.equal(bad.stale, true); assert.equal(tracker.debug.outlier, true);
  assert.equal(tracker.gripFilter.x.value, value);
  assert.deepEqual(bad.anchor, previous);
  assert.deepEqual(tracker.velocity, {x: 0, y: 0});
  trackStick(tracker, hand(), 'right', 561, .95, 1);
  assert.deepEqual(sampleStick(tracker, 561).anchor, previous);
});

test('confirmed displaced readings recover with a bridge instead of being rejected forever', () => {
  const tracker = createStickTracker(); prime(tracker);
  const held = sampleStick(tracker, 510);
  trackStick(tracker, hand(.95, .2), 'right', 528, .95, 1);
  trackStick(tracker, hand(.95, .2), 'right', 561, .95, 1);
  const start = sampleStick(tracker, 561), middle = sampleStick(tracker, 601);
  assert.deepEqual(start.anchor, held.anchor);
  assert.ok(middle.anchor.x < start.anchor.x && middle.anchor.x > tracker.output.anchor.x);
  assert.equal(middle.stale, true);
});

test('brief loss holds exactly, fades after 100 ms, and recovery cannot create a hit', () => {
  const tracker = createStickTracker(); prime(tracker);
  const held = sampleStick(tracker, 510);
  markStickMissing(tracker, 515);
  const early = sampleStick(tracker, 570), fading = sampleStick(tracker, 700);
  assert.deepEqual(early.anchor, held.anchor); assert.equal(early.opacity, 1);
  assert.deepEqual(fading.anchor, held.anchor); assert.ok(fading.opacity > 0 && fading.opacity < 1);
  const recovered = trackStick(tracker, hand(.6, .5), 'right', 710, .95, 1);
  assert.equal(recovered.stale, true);
  assert.deepEqual(sampleStick(tracker, 710).anchor, held.anchor);
  const engine = createStickHitEngine(), hits = [];
  const layout = {viewportWidth: 1000, viewportHeight: 1000, zones: {center: {x: .5, y: .5, radiusX: .2, radiusY: .2}}};
  engine.update(layout, {right: {...held, tipX: .5, tipY: .1}}, h => hits.push(h));
  engine.update(layout, {right: {...recovered, tipX: .5, tipY: .5}}, h => hits.push(h));
  trackStick(tracker, hand(.6, .5), 'right', 750, .95, 1);
  const live = sampleStick(tracker, 791, false);
  assert.equal(live.stale, false);
  engine.update(layout, {right: {...live, tipX: .5, tipY: .5}}, h => hits.push(h));
  assert.equal(hits.length, 0);
  assert.equal(sampleStick(tracker, 750 + config.settleMs), null);
});

test('display interpolation is bounded to 12 ms and leaves collision measurements unchanged', () => {
  const tracker = createStickTracker(); prime(tracker);
  const before = sampleStick(tracker, 510);
  const target = trackStick(tracker, hand(.52), 'right', 528, .95, 1, 538);
  assert.deepEqual(sampleStick(tracker, 538).anchor, before.anchor);
  assert.deepEqual(sampleStick(tracker, 538, false).anchor, target.anchor);
  assert.deepEqual(sampleStick(tracker, 550).anchor, target.anchor);
});

test('rotation crosses +/-pi smoothly, rejects a one-frame flip, and allows continuous rotation', () => {
  const tracker = createStickTracker(); prime(tracker);
  const before = tracker.output.rotation;
  trackStick(tracker, hand(.5, .6, Math.PI), 'right', 528, .95, 1);
  assert.ok(Math.abs(tracker.output.rotation - before) < .05);
  trackStick(tracker, hand(), 'right', 561, .95, 1);
  let previous = tracker.output.rotation;
  for (let i = 1; i <= 90; i++) {
    const s = trackStick(tracker, hand(.5, .6, i * .08), 'right', 561 + i * 33, .95, 1);
    assert.ok(Math.abs(s.rotation - previous) < .3);
    previous = s.rotation;
  }
  assert.ok(Math.abs(previous - before) > 5);
});

test('crossing hands keep their identity despite reversed detection order and label flicker', () => {
  for (const crossingFlip of [false, true]) {
  const trackers = {left: createStickTracker(), right: createStickTracker()};
  let heldFrames = 0;
  for (let i = 0; i <= 60; i++) {
    const a = hand(.2 + i * .01, .6, 0, 'A'), b = hand(.8 - i * .01, .6, 0, 'B');
    const flip = crossingFlip ? i >= 26 && i <= 35 : i > 3 && i % 7 === 0;
    const entries = [{points: a, label: flip ? 'Right' : 'Left'}, {points: b, label: flip ? 'Left' : 'Right'}];
    if (i % 2) entries.reverse();
    const detection = {landmarks: entries.map(e => e.points), handednesses: entries.map(e => [{categoryName: e.label, score: .95}])};
    const matches = associateHands(detection, trackers, i * 33, 1);
    for (const [side, identity] of [['left', 'A'], ['right', 'B']]) {
      const match = matches[side];
      if (match) {
        assert.equal(match.points[0].identity, identity, `frame ${i}, ${side}`);
        trackStick(trackers[side], match.points, side, i * 33, match.confidence, 1);
      } else { markStickMissing(trackers[side], i * 33, matches.ambiguous ? 'identity-ambiguous' : 'unmatched'); heldFrames++; }
    }
  }
  assert.ok(heldFrames < 8);
  console.log(`crossing: ${heldFrames} ambiguous hand-frames held, no identity swaps`);
  }
});

test('a confirmed fast rotation is not repeatedly rejected because its display lags', () => {
  const tracker = createStickTracker(); prime(tracker);
  const initial = tracker.output.rotation;
  let previous = initial;
  for (let i = 0; i < 30; i++) {
    const s = trackStick(tracker, hand(.5, .6, 1.3 + i * .4), 'right', 528 + i * 33, .95, 1);
    assert.ok(Math.abs(s.rotation - previous) < .65);
    previous = s.rotation;
  }
  assert.ok(Math.abs(previous - initial) > 9);
});

test('a lost hand does not steal the remaining hand and a changed identity resets its filters', () => {
  const trackers = {left: createStickTracker(), right: createStickTracker()};
  trackStick(trackers.left, hand(.2), 'left', 0, .95, 1);
  trackStick(trackers.right, hand(.8), 'right', 0, .95, 1);
  markStickMissing(trackers.left, 33);
  const matches = associateHands({landmarks: [hand(.7)], handednesses: [[{categoryName: 'Right', score: .95}]]}, trackers, 132, 1);
  assert.equal(matches.left, null); assert.ok(matches.right);
  const replacement = trackStick(trackers.left, hand(.8), 'right', 165, .95, 1);
  assert.equal(replacement.grip.grabbed, false);
  assert.deepEqual(replacement.velocity, {x: 0, y: 0});
  assert.ok(Math.abs(replacement.anchor.x - replacement.rawGrip.x) < 1e-10);
});

test('resize only reprojects the filtered point and old / invalid data cannot move it', () => {
  const tracker = createStickTracker(); prime(tracker);
  const s = tracker.output;
  const before = tracker.gripFilter.x.value;
  trackStick(tracker, hand(.9), 'right', 400, .95, 1);
  assert.equal(tracker.gripFilter.x.value, before);
  const invalid = hand(); invalid[5].x = NaN;
  const rejected = trackStick(tracker, invalid, 'right', 528, .95, 1);
  assert.equal(rejected.stale, true); assert.equal(tracker.gripFilter.x.value, before);
  for (const [width, height] of [[1920, 1080], [1280, 720], [390, 844]]) {
    const projected = projectStick(s, 1280, 720, {viewportWidth: width, viewportHeight: height});
    const scale = Math.max(width / 1280, height / 720);
    const inverseX = .5 + (projected.gripX - .5) * width / (1280 * scale);
    const inverseY = .5 + (projected.gripY - .5) * height / (720 * scale);
    assert.ok(Math.abs(inverseX - s.anchor.x) < 1e-10);
    assert.ok(Math.abs(inverseY - s.anchor.y) < 1e-10);
  }
});

test('irregular inference intervals preserve fast motion without false outliers', () => {
  for (const intervals of [[16, 17], [30, 36, 29, 38], [50, 65, 45]]) {
    const tracker = createStickTracker();
    let time = 0, lag = 0;
    for (let i = 0; i < 120; i++) {
      time += intervals[i % intervals.length];
      const s = trackStick(tracker, hand(.5, .6 + .1 * Math.sin(time / 1000 * Math.PI * 4)), 'right', time, .95, 16 / 9);
      assert.equal(tracker.debug.outlier, false);
      assert.equal(s.stale, false);
      if (i > 15) lag = Math.max(lag, Math.abs(s.anchor.y - s.rawGrip.y));
    }
    assert.ok(lag < .04, `${intervals}: lag ${lag}`);
  }
});

test('a camera stall becomes stale without a missing detection callback', () => {
  const tracker = createStickTracker(); prime(tracker);
  const pose = sampleStick(tracker, 510);
  const stalled = sampleStick(tracker, 610);
  assert.equal(stalled.stale, true);
  assert.deepEqual(stalled.anchor, pose.anchor);
  assert.equal(sampleStick(tracker, 900), null);
});

test('hand filters are independent and long loss starts a new grip session', () => {
  const left = createStickTracker(), right = createStickTracker();
  for (let i = 0; i < 40; i++) {
    trackStick(left, hand(.25, .6 + .1 * Math.sin(i)), 'left', i * 33, .95, 1);
    trackStick(right, hand(.75), 'right', i * 33, .95, 1);
  }
  assert.ok(Math.abs(right.output.anchor.x - .25) < 1e-10);
  assert.deepEqual(right.velocity, {x: 0, y: 0});
  const last = right.lastSeen;
  const fresh = trackStick(right, hand(.45), 'right', last + config.settleMs + 1, .95, 1);
  assert.ok(Math.abs(fresh.anchor.x - .55) < 1e-10);
  assert.deepEqual(fresh.velocity, {x: 0, y: 0});
  assert.equal(fresh.grip.grabbed, false);
});
