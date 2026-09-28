export const STICK_CONFIG = {
  // Reverse the held axis: the round head hangs below the grip in the neutral playing pose.
  gungulchae: {angleOffset: 180, gripOffset: .18, palmLengthScale: 3.5, minLength: .12, maxLength: .34},
  yeolchae: {angleOffset: 0, gripOffset: .20, palmLengthScale: 3.8, minLength: .12, maxLength: .37},
};

export const FILTER_CONFIG = {
  grip: {minCutoff: 4, beta: 22, dCutoff: 2},
  rotation: {minCutoff: 2.3, beta: 1.6, dCutoff: 2},
};

export const TRACKING_CONFIG = {inferenceIntervalMs: 30, coastMs: 65, settleMs: 260, maxCoastSpeed: .65,
  minConfidence: .5, maxCoastDistance: .025, velocitySmoothing: .55,
  minPalmVector: .015, maxAnchorLag: .012, gripPalmWeight: .72,
  staleAfterMs: 110, maxAngularSpeed: 16, palmAcrossWeight: .65,
  fastSpeed: 1.2, fastAnchorLag: .003, minProjectedAxis: .2};

export const GRIP_CONFIG = {grabThreshold: .62, releaseThreshold: .28, confirmationFrames: 2,
  grabMs: 55, releaseMs: 170, straightAngle: 165, foldedAngle: 85,
  openTipDistance: 1.65, closedTipDistance: .6, angleWeight: .55};

// Shared orthographic scene geometry and screen layout; also used by hit testing.
export const JANGGU_CONFIG = {torsoFraction: .38, torsoOffsetX: 0, torsoOffsetY: 0,
  fallbackTorsoLength: 1.25, minShoulderWidth: .02, scaleMultiplier: 1.8, minScale: .24, maxScale: .70,
  positionSmoothingMs: 150, sizeSmoothingMs: 260, minConfidence: .5, lostTrackingGraceMs: 350, staleAfterMs: 120,
  yawDegrees: 25, rimX: 1.58, rimRadius: .94, rimTube: .09};

export const HIT_CONFIG = {
  cooldownMs: 145, impactVelocity: .20, zonePadding: 1.22,
  strength: {normal: .72, strong: 1.35},
};
