// Render-only latency compensation. Collision detection never consumes this pose.
// A bounded horizon stops motion during stalls; missing/recovering hands do not predict.
export function predictDisplayPose(pose, now, aspect = 1) {
  if (!pose || pose.stale || pose.recovering || !pose.velocity || !Number.isFinite(now)) return pose;
  const age = Math.max(0, now - pose.timestamp);
  if (age > 100) return pose;
  const speed = Math.hypot(pose.velocity.x * aspect, pose.velocity.y);
  const moving = Math.max(0, Math.min(1, (speed - .12) / .65));
  // Smooth saturation, not an unbounded linear extrapolation.
  const horizon = .028 * (1 - Math.exp(-age / 28)) * moving;
  const distance = speed * horizon;
  const limit = distance > .025 ? .025 / distance : 1;
  return {...pose, anchor: {
    x: pose.anchor.x + pose.velocity.x * horizon * limit,
    y: pose.anchor.y + pose.velocity.y * horizon * limit,
  }};
}
