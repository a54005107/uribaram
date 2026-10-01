import {JANGGU_CONFIG} from '../config/stickInteractionConfig.js';
import {clamp} from '../utils/stickMath.js';
import {createJangguLayout, videoPointToViewport} from './jangguLayout.js';

export function createTorsoTracker(config = JANGGU_CONFIG) {
  let state = null, missing = false;
  const visible = (p) => p && (p.visibility ?? 1) >= config.minConfidence && (p.presence ?? 1) >= config.minConfidence;
  const middle = (a, b) => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
  return {
    reset() { state = null; missing = false; },
    update(result, timestamp, aspect = 1) {
      const p = result.landmarks?.[0];
      if (!p || !visible(p[11]) || !visible(p[12])) { missing = true; return; }
      if (state && timestamp - state.timestamp > config.lostTrackingGraceMs) state = null;
      const shoulder = middle(p[11], p[12]);
      const width = Math.hypot(p[11].x - p[12].x, (p[11].y - p[12].y) / aspect);
      if (width < config.minShoulderWidth) { missing = true; return; }
      const hip = visible(p[23]) && visible(p[24]) ? middle(p[23], p[24]) : null;
      // If hips are outside the laptop frame, use the downward shoulder perpendicular.
      let dx = (p[12].x - p[11].x), dy = (p[12].y - p[11].y) / aspect;
      let down = {x: -dy / width, y: dx / width};
      if (down.y < 0) down = {x: -down.x, y: -down.y};
      const lower = hip || {x: shoulder.x + down.x * width * config.fallbackTorsoLength,
        y: shoulder.y + down.y * width * aspect * config.fallbackTorsoLength};
      const torso = middle(shoulder, lower);
      const target = {x: shoulder.x + (lower.x - shoulder.x) * config.torsoFraction + width * config.torsoOffsetX,
        y: shoulder.y + (lower.y - shoulder.y) * config.torsoFraction + width * aspect * config.torsoOffsetY};
      const targetWidth = clamp(width * config.scaleMultiplier, config.minScale, config.maxScale);
      const dt = state ? Math.max(0, timestamp - state.timestamp) : 0;
      const a = 1 - Math.exp(-dt / config.positionSmoothingMs), b = 1 - Math.exp(-dt / config.sizeSmoothingMs);
      state = {x: state ? state.x + (target.x - state.x) * a : target.x,
        y: state ? state.y + (target.y - state.y) * a : target.y,
        width: state ? state.width + (targetWidth - state.width) * b : targetWidth,
        timestamp, debug: {shoulder, hip, torso, target}};
      missing = false;
    },
    layout(now, videoWidth, videoHeight, viewportWidth, viewportHeight) {
      if (!state || now - state.timestamp > config.lostTrackingGraceMs) return null;
      const viewport = {viewportWidth, viewportHeight};
      const project = (p) => videoPointToViewport({x: 1 - p.x, y: p.y}, videoWidth, videoHeight, viewport);
      const center = project(state), scale = Math.max(viewportWidth / videoWidth, viewportHeight / videoHeight);
      return createJangguLayout(viewportWidth, viewportHeight, config, {...center,
        width: state.width * videoWidth * scale / viewportWidth, stale: missing || now - state.timestamp > config.staleAfterMs,
        debug: Object.fromEntries(Object.entries(state.debug).map(([key, p]) => [key, p ? project(p) : null]))});
    },
  };
}
