import {motionConfig} from './motionConfig.js';
import {trackHand} from './handTracker.js';
import {trackPose} from './poseTracker.js';
export function createMotionEngine(overrides = {}) {
  const config = {...motionConfig, ...overrides};
  let state = {leftHand: null, rightHand: null, pose: null};
  const expire = (now) => {
    for (const key of ['leftHand', 'rightHand', 'pose']) if (state[key] && now - state[key].timestamp > config.staleMs) state[key] = null;
  };
  return {
    reset() { state = {leftHand: null, rightHand: null, pose: null}; },
    snapshot(now = performance.now()) { expire(now); return {...state}; },
    hands(result, timestamp, aspect = 1) {
      expire(timestamp);
      const next = {leftHand: null, rightHand: null};
      result.landmarks?.forEach((points, i) => {
        const category = result.handednesses?.[i]?.[0];
        if (!['Left', 'Right'].includes(category?.categoryName) || category.score < config.minConfidence || points.length !== 21) return;
        const key = category.categoryName === 'Left' ? 'leftHand' : 'rightHand';
        if (next[key]?.confidence > category.score) return;
        next[key] = trackHand(points, result.worldLandmarks?.[i], category.categoryName.toUpperCase(), category.score, state[key], timestamp, aspect, config);
      });
      state = {...state, ...next};
    },
    pose(result, timestamp, aspect = 1) {
      expire(timestamp);
      state.pose = result.landmarks?.[0]?.length >= 33 ? trackPose(result.landmarks[0], state.pose, timestamp, aspect, config) : null;
    },
  };
}
