import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ArrowLeft, CameraOff, RefreshCw, ScanFace} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import useFaceTracking from '../hooks/useFaceTracking';
import NeonJanggu3D from '../components/janggu/NeonJanggu3D';
import StickOverlay from '../components/sticks/StickOverlay';
import useStickHitDetection from '../hooks/useStickHitDetection';
import useHandTracking from '../hooks/useHandTracking';

export default function CameraExperience() {
  const navigate = useNavigate();
  const videoRef = useRef(null), jangguRef = useRef(null);
  const hitTimerRef = useRef(null);
  const [lastHit, setLastHit] = useState(null);
  const {stream, status: cameraStatus, error: cameraError, start, stop, attach} = useCamera();
  const cameraReady = cameraStatus === 'ready' && Boolean(stream);
  const tracking = useFaceTracking(videoRef, cameraReady);
  const handTracking = useHandTracking(videoRef, cameraReady, tracking.instrument);
  const trackingDebug = new URLSearchParams(window.location.search).get('debug') === 'tracking';

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
  const stickStyle = (box) => {
    const baseStyle = overlayStyle(box);
    return baseStyle ? {...baseStyle, transform: `translate(-50%, -50%) perspective(700px) rotate(${box.rotation || 0}deg) rotateY(${box.yaw || 0}deg)`} : undefined;
  };
  const detected = tracking.status === 'detected';
  const showInstrument = cameraReady && Boolean(tracking.instrument);
  const activeSticks = {
    left: handTracking.sticks?.left || tracking.sticks?.left,
    right: handTracking.sticks?.right || tracking.sticks?.right,
  };
  const handleHit = useCallback((hit) => {
    jangguRef.current?.hit(hit);
    setLastHit(hit);
    clearTimeout(hitTimerRef.current);
    hitTimerRef.current = setTimeout(() => setLastHit(null), 420);
  }, []);
  useStickHitDetection(tracking.instrument, activeSticks, handleHit);
  useEffect(() => () => clearTimeout(hitTimerRef.current), []);
  const messages = {loading: '인식 모델 준비 중', searching: '얼굴을 찾고 있어요', detecting: '얼굴 확인 중', detected: '얼굴 인식 완료', error: '인식 오류'};

  return <main className="experience-page">
    <video ref={videoRef} className="experience-video" autoPlay muted playsInline/>
    <div className="experience-shade"/>
    <header className="experience-header"><button onClick={leave}><ArrowLeft/> 나가기</button><div className={'recognition-state ' + (detected ? 'success' : tracking.status === 'error' ? 'failed' : '')}><ScanFace/><span>{messages[tracking.status] || '카메라 준비 중'}</span>{tracking.confidence > 0 && <b>{tracking.confidence}%</b>}</div><span/></header>
    {tracking.face && <div className={'face-marker ' + (detected ? 'locked' : '')} style={overlayStyle(tracking.face)}><i/><i/><i/><i/></div>}
    {showInstrument && <div className="instrument-overlay instrument-overlay-3d" style={overlayStyle(tracking.instrument)} aria-label="3D 네온 장구"><NeonJanggu3D ref={jangguRef} rotationY={tracking.instrument.yaw || 0} rotationZ={tracking.instrument.rotation || 0} quality="medium"/><small>{detected ? '3D 장구 인식 완료' : '장구 위치 맞추는 중'}</small></div>}
    {activeSticks.left && <StickOverlay side="left" style={stickStyle(activeSticks.left)}/>} 
    {activeSticks.right && <StickOverlay side="right" style={stickStyle(activeSticks.right)}/>} 
    {showInstrument && <aside className="grip-guide"><b>장구 기본 연주 자세</b><span><i className="grip-dot gungul"/>궁굴채·열채 끝을 장구 중앙으로 45°</span><span><i className="grip-dot yeol"/>팔보다 손목으로 내리치고 바로 반동</span></aside>}
    {lastHit && <div className={`hit-feedback ${lastHit.side}`}>{lastHit.side === 'left' ? '덩' : '덕'}<small>{lastHit.strength}</small></div>}
    {!cameraReady && <div className="experience-message"><CameraOff/><b>{cameraError || '카메라 연결 중…'}</b>{cameraError && <button onClick={() => start()}><RefreshCw/> 다시 연결</button>}</div>}
    {cameraReady && !detected && tracking.status !== 'error' && <div className="standing-guide"><div/><span>얼굴과 양쪽 어깨가 화면에 보이도록 맞춰주세요</span></div>}
    {tracking.status === 'error' && <div className="tracking-error"><b>MediaPipe 실행에 실패했습니다.</b><span>{tracking.detail}</span><button onClick={() => window.location.reload()}><RefreshCw/> 다시 시도</button></div>}
    {detected && <div className="detected-message">움직여보세요. 악기가 몸을 따라갑니다.</div>}
    {showInstrument && <div className="wave-test-controls"><button onClick={() => jangguRef.current?.hitLeft('normal')}>왼쪽 파동</button><button onClick={() => jangguRef.current?.hitRight('strong')}>오른쪽 파동</button></div>}
    <div className="debug-state">상태: {tracking.instrument ? `3D 장구 · bodyYaw ${Math.round(tracking.instrument.yaw || 0)}° · ${handTracking.detail}` : tracking.detail || '카메라 연결 확인 중'}</div>
    {trackingDebug && <aside className="tracking-debug-panel">
      <b>Stick tracking debug</b>
      {['left', 'right'].map((side) => {
        const stick = activeSticks[side];
        return <div key={side}><strong>{side === 'left' ? '궁굴채' : '열채'}</strong>{stick ? <>
          <span>confidence {Math.round((stick.confidence || 0) * 100)}% {stick.stale ? `· missing ${Math.round(stick.missingMs)}ms` : ''}</span>
          <span>grip {stick.gripX?.toFixed(3)}, {stick.gripY?.toFixed(3)}</span>
          <span>tip {stick.tipX?.toFixed(3)}, {stick.tipY?.toFixed(3)}</span>
          <span>angle {Math.round(stick.rotation || 0)}° · roll {Math.round(stick.yaw || 0)}°</span>
          <span>velocity {(stick.velocity || Math.hypot(stick.debug?.velocity?.x || 0, stick.debug?.velocity?.y || 0)).toFixed(2)} · {stick.hitState || 'IDLE'}</span>
        </> : <span>not detected</span>}</div>;
      })}
    </aside>}
  </main>;
}
