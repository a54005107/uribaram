import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import layers from '../../config/playInstrumentLayers.json';
import {ringWave} from '../../motion/ringWave';

const InstrumentRings = forwardRef(function InstrumentRings({instrument, layout}, ref) {
  const elements = useRef([]), animations = useRef([]);
  const source = layers[instrument.id];
  const [vx, vy, width, height] = source.viewBox;
  const scale = layout.width / (Math.max(...source.parts.map(p => p.bounds.x + p.bounds.width)) - source.x);
  const cancel = () => { animations.current.forEach(animation => animation.cancel()); animations.current = []; };
  useEffect(() => cancel, [instrument.id, layout]);
  useImperativeHandle(ref, () => ({strike(hit) {
    cancel();
    const zone = layout.zones[hit.side];
    const point = hit.point || zone;
    const origin = {x: source.x + (point.x * layout.viewportWidth - layout.left) / scale,
      y: source.y + (point.y * layout.viewportHeight - layout.top) / scale};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    source.parts.forEach((part, index) => {
      const element = elements.current[index];
      if (!part.ring || !element) return;
      const wave = ringWave(part.bounds, origin, Math.max(layout.width, layout.height) / scale, hit.strength);
      const transform = amount => `translate(${wave.x * scale * amount}px, ${wave.y * scale * amount}px) scale(${1 + (wave.scale - 1) * amount})`;
      animations.current.push(element.animate(reduced ? [{opacity: 1}, {opacity: .7}, {opacity: 1}] : [
        {transform: transform(0), offset: 0},
        {transform: transform(1), offset: .22},
        {transform: transform(-.38), offset: .5},
        {transform: transform(.14), offset: .73},
        {transform: transform(0), offset: 1},
      ], {duration: reduced ? 160 : 560, delay: reduced ? 0 : wave.delay, easing: 'ease-in-out'}));
    });
  }}), [source, layout, scale]);
  return <div className="camera-play-instrument instrument-rings" role="img" aria-label={instrument.name}
    style={{left: layout.left, top: layout.top, width: layout.width, height: layout.height}}>
    {source.parts.map((part, index) => <img key={part.id} ref={element => { elements.current[index] = element; }}
      src={part.file} alt="" draggable="false" style={{position: 'absolute', maxWidth: 'none',
        left: (vx - source.x) * scale, top: (vy - source.y) * scale, width: width * scale, height: height * scale,
        transformOrigin: `${(part.bounds.x + part.bounds.width / 2 - vx) * scale}px ${(part.bounds.y + part.bounds.height / 2 - vy) * scale}px`}} />)}
  </div>;
});
export default InstrumentRings;
