import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {ArrowLeft, CameraOff, RefreshCw, ScanFace} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import useFaceTracking from '../hooks/useFaceTracking';
import NeonJanggu3D from '../components/janggu/NeonJanggu3D';
import LiveSticks from '../components/sticks/LiveSticks';
import {createJangguLayout} from '../motion/jangguLayout';
import {createTorsoTracker} from '../motion/torsoTracker';
import useHandTracking from '../hooks/useHandTracking';
import {createMotionEngine} from '../motion/motionEngine';
import MotionDebug from '../motion/MotionDebug';

export default function CameraExperience() {
  const navigate = useNavigate();
  const {search} = useLocation();
  const debugMode = new URLSearchParams(search).get('debug');
  const debugEnabled = debugMode === 'motion' || debugMode === 'tracking';
  const videoRef = useRef(null), jangguRef = useRef(null);
  const hitTimerRef = useRef(null);
  const [lastHit, setLastHit] = useState(null);
  const {stream, status: cameraStatus, error: cameraError, start, stop, attach} = useCamera();
  const cameraReady = cameraStatus === 'ready' && Boolean(stream);
  const transformRef = useRef(null);
  const [torsoTracker] = useState(() => createTorsoTracker());
  const [motionEngine] = useState(() => createMotionEngine());
  const [motionDebug, setMotionDebug] = useState(() => debugMode === 'motion');
  const showMotionDebug = debugEnabled && motionDebug;
  useEffect(() => { motionEngine.reset(); return () => motionEngine.reset(); }, [motionEngine, stream, cameraReady]);
  const [viewport, setViewport] = useState({width: window.innerWidth, height: window.innerHeight});
  useEffect(() => {
    const element = videoRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      if (width > 0 && height > 0) setViewport({width, height});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const layout = useMemo(() => createJangguLayout(viewport.width, viewport.height), [viewport]);
  useEffect(() => { torsoTracker.reset(); transformRef.current = null; }, [torsoTracker, stream, cameraReady]);
  const handlePose = useCallback((result, timestamp, aspect) => {
    motionEngine.pose(result, timestamp, aspect);
    torsoTracker.update(result, timestamp, aspect);
  }, [motionEngine, torsoTracker]);
  const tracking = useFaceTracking(videoRef, cameraReady, handlePose, stream);
  const handTracking = useHandTracking(videoRef, cameraReady, motionEngine.hands, stream);
  const trackingDebug = debugMode === 'tracking';

  useEffect(() => {
    if (stream && videoRef.current) attach(videoRef.current);
    else if (cameraStatus === 'idle') start();
  }, [stream, cameraStatus, attach, start]);

  const leave = () => { stop(); navigate('/'); };
  const overlayStyle = (box) => {
    const video = videoRef.current;
    if (!box || !video?.videoWidth) return undefined;
    const rect = video.getBoundingClientRect();
    const scale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
    const width = video.videoWidth * scale, height = video.videoHeight * scale;
    return {left: rect.left + (rect.width - width) / 2 + box.x * width, top: rect.top + (rect.height - height) / 2 + box.y * height, width: box.width * width, height: box.height * height, transform: 'translate(-50%, -50%)'};
  };
  const detected = tracking.status === 'detected';
  const showInstrument = cameraReady;
  const handleHit = useCallback((hit) => {
    jangguRef.current?.hit(hit);
    setLastHit(hit);
    clearTimeout(hitTimerRef.current);
    hitTimerRef.current = setTimeout(() => setLastHit(null), 420);
  }, []);
  useEffect(() => () => clearTimeout(hitTimerRef.current), []);
  const messages = {loading: '인식 모델 준비 중', searching: '얼굴을 찾고 있어요', detecting: '얼굴 확인 중', detected: '얼굴 인식 완료', error: '인식 오류'};

  return <main className="experience-page">
    {/* Keep the full-size video mounted and playing: tracking and projection use its dimensions. */}
    <video ref={videoRef} className={'experience-video' + (debugEnabled ? ' is-debug-visible' : '')} aria-hidden={!debugEnabled} tabIndex={-1} autoPlay muted playsInline/>
    <div className="experience-shade"/>
    <MotionDebug engine={motionEngine} videoRef={videoRef} enabled={showMotionDebug} handStatus={handTracking.status} poseStatus={tracking.status}/>
    {debugEnabled && <button className="motion-debug-toggle" aria-pressed={motionDebug} onClick={() => setMotionDebug((value) => !value)}>모션 디버그 {motionDebug ? '끄기' : '켜기'}</button>}
    <header className="experience-header"><button onClick={leave}><ArrowLeft/> 나가기</button><div className={'recognition-state ' + (detected ? 'success' : tracking.status === 'error' ? 'failed' : '')}><ScanFace/><span>{messages[tracking.status] || '카메라 준비 중'}</span>{tracking.confidence > 0 && <b>{tracking.confidence}%</b>}</div><span/></header>
    {!debugEnabled && <h1 className="experience-title">장구를 연주해보세요</h1>}
    {debugEnabled && tracking.face && <div className={'face-marker ' + (detected ? 'locked' : '')} style={overlayStyle(tracking.face)}><i/><i/><i/><i/></div>}
    {showInstrument && <div className="body-janggu-overlay" aria-label="3D 장구"><NeonJanggu3D ref={jangguRef} transformRef={transformRef} quality="medium"/></div>}
    <LiveSticks torsoTracker={torsoTracker} transformRef={transformRef} samplesRef={handTracking.samplesRef} videoRef={videoRef} layout={layout} enabled={cameraReady} debug={showMotionDebug || trackingDebug} onHit={handleHit}/>
    {showInstrument && <aside className="grip-guide"><b>장구 기본 연주 자세</b><span><i className="grip-dot gungul"/>궁굴채·열채 끝을 장구 중앙으로 45°</span><span><i className="grip-dot yeol"/>팔보다 손목으로 내리치고 바로 반동</span></aside>}
    {lastHit && <div className={`hit-feedback ${lastHit.side}`}>{lastHit.side === 'left' ? '덩' : '덕'}<small>{lastHit.strength}</small></div>}
    {!cameraReady && <div className="experience-message"><CameraOff/><b>{cameraError || '카메라 연결 중…'}</b>{cameraError && <button onClick={() => start()}><RefreshCw/> 다시 연결</button>}</div>}
    {cameraReady && !detected && tracking.status !== 'error' && <div className="standing-guide">{debugEnabled && <div/>}<span>카메라가 얼굴과 양쪽 어깨를 볼 수 있도록 서주세요</span></div>}
    {tracking.status === 'error' && <div className="tracking-error"><b>MediaPipe 실행에 실패했습니다.</b><span>{tracking.detail}</span><button onClick={() => window.location.reload()}><RefreshCw/> 다시 시도</button></div>}
    {detected && <div className="detected-message">주먹을 쥐면 채를 잡고, 손을 펴면 놓습니다.</div>}
    {debugEnabled && showInstrument && <div className="wave-test-controls"><button onClick={() => handleHit({side: 'left', strength: 'normal'})}>왼쪽 파동</button><button onClick={() => handleHit({side: 'right', strength: 'strong'})}>오른쪽 파동</button></div>}
    <button className="primary-button experience-finish" onClick={() => navigate('/ending')}>체험 완료</button>
    {debugEnabled && <div className="debug-state">상태: {handTracking.detail || tracking.detail || '카메라 연결 확인 중'}</div>}

  </main>;
}
