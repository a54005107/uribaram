import {JANGGU_CONFIG} from '../config/stickInteractionConfig.js';
export function createJangguLayout(viewportWidth, viewportHeight, config = JANGGU_CONFIG, transform = null) {
  const yaw = config.yawDegrees * Math.PI / 180;
  const worldWidth = 2 * ((config.rimX + config.rimTube) * Math.cos(yaw) + (config.rimRadius + config.rimTube) * Math.abs(Math.sin(yaw)));
  const worldHeight = 2 * (config.rimRadius + config.rimTube);
  const widthPx = viewportWidth * (transform?.width ?? config.minScale);
  const zoom = widthPx / worldWidth, heightPx = worldHeight * zoom;
  const x = transform?.x ?? 0, y = transform?.y ?? 0;
  const zones = Object.fromEntries(['left', 'right'].map((side) => [side, {
    x: x + (side === 'left' ? -1 : 1) * config.rimX * Math.cos(yaw) * zoom / viewportWidth, y,
    radiusX: config.rimRadius * Math.abs(Math.sin(yaw)) * zoom / viewportWidth,
    radiusY: config.rimRadius * zoom / viewportHeight,
  }]));
  return {x, y, width: widthPx / viewportWidth, height: heightPx / viewportHeight, zoom, zones,
    viewportWidth, viewportHeight, yaw: config.yawDegrees, rotation: 0, visible: Boolean(transform),
    stale: transform?.stale ?? false, debug: transform?.debug};
}

// Incoming points are already mirrored. All output positions use viewport-normalized coordinates.
export function videoPointToViewport(point, videoWidth, videoHeight, layout) {
  const scale = Math.max(layout.viewportWidth / videoWidth, layout.viewportHeight / videoHeight);
  return {x: .5 + (point.x - .5) * videoWidth * scale / layout.viewportWidth,
    y: .5 + (point.y - .5) * videoHeight * scale / layout.viewportHeight};
}
