import React, {useEffect, useRef, useState} from 'react';
import './PhotoResult.css';
const assets='/assets/figma/oct28/';
export default function PhotoResult({photoUrl,sharing,qr,transfer,onShare,onRetake,onClose}) {
 const ref=useRef(null),[scale,setScale]=useState(1);
 useEffect(()=>{const observer=new ResizeObserver(([{contentRect:r}])=>setScale(Math.min(r.width/2200,r.height/1100)));
  observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const message=transfer.message||{connecting:'QR 연결 준비 중…',ready:'5분 안에 QR을 스캔해 주세요. 받을 때까지 이 화면을 열어 두세요.',sending:'사진을 보내고 있어요…',sent:'전송 완료! 사진을 휴대폰에 저장해 주세요.',expired:'QR이 만료됐어요. 닫은 뒤 다시 열어 주세요.',closed:'연결이 종료됐어요. 닫은 뒤 다시 열어 주세요.',error:'사진을 보내지 못했어요. 사진 저장을 이용해 주세요.'}[transfer.status]||'';
 return <section ref={ref} className="photo-result-scene" aria-label="촬영한 사진">
  <div className={`photo-result-stage${sharing?' is-sharing':''}`} style={{transform:`translate(-50%,-50%) scale(${scale})`}}>
   <aside className="photo-share-panel" id="photo-share-panel" aria-label="휴대폰으로 사진 받기" inert={!sharing||undefined} aria-hidden={!sharing}>
    <div className="photo-share-content">
     {qr?<img className="photo-share-qr" src={qr} width="280" height="280" alt="휴대폰 사진 수신 QR 코드"/>:<div className="photo-share-placeholder" aria-hidden="true"/>}
     <span className="photo-share-status" role="status">{message}</span>
    </div>
   </aside>
   <div className="photo-memory-card">
    <img className="photo-memory-image" src={photoUrl||undefined} alt="촬영한 우리바람 사진"/>
    <img className="photo-memory-title" src={assets+'7f8e1.svg'} width="284.353" height="49.064" alt="얼씨구 좋다!"/>
    <button className="photo-memory-qr" onClick={sharing?onClose:onShare} aria-expanded={sharing} aria-controls="photo-share-panel"><img src={assets+'d4690.svg'} width="203.453" height="31.4" alt="QR로 간직하기"/></button>
    <button className="photo-memory-retake" onClick={onRetake}><img src={assets+'9e63b.svg'} width="163.536" height="27.887" alt="다시 찍기"/></button>
   </div>
   {sharing&&transfer.status==='error'&&<p className="photo-share-error" role="alert">QR 연결을 준비하지 못했어요. <a href={photoUrl||undefined} download="우리바람.jpg">사진 저장</a></p>}
  </div>
 </section>;
}
