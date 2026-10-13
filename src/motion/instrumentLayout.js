// The artwork and hit regions use one geometry calculation at every viewport size.
export function createInstrumentLayout(geometry, viewportWidth, viewportHeight) {
  const scale = Math.min(viewportWidth * .68 / geometry.width, viewportHeight * .52 / geometry.height);
  const width = geometry.width * scale, height = geometry.height * scale;
  const left = (viewportWidth - width) / 2;
  const top = viewportHeight * .62 - height / 2;
  const zones = Object.fromEntries(Object.entries(geometry.zones).map(([name, zone]) => [name, {
    x: (left + zone.x * width) / viewportWidth,
    y: (top + zone.y * height) / viewportHeight,
    radiusX: zone.radiusX * width / viewportWidth,
    radiusY: zone.radiusY * height / viewportHeight,
  }]));
  return {viewportWidth, viewportHeight, left, top, width, height, zones, stale: false};
}
