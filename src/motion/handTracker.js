import {smoothLandmarks} from './smoothing.js';
import {appendHistory} from './motionHistory.js';
import {analyzeMotion} from './motionAnalyzer.js';
import {analyzeFingers, fingerJoints} from './fingerAnalyzer.js';
export function trackHand(points, worldPoints, hand, confidence, previous, timestamp, aspect, config) {
  const landmarks = smoothLandmarks(previous?.landmarks, points, timestamp - (previous?.timestamp ?? timestamp), config.smoothingTimeMs);
  const history = appendHistory(previous?.history || [], landmarks[0], timestamp, config);
  // World landmarks have isotropic axes; fallback corrects normalized image aspect ratio.
  const worldLandmarks = worldPoints?.length === 21 ? smoothLandmarks(previous?.worldLandmarks, worldPoints, timestamp - (previous?.timestamp ?? timestamp), config.smoothingTimeMs) : null;
  const fingerPoints = worldLandmarks || landmarks.map((p) => ({x: p.x, y: p.y / aspect, z: p.z}));
  return {hand, confidence, timestamp, landmarks, worldLandmarks, wrist: landmarks[0], position: landmarks[0],
    fingerTips: Object.fromEntries(Object.entries(fingerJoints).map(([name, ids]) => [name, landmarks[ids[3]]])),
    fingers: analyzeFingers(fingerPoints, config), history, ...analyzeMotion(history, previous?.moving || false, config)};
}
