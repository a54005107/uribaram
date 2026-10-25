import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {flagWishes, savedFlagWish} from '../config/flagWishes';
import '../../public/assets/figma/styles/tokens.css';
import './FlagPage.css';
export default function FlagPage() {
  const navigate = useNavigate(), pageRef = useRef(null);
  const [color, setColor] = useState(() => ['red','yellow','blue'].includes(sessionStorage.getItem('uribaram-flag-color')) ? sessionStorage.getItem('uribaram-flag-color') : 'red');
  const [wish, setWish] = useState(savedFlagWish), [scale,setScale] = useState(0);
  useEffect(() => {const observer = new ResizeObserver(([e]) => setScale(Math.min(e.contentRect.width/2240,e.contentRect.height/1260)));observer.observe(pageRef.current);return () => observer.disconnect();}, []);
  return <main ref={pageRef} className="page flag-page" aria-label="농기에 바람 담기">
    <form className="flag-form" style={{transform:`translate(-50%, -50%) scale(${scale})`}} onSubmit={e => {e.preventDefault();sessionStorage.setItem('uribaram-flag-color',color);sessionStorage.setItem('uribaram-flag-wish',wish[0]);navigate('/loading');}}>
      <button className="flag-back" type="button" aria-label="이전 페이지" onClick={()=>navigate('/trumpet')}>‹</button>
      <img className="flag-input-pole" src="/assets/figma/flag/pole/input-screen/original.svg" width="426" height="1524" alt=""/>
      <img className="flag-input-cloth" src={`/assets/figma/flag/input/${color === 'red' ? 'screen' : color}/original.svg`} width="580" height="1062" alt=""/>
      <img className="flag-wish-art" src={`/assets/figma/oct23/${wish[1]}.svg`} width="231.709" height="724.838" alt={wish[0]}/>
      <p className="flag-prompt">어떤 바람을 이루고 싶나요?<br/>한 가지 바람을 선택해주세요</p>
      <div className="flag-wishes" role="group" aria-label="바람 문구">{flagWishes.map(item => <button type="button" key={item[0]} aria-pressed={wish[0] === item[0]} onClick={() => setWish(item)}>{item[0]}</button>)}</div>
      <div className="flag-colors" role="group" aria-label="깃발 색상">{[['red','빨강'],['yellow','노랑'],['blue','파랑']].map(([value,label]) => <button type="button" key={value} aria-label={label} aria-pressed={color===value} onClick={() => setColor(value)}><img src={`/assets/figma/ui/flag-colors/${value}.svg`} width="54" height="52" alt=""/></button>)}</div>
      <button className="flag-submit" type="submit">바람 담기</button>
    </form>
  </main>;
}
