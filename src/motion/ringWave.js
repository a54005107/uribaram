// Approximate each ring's perimeter from its exported Figma bounds.
// The wave reaches the nearest part of the perimeter first, not its center.
export function ringWave(bounds, point, size, strength = 'normal') {
  const cx = bounds.x + bounds.width / 2, cy = bounds.y + bounds.height / 2;
  let distance = Infinity;
  for (let i = 0; i < 64; i++) {
    const angle = i / 64 * Math.PI * 2;
    distance = Math.min(distance, Math.hypot(cx + Math.cos(angle) * bounds.width / 2 - point.x,
      cy + Math.sin(angle) * bounds.height / 2 - point.y));
  }
  const dx = cx - point.x, dy = cy - point.y, length = Math.hypot(dx, dy) || 1;
  const amplitude = {weak: .008, normal: .016, strong: .025}[strength] * size;
  const attenuation = Math.max(.3, 1 - distance / size);
  return {delay: Math.min(360, distance / size * 420),
    x: dx / length * amplitude * attenuation, y: dy / length * amplitude * attenuation,
    scale: 1 + .025 * attenuation * (strength === 'strong' ? 1.4 : strength === 'weak' ? .6 : 1)};
}
