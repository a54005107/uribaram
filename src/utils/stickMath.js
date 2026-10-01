export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const weightedPoint = (entries) => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return entries.reduce((point, [value, weight]) => ({x: point.x + value.x * weight / total, y: point.y + value.y * weight / total, z: point.z + (value.z || 0) * weight / total}), {x: 0, y: 0, z: 0});
};
export const unwrapAngle = (previous, next) => previous == null ? next : previous + Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
export const limitVector = (x, y, maximum) => {
  const magnitude = Math.hypot(x, y), scale = magnitude > maximum ? maximum / magnitude : 1;
  return {x: x * scale, y: y * scale};
};
