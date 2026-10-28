import {createInstrumentLayout} from './instrumentLayout.js';

export const PLAY_WIDTH = 2560;
export const PLAY_HEIGHT = 1440;

export function playArtboard(width, height) {
  const scale = Math.min(width / PLAY_WIDTH, height / PLAY_HEIGHT);
  return {scale, left: (width - PLAY_WIDTH * scale) / 2, top: (height - PLAY_HEIGHT * scale) / 2};
}

// Figma 2305:829: retain the nested rotation, rather than stretching its bounds.
export const JANGGU = {
  width: 1021.9511362154,
  height: 1050.4167914948,
  cx: 1299.584,
  cy: 810.504,
  rotation: -53.96989332786222,
};

export function jangguPoint(x, y) {
  const angle = JANGGU.rotation * Math.PI / 180;
  const dx = (x - .5) * JANGGU.width, dy = (y - .5) * JANGGU.height;
  return {x: JANGGU.cx + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: JANGGU.cy + dx * Math.sin(angle) + dy * Math.cos(angle)};
}

export function createPlayLayout(id, geometry, width, height) {
  const board = playArtboard(width, height);
  if (id !== 'janggu') {
    const layout = createInstrumentLayout(geometry, width, height);
    const vertical = id === 'buk';
    const scale = Math.min(1180 / (vertical ? geometry.height : geometry.width), 920 / (vertical ? geometry.width : geometry.height)) * board.scale;
    layout.rotation = vertical ? 90 : 0;
    layout.mirrorX = id === 'jing';
    layout.width = geometry.width * scale;
    layout.height = geometry.height * scale;
    layout.left = width / 2 - layout.width / 2;
    layout.top = height / 2 - layout.height / 2;
    layout.zones = Object.fromEntries(Object.entries(geometry.zones).map(([name, zone]) => [name, {
      x: vertical ? (width/2 - (zone.y-.5)*layout.height)/width : (layout.left + (layout.mirrorX ? 1-zone.x : zone.x) * layout.width) / width,
      y: vertical ? (height/2 + (zone.x-.5)*layout.width)/height : (layout.top + zone.y * layout.height) / height,
      radiusX: vertical ? zone.radiusY * layout.height / width : zone.radiusX * layout.width / width,
      radiusY: vertical ? zone.radiusX * layout.width / height : zone.radiusY * layout.height / height,
    }]));
    return layout;
  }
  const zones = Object.fromEntries([['left', .29295, .2355], ['right', .70705, .7645]].map(([name, x, y]) => {
    const point = jangguPoint(x, y);
    return [name, {x: (board.left + point.x * board.scale) / width,
      y: (board.top + point.y * board.scale) / height,
      radiusX: 120 * board.scale / width, radiusY: 250 * board.scale / height}];
  }));
  return {viewportWidth: width, viewportHeight: height, ...board,
    width: PLAY_WIDTH * board.scale, height: PLAY_HEIGHT * board.scale, zones, stale: false};
}
