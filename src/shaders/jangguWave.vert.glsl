uniform float uTime;
uniform float uHitTimes[4];
uniform float uHitSides[4];
uniform float uHitStrengths[4];
uniform float uWaveDuration;
uniform float uWaveSpeed;
uniform float uWaveDecay;
uniform float uWaveDisplacement;
varying float vEnergy;

void main() {
  vec3 transformed = position;
  float energy = 0.0;
  float glow = 0.0;
  for (int i = 0; i < 4; i++) {
    float age = uTime - uHitTimes[i];
    if (age >= 0.0 && age < uWaveDuration) {
      float origin = uHitSides[i] < 0.0 ? -1.55 : 1.55;
      float distanceFromHit = abs(position.x - origin);
      float envelope = exp(-age * uWaveDecay) * (1.0 - smoothstep(uWaveDuration * 0.7, uWaveDuration, age));
      float front = exp(-pow(distanceFromHit - age * uWaveSpeed, 2.0) * 5.0);
      float ripple = sin(distanceFromHit * 12.0 - age * 28.0);
      energy += ripple * front * envelope * uHitStrengths[i];
      glow += front * envelope * uHitStrengths[i];
    }
  }
  // Move the whole strand radially, rather than only deforming its tiny tube cross section.
  vec3 radial = vec3(0.0, position.yz / max(length(position.yz), 0.001));
  transformed += radial * clamp(energy, -1.5, 1.5) * uWaveDisplacement;
  vEnergy = min(glow, 1.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
