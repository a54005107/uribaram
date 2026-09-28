import {angle} from './geometry.js';
export const fingerJoints = {thumb: [1, 2, 3, 4], index: [5, 6, 7, 8], middle: [9, 10, 11, 12], ring: [13, 14, 15, 16], pinky: [17, 18, 19, 20]};
export function analyzeFingers(points, config) {
  return Object.fromEntries(Object.entries(fingerJoints).map(([name, ids]) => {
    const [a, b, c, d] = ids.map((id) => points[id]);
    const threshold = name === 'thumb' ? config.thumbAngle : config.fingerAngle;
    return [name, a && b && c && d ? (angle(a, b, c) >= threshold && angle(b, c, d) >= threshold ? 'extended' : 'folded') : 'unknown'];
  }));
}
