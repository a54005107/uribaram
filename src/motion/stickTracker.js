import {FILTER_CONFIG, STICK_CONFIG, TRACKING_CONFIG as config} from '../config/stickInteractionConfig.js';
import {OneEuroFilter, createPointFilter} from '../utils/oneEuroFilter.js';
import {clamp, limitVector, unwrapAngle, weightedPoint} from '../utils/stickMath.js';
import {gripScore, createGripState, updateGrip} from './gripAnalyzer.js';
import {videoPointToViewport} from './jangguLayout.js';

export const createStickTracker = () => ({gripFilter: createPointFilter(FILTER_CONFIG.grip), angleFilter: new OneEuroFilter(FILTER_CONFIG.rotation),
  grip: createGripState(), previous: null, velocity: {x: 0, y: 0}, lastSeen: -Infinity, output: null, angle: null, missing: false});

export function trackStick(tracker, points, side, timestamp, confidence, aspect) {
  if (timestamp - tracker.lastSeen > config.settleMs) Object.assign(tracker, createStickTracker());
  const palm = weightedPoint([5, 9, 13, 17].map((id) => [points[id], 1]));
  const raw = weightedPoint([[points[0], 1 - config.gripPalmWeight], [palm, config.gripPalmWeight]]);
  const mirror = (p) => ({x: 1 - p.x, y: p.y, z: p.z || 0});
  const grip = mirror(raw), wrist = mirror(points[0]), palmCenter = mirror(palm);
  const dt = tracker.previous ? (timestamp - tracker.previous.timestamp) / 1000 : 0;
  if (dt > 0) {
    tracker.velocity.x += ((grip.x - tracker.previous.x) / dt - tracker.velocity.x) * config.velocitySmoothing;
    tracker.velocity.y += ((grip.y - tracker.previous.y) / dt - tracker.velocity.y) * config.velocitySmoothing;
  }
  tracker.previous = {...grip, timestamp};
  const filtered = {x: tracker.gripFilter.x.filter(grip.x, timestamp), y: tracker.gripFilter.y.filter(grip.y, timestamp)};
  // Bound lag even during a sudden strike; no forward prediction while tracked.
  const speed = Math.hypot(tracker.velocity.x * aspect, tracker.velocity.y);
  const maxLag = config.maxAnchorLag + (config.fastAnchorLag - config.maxAnchorLag) * clamp(speed / config.fastSpeed, 0, 1);
  const lag = limitVector((filtered.x - grip.x) * aspect, filtered.y - grip.y, maxLag);
  const anchor = {x: grip.x + lag.x / aspect, y: grip.y + lag.y};
  tracker.gripFilter.x.value = anchor.x; tracker.gripFilter.y.value = anchor.y;
  const index = mirror(points[5]), middle = mirror(points[9]), pinky = mirror(points[17]);
  const longitudinal = {x: (middle.x - wrist.x) * aspect, y: middle.y - wrist.y, z: (middle.z - wrist.z) * aspect};
  const across = {x: (index.x - pinky.x) * aspect, y: index.y - pinky.y, z: (index.z - pinky.z) * aspect};
  const magnitude = (v) => Math.hypot(v.x, v.y, v.z);
  const alongSize = magnitude(longitudinal), acrossSize = magnitude(across);
  const unit = (v, size) => ({x: v.x / Math.max(size, .001), y: v.y / Math.max(size, .001), z: v.z / Math.max(size, .001)});
  const along = unit(longitudinal, alongSize), radial = unit(across, acrossSize);
  const weight = acrossSize >= config.minPalmVector ? config.palmAcrossWeight : 0;
  const axis = {x: along.x * (1 - weight) + radial.x * weight, y: along.y * (1 - weight) + radial.y * weight, z: along.z * (1 - weight) + radial.z * weight};
  const dx = axis.x, dy = axis.y;
  const stickConfig = side === 'left' ? STICK_CONFIG.gungulchae : STICK_CONFIG.yeolchae;
  if (alongSize >= config.minPalmVector && Math.hypot(dx, dy) >= config.minProjectedAxis) {
    const target = unwrapAngle(tracker.angle, Math.atan2(dy, dx) + stickConfig.angleOffset * Math.PI / 180);
    tracker.angle = tracker.angle == null ? target : tracker.angle + clamp(target - tracker.angle, -config.maxAngularSpeed * dt, config.maxAngularSpeed * dt);
  }
  const rotation = tracker.angleFilter.filter(tracker.angle ?? Math.PI / 2, timestamp);
  const wasGrabbed = tracker.grip.grabbed;
  tracker.grip = updateGrip(tracker.grip, gripScore(points, aspect), timestamp);
  // Fix object length at acquisition; torso scale must never stretch a held stick.
  if (!wasGrabbed) tracker.length = clamp(acrossSize / aspect * stickConfig.palmLengthScale, stickConfig.minLength, stickConfig.maxLength);
  tracker.lastSeen = timestamp;
  tracker.output = {anchor, rawGrip: grip, wrist, palmCenter, rotation, orientation: axis, palmTilt: Math.atan2(axis.z, Math.hypot(dx, dy)),
    length: tracker.length, side, confidence, timestamp, grip: {...tracker.grip}, velocity: {...tracker.velocity}, stale: false};
  return tracker.output;
}

export function sampleStick(tracker, now) {
  if (!tracker.output || now - tracker.lastSeen >= config.settleMs) return null;
  const missingMs = now - tracker.lastSeen;
  if (!tracker.missing && missingMs <= config.staleAfterMs) return tracker.output;
  const velocity = limitVector(tracker.velocity.x, tracker.velocity.y, config.maxCoastSpeed);
  const seconds = config.coastMs / 1000 * (1 - Math.exp(-missingMs / config.coastMs));
  const delta = limitVector(velocity.x * seconds, velocity.y * seconds, config.maxCoastDistance);
  return {...tracker.output, stale: true, missingMs, anchor: {x: tracker.output.anchor.x + delta.x, y: tracker.output.anchor.y + delta.y}};
}

export function projectStick(sample, videoWidth, videoHeight, layout) {
  if (!sample) return null;
  const config = sample.side === 'left' ? STICK_CONFIG.gungulchae : STICK_CONFIG.yeolchae;
  const anchor = videoPointToViewport(sample.anchor, videoWidth, videoHeight, layout);
  const scale = Math.max(layout.viewportWidth / videoWidth, layout.viewportHeight / videoHeight);
  const width = sample.length * videoWidth * scale / layout.viewportWidth;
  const lengthPx = width * layout.viewportWidth;
  const tipDistance = lengthPx * (1 - config.gripOffset);
  return {...sample, gripX: anchor.x, gripY: anchor.y, gripOffset: config.gripOffset, width,
    height: lengthPx * .075 / layout.viewportHeight,
    tipX: anchor.x + Math.cos(sample.rotation) * tipDistance / layout.viewportWidth,
    tipY: anchor.y + Math.sin(sample.rotation) * tipDistance / layout.viewportHeight,
    debugPoints: Object.fromEntries(['wrist', 'palmCenter', 'rawGrip'].map((key) => [key, videoPointToViewport(sample[key], videoWidth, videoHeight, layout)]))};
}
