import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import useHandTracking from '../hooks/useHandTracking';
import usePercussionAudio from '../hooks/usePercussionAudio';
import CameraInstrumentStage from '../components/sticks/CameraInstrumentStage';
import PlayScene from '../components/sticks/PlayScene';
import {createInstrumentLayout} from '../motion/instrumentLayout';
import geometry from '../config/playInstrumentGeometry.json';
import {instruments} from './InstrumentsPage';
import './InstrumentPlayPage.css';

export default function InstrumentPlayPage() {
  const [params] = useSearchParams();
  const id = params.get('instrument') || sessionStorage.getItem('uribaram-instrument') || 'janggu';
  const instrument = instruments.find(item => item.id === id) || instruments[1];
  return <CameraPlay key={instrument.id} instrument={instrument}/>;
}

function CameraPlay({instrument}) {
  const navigate = useNavigate();
  const pageRef = useRef(null), videoRef = useRef(null);
  const {stream, status, error, start, stop, attach} = useCamera();
  const startRef = useRef(start); startRef.current = start;
  const [playbackError, setPlaybackError] = useState('');
  const [retry, setRetry] = useState(0);
  const [viewport, setViewport] = useState({width: window.innerWidth, height: window.innerHeight});
  const ready = status === 'ready' && Boolean(stream) && !playbackError;
  const streamKey = useMemo(() => ({stream, retry}), [stream, retry]);
  const hands = useHandTracking(videoRef, ready, undefined, streamKey);
  const sound = usePercussionAudio(instrument.id);
  const layout = useMemo(() => createInstrumentLayout(geometry[instrument.id], viewport.width, viewport.height), [instrument.id, viewport]);

  useEffect(() => {
    void startRef.current();
    return () => stop();
  }, [stop]);
  useEffect(() => {
    if (!stream) return;
    let cancelled = false;
    setPlaybackError('');
    attach(videoRef.current).catch(() => { if (!cancelled) setPlaybackError('카메라 영상을 재생하지 못했습니다. 다시 연결해 주세요.'); });
    return () => { cancelled = true; };
  }, [stream, attach]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setViewport({width: entry.contentRect.width, height: entry.contentRect.height}));
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  const reconnect = () => { setPlaybackError(''); void start(); };
  const hasGrip = Object.values(hands.sticks || {}).some(stick => stick.grip.grabbed && !stick.stale);
  const trackingMessage = hands.status === 'loading' ? '손 움직임을 준비하고 있어요…'
    : hasGrip ? '채 끝으로 악기를 치면 소리가 나요'
    : hands.status === 'tracking' ? (instrument.id === 'janggu' ? '주먹을 쥐면 채가 나타나요. 손을 펴면 놓을 수 있어요' : '한 손을 쥐면 채가 나타나요. 손을 펴면 다른 손으로 잡을 수 있어요')
    : instrument.id === 'janggu' ? '양손이 보이도록 한 걸음 물러서 주세요' : '연주할 손이 카메라에 보이도록 한 걸음 물러서 주세요';
  return <main ref={pageRef} className="page camera-play-page illustrated-play-page" aria-label={`${instrument.name} 카메라 연주`}>
    <video ref={videoRef} className="camera-play-video" autoPlay muted playsInline aria-hidden="true" />
    <PlayScene width={viewport.width} height={viewport.height}/>
    <header className="camera-play-header">
      <button type="button" onClick={() => navigate('/instruments')}>← 악기 고르기</button>
      <h1>{instrument.name} 연주</h1>
      <button type="button" onClick={() => navigate(`/camera?instrument=${instrument.id}`)}>카메라 변경</button>
    </header>
    <CameraInstrumentStage instrument={instrument} layout={layout} videoRef={videoRef} samplesRef={hands.samplesRef}
      enabled={ready && hands.status === 'tracking'} onHit={sound.strike} />
    {(!ready || hands.status === 'error') && <section className="camera-play-notice" role={status === 'error' || playbackError || hands.status === 'error' ? 'alert' : 'status'}>
      <p>{error || playbackError || (hands.status === 'error' ? '손 움직임 인식을 시작하지 못했습니다.' : '카메라를 연결하고 있어요. 카메라 사용을 허용해 주세요.')}</p>
      {(status === 'error' || playbackError) && <button type="button" onClick={reconnect}>카메라 다시 연결</button>}
      {ready && hands.status === 'error' && <button type="button" onClick={() => setRetry(value => value + 1)}>손 인식 다시 시작</button>}
    </section>}
    <footer className="camera-play-footer">
      {ready && hands.status !== 'error' && <p role="status">{trackingMessage}</p>}
      <div className="camera-play-actions">
        {!sound.enabled && <button type="button" className="camera-play-sound" onClick={sound.enable}>소리 켜기</button>}
        <button type="button" onClick={() => navigate('/ending')}>연주 마치기</button>
      </div>
      {sound.error && <p role="alert">{sound.error}</p>}
    </footer>
  </main>;
}
