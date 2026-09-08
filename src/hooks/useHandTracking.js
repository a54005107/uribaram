import {useEffect, useRef, useState} from 'react';
import {FilesetResolver, HandLandmarker} from '@mediapipe/tasks-vision';
import {FILTER_CONFIG, STICK_CONFIG, TRACKING_CONFIG} from '../config/stickInteractionConfig';
import {OneEuroFilter, createPointFilter} from '../utils/oneEuroFilter';
import {clamp, limitVector, unwrapAngle, weightedPoint} from '../utils/stickMath';

const makeTracker = () => ({
  gripFilter: createPointFilter(FILTER_CONFIG.grip), tipFilter: createPointFilter(FILTER_CONFIG.tip),
  angleFilter: new OneEuroFilter(FILTER_CONFIG.rotation), rollFilter: new OneEuroFilter(FILTER_CONFIG.roll),
  widthFilter: new OneEuroFilter(FILTER_CONFIG.size), lastRawGrip: null, velocity: {x: 0, y: 0},
  lastSeen: 0, lastOutput: null, unwrappedAngle: null,
});

const makeStick = (landmarks, side, video, instrument, tracker, now, confidence) => {
  const config = side === 'left' ? STICK_CONFIG.gungulchae : STICK_CONFIG.yeolchae;
  const [wrist, indexMcp, middleMcp, ringMcp, pinkyMcp] = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
  const mirror = (point) => ({x: 1 - point.x, y: point.y, z: point.z || 0});
  const screenWrist = mirror(wrist), screenIndex = mirror(indexMcp), screenMiddle = mirror(middleMcp);
  const screenRing = mirror(ringMcp), screenPinky = mirror(pinkyMcp);
  const palmCenter = weightedPoint([[screenIndex, .24], [screenMiddle, .31], [screenRing, .25], [screenPinky, .2]]);
  const grip = weightedPoint([[screenWrist, .35], [screenIndex, .23], [screenMiddle, .25], [screenRing, .1], [screenPinky, .07]]);
  const videoWidth = video.videoWidth || 1280, videoHeight = video.videoHeight || 720;
  const dxPixels = (palmCenter.x - screenWrist.x) * videoWidth, dyPixels = (palmCenter.y - screenWrist.y) * videoHeight;
  const baseAngle = Math.atan2(dyPixels, dxPixels) + config.angleOffset * Math.PI / 180;
  tracker.unwrappedAngle = unwrapAngle(tracker.unwrappedAngle, baseAngle);
  const palmDepth = (screenPinky.z - screenIndex.z) * videoWidth;
  const palmSpan = Math.max(1, Math.hypot((screenPinky.x - screenIndex.x) * videoWidth, (screenPinky.y - screenIndex.y) * videoHeight));
  const rawRoll = Math.atan2(palmDepth, palmSpan) * 180 / Math.PI;
  const targetRoll = clamp(rawRoll * config.rollWeight, -config.maxRoll, config.maxRoll);
  const dt = tracker.lastRawGrip ? Math.max(.008, Math.min(.1, (now - tracker.lastRawGrip.time) / 1000)) : .033;
  if (tracker.lastRawGrip) {
    const instantaneous = {x: (grip.x - tracker.lastRawGrip.x) / dt, y: (grip.y - tracker.lastRawGrip.y) / dt};
    tracker.velocity.x += (instantaneous.x - tracker.velocity.x) * .62;
    tracker.velocity.y += (instantaneous.y - tracker.velocity.y) * .62;
  }
  tracker.lastRawGrip = {...grip, time: now};
  const predictionWeight = clamp((confidence - .35) / .5, .25, 1);
  const prediction = limitVector(tracker.velocity.x * config.predictionTime * predictionWeight, tracker.velocity.y * config.predictionTime * predictionWeight, config.maxPrediction);
  const predictedGrip = {x: grip.x + prediction.x, y: grip.y + prediction.y};
  const filteredGrip = {x: tracker.gripFilter.x.filter(predictedGrip.x, now), y: tracker.gripFilter.y.filter(predictedGrip.y, now)};
  const angle = tracker.angleFilter.filter(tracker.unwrappedAngle, now), roll = tracker.rollFilter.filter(targetRoll, now);
  const palmWidth = Math.hypot(screenIndex.x - screenPinky.x, screenIndex.y - screenPinky.y);
  const targetLength = instrument?.width ? instrument.width * config.lengthScale : palmWidth * 4.4;
  const length = tracker.widthFilter.filter(clamp(targetLength, config.minLength, config.maxLength), now);
  const ux = Math.cos(angle), uy = Math.sin(angle) * videoWidth / videoHeight;
  const center = {x: filteredGrip.x + ux * length * (.5 - config.gripOffset), y: filteredGrip.y + uy * length * (.5 - config.gripOffset)};
  const rawTip = {x: filteredGrip.x + ux * length * (1 - config.gripOffset), y: filteredGrip.y + uy * length * (1 - config.gripOffset)};
  const tip = {x: tracker.tipFilter.x.filter(rawTip.x, now), y: tracker.tipFilter.y.filter(rawTip.y, now)};
  return {...center, width: length, height: Math.max(.024, length * .075 * videoWidth / videoHeight), rotation: angle * 180 / Math.PI, yaw: roll,
    tipX: tip.x, tipY: tip.y, gripX: filteredGrip.x, gripY: filteredGrip.y, confidence, source: 'hand', stale: false,
    debug: {rawGrip: grip, predictedGrip, velocity: {...tracker.velocity}, palmRoll: rawRoll}};
};

const coastStick = (tracker, now) => {
  if (!tracker.lastOutput) return null;
  const missingMs = now - tracker.lastSeen;
  if (missingMs >= TRACKING_CONFIG.settleMs) return null;
  const elapsed = Math.min(missingMs, TRACKING_CONFIG.coastMs) / 1000, decay = Math.max(0, 1 - missingMs / TRACKING_CONFIG.settleMs);
  const velocity = limitVector(tracker.velocity.x, tracker.velocity.y, TRACKING_CONFIG.maxCoastSpeed);
  const dx = velocity.x * elapsed * decay, dy = velocity.y * elapsed * decay;
  return {...tracker.lastOutput, x: tracker.lastOutput.x + dx, y: tracker.lastOutput.y + dy, tipX: tracker.lastOutput.tipX + dx, tipY: tracker.lastOutput.tipY + dy,
    gripX: tracker.lastOutput.gripX + dx, gripY: tracker.lastOutput.gripY + dy, confidence: tracker.lastOutput.confidence * decay, stale: true, missingMs};
};

export default function useHandTracking(videoRef, enabled, instrument) {
  const [result, setResult] = useState({status: 'idle', sticks: null, detail: ''});
  const instrumentRef = useRef(instrument); instrumentRef.current = instrument;
  useEffect(() => {
    if (!enabled) { setResult({status: 'idle', sticks: null, detail: ''}); return undefined; }
    let disposed = false, landmarker, frameId = 0, lastVideoTime = -1, lastInference = 0;
    const trackers = {left: makeTracker(), right: makeTracker()};
    setResult({status: 'loading', sticks: null, detail: '손 인식 모델 준비 중'});
    const loop = () => {
      if (disposed) return;
      const video = videoRef.current, now = performance.now();
      if (landmarker && video?.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastInference >= TRACKING_CONFIG.inferenceIntervalMs) {
        lastVideoTime = video.currentTime; lastInference = now;
        try {
          const detection = landmarker.detectForVideo(video, now), nextSticks = {};
          detection.landmarks?.forEach((landmarks, index) => {
            const category = detection.handednesses?.[index]?.[0];
            const side = category?.categoryName?.toLowerCase() === 'left' ? 'left' : 'right';
            const confidence = category?.score ?? .65, tracker = trackers[side];
            const stick = makeStick(landmarks, side, video, instrumentRef.current, tracker, now, confidence);
            tracker.lastSeen = now; tracker.lastOutput = stick; nextSticks[side] = stick;
          });
          for (const side of ['left', 'right']) if (!nextSticks[side]) {
            const coasted = coastStick(trackers[side], now);
            if (coasted) nextSticks[side] = coasted;
            else trackers[side] = makeTracker();
          }
          const count = Object.keys(nextSticks).length, staleCount = Object.values(nextSticks).filter((stick) => stick.stale).length;
          setResult({status: count ? 'tracking' : 'searching', sticks: count ? nextSticks : null,
            detail: count ? `손 ${count}개 추적 중${staleCount ? ` · ${staleCount}개 보간` : ''}` : '주먹 쥔 양손을 카메라에 보여주세요'});
        } catch (error) {
          console.error('Hand tracking failed:', error); setResult({status: 'error', sticks: null, detail: error?.message || '손 인식 실패'}); return;
        }
      }
      frameId = requestAnimationFrame(loop);
    };
    (async () => {
      try {
        const base = import.meta.env.BASE_URL, vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
        const options = {baseOptions: {modelAssetPath: `${base}mediapipe/hand_landmarker.task`, delegate: 'GPU'}, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4};
        try { landmarker = await HandLandmarker.createFromOptions(vision, options); }
        catch { landmarker = await HandLandmarker.createFromOptions(vision, {...options, baseOptions: {...options.baseOptions, delegate: 'CPU'}}); }
        if (!disposed) { setResult({status: 'searching', sticks: null, detail: '손 인식 모델 준비 완료'}); loop(); }
      } catch (error) {
        console.error('Hand model load failed:', error); if (!disposed) setResult({status: 'error', sticks: null, detail: error?.message || '손 모델 로딩 실패'});
      }
    })();
    return () => { disposed = true; cancelAnimationFrame(frameId); landmarker?.close(); };
  }, [videoRef, enabled]);
  return result;
}
