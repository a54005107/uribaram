import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import useHandTracking from '../hooks/useHandTracking';
import usePercussionAudio from '../hooks/usePercussionAudio';
import CameraInstrumentStage from '../components/sticks/CameraInstrumentStage';
import PlayScene from '../components/sticks/PlayScene';
import TrackingDebug from '../components/sticks/TrackingDebug';
import {createPlayLayout, playArtboard} from '../motion/figmaPlayLayout';
import geometry from '../config/playInstrumentGeometry.json';
import {instruments} from './InstrumentsPage';
import './InstrumentPlayPage.css';

export default function InstrumentPlayPage() {
  const [params] = useSearchParams();
  const id = params.get('instrument') || sessionStorage.getItem('uribaram-instrument') || 'janggu';
  const instrument = instruments.find(item => item.id === id) || instruments[1];
  return <CameraPlay instrument={instrument} debug={import.meta.env.DEV && params.get('debug') === 'tracking'}/>;
}

function CameraPlay({instrument, debug}) {
  const navigate = useNavigate();
  const pageRef = useRef(null), videoRef = useRef(null), sceneRef = useRef(null);
  const previousInstrument = useRef(instrument.id);
  const {stream, status, error, start, acquire, release, attach} = useCamera();
  const startRef = useRef(acquire); startRef.current = acquire;
  const [playbackError, setPlaybackError] = useState('');
  const [retry, setRetry] = useState(0);
  const [viewport, setViewport] = useState({width: window.innerWidth, height: window.innerHeight});
  const ready = status === 'ready' && Boolean(stream) && !playbackError;
  const streamKey = useMemo(() => ({stream, retry}), [stream, retry]);
  const hands = useHandTracking(videoRef, ready, undefined, streamKey, debug);
  const sound = usePercussionAudio(instrument.id);
  const layout = useMemo(() => createPlayLayout(instrument.id, geometry[instrument.id], viewport.width, viewport.height), [instrument.id, viewport]);
  const board = playArtboard(viewport.width, viewport.height);
  const boardStyle = {'--board-left': `${board.left}px`, '--board-top': `${board.top}px`, '--board-scale': board.scale};

  useEffect(() => {
    if (previousInstrument.current === instrument.id) return;
    previousInstrument.current = instrument.id;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animations = Array.from(pageRef.current.querySelectorAll('.camera-play-instrument')).map(node =>
      node.animate([{opacity: .3, scale: '.97'}, {opacity: 1, scale: '1'}],
        {duration: 240, easing: 'ease-out'}));
    return () => animations.forEach(animation => animation.cancel());
  }, [instrument.id]);

  useEffect(() => {
    void startRef.current();
    return () => release();
  }, [release]);
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
    : hasGrip ? (instrument.id === 'janggu' ? '양손의 채 끝으로 장구를 치면 소리가 나요' : '채 하나의 윗부분 끝으로 악기를 치면 소리가 나요')
    : hands.status === 'tracking' ? (instrument.id === 'janggu' ? '주먹을 쥐면 채가 나타나요. 손을 펴면 놓을 수 있어요' : '한 손을 쥐면 채가 나타나요. 손을 펴면 다른 손으로 잡을 수 있어요')
    : instrument.id === 'janggu' ? '양손이 보이도록 한 걸음 물러서 주세요' : '연주할 손이 카메라에 보이도록 한 걸음 물러서 주세요';
  const choose = id => {
    if (id === instrument.id) return;
    sessionStorage.setItem('uribaram-instrument', id);
    navigate(`/experience?instrument=${id}${debug ? '&debug=tracking' : ''}`, {replace: true});
  };
  const flags = ['734c1', '23616', '2e689', '6f838', 'af236'];
  return <main ref={pageRef} className="page camera-play-page illustrated-play-page" aria-label={`${instrument.name} 카메라 연주`}
    onPointerDown={() => { if (!sound.enabled) void sound.enable(); }}>
    <video ref={videoRef} className="camera-play-video" autoPlay muted playsInline aria-hidden="true" />
    <PlayScene ref={sceneRef} width={viewport.width} height={viewport.height}/>
    <header className="play-design-board play-navigation" style={boardStyle}>
      <nav aria-label="연주할 악기">
        {instruments.map((item, index) => <button key={item.id} type="button" className="play-pennant"
          style={{'--pennant-left': `${2240 * [.0482, .1147, .1813, .2478, .3143][index]}px`}}
          aria-label={`${item.name} 연주`} aria-pressed={item.id === instrument.id} onClick={() => choose(item.id)}>
          <img src={`/assets/figma/play-instrument/${flags[index]}-blank.svg`} alt="" draggable="false"/>
          <span className={item.role.length === 4 ? 'play-pennant-four' : undefined}>{item.role}</span>
        </button>)}
      </nav>
      <button type="button" className="play-pennant" style={{'--pennant-left': `${2240 * .8799}px`}} onClick={() => navigate('/ending')}>
        <img src="/assets/figma/play-instrument/46c49-blank.svg" alt="" draggable="false"/>
        <span>마치기</span>
      </button>
    </header>
    <CameraInstrumentStage instrument={instrument} layout={layout} videoRef={videoRef} samplesRef={hands.samplesRef}
      debug={debug} diagnosticsRef={hands.diagnosticsRef}
      enabled={ready && (hands.status === 'tracking' || hands.status === 'searching')}
      onHit={hit => { sound.strike(hit); sceneRef.current?.strike(hit); }} />
    {(!ready || hands.status === 'error') && <section className="camera-play-notice" role={status === 'error' || playbackError || hands.status === 'error' ? 'alert' : 'status'}>
      <p>{error || playbackError || (hands.status === 'error' ? '손 움직임 인식을 시작하지 못했습니다.' : '카메라를 연결하고 있어요. 카메라 사용을 허용해 주세요.')}</p>
      {(status === 'error' || playbackError) && <button type="button" disabled={status === 'loading'} onClick={reconnect}>카메라 다시 연결</button>}
      {ready && hands.status === 'error' && <button type="button" onClick={() => setRetry(value => value + 1)}>손 인식 다시 시작</button>}
    </section>}
    <footer className="play-design-board camera-play-footer" style={boardStyle}>
      <p className="play-instruction">손을 움직여 악기를 연주해 보세요</p>
      <p className="play-assistive-status" role="status">{trackingMessage}</p>
    </footer>
    <details className="play-options">
      <summary>연주 설정</summary>
      <p>{trackingMessage}</p>
      <button type="button" onClick={() => navigate('/instruments')}>악기 고르기로</button>
      <button type="button" onClick={() => navigate(`/camera?instrument=${instrument.id}`)}>카메라 변경</button>
      {!sound.enabled && <button type="button" onClick={sound.enable}>소리 켜기</button>}
      {sound.error && <p role="alert">{sound.error}</p>}
    </details>
    {!sound.enabled && <button type="button" className="play-enable-sound" onClick={sound.enable}>화면을 눌러 소리를 켜 주세요</button>}
    {debug && <TrackingDebug diagnosticsRef={hands.diagnosticsRef} samplesRef={hands.samplesRef}/>}
  </main>;
}
