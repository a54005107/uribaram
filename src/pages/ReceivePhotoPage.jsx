import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {receivePhoto} from '../camera/photoTransfer';
import './PhotoPage.css';
import './ReceivePhotoPage.css';

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
  return <ReceivePhotoView url={url} state={state}/>;
}

export function ReceivePhotoView({url,state}) {
  const ref=useRef(null),[scale,setScale]=useState(1);
  useEffect(()=>{const observer=new ResizeObserver(([{contentRect:r}])=>setScale(Math.min(r.width/402,r.height/874)));
    observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <main ref={ref} className="photo-phone-page" aria-label="우리바람 사진 저장">
    <div className="photo-phone-board" style={{transform:`translate(-50%,-50%) scale(${scale})`}}>
      <div className="photo-phone-logo"><img src="/assets/figma/oct28/b9168.svg" width="703" height="235" alt="우리바람"/></div>
      <div className="photo-phone-image">{url&&<img src={url} alt="상모 체험 사진"/>}</div>
      {url?<>
        <a className="photo-phone-save" href={url} download="우리바람.jpg"><img src="/assets/figma/oct28/db326.svg" width="117.164" height="18.161" alt="사진 저장하기"/></a>
        <img className="photo-phone-caption" src="/assets/figma/oct28/9d5a2.svg" width="91.728" height="7.334" alt="저장 후 화면을 닫아 주세요"/>
      </>:<div className="photo-phone-status" role="status"><p>{state.status==='error'?state.message||'QR 주소가 올바르지 않아요. 촬영 화면에서 새 QR을 만들어 주세요.':'사진을 받고 있어요. 촬영 화면을 열어 두세요.'}</p>{state.code&&<small>오류 코드: {state.code}</small>}</div>}
    </div>
  </main>;
}
