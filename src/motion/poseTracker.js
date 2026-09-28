import {smoothLandmarks} from './smoothing.js';
import {appendHistory} from './motionHistory.js';
import {analyzeMotion} from './motionAnalyzer.js';
const joints = {leftShoulder: 11, rightShoulder: 12, leftElbow: 13, rightElbow: 14, leftWrist: 15, rightWrist: 16};
export function trackPose(points, previous, timestamp, aspect, config) {
  const visible = points.map((p) => (p.visibility ?? 1) >= config.minConfidence && (p.presence ?? 1) >= config.minConfidence ? p : null);
  const landmarks = smoothLandmarks(previous?.landmarks, visible, timestamp - (previous?.timestamp ?? timestamp), config.smoothingTimeMs);
  const pose = {timestamp, landmarks, ...Object.fromEntries(Object.entries(joints).map(([name, id]) => [name, landmarks[id]]))};
  const [nose, leftEar, rightEar] = [landmarks[0], landmarks[7], landmarks[8]];
  if (nose && leftEar && rightEar) {
    const width = Math.max(.01, Math.abs(leftEar.x - rightEar.x));
    const offsetX = (nose.x - (leftEar.x + rightEar.x) / 2) / width;
    const offsetY = (nose.y - (leftEar.y + rightEar.y) / 2) / aspect / width;
    const tilt = Math.atan2((leftEar.y - rightEar.y) / aspect, Math.abs(leftEar.x - rightEar.x)) * 180 / Math.PI;
    const history = appendHistory(previous?.head?.history || [], nose, timestamp, config);
    const state = Math.abs(tilt) > config.headTiltDegrees ? 'head tilt' : Math.abs(offsetX) > config.headTurn ? (offsetX > 0 ? 'head right' : 'head left') : Math.abs(offsetY) > config.headVertical ? (offsetY > 0 ? 'head down' : 'head up') : 'neutral';
    pose.head = {position: nose, state, tilt, offsetX, offsetY, approximate: true, history, ...analyzeMotion(history, previous?.head?.moving || false, config)};
  } else pose.head = null;
  return pose;
}
