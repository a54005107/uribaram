export function smoothLandmarks(previous, points, dt, timeConstant) {
  const alpha = 1 - Math.exp(-Math.max(0, dt) / timeConstant);
  return points.map((p, i) => {
    const old = previous?.[i];
    if (!old || !p) return p ? {...p} : null;
    return {...p, x: old.x + alpha * (p.x - old.x), y: old.y + alpha * (p.y - old.y), z: (old.z || 0) + alpha * ((p.z || 0) - (old.z || 0))};
  });
}
