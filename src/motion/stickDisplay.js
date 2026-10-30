import {clamp, unwrapAngle} from '../utils/stickMath.js';

// Display-only interpolation. Never feed these poses to collision or holding.
export function createStickDisplay() {
  let target, from, displayed, start = 0, duration = 0;
  const reset = () => { target = from = displayed = null; };
  return {
    reset,
    sample(pose, now) {
      if (!pose?.grip.grabbed || pose.stale || pose.recovering) {
        reset();
        return pose;
      }
      if (!target || pose.side !== target.side) {
        target = displayed = pose;
        return pose;
      }
      if (pose.timestamp !== target.timestamp) {
        duration = clamp(pose.timestamp - target.timestamp, 16, 32);
        from = displayed;
        target = pose;
        start = now;
      }
      const t = duration ? clamp((now - start) / duration, 0, 1) : 1;
      displayed = {...pose};
      if (from && t < 1) {
        for (const key of ['gripX', 'gripY']) displayed[key] = from[key] + (target[key] - from[key]) * t;
        displayed.rotation = from.rotation + (unwrapAngle(from.rotation, target.rotation) - from.rotation) * t;
      }
      return displayed;
    },
  };
}
