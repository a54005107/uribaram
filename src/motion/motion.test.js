import test from 'node:test';
import assert from 'node:assert/strict';
import {motionConfig as config} from './motionConfig.js';
import {analyzeMotion} from './motionAnalyzer.js';
import {smoothLandmarks} from './smoothing.js';
import {appendHistory} from './motionHistory.js';
import {analyzeFingers} from './fingerAnalyzer.js';
import {displayPoint} from './geometry.js';
import {createMotionEngine} from './motionEngine.js';

test('speed uses elapsed seconds at different sampling rates and detects transitions', () => {
  for (const step of [20, 50, 150]) {
    const history = Array.from({length: 5}, (_, i) => ({x: i * step / 1000, y: 0, z: 0, timestamp: i * step}));
    const motion = analyzeMotion(history, false, config);
    assert.ok(Math.abs(motion.speed - 1) < 1e-9);
    assert.equal(motion.direction, 'RIGHT'); assert.equal(motion.started, true);
  }
  const stopped = analyzeMotion([{x: 0, y: 0, timestamp: 0}, {x: 0, y: 0, timestamp: 100}], true, config);
  assert.equal(stopped.stopped, true); assert.equal(stopped.direction, 'STILL');
});
test('hysteresis rejects small jitter and preserves movement between thresholds', () => {
  const history = [{x: 0, y: 0, timestamp: 0}, {x: .009, y: 0, timestamp: 100}];
  assert.equal(analyzeMotion(history, false, config).moving, false);
  assert.equal(analyzeMotion(history, true, config).moving, true);
});
test('EMA time constant is independent of sample subdivision', () => {
  const old = [{x: 0, y: 0, z: 0}], target = [{x: 1, y: 1, z: 1}];
  const once = smoothLandmarks(old, target, 100, 85);
  const twice = smoothLandmarks(smoothLandmarks(old, target, 50, 85), target, 50, 85);
  assert.ok(Math.abs(once[0].x - twice[0].x) < 1e-12);
});
test('history is bounded in duration and size', () => {
  let history = [];
  for (let i = 0; i < 100; i++) history = appendHistory(history, {x: i, y: 0}, i * 25, config);
  assert.ok(history.length <= config.historyLimit);
  assert.ok(history.at(-1).timestamp - history[0].timestamp <= config.historyMs);
});
test('finger angles recognize extended and folded joints regardless of image rotation', () => {
  const points = Array.from({length: 21}, () => ({x: 0, y: 0, z: 0}));
  [5, 6, 7, 8].forEach((id, i) => { points[id] = {x: i, y: 0, z: 0}; });
  assert.equal(analyzeFingers(points, config).index, 'extended');
  const rotated = points.map((p) => ({x: -p.y, y: p.x, z: p.z}));
  assert.equal(analyzeFingers(rotated, config).index, 'extended');
  points[8] = {...points[6]};
  assert.equal(analyzeFingers(points, config).index, 'folded');
});
test('display transform mirrors and accounts for cover cropping without changing source', () => {
  const source = {x: .25, y: .5};
  assert.deepEqual(displayPoint(source, 100, 100, 200, 100, true), {x: 100, y: 50});
  assert.deepEqual(displayPoint(source, 100, 100, 200, 100, false), {x: 0, y: 50});
  assert.equal(source.x, .25);
});
const hands = (x, name = 'Left', score = .9) => ({landmarks: [Array.from({length: 21}, () => ({x, y: .5, z: 0}))], handednesses: [[{categoryName: name, score}]]});
test('hands retain anatomical labels, reset on loss, and expire without new frames', () => {
  const engine = createMotionEngine();
  engine.hands(hands(.1), 0); engine.hands(hands(.3), 100);
  assert.equal(engine.snapshot(100).leftHand.hand, 'LEFT');
  assert.ok(engine.snapshot(100).leftHand.speed > 0);
  engine.hands({landmarks: []}, 150);
  assert.equal(engine.snapshot(150).leftHand, null);
  engine.hands(hands(.8), 200);
  assert.equal(engine.snapshot(200).leftHand.speed, 0);
  assert.equal(engine.snapshot(501).leftHand, null);
  engine.hands(hands(.5, 'Right', .1), 550);
  assert.equal(engine.snapshot(550).rightHand, null);
});
test('pose hides occluded joints and exposes approximate head and arm data', () => {
  const engine = createMotionEngine();
  const points = Array.from({length: 33}, () => ({x: .5, y: .5, z: 0, visibility: .9}));
  points[7].x = .6; points[8].x = .4; points[13].visibility = .1;
  engine.pose({landmarks: [points]}, 0);
  const pose = engine.snapshot(0).pose;
  assert.equal(pose.leftElbow, null); assert.ok(pose.rightElbow);
  assert.equal(pose.head.state, 'neutral'); assert.equal(pose.head.approximate, true);
  engine.reset(); assert.equal(engine.snapshot(10).pose, null);
});
