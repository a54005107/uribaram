import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {flagWishes, savedFlagWish} from '../config/flagWishes';
import '../../public/assets/figma/styles/tokens.css';
import './FlagPage.css';
export default function FlagPage() {
  const navigate = useNavigate(), pageRef = useRef(null);
  const [color, setColor] = useState(() => ['red','yellow','blue'].includes(sessionStorage.getItem('uribaram-flag-color')) ? sessionStorage.getItem('uribaram-flag-color') : 'red');
  const [wish, setWish] = useState(savedFlagWish), [scale,setScale] = useState(0);
  useEffect(() => {const observer = new ResizeObserver(([e]) => setScale(Math.min(e.contentRect.width/2560,e.contentRect.height/1440)));observer.observe(pageRef.current);return () => observer.disconnect();}, []);
  const cycleColor = step => setColor(current => ['red','blue','yellow'][(['red','blue','yellow'].indexOf(current)+step+3)%3]);
  const wishes = ['우리바람','시험합격','운수대통','연애성공','취업성공','백년해로','부귀영화','무사졸업','무병장수','만사형통'].map(name => flagWishes.find(item=>item[0]===name));
  return <main ref={pageRef} className="page flag-page" aria-label="농기에 바람 담기">
    <form className="flag-form" style={{transform:`translate(-50%, -50%) scale(${scale})`}} onSubmit={e => {e.preventDefault();sessionStorage.setItem('uribaram-flag-color',color);sessionStorage.setItem('uribaram-flag-wish',wish[0]);navigate('/loading');}}>
      <button className="flag-back" type="button" aria-label="이전 페이지" onClick={()=>navigate('/trumpet')}>‹</button>
      <img className="flag-input-pole" src="/assets/figma/oct28/d92b9.svg" width="553.801" height="1432.372" alt=""/>
      {[[1688.42,-43.91,83.122,128.337,18.999,134.538,-43.18,-12.19,-.98,'bf867'],[1718.73,-69.41,55.267,143.06,17.871,141.228,-24.15,-8.14,-.99,'07104'],[1753.25,-71.37,27.2,145.549,17.36,144.027,6.17,2.21,-1,'648e4'],[1755.89,-57.64,61.659,140.981,18.074,140.077,28.37,9.3,-.99,'6bc3e']].map(([x,y,w,h,iw,ih,r,sk,s,file])=><div key={file} className="flag-tassel" style={{left:x,top:y,width:w,height:h}}><img src={`/assets/figma/oct28/${file}.svg`} width={iw} height={ih} alt="" style={{transform:`rotate(${r}deg) skewX(${sk}deg) scaleY(${s})`}}/></div>)}
      <img className="flag-input-cloth" src={`/assets/figma/flag/input/${color === 'red' ? 'screen' : color}/original.svg`} width="580" height="1062" alt=""/>
      <img className="flag-wish-art" src={`/assets/figma/oct23/${wish[1]}.svg`} width="231.709" height="724.838" alt={wish[0]}/>
      <p className="flag-prompt">어떤 바람을 이루고 싶나요?<br/>한 가지 바람을 선택해주세요</p>
      <p className="flag-hint">준비가 되었다면 농기를 클릭하세요</p>
      <div className="flag-wishes" role="group" aria-label="바람 문구">{wishes.map(item => <button type="button" key={item[0]} aria-pressed={wish[0] === item[0]} onClick={() => setWish(item)}>{item[0]}</button>)}</div>
      <button className="flag-color-arrow flag-color-prev" type="button" aria-label="이전 농기 색상" onClick={()=>cycleColor(-1)}><img src="/assets/figma/oct28/54a6d.svg" width="54" height="52" alt=""/></button>
      <button className="flag-color-arrow flag-color-next" type="button" aria-label="다음 농기 색상" onClick={()=>cycleColor(1)}><img src="/assets/figma/oct28/e8b69.svg" width="54" height="52" alt=""/></button>
      <button className="flag-submit" type="submit" aria-label={`${wish[0]} 농기를 선택하고 다음으로`}/>
    </form>
  </main>;
}
