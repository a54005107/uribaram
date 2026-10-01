import {subtract} from './geometry.js';
export function analyzeMotion(history, wasMoving, config) {
  const last = history.at(-1);
  const first = history.slice(0, -1).find((p) => last.timestamp - p.timestamp <= config.velocityWindowMs) || history.at(-2) || last;
  const dt = (last.timestamp - first.timestamp) / 1000;
  const delta = subtract(last, first);
  const velocity = {x: dt > 0 ? delta.x / dt : 0, y: dt > 0 ? delta.y / dt : 0, z: dt > 0 ? delta.z / dt : 0};
  // Image-plane motion: normalized x/y per second. Relative landmark z is not metric depth.
  const speed = Math.hypot(velocity.x, velocity.y);
  const moving = speed >= (wasMoving ? config.stopSpeed : config.startSpeed);
  const direction = !moving ? 'STILL' : Math.abs(velocity.x) > Math.abs(velocity.y) ? (velocity.x > 0 ? 'RIGHT' : 'LEFT') : (velocity.y > 0 ? 'DOWN' : 'UP');
  let distance = 0;
  for (let i = 1; i < history.length; i++) distance += Math.hypot(history[i].x - history[i - 1].x, history[i].y - history[i - 1].y);
  return {velocity, speed, direction, moving, distance, started: moving && !wasMoving, stopped: !moving && wasMoving};
}
