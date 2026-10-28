import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import layers from '../../config/playInstrumentLayers.json';
import {createRingWaveAnimator} from '../../motion/ringWaveAnimator';

const InstrumentRings = forwardRef(function InstrumentRings({instrument, layout}, ref) {
  const elements = useRef([]), animator = useRef(null);
  const source = layers[instrument.id];
  const [vx, vy, width, height] = source.viewBox;
  const scale = layout.width / (Math.max(...source.parts.map(p => p.bounds.x + p.bounds.width)) - source.x);
  useEffect(() => {
    const handleRing=instrument.id==='jing'?'ring-004-yellow':instrument.id==='kkwaenggwari'?'ring-003-red':null;
    // Buk's yellow central lacing participates in the same travelling pulse.
    // Handheld instrument handles remain fixed to the left-hand grip.
    animator.current=createRingWaveAnimator(source.parts.map((part,index)=>({...part,element:elements.current[index]})).filter(part=>(part.ring || (instrument.id==='buk' && part.id.startsWith('detail-') && part.id.endsWith('-yellow')))&&part.id!==handleRing),Math.max(layout.width,layout.height)/scale,scale);
    return()=>animator.current?.dispose();
  },[source,layout,scale]);
  useImperativeHandle(ref, () => ({strike(hit) {
    const zone = layout.zones[hit.side];
    const point = hit.point || zone;
    const px = point.x * layout.viewportWidth - layout.left - layout.width/2;
    const py = point.y * layout.viewportHeight - layout.top - layout.height/2;
    const angle = -(layout.rotation || 0) * Math.PI/180;
    const origin = {x: source.x + ((px*Math.cos(angle)-py*Math.sin(angle))*(layout.mirrorX ? -1 : 1)+layout.width/2) / scale,
      y: source.y + (px*Math.sin(angle)+py*Math.cos(angle)+layout.height/2) / scale};
    animator.current?.strike(origin,hit.strength);
  }}), [source, layout, scale]);
  return <div className="camera-play-instrument instrument-rings" role="img" aria-label={instrument.name}
    style={{left: layout.left, top: layout.top, width: layout.width, height: layout.height, transform:`rotate(${layout.rotation || 0}deg) scaleX(${layout.mirrorX ? -1 : 1})`}}>
    {source.parts.map((part, index) => <img key={part.id} ref={element => { elements.current[index] = element; }}
      src={part.file} alt="" draggable="false" style={{position: 'absolute', maxWidth: 'none',
        left: (vx - source.x) * scale, top: (vy - source.y) * scale, width: width * scale, height: height * scale,
        transformOrigin: `${(part.bounds.x + part.bounds.width / 2 - vx) * scale}px ${(part.bounds.y + part.bounds.height / 2 - vy) * scale}px`}} />)}
  </div>;
});
export default InstrumentRings;
