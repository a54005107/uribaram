uniform float uTime;
uniform float uHitTimes[4];
uniform float uHitSides[4];
uniform float uHitStrengths[4];
varying float vEnergy;

void main() {
  vec3 transformed = position;
  float energy = 0.0;
  for (int i = 0; i < 4; i++) {
    float age = uTime - uHitTimes[i];
    if (age >= 0.0 && age < 1.2) {
      float origin = uHitSides[i] < 0.0 ? -1.55 : 1.55;
      float distanceFromHit = abs(position.x - origin);
      float envelope = exp(-age * 4.2);
      float front = exp(-pow(distanceFromHit - age * 4.6, 2.0) * 5.0);
      float ripple = sin(distanceFromHit * 12.0 - age * 28.0);
      energy += ripple * front * envelope * uHitStrengths[i];
    }
  }
  transformed += normal * energy * 0.12;
  vEnergy = abs(energy);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
