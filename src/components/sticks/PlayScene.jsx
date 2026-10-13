import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {playArtboard} from '../../motion/figmaPlayLayout';
import {launchStar, stepStar} from '../../motion/starBounce';

// Original decoration slots from Figma play frame 2305:824 (2240 × 1260).
const decorations = [
  ['babdb', 16.655, 36.43, 138.005, 262.501, -35.26],
  ['de68f', 80.495, 84.685, 138.005, 262.501, -35.26],
  ['25822', 91.955, 48.635, 116, 221, 37.95],
  ['d1e07', 15.17, 69.38, 98.58, 187.51, 115],
  ['d1e07', 81.955, 22.57, 98.58, 187.51, 192],
  ['4c4af', 8.66, 39.84, 70, 70, 0],
  ['79742', 69.265, 13.85, 139, 139, 0],
  ['cff1d', 93.345, 21.665, 80, 80, 0],
  ['c4f61', 96.34, 79.68, 98, 98, 0],
  ['4248b', 28.395, 81.585, 106, 106, 0],
  ['fb544', 28.395, 17.46, 70, 70, 0],
  ['8f95b', 5.47, 89.245, 143, 143, 0],
];
export default forwardRef(function PlayScene({width, height}, ref) {
  const {scale, left, top} = playArtboard(width, height);
  const nodes = useRef([]), particles = useRef([]), kick = useRef(() => {});
  useImperativeHandle(ref, () => ({strike: hit => kick.current(hit)}), []);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const floor = (height - top) / scale;
    particles.current = decorations.map(([, x, y, w, h], index) => {
      const radius = Math.hypot(w, h) / 2;
      return {x: 0, vx: 0, y: 0, velocity: 0, angle: 0, spin: 0,
        floor: floor - y * 12.6 - radius - 12, index,
        minX: -left / scale + radius - x * 22.4,
        maxX: (width - left) / scale - radius - x * 22.4};
    });
    let frame, previous;
    const draw = p => {
      if (nodes.current[p.index]) nodes.current[p.index].style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.angle}deg)`;
    };
    const loop = now => {
      const dt = Math.min((now - (previous ?? now)) / 1000, .04);
      previous = now;
      let moving = false;
      for (const p of particles.current) {
        if (stepStar(p, dt)) moving = true;
        draw(p);
      }
      frame = moving ? requestAnimationFrame(loop) : null;
    };
    kick.current = hit => {
      if (reduced) return;
      const strength = {weak: .7, normal: 1, strong: 1.2}[hit.strength] || 1;
      for (const p of particles.current) launchStar(p, strength);
      if (frame == null) { previous = undefined; frame = requestAnimationFrame(loop); }
    };
    if (reduced) particles.current.forEach(p => { p.y = p.floor; draw(p); });
    else frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); kick.current = () => {}; };
  }, [height, top, scale]);
  return <div className="play-scene" aria-hidden="true" style={{left, top, width: 2240, height: 1260, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    {decorations.map(([asset, x, y, w, h, rotation], index) => <div key={index} ref={node => { nodes.current[index] = node; }} className="play-scene-decoration" style={{left: `${x}%`, top: `${y}%`}}>
      <img src={`/assets/figma/play-scene/${asset}.svg`} width={w} height={h} alt="" draggable="false"
        style={{transform: `translate(-50%, -50%) rotate(${rotation}deg)`}} />
    </div>)}
  </div>;
});
