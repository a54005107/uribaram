import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TrumpetPage.css';

export default function TrumpetPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [scale, setScale] = useState(0);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(null);
  const busy = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const blow = () => {
    if (busy.current || count >= 3) return;
    busy.current = true;
    const next = count + 1;
    setCount(next);
    setBurst(Array.from({length: 24}, (_, index) => {
      const angle = (-175 + Math.random() * 155) * Math.PI / 180;
      const distance = 220 + Math.random() * 500;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        fall: 500 + Math.random() * 400,
        size: 22 + Math.random() * 28,
        color: ['#FFEB36', '#FF3364', '#3373ED', '#13BA14', '#FF6CF1'][index % 5],
        rotation: Math.random() * 360,
      };
    }));
    timer.current = setTimeout(() => {
      if (next === 3) {
        navigate('/flag');
      } else {
        setBurst(null);
        busy.current = false;
      }
    }, 1400);
  };

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
    <p className="trumpet-progress" role="status">{count} / 3{count === 3 ? ' · 다음 화면으로 이동합니다' : ''}</p>
    <div className="trumpet-artwork" style={{transform: `scale(${scale})`}}>
      <button
        className="trumpet-instrument"
        aria-label={`나발 불기 (${count} / 3)`}
        aria-disabled={burst !== null || count === 3}
        title="나발을 세 번 눌러주세요"
        onClick={blow}
      >
        <img src="/assets/figma/instruments/trumpet/screen/original.svg" width="1633" height="1572" alt="" draggable="false" />
      </button>
      {burst && <div className="trumpet-sparkles" key={count} aria-hidden="true">
        {burst.map((particle, index) => <i key={index} className="trumpet-sparkle" style={{
          '--burst-x': `${particle.x}px`, '--burst-y': `${particle.y}px`,
          '--fall-y': `${particle.y + particle.fall}px`, '--spin': `${particle.rotation}deg`,
          width: particle.size, height: particle.size, background: particle.color,
        }}/>) }
      </div>}
    </div>
  </main>;
}
