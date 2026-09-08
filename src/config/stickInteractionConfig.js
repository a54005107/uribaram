export const STICK_CONFIG = {
  gungulchae: {angleOffset: 180, gripOffset: .18, lengthScale: .34, minLength: .14, maxLength: .35, predictionTime: .022, maxPrediction: .035, rollWeight: .58, maxRoll: 42},
  yeolchae: {angleOffset: 0, gripOffset: .20, lengthScale: .36, minLength: .15, maxLength: .37, predictionTime: .026, maxPrediction: .04, rollWeight: .48, maxRoll: 36},
};

export const FILTER_CONFIG = {
  grip: {minCutoff: 2.6, beta: .55, dCutoff: 1},
  rotation: {minCutoff: 1.65, beta: .22, dCutoff: 1},
  roll: {minCutoff: 1.35, beta: .16, dCutoff: 1},
  tip: {minCutoff: 2.1, beta: .38, dCutoff: 1},
  size: {minCutoff: 1.2, beta: .1, dCutoff: 1},
};

export const TRACKING_CONFIG = {inferenceIntervalMs: 30, coastMs: 100, settleMs: 250, maxCoastSpeed: 1.8};

export const HIT_CONFIG = {
  cooldownMs: 145, zoneEntry: 1.08, zoneExit: 1.3, raisedDistance: 1.22,
  swingVelocity: .22, impactVelocity: .28, towardVelocity: .12,
  strength: {normal: .72, strong: 1.35},
};
