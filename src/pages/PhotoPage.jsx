import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import QRCode from 'qrcode';
import {useCamera} from '../camera/CameraProvider';
import usePhotoHeadwear from '../hooks/usePhotoHeadwear';
import {offerPhoto} from '../camera/photoTransfer';
import './PhotoPage.css';

export default function PhotoPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [board,setBoard] = useState({scale:1,left:0,top:0});
  useEffect(()=>{const observer=new ResizeObserver(([e])=>{const {width,height}=e.contentRect;const scale=Math.min(width/2240,height/1260);setBoard({scale,left:(width-2240*scale)/2,top:(height-1260*scale)/2});});observer.observe(pageRef.current);return()=>observer.disconnect();},[]);
  const {stream, status, error, acquire, release, attach, start, devices, deviceId, selectDevice} = useCamera();
  const videoRef = useRef(null), canvasRef = useRef(null), acquireRef = useRef(acquire);
  acquireRef.current = acquire;
  const alive = useRef(true), busy = useRef(false);
  const [kind, setKind] = useState('sangmo'), [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(''), [photo, setPhoto] = useState(null), [photoUrl, setPhotoUrl] = useState('');
  const [transfer, setTransfer] = useState({status: 'idle'}), [sharing, setSharing] = useState(false), [qr, setQr] = useState('');
  const headStatus = usePhotoHeadwear(videoRef, canvasRef, ready && !photo, kind);
  useEffect(() => {
    alive.current = true; void acquireRef.current();
    return () => { alive.current = false; release(); };
  }, [release]);
  useEffect(() => {
    let cancelled = false; setReady(false);
    if (stream) attach(videoRef.current).then(() => { if (!cancelled) setReady(true); })
      .catch(() => { if (!cancelled) setNotice('영상을 재생하지 못했어요. 다시 연결해 주세요.'); });
    return () => { cancelled = true; };
  }, [stream, attach]);
  useEffect(() => {
    if (!photo) { setPhotoUrl(''); return; }
    const url = URL.createObjectURL(photo); setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!photo || !sharing) return;
    setTransfer({status: 'connecting'});
    return offerPhoto(photo, setTransfer);
  }, [photo, sharing]);
  useEffect(() => {
    let cancelled = false; setQr('');
    if (transfer.status === 'ready') QRCode.toDataURL(transfer.url, {width: 280, margin: 4, errorCorrectionLevel: 'M'})
      .then(url => { if (!cancelled) setQr(url); }).catch(() => { if (!cancelled) setNotice('QR을 만들지 못했어요. 사진 저장을 이용해 주세요.'); });
    return () => { cancelled = true; };
  }, [transfer]);
  const capture = () => {
    if (!ready || photo || busy.current || !canvasRef.current?.width) return;
    busy.current = true;
    canvasRef.current.toBlob(blob => {
      busy.current = false;
      if (!alive.current) return;
      if (blob) { setPhoto(blob); setNotice(''); }
      else setNotice('촬영하지 못했어요. 다시 눌러 주세요.');
    }, 'image/jpeg', .9);
  };
  return <main ref={pageRef} className="photo-page" aria-label="상모와 고깔 사진 촬영">
    <video ref={videoRef} autoPlay playsInline muted className="photo-source" aria-hidden="true"/>
    <canvas ref={canvasRef} className="photo-preview" aria-label="상모 체험 카메라"/>
    {!photo && <>
      <div className="photo-design-board" style={{left:board.left,top:board.top,transform:`scale(${board.scale})`}}>
        <button className="photo-back" onClick={()=>navigate('/ending')} aria-label="이전 페이지">‹</button>
        <button className="photo-hat-choice photo-gokkal" onClick={()=>setKind('gokkal')} aria-label="고깔 선택" aria-pressed={kind==='gokkal'}><img src="/assets/figma/feedback/gokkal.svg" alt=""/></button>
        <button className="photo-hat-choice photo-sangmo" onClick={()=>setKind('sangmo')} aria-label="상모 선택" aria-pressed={kind==='sangmo'}><img src="/assets/figma/feedback/sangmo.svg" alt=""/></button>
        <button className="photo-shutter" onClick={capture} disabled={!ready} aria-label="사진 찍기"><img src="/assets/figma/feedback/shutter.svg" alt=""/></button>
      </div>
      <p className="photo-tracking-status" role="status">{headStatus==='loading'?'상모를 준비하고 있어요…':headStatus==='error'?'상모 인식을 시작하지 못했어요. 사진 촬영은 할 수 있어요.':''}</p>
      <details className="photo-camera-controls" open={status==='error'||undefined}>
        <summary>카메라 설정</summary>
        <label>카메라 <select value={deviceId} onChange={event=>{setReady(false);void selectDevice(event.target.value);}}>{devices.map(device=><option key={device.deviceId} value={device.deviceId}>{device.label||'카메라'}</option>)}</select></label>
        <button onClick={()=>{setNotice('');void start();}}>다시 연결</button>
        <p role="status">{error||notice||(status==='loading'?'카메라 연결 중…':'')}</p>
      </details>
    </>}
    {photo && <section className="photo-result" aria-label="촬영한 사진">
      <img className="photo-result-image" src={photoUrl || undefined} alt="촬영한 우리바람 사진"/>
      <div><h2>우리의 순간을 간직해요</h2>
        <a href={photoUrl || undefined} download="우리바람.jpg">사진 저장</a>
        <button onClick={() => { setSharing(false); setTransfer({status: 'idle'}); setPhoto(null); }}>다시 찍기</button>
        {!sharing && <button onClick={() => setSharing(true)}>휴대폰으로 받기 (QR)</button>}
        {qr && <img className="photo-qr" src={qr} width="280" height="280" alt="휴대폰 사진 수신 QR 코드"/>}
        {transfer.localNetwork && <p>PC와 휴대폰을 같은 Wi-Fi에 연결한 뒤 QR을 스캔해 주세요.</p>}
        <p role="status">{transfer.message || {idle: '', connecting: 'QR 연결 준비 중…', ready: '5분 안에 QR을 스캔해 주세요. 받을 때까지 이 화면을 열어 두세요.', sending: '사진을 보내고 있어요…', sent: '전송 완료! 이 QR은 다시 사용할 수 없어요.', expired: 'QR이 만료됐어요.', closed: '연결이 종료됐어요.', error: '직접 연결하지 못했어요. 같은 Wi-Fi에서 다시 시도하거나 사진 저장을 이용해 주세요.'}[transfer.status]}</p>
        {transfer.code && <p>오류 코드: {transfer.code}</p>}
        {sharing && ['error', 'expired', 'closed', 'sent'].includes(transfer.status) && <button onClick={() => { setSharing(false); setTransfer({status: 'idle'}); }}>QR 닫기</button>}
      </div>
    </section>}
  </main>;
}
