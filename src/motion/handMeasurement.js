import {TRACKING_CONFIG as config} from '../config/stickInteractionConfig.js';
import {weightedPoint} from '../utils/stickMath.js';

export function measureHand(points, aspect = 1) {
  if (points?.length !== 21 || !Number.isFinite(aspect) || aspect <= 0
    || points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || (p.z != null && !Number.isFinite(p.z)))) return null;
  const palm = weightedPoint([5, 9, 13, 17].map(id => [points[id], 1]));
  const raw = weightedPoint([[points[0], 1 - config.gripPalmWeight], [palm, config.gripPalmWeight]]);
  const mirror = p => ({x: 1 - p.x, y: p.y, z: p.z || 0});
  const span = Math.hypot((points[5].x - points[17].x) * aspect, points[5].y - points[17].y);
  return {grip: mirror(raw), wrist: mirror(points[0]), palmCenter: mirror(palm), span, mirror};
}
