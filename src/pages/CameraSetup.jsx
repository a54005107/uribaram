import React, {useEffect, useRef} from 'react';
import {ArrowLeft, ArrowRight, Camera, Check, ChevronDown, LoaderCircle, RefreshCw} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';

export default function CameraSetup() {
  const navigate = useNavigate(), videoRef = useRef(null);
  const {status, error, devices, deviceId, info, stream, start, selectDevice, attach} = useCamera();

  useEffect(() => { if (stream && videoRef.current) attach(videoRef.current); }, [stream, attach]);
  const changeCamera = (event) => selectDevice(event.target.value, true);
  const resolution = info?.width && info?.height ? `${info.width} × ${info.height}` : '';

  return <main className="setup-page">
    <header className="minimal-bar"><button onClick={() => navigate('/')}><ArrowLeft/> 처음으로</button><b>카메라 확인</b><span/></header>
    <section className="setup-content">
      <div className="setup-copy"><span>STEP 1</span><h1>사용할 카메라를 선택해주세요</h1><p>카메라가 여러 개라면 목록에서 내 모습이 보이는 장치를 선택할 수 있습니다.</p></div>
      <label className="camera-selector"><span>카메라 장치</span><div><select value={deviceId} onChange={changeCamera} disabled={status === 'loading'}><option value="">기본 카메라</option>{devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `카메라 ${index + 1}`}</option>)}</select><ChevronDown/></div></label>
      <div className={'camera-card ' + (status === 'ready' ? 'live' : '')}>
        <video ref={videoRef} autoPlay muted playsInline/>
        {status !== 'ready' && <div className="camera-placeholder">{status === 'loading' ? <LoaderCircle className="spin"/> : <Camera/>}<b>{status === 'loading' ? '선택한 카메라 연결 중…' : '카메라가 꺼져 있습니다'}</b></div>}
        {status === 'ready' && <div className="camera-guide"><i/><span>얼굴과 상체를 이 영역에 맞춰주세요</span></div>}
        {status === 'ready' && <small className="camera-info"><Check/> {info?.label || '카메라 연결됨'} {resolution && `· ${resolution}`}</small>}
      </div>
      {error && <div className="inline-error">{error}</div>}
      {status !== 'ready' ? <button className="primary-button setup-action" disabled={status === 'loading'} onClick={() => start()}>{status === 'error' ? <RefreshCw/> : <Camera/>}{status === 'error' ? '선택한 카메라로 다시 연결' : '선택한 카메라 켜기'}</button> : <button className="primary-button setup-action" onClick={() => navigate('/experience')}>이 카메라로 얼굴 인식 <ArrowRight/></button>}
    </section>
  </main>;
}
