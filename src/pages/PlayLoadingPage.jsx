import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {instruments} from './InstrumentsPage';
import {useCamera} from '../camera/CameraProvider';
import '../../public/assets/figma/styles/tokens.css';
import './PlayLoadingPage.css';
import FlagWord from '../components/FlagWord';

const DURATION_MS = 6933;
const ASSETS = '/assets/figma/play-loading';
// Figma 2145:5623: all three dots share the same 6.933-second timeline.
const DOT_OFFSETS = [
  [0, .0173, .0433, .075, .2337, .2596, .2914, .45, .476, .5077, 1],
  [0, .0462, .0721, .1039, .2625, .2885, .3202, .4789, .5048, .5366, 1],
  [0, .075, .101, .1327, .2914, .3173, .3491, .5077, .5337, .5654, 1],
];
const DOT_Y = [0, 0, -10, 0, 0, -10, 0, 0, -10, 0, 0];
const DOT_EASING = ['linear', 'ease-out', 'ease-in', 'linear', 'ease-out', 'ease-in', 'linear', 'ease-out', 'ease-in', 'linear', 'linear'];

export default function PlayLoadingPage() {
  const navigate = useNavigate();
  const {acquire, release} = useCamera();
  const acquireRef = useRef(acquire);
  acquireRef.current = acquire;
  const [params] = useSearchParams();
  const requested = params.get('instrument') || sessionStorage.getItem('uribaram-instrument');
  const instrument = instruments.find(item => item.id === requested) || instruments[1];
  const pageRef = useRef(null);
  const fillRef = useRef(null);
  const dotsRef = useRef([]);
  const [scale, setScale] = useState(0);

  // Keep the selected camera alive between setup and performance. Reuse the
  // existing session rather than releasing and reopening the device.
  useEffect(() => {
    void acquireRef.current();
    return () => release();
  }, [release]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / 2240, entry.contentRect.height / 1260));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animations = [];
    if (!reducedMotion) {
      // Reveal the ink, not the text position: the lowest letter fills first.
      animations.push(fillRef.current.animate([
        {clipPath: 'inset(100% 0 0 0)', offset: 0},
        {clipPath: 'inset(0% 0 0 0)', offset: .577},
        {clipPath: 'inset(0% 0 0 0)', offset: 1},
      ], {duration: DURATION_MS, easing: 'linear', fill: 'both'}));
      dotsRef.current.forEach((dot, index) => animations.push(dot.animate(
        DOT_OFFSETS[index].map((offset, frame) => ({offset, transform: `translateY(${DOT_Y[frame]}px)`, easing: DOT_EASING[frame]})),
        {duration: DURATION_MS, fill: 'both'},
      )));
    }
    const timer = window.setTimeout(() => {
      navigate(`/experience?instrument=${instrument.id}`, {replace: true});
    }, reducedMotion ? 1500 : DURATION_MS);
    return () => { window.clearTimeout(timer); animations.forEach(animation => animation.cancel()); };
  }, [instrument.id, navigate]);

  const letters = <FlagWord/>;
  return <main className="page play-loading-page" ref={pageRef} aria-label={`${instrument.name} 연주 준비`}>
    <div className="play-loading-stage" style={{transform: `translate(-50%, -50%) scale(${scale})`}}>
      <img className="play-loading-pole" src={`${ASSETS}/pole.svg`} width="327.557" height="1172.18" alt="" />
      <img className="play-loading-cloth" src={`${ASSETS}/cloth.svg`} width="446.059" height="816.306" alt="" />
      <div className="play-loading-writing" role="img" aria-label="우리바람">
        <div className="play-loading-letters play-loading-letters--empty" aria-hidden="true">{letters}</div>
        <div ref={fillRef} className="play-loading-letters play-loading-letters--filled" aria-hidden="true">{letters}</div>
      </div>
      <div className="play-loading-caption" role="status" aria-label="당신의 바람을 울릴 준비 중이에요">
        <img src={`${ASSETS}/caption.svg`} width="516.587" height="32.22" alt="당신의 바람을 울릴 준비 중이에요" />
        <div className="play-loading-dots" aria-hidden="true">
          {[0, 1, 2].map(index => <img key={index} ref={element => { dotsRef.current[index] = element; }} src={`${ASSETS}/dot.svg`} width="6.40802" height="6.12" alt="" />)}
        </div>
      </div>
    </div>
  </main>;
}
