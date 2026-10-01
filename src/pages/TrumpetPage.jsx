import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TrumpetPage.css';

export default function TrumpetPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setScale(Math.min(height / 1260, width / 1260));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  return <main ref={pageRef} className="trumpet-page" aria-label="나발 체험">
    <p className="trumpet-instruction">나발을 세 번 불어<br />풍물패를 불러봐요</p>
    <div className="trumpet-artwork" style={{transform: `scale(${scale})`}}>
      <button
        className="trumpet-instrument"
        aria-label="깃발 문구 입력으로 이동"
        title="나발을 눌러 다음으로"
        onClick={() => navigate('/flag')}
      >
        <img src="/assets/figma/instruments/trumpet/screen/original.svg" width="1633" height="1572" alt="" draggable="false" />
      </button>
    </div>
  </main>;
}
