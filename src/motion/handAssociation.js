import {TRACKING_CONFIG as config} from '../config/stickInteractionConfig.js';
import {measureHand} from './handMeasurement.js';
import {limitVector} from '../utils/stickMath.js';

const sides = ['left', 'right'];
const distance = (a, b, aspect) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);

// Associate at most two detections globally. Array order and a one-frame
// handedness flip cannot directly move a measurement into the other filter.
export function associateHands(detection, trackers, timestamp, aspect) {
  const candidates = (detection.landmarks || []).map((points, index) => {
    const category = detection.handednesses?.[index]?.[0];
    const measurement = measureHand(points, aspect);
    const label = category?.categoryName?.toLowerCase();
    return measurement && sides.includes(label) && category.score >= config.minConfidence
      ? {points, measurement, label, confidence: category.score} : null;
  }).filter(Boolean).slice(0, 2);
  const cost = (side, candidate) => {
    if (!candidate) return .8;
    const tracker = trackers[side], age = timestamp - tracker.lastSeen;
    if (!tracker.previous || age >= config.settleMs) return candidate.label === side ? .2 : Infinity;
    // A lost slot cannot steal a differently-labelled hand on re-entry.
    const crossingHold = tracker.debug.reason === 'identity-ambiguous';
    if (((tracker.missing && !crossingHold) || age > config.lostTrackingGraceMs) && candidate.label !== side) return Infinity;
    const dt = Math.max(0, age) / 1000;
    const delta = limitVector(tracker.velocity.x * aspect, tracker.velocity.y, config.associationMaxSpeed);
    const horizon = Math.min(age, config.associationPredictionMs) / 1000;
    const predicted = {x: tracker.previous.x + delta.x / aspect * horizon, y: tracker.previous.y + delta.y * horizon};
    const displacement = distance(candidate.measurement.grip, tracker.previous, aspect);
    const priorSpeed = Math.hypot(tracker.velocity.x * aspect, tracker.velocity.y);
    if (displacement > config.associationBaseDistance + Math.max(config.associationMaxSpeed, priorSpeed * 1.5) * Math.min(dt, .15)) return Infinity;
    const sizePenalty = tracker.palmSpan > .01 && candidate.measurement.span > .01
      ? Math.min(.1, Math.abs(Math.log(candidate.measurement.span / tracker.palmSpan)) * .04) : 0;
    const other = trackers[side === 'left' ? 'right' : 'left'];
    const crossing = other.previous && timestamp - other.lastSeen <= config.lostTrackingGraceMs
      && distance(tracker.previous, other.previous, aspect) < .18;
    return distance(candidate.measurement.grip, predicted, aspect) + sizePenalty
      + (candidate.label === side || crossing ? 0 : config.associationLabelPenalty);
  };
  const choices = [null, ...candidates], assignments = [];
  for (const left of choices) for (const right of choices) {
    if (left && left === right) continue;
    assignments.push({left, right, cost: cost('left', left) + cost('right', right)});
  }
  assignments.sort((a, b) => a.cost - b.cost);
  const best = assignments[0], next = assignments[1];
  const ambiguous = Boolean(best.left && best.right && next?.left && next?.right
    && next.cost - best.cost < config.associationAmbiguity
    && trackers.left.previous && trackers.right.previous
    && distance(trackers.left.previous, trackers.right.previous, aspect) < .15);
  return {left: ambiguous ? null : best.left, right: ambiguous ? null : best.right, ambiguous,
    rejected: candidates.some(candidate => candidate !== best.left && candidate !== best.right)};
}
