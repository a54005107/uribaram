import {useEffect, useRef, useState} from 'react';
import {motionConfig} from '../motion/motionConfig';
import {HandLandmarker} from '@mediapipe/tasks-vision';
import {prepareHands} from '../camera/prepareHands';
import {TRACKING_CONFIG} from '../config/stickInteractionConfig';
import {createStickTracker, trackStick, sampleStick, markStickMissing} from '../motion/stickTracker';
import {associateHands} from '../motion/handAssociation';
import {createMotionActivity} from '../motion/idleActivity';

export default function useHandTracking(videoRef, enabled, onDetection, streamKey, debug = false) {
  const [result, setResult] = useState({status: 'idle', sticks: null, detail: ''});
  const callbackRef = useRef(onDetection); callbackRef.current = onDetection;
  const trackersRef = useRef({left: createStickTracker(), right: createStickTracker()});
  const samplesRef = useRef(null);
  const diagnosticsRef = useRef({cameraFps: null, renderFps: 0, inferenceFps: 0, inferenceMs: 0, hands: {}});
  if (!samplesRef.current) samplesRef.current = {
    sample: now => Object.fromEntries(['left', 'right'].map(side => [side, sampleStick(trackersRef.current[side], now)])),
    sampleForHit: now => Object.fromEntries(['left', 'right'].map(side => [side, sampleStick(trackersRef.current[side], now, false)])),
  };
  useEffect(() => {
    trackersRef.current = {left: createStickTracker(), right: createStickTracker()};
    diagnosticsRef.current = {cameraFps: null, renderFps: 0, inferenceFps: 0, inferenceMs: 0, hands: {}};
    if (!enabled) { setResult({status: 'idle', sticks: null, detail: ''}); return undefined; }
    let disposed = false, landmarker, frameId = 0, videoFrameId, lastVideoTime = -1, lastInference = 0, lastUi = -Infinity;
    let videoFrameSerial = 0, processedVideoFrame = -1, captureTime = 0;
    let cameraWindow = null, cameraFrames = 0, inferenceWindow = performance.now(), inferenceFrames = 0;
    let inferenceCost = 0;
    const videoElement = videoRef.current;
    const recordCameraFrames = (now, frames) => {
      diagnosticsRef.current.cameraFrameAt = now;
      if (cameraWindow == null) { cameraWindow = now; cameraFrames = frames; }
      if (now - cameraWindow >= 500) {
        diagnosticsRef.current.cameraFps = Math.max(0, frames - cameraFrames) * 1000 / (now - cameraWindow);
        cameraWindow = now; cameraFrames = frames;
      }
    };
    const usesVideoFrames = Boolean(videoElement?.requestVideoFrameCallback);
    if (usesVideoFrames) {
      const onFrame = (now, metadata) => {
        if (disposed) return;
        videoFrameSerial = metadata.presentedFrames;
        captureTime = now;
        if (debug) recordCameraFrames(now, metadata.presentedFrames);
        videoFrameId = videoElement.requestVideoFrameCallback(onFrame);
      };
      videoFrameId = videoElement.requestVideoFrameCallback(onFrame);
    }
    const trackers = trackersRef.current;
    const reportMotion=createMotionActivity('hands');
    // Reuse a smaller inference surface, keeping the original aspect ratio.
    // Full-resolution camera pixels are unnecessary for the hand model.
    const inferenceCanvas = document.createElement('canvas');
    const inferenceContext = inferenceCanvas.getContext('2d');
    setResult({status: 'loading', sticks: null, detail: '손 인식 모델 준비 중'});
    const loop = () => {
      if (disposed) return;
      const video = videoRef.current, now = performance.now();
      if (debug && !video?.requestVideoFrameCallback && video?.getVideoPlaybackQuality) recordCameraFrames(now, video.getVideoPlaybackQuality().totalVideoFrames);
      // currentTime may advance between camera frames. Prefer actual presented
      // frame numbers so the same pixels cannot produce multiple measurements.
      const freshFrame = usesVideoFrames ? videoFrameSerial > 0 && videoFrameSerial !== processedVideoFrame : video?.currentTime !== lastVideoTime;
      const interval = Math.max(TRACKING_CONFIG.inferenceIntervalMs, Math.min(60, inferenceCost * 1.6));
      if (!document.hidden && !video?.paused && landmarker && video?.readyState >= 2 && freshFrame && now - lastInference >= interval) {
        lastVideoTime = video.currentTime; lastInference = now;
        processedVideoFrame = videoFrameSerial;
        const timestamp = usesVideoFrames ? captureTime : now;
        try {
          const inputScale = Math.min(1, TRACKING_CONFIG.inferenceMaxDimension / Math.max(video.videoWidth, video.videoHeight));
          const inputWidth = Math.round(video.videoWidth * inputScale), inputHeight = Math.round(video.videoHeight * inputScale);
          if (inferenceCanvas.width !== inputWidth || inferenceCanvas.height !== inputHeight) {
            inferenceCanvas.width = inputWidth; inferenceCanvas.height = inputHeight;
          }
          inferenceContext.drawImage(video, 0, 0, inputWidth, inputHeight);
          const detection = landmarker.detectForVideo(inferenceCanvas, timestamp), nextSticks = {};
          const receivedAt = performance.now();
          inferenceCost = inferenceCost ? inferenceCost * .8 + (receivedAt - now) * .2 : receivedAt - now;
          callbackRef.current?.(detection, timestamp, video.videoWidth / video.videoHeight);
          const association = associateHands(detection, trackers, timestamp, video.videoWidth / video.videoHeight);
          for (const side of ['left', 'right']) {
            const match = association[side];
            if (match) {
              const sample = trackStick(trackers[side], match.points, side, timestamp, match.confidence, video.videoWidth / video.videoHeight, receivedAt);
              if (sample) nextSticks[side] = sample;
              if(sample&&!sample.stale)reportMotion(side,{...sample.anchor,angle:sample.rotation},receivedAt);
            } else {
              trackers[side].debug.outlier = association.rejected;
              markStickMissing(trackers[side], receivedAt, association.ambiguous ? 'identity-ambiguous' : association.rejected ? 'identity-rejected' : 'unmatched');
              const held = sampleStick(trackers[side], receivedAt);
              if (held) nextSticks[side] = held;
              else trackers[side] = createStickTracker();
            }
          }
          if (debug) {
            inferenceFrames++;
            const metrics = diagnosticsRef.current;
            metrics.inferenceMs = receivedAt - now;
            if (receivedAt - inferenceWindow >= 500) {
              metrics.inferenceFps = inferenceFrames * 1000 / (receivedAt - inferenceWindow);
              inferenceFrames = 0; inferenceWindow = receivedAt;
            }
            metrics.hands = Object.fromEntries(['left', 'right'].map(side => [side, {...trackers[side].debug,
              detected: Boolean(association[side]), lastSeen: trackers[side].lastSeen, ambiguous: association.ambiguous}]));
          }
          const count = Object.keys(nextSticks).length, staleCount = Object.values(nextSticks).filter((stick) => stick.stale).length;
          if (now - lastUi >= motionConfig.uiIntervalMs) {
            lastUi = now;
            setResult({status: count ? 'tracking' : 'searching', sticks: count ? nextSticks : null,
              detail: count ? `손 ${count}개 추적 중${staleCount ? ` · ${staleCount}개 보간` : ''}` : '주먹 쥔 양손을 카메라에 보여주세요'});
          }
        } catch (error) {
          if (disposed) return;
          trackersRef.current = {left: createStickTracker(), right: createStickTracker()};
          landmarker?.close(); landmarker = null;
          console.error('Hand tracking failed:', error); setResult({status: 'error', sticks: null, detail: error?.message || '손 인식 실패'}); return;
        }
      }
      if (!disposed) frameId = requestAnimationFrame(loop);
    };
    (async () => {
      try {
        const {vision, modelAssetBuffer} = await prepareHands();
        if (disposed) return;
        const options = {baseOptions: {modelAssetBuffer, delegate: 'GPU'}, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .4, minHandPresenceConfidence: .4, minTrackingConfidence: .4};
        try { landmarker = await HandLandmarker.createFromOptions(vision, options); }
        catch { if (disposed) return; landmarker = await HandLandmarker.createFromOptions(vision, {...options, baseOptions: {...options.baseOptions, delegate: 'CPU'}}); }
        if (disposed) { landmarker.close(); return; }
        if (!disposed) { setResult({status: 'searching', sticks: null, detail: '손 인식 모델 준비 완료'}); loop(); }
      } catch (error) {
        console.error('Hand model load failed:', error); if (!disposed) setResult({status: 'error', sticks: null, detail: error?.message || '손 모델 로딩 실패'});
      }
    })();
    return () => { disposed = true; cancelAnimationFrame(frameId); if (videoFrameId != null) videoElement.cancelVideoFrameCallback(videoFrameId); landmarker?.close(); };
  }, [videoRef, enabled, streamKey, debug]);
  return {...result, samplesRef, diagnosticsRef};
}
