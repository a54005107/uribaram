export const STICK_CONFIG = {
  // Reverse the held axis: the round head hangs below the grip in the neutral playing pose.
  gungulchae: {angleOffset: 180, gripOffset: .18, length: .22},
  yeolchae: {angleOffset: 0, gripOffset: .20, length: .24},
};

export const FILTER_CONFIG = {
  // dCutoff 2 preserves rapid strike reversals better than the initial 1 Hz.
  grip: {minCutoff: 1.2, beta: .04, dCutoff: 2},
  rotation: {minCutoff: 1.2, beta: .8, dCutoff: 1},
};

export const TRACKING_CONFIG = {inferenceIntervalMs: 30, inferenceMaxDimension: 640,
  lostTrackingGraceMs: 100, settleMs: 350, reacquireBlendMs: 80, renderBlendMs: 12,
  // Fixed reference units make beta independent of video resolution / viewport.
  filterReferenceHeight: 1000, velocityTimeConstantMs: 60,
  minConfidence: .5,
  minPalmVector: .015, gripPalmWeight: .72,
  staleAfterMs: 100, maxAngularSpeed: 16, palmAcrossWeight: .65,
  minProjectedAxis: .2,
  angleOutlierRadians: 1.1, angleConfirmationRadians: .3,
  jumpMinDistance: .16, jumpSpeed: 8, jumpAcceleration: 140, jumpInnovation: .12,
  outlierConfirmationDistance: .08, outlierConfirmationMs: 100,
  associationPredictionMs: 80, associationBaseDistance: .10, associationMaxSpeed: 8,
  associationLabelPenalty: .035, associationAmbiguity: .018};

export const GRIP_CONFIG = {grabThreshold: .62, releaseThreshold: .28, confirmationFrames: 2,
  grabMs: 55, releaseMs: 280, straightAngle: 165, foldedAngle: 85,
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
