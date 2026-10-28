import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import parts from '../../config/figmaPlayJanggu.json';
import {JANGGU, PLAY_WIDTH, PLAY_HEIGHT} from '../../motion/figmaPlayLayout';
import './FigmaJanggu.css';
import {createRingWaveAnimator} from '../../motion/ringWaveAnimator';

const FigmaJanggu = forwardRef(function FigmaJanggu({layout}, ref) {
  const elements = useRef([]), animator = useRef(null);
  useEffect(()=>{
    animator.current=createRingWaveAnimator(parts.map((part,index)=>{
      const [top,right,bottom,left]=part.inset;
      return {ring:part.ring,element:elements.current[index],bounds:{x:left*JANGGU.width/100,y:top*JANGGU.height/100,width:(100-left-right)*JANGGU.width/100,height:(100-top-bottom)*JANGGU.height/100}};
    }).filter(part=>part.ring),Math.max(JANGGU.width,JANGGU.height));
    return()=>animator.current?.dispose();
  },[layout]);
  useImperativeHandle(ref,()=>({strike(hit){
    const point=hit.point || layout.zones[hit.side];
    const x=(point.x*layout.viewportWidth-layout.left)/layout.scale-JANGGU.cx;
    const y=(point.y*layout.viewportHeight-layout.top)/layout.scale-JANGGU.cy;
    const angle=-JANGGU.rotation*Math.PI/180;
    animator.current?.strike({x:x*Math.cos(angle)-y*Math.sin(angle)+JANGGU.width/2,y:x*Math.sin(angle)+y*Math.cos(angle)+JANGGU.height/2},hit.strength);
  }}),[layout]);
  return <div className="camera-play-instrument figma-janggu-board" role="img" aria-label="장구"
    style={{left: layout.left, top: layout.top, width: PLAY_WIDTH, height: PLAY_HEIGHT, transform: `scale(${layout.scale})`, transformOrigin: '0 0'}}>
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
