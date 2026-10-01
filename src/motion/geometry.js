export const subtract = (a, b) => ({x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0)});
export const length = (v) => Math.hypot(v.x, v.y, v.z || 0);
export const distance = (a, b) => length(subtract(a, b));
export function angle(a, b, c) {
  const u = subtract(a, b), v = subtract(c, b), denominator = length(u) * length(v);
  if (denominator < 1e-10) return 0;
  return Math.acos(Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y + u.z * v.z) / denominator))) * 180 / Math.PI;
}
// object-fit: cover; only display coordinates are mirrored.
export function displayPoint(point, width, height, videoWidth, videoHeight, mirrored = true) {
  const scale = Math.max(width / videoWidth, height / videoHeight);
  return {x: (width - videoWidth * scale) / 2 + (mirrored ? 1 - point.x : point.x) * videoWidth * scale,
    y: (height - videoHeight * scale) / 2 + point.y * videoHeight * scale};
}
