const smoothingFactor = (cutoff, dt) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

export class OneEuroFilter {
  constructor({minCutoff = 1, beta = 0, dCutoff = 1} = {}) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff; this.reset();
  }
  reset(value) { this.value = value; this.derivative = 0; this.time = undefined; }
  filter(value, timeMs) {
    if (this.value == null || this.time == null) { this.value = value; this.time = timeMs; return value; }
    const dt = Math.max(1 / 120, Math.min(.1, (timeMs - this.time) / 1000));
    const rawDerivative = (value - this.value) / dt;
    const derivativeAlpha = smoothingFactor(this.dCutoff, dt);
    this.derivative += (rawDerivative - this.derivative) * derivativeAlpha;
    const cutoff = this.minCutoff + this.beta * Math.abs(this.derivative);
    this.value += (value - this.value) * smoothingFactor(cutoff, dt);
    this.time = timeMs;
    return this.value;
  }
}

export const createPointFilter = (config) => ({x: new OneEuroFilter(config), y: new OneEuroFilter(config)});
