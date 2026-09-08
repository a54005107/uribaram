uniform vec3 uColor;
varying float vEnergy;

void main() {
  vec3 core = mix(uColor, vec3(1.0, 0.96, 0.78), clamp(vEnergy * 2.5, 0.0, 1.0));
  gl_FragColor = vec4(core * (2.1 + vEnergy * 3.5), 1.0);
}
