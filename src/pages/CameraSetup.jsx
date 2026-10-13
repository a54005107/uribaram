import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import {instruments} from './InstrumentsPage';
import './InstrumentPlayPage.css';
import './CameraSetup.css';

export default function CameraSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = params.get('instrument') || sessionStorage.getItem('uribaram-instrument');
  const instrument = instruments.find(item => item.id === requested) || instruments[1];
  const {stream, status, error, devices, deviceId, start, acquire, release, attach, selectDevice} = useCamera();
  const videoRef = useRef(null), startRef = useRef(acquire);
  startRef.current = acquire;
  const [playbackError, setPlaybackError] = useState('');
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    void startRef.current();
    return () => release();
  }, [release]);
  useEffect(() => {
    setPreviewReady(false);
    setPlaybackError('');
    if (!stream) return;
    let cancelled = false;
    attach(videoRef.current).then(() => {
      if (!cancelled) setPreviewReady(true);
    }).catch(() => {
      if (!cancelled) setPlaybackError('미리보기를 재생하지 못했어요. 다시 연결해 주세요.');
    });
    return () => { cancelled = true; };
  }, [stream, attach]);

  const connect = async (id) => {
    setPreviewReady(false);
    setPlaybackError('');
    await selectDevice(id, false);
    await start(id);
  };
  const ready = status === 'ready' && previewReady && !playbackError;
  return <main className="page camera-play-page camera-setup-page" aria-label="연주 카메라 선택">
    <header className="camera-play-header">
      <button type="button" onClick={() => navigate('/instruments')}>← 악기 고르기</button>
      <span>{instrument.name} 연주 준비</span>
    </header>
    <section className="camera-setup-content">
      <div className="camera-setup-heading">
        <p>연주 준비</p>
        <h1>나를 비추는 카메라를 골라 주세요</h1>
        <p>화면에 얼굴과 양손이 보이면 준비 완료!</p>
      </div>
      <div className="camera-setup-preview" aria-busy={status === 'loading'}>
        <video ref={videoRef} autoPlay muted playsInline aria-label="선택한 카메라 미리보기" />
        {!ready && <div className="camera-setup-status" role={error || playbackError ? 'alert' : 'status'}>
          {error || playbackError || '카메라를 연결하고 있어요. 카메라 사용을 허용해 주세요.'}
        </div>}
        {ready && <span className="camera-setup-live">● 미리보기</span>}
      </div>
      <div className="camera-setup-controls">
        <label htmlFor="play-camera">사용할 카메라</label>
        <div className="camera-setup-device-row">
          <select id="play-camera" value={deviceId} disabled={status === 'loading'} onChange={event => void connect(event.target.value)}>
            <option value="">기본 카메라</option>
            {devices.filter(device => device.deviceId).map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `카메라 ${index + 1}`}</option>)}
          </select>
          <button type="button" disabled={status === 'loading'} onClick={() => void connect(deviceId)}>다시 연결</button>
        </div>
        <p className="camera-setup-help">차단 그림이 보이면 다른 카메라를 선택하거나 카메라 덮개와 프라이버시 모드를 확인해 주세요.</p>
        <button type="button" className="camera-play-sound camera-setup-start" disabled={!ready} onClick={() => navigate(`/play-loading?instrument=${instrument.id}`)}>이 카메라로 연주하기 →</button>
      </div>
    </section>
  </main>;
}
