import {angle, distance} from './geometry.js';
import {GRIP_CONFIG} from '../config/stickInteractionConfig.js';
import {clamp, weightedPoint} from '../utils/stickMath.js';

export function gripScore(points, aspect = 1, config = GRIP_CONFIG) {
  const p = points.map((v) => ({x: v.x, y: v.y / aspect, z: v.z || 0}));
  const palm = weightedPoint([5, 9, 13, 17].map((id) => [p[id], 1]));
  const palmSize = Math.max(.001, distance(p[0], palm));
  const scores = [5, 9, 13, 17].map((id) => {
    const bend = Math.min(angle(p[id], p[id + 1], p[id + 2]), angle(p[id + 1], p[id + 2], p[id + 3]));
    const curl = clamp((config.straightAngle - bend) / (config.straightAngle - config.foldedAngle), 0, 1);
    const near = clamp((config.openTipDistance - distance(p[id + 3], palm) / palmSize) / (config.openTipDistance - config.closedTipDistance), 0, 1);
    return curl * config.angleWeight + near * (1 - config.angleWeight);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export const createGripState = () => ({state: 'OPEN', grabbed: false, candidate: null, since: 0, frames: 0});
export function updateGrip(previous, score, timestamp, config = GRIP_CONFIG) {
  const next = {...previous, score};
  const candidate = score >= config.grabThreshold ? 'grab' : score <= config.releaseThreshold ? 'release' : null;
  next.frames = candidate && candidate === previous.candidate ? previous.frames + 1 : candidate ? 1 : 0;
  next.since = candidate === previous.candidate ? previous.since : timestamp;
  next.candidate = candidate;
  if (!next.grabbed) {
    next.state = candidate === 'release' ? 'OPEN' : 'CLOSING';
    if (candidate === 'grab' && next.frames >= config.confirmationFrames && timestamp - next.since >= config.grabMs) { next.grabbed = true; next.state = 'FIST'; }
  } else {
    next.state = candidate === 'release' ? 'OPENING' : 'FIST';
    if (candidate === 'release' && next.frames >= config.confirmationFrames && timestamp - next.since >= config.releaseMs) { next.grabbed = false; next.state = 'OPEN'; }
  }
  return next;
}
