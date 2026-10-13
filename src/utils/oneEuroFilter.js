const smoothingFactor = (cutoff, dt) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

export class OneEuroFilter {
  constructor({minCutoff = 1, beta = 0, dCutoff = 1} = {}) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff; this.reset();
  }
  reset(value) { this.value = value; this.raw = value; this.derivative = 0; this.time = undefined; }
  filter(value, timeMs) {
    if (!Number.isFinite(value) || !Number.isFinite(timeMs)) return this.value;
    if (this.value == null || this.time == null) { this.value = value; this.raw = value; this.time = timeMs; return value; }
    if (timeMs <= this.time) return this.value;
    const dt = (timeMs - this.time) / 1000;
    const rawDerivative = (value - this.raw) / dt;
    const derivativeAlpha = smoothingFactor(this.dCutoff, dt);
    this.derivative += (rawDerivative - this.derivative) * derivativeAlpha;
    const cutoff = this.minCutoff + this.beta * Math.abs(this.derivative);
    this.value += (value - this.value) * smoothingFactor(cutoff, dt);
    this.time = timeMs;
    this.raw = value;
    return this.value;
  }
}

export const createPointFilter = (config) => ({x: new OneEuroFilter(config), y: new OneEuroFilter(config)});
