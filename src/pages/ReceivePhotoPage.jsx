import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {receivePhoto} from '../camera/photoTransfer';
import './PhotoPage.css';

export default function ReceivePhotoPage() {
  const {hash} = useLocation();
  const [state, setState] = useState({status: 'connecting'});
  const [url, setUrl] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(hash.slice(1));
    if (!params.get('photo') || !params.get('token')) { setState({status: 'error'}); return; }
    return receivePhoto(params.get('photo'), params.get('token'), setState);
  }, [hash]);
  useEffect(() => {
    if (!state.blob) return;
    const next = URL.createObjectURL(state.blob); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [state.blob]);
  return <main className="photo-receive">
    <h1>우리바람 사진</h1>
    {url ? <><img src={url} alt="상모 체험 사진"/><a href={url} download="우리바람.jpg">사진 저장하기</a>
      <p>저장 후 이 화면을 닫아 주세요.</p></>
      : <p role="status">{state.status === 'error' ? '사진을 연결하지 못했어요. QR이 만료되었거나 네트워크에서 연결을 막고 있어요. 촬영 화면에서 QR을 다시 만들어 주세요.' : '사진을 받고 있어요. 촬영한 컴퓨터의 화면을 열어 두세요.'}</p>}
  </main>;
}
