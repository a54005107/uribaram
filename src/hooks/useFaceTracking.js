import {useEffect, useState} from 'react';
import {FilesetResolver, PoseLandmarker} from '@mediapipe/tasks-vision';

const FACE_POINTS = [0, 2, 5, 7, 8];
const mix = (oldValue, newValue, amount = .32) => oldValue == null ? newValue : oldValue + (newValue - oldValue) * amount;
const initialState = {status: 'idle', face: null, instrument: null, sticks: null, confidence: 0, detail: ''};

export default function useFaceTracking(videoRef, enabled) {
  const [tracking, setTracking] = useState(initialState);

  useEffect(() => {
    if (!enabled) { setTracking(initialState); return undefined; }
    let disposed = false, landmarker, frameId = 0, lastVideoTime = -1, stableFrames = 0, missedFrames = 0;
    let smoothFace, smoothInstrument, smoothLeftStick, smoothRightStick;
    setTracking({...initialState, status: 'loading', detail: 'MediaPipe 모델 불러오는 중'});

    const smoothBox = (previous, next) => ({x: mix(previous?.x, next.x), y: mix(previous?.y, next.y), width: mix(previous?.width, next.width), height: mix(previous?.height, next.height), rotation: mix(previous?.rotation, next.rotation ?? 0, .18), yaw: mix(previous?.yaw, next.yaw ?? 0, .12), tipX: next.tipX == null ? undefined : mix(previous?.tipX, next.tipX, .4), tipY: next.tipY == null ? undefined : mix(previous?.tipY, next.tipY, .4)});
    const makeStick = (side, wrist, target, length, previous) => {
      const wristX = 1 - wrist.x;
      const rawDx = target.x - wristX;
      const dy = Math.max(target.y - wrist.y, .075);
      const inwardSign = side === 'left' ? -1 : 1;
      const dx = inwardSign * Math.max(Math.abs(rawDx), dy * .82);
      const magnitude = Math.max(.001, Math.hypot(dx, dy));
      const ux = dx / magnitude, uy = dy / magnitude;
      const gripRatio = .18;
      return smoothBox(previous, {x: wristX + ux * length * (.5 - gripRatio), y: wrist.y + uy * length * (.5 - gripRatio), width: length, height: Math.max(.025, length * .08), rotation: Math.atan2(uy, ux) * 180 / Math.PI, yaw: 0, tipX: wristX + ux * length * (1 - gripRatio), tipY: wrist.y + uy * length * (1 - gripRatio)});
    };
    const pointScore = (point) => Math.max(point?.visibility ?? 0, point?.presence ?? 0, point ? .65 : 0);

    const loop = () => {
      if (disposed) return;
      const video = videoRef.current;
      if (landmarker && video?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const pose = result.landmarks?.[0];
          const worldPose = result.worldLandmarks?.[0];
          const confidence = pose ? FACE_POINTS.reduce((sum, index) => sum + pointScore(pose[index]), 0) / FACE_POINTS.length : 0;
          if (pose && confidence >= .45) {
            const [nose, leftEar, rightEar, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist] = [pose[0], pose[7], pose[8], pose[11], pose[12], pose[13], pose[14], pose[15], pose[16]];
            stableFrames = Math.min(10, stableFrames + 1); missedFrames = 0;
            const earDistance = Math.abs(leftEar.x - rightEar.x);
            const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
            const faceWidth = Math.max(.12, earDistance * 1.8);
            const shoulderCenter = {x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2};
            const chestX = shoulderCenter.x;
            const chestY = shoulderCenter.y + shoulderWidth * .27;
            const rotation = Math.max(-18, Math.min(18, Math.atan2(rightShoulder.y - leftShoulder.y, Math.abs(rightShoulder.x - leftShoulder.x)) * 180 / Math.PI));
            const worldLeftShoulder = worldPose?.[11], worldRightShoulder = worldPose?.[12];
            const depthDifference = worldLeftShoulder && worldRightShoulder ? worldRightShoulder.z - worldLeftShoulder.z : rightShoulder.z - leftShoulder.z;
            const worldShoulderWidth = worldLeftShoulder && worldRightShoulder ? Math.abs(worldRightShoulder.x - worldLeftShoulder.x) : Math.abs(rightShoulder.x - leftShoulder.x);
            const bodyYaw = Math.max(-55, Math.min(55, Math.atan2(depthDifference, Math.max(.01, worldShoulderWidth)) * 180 / Math.PI * .8));
            const instrumentWidth = Math.max(.42, shoulderWidth * 2.05);
            smoothFace = smoothBox(smoothFace, {x: 1 - nose.x, y: nose.y, width: faceWidth, height: faceWidth * 1.25, rotation: 0, yaw: 0});
            smoothInstrument = smoothBox(smoothInstrument, {x: 1 - chestX, y: chestY, width: instrumentWidth, height: instrumentWidth * .625, rotation, yaw: bodyYaw});
            const stickLength = Math.max(.14, shoulderWidth * .58);
            const leftArmVisible = (leftElbow.visibility ?? .65) >= .35 && (leftWrist.visibility ?? .65) >= .35;
            const rightArmVisible = (rightElbow.visibility ?? .65) >= .35 && (rightWrist.visibility ?? .65) >= .35;
            const screenChestX = 1 - chestX;
            const leftDrumTarget = {x: screenChestX - instrumentWidth * .24, y: chestY};
            const rightDrumTarget = {x: screenChestX + instrumentWidth * .24, y: chestY};
            smoothLeftStick = leftArmVisible ? makeStick('left', leftWrist, rightDrumTarget, stickLength, smoothLeftStick) : undefined;
            smoothRightStick = rightArmVisible ? makeStick('right', rightWrist, leftDrumTarget, stickLength, smoothRightStick) : undefined;
            setTracking({status: stableFrames >= 3 ? 'detected' : 'detecting', face: smoothFace, instrument: smoothInstrument, sticks: {left: smoothLeftStick, right: smoothRightStick}, confidence: Math.round(confidence * 100), detail: '얼굴·어깨·손목 랜드마크 감지됨'});
          } else {
            missedFrames += 1;
            if (missedFrames >= 4) { stableFrames = 0; smoothFace = undefined; smoothInstrument = undefined; smoothLeftStick = undefined; smoothRightStick = undefined; setTracking({...initialState, status: 'searching', detail: pose ? '얼굴 신뢰도가 낮음' : '신체 랜드마크 없음'}); }
          }
        } catch (error) {
          console.error('MediaPipe inference failed:', error);
          setTracking({...initialState, status: 'error', detail: error?.message || '추론 실행 실패'});
          return;
        }
      }
      frameId = requestAnimationFrame(loop);
    };

    (async () => {
      try {
        const base = import.meta.env.BASE_URL;
        const vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {modelAssetPath: `${base}mediapipe/pose_landmarker_lite.task`, delegate: 'CPU'},
          runningMode: 'VIDEO', numPoses: 1,
          minPoseDetectionConfidence: .35, minPosePresenceConfidence: .35, minTrackingConfidence: .35,
        });
        if (!disposed) { setTracking({...initialState, status: 'searching', detail: '모델 준비 완료'}); loop(); }
      } catch (error) {
        console.error('MediaPipe load failed:', error);
        if (!disposed) setTracking({...initialState, status: 'error', detail: error?.message || '모델 로딩 실패'});
      }
    })();

    return () => { disposed = true; cancelAnimationFrame(frameId); landmarker?.close(); };
  }, [videoRef, enabled]);

  return tracking;
}
