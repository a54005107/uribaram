export function launchStar(particle, strength = 1, random = Math.random) {
  const impulse = {up: (650 + random() * 420) * strength,
    sideways: (random() - .5) * 680, spin: (random() - .5) * 440};
  if (particle.y < particle.floor - 2 || particle.velocity < -20) {
    // A single pending hop avoids teleporting airborne stars or accumulating
    // an unbounded queue during fast playing.
    particle.pending = impulse;
  } else applyImpulse(particle, impulse);
}

function applyImpulse(particle, impulse) {
  particle.velocity = -impulse.up;
  particle.vx = impulse.sideways;
  particle.spin = impulse.spin;
}

export function stepStar(particle, elapsed) {
  particle.x ??= 0; particle.vx ??= 0; particle.spin ??= 0;
  let remaining = Math.min(elapsed, .08);
  do {
    const dt = Math.min(remaining, 1 / 120);
    particle.velocity += 2200 * dt;
    particle.y += particle.velocity * dt;
    particle.x += particle.vx * dt;
    particle.angle += particle.spin * dt;
    if (particle.x < particle.minX || particle.x > particle.maxX) {
      particle.x = Math.max(particle.minX, Math.min(particle.maxX, particle.x));
      particle.vx *= -.65;
      particle.spin *= -.6;
    }
    if (particle.y >= particle.floor && particle.velocity >= 0) {
      particle.y = particle.floor;
      if (particle.pending) {
        applyImpulse(particle, particle.pending); particle.pending = null;
      } else {
        particle.velocity = particle.velocity > 130 ? -particle.velocity * .28 : 0;
        particle.vx *= Math.exp(-12 * dt);
        particle.spin *= Math.exp(-16 * dt);
      }
    } else particle.vx *= Math.exp(-.35 * dt);
    remaining -= dt;
  } while (remaining > 1e-8);
  if (particle.y === particle.floor && particle.velocity === 0 && Math.abs(particle.vx) < 4 && Math.abs(particle.spin) < 4) {
    particle.vx = 0; particle.spin = 0;
    return false;
  }
  return true;
}
