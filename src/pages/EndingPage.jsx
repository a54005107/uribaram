import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import './EndingPage.css';
import FlagWord from '../components/FlagWord';

export default function EndingPage() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  const pageRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => { stop(); }, [stop]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 2240, entry.contentRect.height / 1260)));
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  return <main ref={pageRef} className="page ending-page" aria-label="우리바람 연주 마무리">
    <div className="ending-board" style={{'--ending-scale': scale}}>
      <div className="ending-flag">
      <img className="ending-pole" src="/assets/figma/ending/pole.svg" width="425.793" height="1523.72" alt=""/>
      <img className="ending-cloth" src="/assets/figma/ending/cloth.svg" width="579.833" height="1061.12" alt=""/>
      <FlagWord className="ending-word-art"/>
      </div>
      <section className="ending-copy">
        <h1>우리 바람,소리 타고 저 멀리.<br/>한바탕 함께 울려보았나요?</h1>
        <button className="ending-story-link" onClick={() => navigate('/story')}>이제 이 소리에 담긴 이야기를 알아 볼까요? &gt;</button>
      </section>
      <button className="ending-photo-link" onClick={() => navigate('/photo')}>상모 쓰고 사진 찍기 ↗</button>
    </div>
  </main>;
}
