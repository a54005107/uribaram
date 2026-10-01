import {HIT_CONFIG} from '../config/stickInteractionConfig.js';

export const forgivingHitZone = (zone) => ({...zone,
  radiusX: zone.radiusX * HIT_CONFIG.zonePadding, radiusY: zone.radiusY * HIT_CONFIG.zonePadding});

// Segment/ellipse intersection catches fast tips that cross an entire surface between frames.
export function segmentEntry(previous, current, zone) {
  const x = (previous.x - zone.x) / zone.radiusX, y = (previous.y - zone.y) / zone.radiusY;
  const dx = (current.x - previous.x) / zone.radiusX, dy = (current.y - previous.y) / zone.radiusY;
  const a = dx * dx + dy * dy, b = 2 * (x * dx + y * dy), c = x * x + y * y - 1;
  const d = b * b - 4 * a * c;
  if (c <= 0 || a < 1e-10 || d < 0) return null;
  const t = (-b - Math.sqrt(d)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}

export function createStickHitEngine() {
  let hands = {}, lastLayout;
  return {
    reset() { hands = {}; lastLayout = null; },
    update(layout, sticks, onHit) {
      if (!layout || layout.stale) { hands = {}; lastLayout = null; return; }
      if (lastLayout && (layout.viewportWidth !== lastLayout.viewportWidth || layout.viewportHeight !== lastLayout.viewportHeight)) hands = {};
      lastLayout = layout;
      for (const side of ['left', 'right']) {
        const stick = sticks[side];
        if (!stick || !stick.grip.grabbed || stick.stale) { delete hands[side]; continue; }
        const current = {x: stick.tipX, y: stick.tipY, timestamp: stick.timestamp};
        const state = hands[side] || {previous: null, lastHit: -Infinity};
        const previous = state.previous;
        if (previous && current.timestamp <= previous.timestamp) continue;
        if (previous && current.timestamp > previous.timestamp) {
          const dt = (current.timestamp - previous.timestamp) / 1000;
          const vx = (current.x - previous.x) / dt, vy = (current.y - previous.y) / dt, speed = Math.hypot(vx, vy);
          const entries = Object.entries(layout.zones).map(([target, zone]) => {
            const oldZone = state.zones[target];
            const relativePrevious = {x: zone.x + (previous.x - oldZone.x) * zone.radiusX / oldZone.radiusX,
              y: zone.y + (previous.y - oldZone.y) * zone.radiusY / oldZone.radiusY};
            return {target, t: segmentEntry(relativePrevious, current, forgivingHitZone(zone))};
          })
            .filter(({t}) => t !== null).sort((a, b) => a.t - b.t);
          if (entries.length && speed >= HIT_CONFIG.impactVelocity && current.timestamp - state.lastHit >= HIT_CONFIG.cooldownMs) {
            state.lastHit = current.timestamp;
            onHit({side: entries[0].target, hand: side, velocity: speed, downwardVelocity: vy,
              strength: speed >= HIT_CONFIG.strength.strong ? 'strong' : speed >= HIT_CONFIG.strength.normal ? 'normal' : 'weak'});
          }
        }
        state.previous = current; state.zones = layout.zones; hands[side] = state;
      }
    },
  };
}
