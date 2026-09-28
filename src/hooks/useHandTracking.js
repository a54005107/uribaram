import {useEffect, useRef, useState} from 'react';
import {motionConfig} from '../motion/motionConfig';
import {FilesetResolver, HandLandmarker} from '@mediapipe/tasks-vision';
import {TRACKING_CONFIG} from '../config/stickInteractionConfig';
import {createStickTracker, trackStick, sampleStick} from '../motion/stickTracker';

export default function useHandTracking(videoRef, enabled, onDetection, streamKey) {
  const [result, setResult] = useState({status: 'idle', sticks: null, detail: ''});
  const callbackRef = useRef(onDetection); callbackRef.current = onDetection;
  const trackersRef = useRef({left: createStickTracker(), right: createStickTracker()});
  const samplesRef = useRef(null);
  if (!samplesRef.current) samplesRef.current = {sample: (now) => Object.fromEntries(['left', 'right'].map((side) => [side, sampleStick(trackersRef.current[side], now)]))};
  useEffect(() => {
    trackersRef.current = {left: createStickTracker(), right: createStickTracker()};
    if (!enabled) { setResult({status: 'idle', sticks: null, detail: ''}); return undefined; }
    let disposed = false, landmarker, frameId = 0, lastVideoTime = -1, lastInference = 0, lastUi = -Infinity;
    const trackers = trackersRef.current;
    setResult({status: 'loading', sticks: null, detail: '손 인식 모델 준비 중'});
    const loop = () => {
      if (disposed) return;
      const video = videoRef.current, now = performance.now();
      if (!document.hidden && !video?.paused && landmarker && video?.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastInference >= TRACKING_CONFIG.inferenceIntervalMs) {
        lastVideoTime = video.currentTime; lastInference = now;
        try {
          const detection = landmarker.detectForVideo(video, now), nextSticks = {};
          callbackRef.current?.(detection, now, video.videoWidth / video.videoHeight);
          const seen = new Set();
          detection.landmarks?.forEach((landmarks, index) => {
            const category = detection.handednesses?.[index]?.[0];
            if (!['Left', 'Right'].includes(category?.categoryName) || category.score < TRACKING_CONFIG.minConfidence || landmarks.length !== 21) return;
            const side = category.categoryName.toLowerCase();
            if (seen.has(side)) return;
            seen.add(side);
            trackers[side].missing = false;
            nextSticks[side] = trackStick(trackers[side], landmarks, side, now, category.score, video.videoWidth / video.videoHeight);
          });
          for (const side of ['left', 'right']) if (!seen.has(side)) {
            trackers[side].missing = true;
            trackers[side].grip.candidate = null;
            trackers[side].grip.frames = 0;
            const coasted = sampleStick(trackers[side], now);
            if (coasted) nextSticks[side] = coasted;
            else trackers[side] = createStickTracker();
          }
          const count = Object.keys(nextSticks).length, staleCount = Object.values(nextSticks).filter((stick) => stick.stale).length;
          if (now - lastUi >= motionConfig.uiIntervalMs) {
            lastUi = now;
            setResult({status: count ? 'tracking' : 'searching', sticks: count ? nextSticks : null,
              detail: count ? `손 ${count}개 추적 중${staleCount ? ` · ${staleCount}개 보간` : ''}` : '주먹 쥔 양손을 카메라에 보여주세요'});
          }
        } catch (error) {
          trackersRef.current = {left: createStickTracker(), right: createStickTracker()};
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
        if (disposed) { landmarker.close(); return; }
        if (!disposed) { setResult({status: 'searching', sticks: null, detail: '손 인식 모델 준비 완료'}); loop(); }
      } catch (error) {
        console.error('Hand model load failed:', error); if (!disposed) setResult({status: 'error', sticks: null, detail: error?.message || '손 모델 로딩 실패'});
      }
    })();
    return () => { disposed = true; cancelAnimationFrame(frameId); landmarker?.close(); };
  }, [videoRef, enabled, streamKey]);
  return {...result, samplesRef};
}
