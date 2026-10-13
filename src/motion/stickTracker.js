import {FILTER_CONFIG, STICK_CONFIG, TRACKING_CONFIG as config} from '../config/stickInteractionConfig.js';
import {OneEuroFilter, createPointFilter} from '../utils/oneEuroFilter.js';
import {clamp, unwrapAngle} from '../utils/stickMath.js';
import {gripScore, createGripState, updateGrip} from './gripAnalyzer.js';
import {videoPointToViewport} from './jangguLayout.js';
import {measureHand} from './handMeasurement.js';

export const createStickTracker = () => ({
  gripFilter: createPointFilter(FILTER_CONFIG.grip), angleFilter: new OneEuroFilter(FILTER_CONFIG.rotation),
  grip: createGripState(), previous: null, velocity: {x: 0, y: 0},
  lastSeen: -Infinity, lastInputTime: -Infinity, output: null, angle: null, missing: false,
  rendered: null, held: null, transition: null, outlierCandidate: null, angleCandidate: null, rawAngle: null, debug: {},
});

export function markStickMissing(tracker, now, reason = 'missing') {
  if (!tracker.missing) tracker.held = sampleStick(tracker, now);
  tracker.missing = true;
  tracker.grip.candidate = null;
  tracker.grip.frames = 0;
  tracker.debug = {...tracker.debug, lost: true, reason};
}

export function trackStick(tracker, points, side, timestamp, confidence, aspect, receivedAt = timestamp) {
  if (!Number.isFinite(timestamp) || timestamp <= tracker.lastInputTime) return sampleStick(tracker, receivedAt, false);
  const measurement = measureHand(points, aspect);
  if (!measurement || !Number.isFinite(confidence) || confidence < config.minConfidence) {
    tracker.lastInputTime = timestamp;
    markStickMissing(tracker, receivedAt, 'invalid-measurement');
    return sampleStick(tracker, receivedAt, false);
  }
  if (timestamp - tracker.lastSeen >= config.settleMs || (tracker.side && tracker.side !== side)
    || (tracker.aspect && Math.abs(tracker.aspect - aspect) > .001)) Object.assign(tracker, createStickTracker());
  tracker.side = side; tracker.aspect = aspect; tracker.lastInputTime = timestamp;
  const {grip, wrist, palmCenter, span, mirror} = measurement;
  const dt = tracker.previous ? (timestamp - tracker.previous.timestamp) / 1000 : 0;
  const vx = dt > 0 ? (grip.x - tracker.previous.x) / dt : 0;
  const vy = dt > 0 ? (grip.y - tracker.previous.y) / dt : 0;
  const speed = Math.hypot(vx * aspect, vy);
  const oldSpeed = Math.hypot(tracker.velocity.x * aspect, tracker.velocity.y);
  const distance = speed * dt;
  const innovation = dt > 0 ? Math.hypot(
    (grip.x - tracker.previous.x - tracker.velocity.x * dt) * aspect,
    grip.y - tracker.previous.y - tracker.velocity.y * dt) : 0;
  const acceleration = dt > 0 ? Math.hypot((vx - tracker.velocity.x) * aspect, vy - tracker.velocity.y) / dt : 0;
  const sizeJump = tracker.palmSpan > .01 && span > .01
    && (span / tracker.palmSpan > 1.9 || span / tracker.palmSpan < .52);
  // Large distance alone is not an outlier. Require implausible speed plus
  // acceleration / prediction disagreement, or unreliable hand geometry.
  const suspicious = dt > 0 && dt <= config.lostTrackingGraceMs / 1000
    && distance > config.jumpMinDistance && innovation > config.jumpInnovation
    && ((speed > Math.max(config.jumpSpeed, oldSpeed * 2.5) && acceleration > config.jumpAcceleration)
      || (sizeJump && confidence < .7 && speed > 2));
  let confirmedJump = false;
  if (suspicious) {
    const candidate = tracker.outlierCandidate;
    confirmedJump = Boolean(candidate && timestamp - candidate.timestamp <= config.outlierConfirmationMs
      && Math.hypot((grip.x - candidate.grip.x) * aspect, grip.y - candidate.grip.y) < config.outlierConfirmationDistance);
    if (!confirmedJump) {
      tracker.outlierCandidate = {grip, timestamp};
      tracker.debug = {...tracker.debug, raw: grip, speed, outlier: true, innovation, acceleration};
      markStickMissing(tracker, receivedAt, 'outlier');
      return sampleStick(tracker, receivedAt, false);
    }
  }
  const recovering = Boolean(tracker.output && (tracker.missing || timestamp - tracker.lastSeen > config.staleAfterMs || confirmedJump));
  const oldPose = sampleStick(tracker, receivedAt);
  if (recovering) {
    tracker.gripFilter = createPointFilter(FILTER_CONFIG.grip);
    tracker.angleFilter.reset(tracker.output.rotation);
    tracker.angle = tracker.output.rotation;
    tracker.rawAngle = null; tracker.angleCandidate = null;
    tracker.velocity = {x: 0, y: 0};
  } else if (dt > 0) {
    const alpha = 1 - Math.exp(-dt * 1000 / config.velocityTimeConstantMs);
    tracker.velocity.x += (vx - tracker.velocity.x) * alpha;
    tracker.velocity.y += (vy - tracker.velocity.y) * alpha;
  }
  tracker.outlierCandidate = null;
  tracker.previous = {...grip, timestamp};
  // One filter per axis, in fixed video-height units. Never overwrite its
  // filtered state with the unfiltered measurement to force a smaller lag.
  const units = config.filterReferenceHeight;
  const anchor = {
    x: tracker.gripFilter.x.filter(grip.x * aspect * units, timestamp) / (aspect * units),
    y: tracker.gripFilter.y.filter(grip.y * units, timestamp) / units,
  };
  const index = mirror(points[5]), middle = mirror(points[9]), pinky = mirror(points[17]);
  const longitudinal = {x: (middle.x - wrist.x) * aspect, y: middle.y - wrist.y, z: (middle.z - wrist.z) * aspect};
  const across = {x: (index.x - pinky.x) * aspect, y: index.y - pinky.y, z: (index.z - pinky.z) * aspect};
  const magnitude = v => Math.hypot(v.x, v.y, v.z);
  const alongSize = magnitude(longitudinal), acrossSize = magnitude(across);
  const unit = (v, size) => ({x: v.x / Math.max(size, .001), y: v.y / Math.max(size, .001), z: v.z / Math.max(size, .001)});
  const along = unit(longitudinal, alongSize), radial = unit(across, acrossSize);
  const weight = acrossSize >= config.minPalmVector ? config.palmAcrossWeight : 0;
  const axis = {x: along.x * (1 - weight) + radial.x * weight, y: along.y * (1 - weight) + radial.y * weight, z: along.z * (1 - weight) + radial.z * weight};
  const dx = axis.x, dy = axis.y;
  const stickConfig = side === 'left' ? STICK_CONFIG.gungulchae : STICK_CONFIG.yeolchae;
  if (alongSize >= config.minPalmVector && Math.hypot(dx, dy) >= config.minProjectedAxis) {
    const target = unwrapAngle(tracker.angle, Math.atan2(dy, dx) + stickConfig.angleOffset * Math.PI / 180);
    const angularJump = tracker.rawAngle != null && dt < .06
      && Math.abs(unwrapAngle(tracker.rawAngle, target) - tracker.rawAngle) > config.angleOutlierRadians;
    const confirmedAngle = tracker.angleCandidate != null
      && Math.abs(unwrapAngle(tracker.angleCandidate, target) - tracker.angleCandidate) < Math.max(config.angleConfirmationRadians, config.maxAngularSpeed * dt);
    if (!angularJump || confirmedAngle) {
      tracker.angle = tracker.angle == null ? target : tracker.angle + clamp(target - tracker.angle, -config.maxAngularSpeed * dt, config.maxAngularSpeed * dt);
      tracker.rawAngle = target;
      tracker.angleCandidate = null;
    } else tracker.angleCandidate = target;
  }
  const rotation = tracker.angleFilter.filter(tracker.angle ?? Math.PI / 2, timestamp);
  tracker.grip = updateGrip(tracker.grip, gripScore(points, aspect), timestamp);
  tracker.length = stickConfig.length;
  tracker.palmSpan = span;
  tracker.lastSeen = timestamp;
  tracker.missing = false; tracker.held = null;
  // Recovery is a visual bridge, never a playable strike.
  const recoveryEnd = recovering ? receivedAt + config.reacquireBlendMs : tracker.recoveryEnd || 0;
  tracker.recoveryEnd = recoveryEnd;
  tracker.transition = {from: oldPose, start: receivedAt,
    duration: recovering ? config.reacquireBlendMs
      : recoveryEnd > receivedAt ? recoveryEnd - receivedAt : config.renderBlendMs};
  tracker.output = {anchor, rawGrip: grip, wrist, palmCenter, rotation, orientation: axis, palmTilt: Math.atan2(axis.z, Math.hypot(dx, dy)),
    length: tracker.length, side, confidence, timestamp, grip: {...tracker.grip}, velocity: {...tracker.velocity}, stale: false};
  tracker.debug = {raw: grip, filtered: anchor, speed: recovering ? 0 : speed, lost: false, outlier: false,
    innovation, acceleration, reason: recovering ? 'reacquiring' : 'tracking'};
  return sampleStick(tracker, receivedAt, false);
}

export function sampleStick(tracker, now, interpolate = true) {
  if (!tracker.output || now - tracker.lastSeen >= config.settleMs) return null;
  const age = Math.max(0, now - tracker.lastSeen);
  const lost = tracker.missing || age > config.staleAfterMs;
  if (lost) {
    // No dead reckoning while occluded: retain the last visible pose.
    const pose = tracker.held || tracker.rendered || tracker.output;
    const opacity = 1 - clamp((age - config.lostTrackingGraceMs) / (config.settleMs - config.lostTrackingGraceMs), 0, 1);
    return {...tracker.output, anchor: pose.anchor, rotation: pose.rotation, stale: true, missingMs: age, opacity};
  }
  const recovering = now < tracker.recoveryEnd;
  let pose = {...tracker.output, stale: recovering, recovering, opacity: 1};
  const transition = tracker.transition;
  if (interpolate && transition?.from && transition.duration > 0) {
    const progress = clamp((now - transition.start) / transition.duration, 0, 1);
    const from = transition.from;
    pose = {...pose, anchor: {
      x: from.anchor.x + (pose.anchor.x - from.anchor.x) * progress,
      y: from.anchor.y + (pose.anchor.y - from.anchor.y) * progress,
    }, rotation: from.rotation + (unwrapAngle(from.rotation, pose.rotation) - from.rotation) * progress,
    opacity: (from.opacity ?? 1) + (1 - (from.opacity ?? 1)) * progress};
  }
  if (interpolate) tracker.rendered = pose;
  return pose;
}

export function projectStick(sample, videoWidth, videoHeight, layout, instrumentId = 'janggu') {
  if (!sample) return null;
  const trackedConfig = sample.side === 'left' ? STICK_CONFIG.gungulchae : STICK_CONFIG.yeolchae;
  const config = instrumentId === 'janggu' ? trackedConfig : STICK_CONFIG.yeolchae;
  // Only janggu's left beater uses the reversed axis. Other instruments strike
  // with the upper end in either hand; drawing and hit testing share this tip.
  const rotation = sample.rotation + (config.angleOffset - trackedConfig.angleOffset) * Math.PI / 180;
  const anchor = videoPointToViewport(sample.anchor, videoWidth, videoHeight, layout);
  const scale = Math.max(layout.viewportWidth / videoWidth, layout.viewportHeight / videoHeight);
  const width = config.length * videoWidth * scale / layout.viewportWidth;
  const lengthPx = width * layout.viewportWidth;
  const tipDistance = lengthPx * (1 - config.gripOffset);
  return {...sample, rotation, gripX: anchor.x, gripY: anchor.y, gripOffset: config.gripOffset, width,
    height: lengthPx * .075 / layout.viewportHeight,
    tipX: anchor.x + Math.cos(rotation) * tipDistance / layout.viewportWidth,
    tipY: anchor.y + Math.sin(rotation) * tipDistance / layout.viewportHeight,
    debugPoints: Object.fromEntries(['wrist', 'palmCenter', 'rawGrip'].map((key) => [key, videoPointToViewport(sample[key], videoWidth, videoHeight, layout)]))};
}
