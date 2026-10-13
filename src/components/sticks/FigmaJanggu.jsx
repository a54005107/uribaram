import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import parts from '../../config/figmaPlayJanggu.json';
import {JANGGU} from '../../motion/figmaPlayLayout';
import './FigmaJanggu.css';

const FigmaJanggu = forwardRef(function FigmaJanggu({layout}, ref) {
  const elements = useRef([]), animations = useRef([]);
  const cancel = () => { animations.current.forEach(animation => animation.cancel()); animations.current = []; };
  useEffect(() => cancel, []);
  useImperativeHandle(ref, () => ({strike(hit) {
    cancel();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = hit.side === 'left' ? 0 : 15;
    const amplitude = {weak: .025, normal: .045, strong: .065}[hit.strength] || .045;
    elements.current.slice(start, start + 15).forEach((element, index) => {
      animations.current.push(element.animate([
        {transform: 'scale(1)'}, {transform: `scale(${1 + amplitude})`},
        {transform: `scale(${1 - amplitude * .4})`}, {transform: 'scale(1)'},
      ], {duration: 560, delay: index * 7, easing: 'ease-in-out'}));
    });
  }}), []);
  return <div className="camera-play-instrument figma-janggu-board" role="img" aria-label="장구"
    style={{left: layout.left, top: layout.top, width: 2240, height: 1260, transform: `scale(${layout.scale})`, transformOrigin: '0 0'}}>
    <div className="figma-janggu" style={{position: 'absolute', width: JANGGU.width, height: JANGGU.height,
      left: JANGGU.cx - JANGGU.width / 2, top: JANGGU.cy - JANGGU.height / 2, transform: `rotate(${JANGGU.rotation}deg)`}}>
      {parts.map((part, index) => {
        const [top, right, bottom, left] = part.inset;
        const w = JANGGU.width * (100 - left - right) / 100;
        const h = JANGGU.height * (100 - top - bottom) / 100;
        const t = part.transform;
        const imageStyle = t ? {width: Math.hypot(t.w[0] * w, t.w[1] * h) / 100,
          height: Math.hypot(t.h[0] * w, t.h[1] * h) / 100, transform: `rotate(${t.rotation}deg)`} : {width: '100%', height: '100%'};
        return <div key={part.id} ref={element => {elements.current[index] = element;}}
          style={{position: 'absolute', inset: part.inset.map(value => `${value}%`).join(' ')}}>
          <div data-node-id={part.id} style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={`/assets/figma/play-instrument/${part.file}`} alt="" draggable="false" style={{...imageStyle, maxWidth: 'none', flexShrink: 0}}/>
          </div>
        </div>;
      })}
    </div>
  </div>;
});
export default FigmaJanggu;
