import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import FlagWord from '../components/FlagWord';
import '../../public/assets/figma/styles/tokens.css';
import './FlagPage.css';

export default function FlagPage() {
  const navigate = useNavigate();
  const [color, setColor] = useState(() => {
    const saved = sessionStorage.getItem('uribaram-flag-color');
    return ['red', 'yellow', 'blue'].includes(saved) ? saved : 'red';
  });
  const [scale, setScale] = useState(0);
  const pageRef = useRef(null);
  useEffect(() => {
    sessionStorage.removeItem('uribaram-flag-message');
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.height / 1260, entry.contentRect.width / 900));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  return <main ref={pageRef} className="page flag-page" aria-label="우리바람 깃발">
    <form className="flag-form" onSubmit={event => {
      event.preventDefault();
      sessionStorage.setItem('uribaram-flag-color', color);
      navigate('/loading');
    }}>
      <div className="flag-controls">
        <p>우리바람을 함께 담아 볼까요?<br/>깃발의 색을 골라 보세요</p>
        <div className="flag-colors" role="group" aria-label="깃발 색상">
          {[['red', '빨강'], ['yellow', '노랑'], ['blue', '파랑']].map(([value, label]) =>
            <button key={value} type="button" aria-label={label} aria-pressed={color === value} onClick={() => setColor(value)}>
              <span><img src={'/assets/figma/ui/flag-colors/' + value + '.svg'} width="54" height="52" alt="" /></span>
            </button>)}
        </div>
      </div>
      <div className="flag-stage" style={{transform: 'translate(-50%, -50%) scale(' + scale + ')'}}>
        <img className="flag-input-pole" src="/assets/figma/flag/pole/input-screen/original.svg" width="426" height="1524" alt="" />
        <img className="flag-input-cloth" src={'/assets/figma/flag/input/' + (color === 'red' ? 'screen' : color) + '/original.svg'} width="580" height="1062" alt="" />
        <FlagWord className="flag-word-art"/>
      </div>
      <button className="flag-submit" type="submit">바람 담기</button>
    </form>
  </main>;
}
