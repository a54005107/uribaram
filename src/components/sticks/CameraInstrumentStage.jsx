import React, {useEffect, useRef} from 'react';
import {projectStick} from '../../motion/stickTracker';
import {createStickHitEngine} from '../../motion/stickHitEngine';
import {figmaSticks, drawFigmaStick} from '../../motion/figmaSticks';

export default function CameraInstrumentStage({instrument, layout, videoRef, samplesRef, enabled, onHit}) {
  const canvasRef = useRef(null);
  const callbackRef = useRef(onHit);
  callbackRef.current = onHit;
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas.getContext('2d');
    const engine = createStickHitEngine();
    const artwork = figmaSticks[instrument.id];
    const images = Object.fromEntries(Object.entries(artwork).map(([side, item]) => [side,
      item.urls.map(url => { const image = new Image(); image.src = url; return image; })]));
    const {viewportWidth: width, viewportHeight: height} = layout;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    let frame, ripples = [];
    const loop = now => {
      context.clearRect(0, 0, width, height);
      const video = videoRef.current;
      if (!enabled || document.hidden || video?.readyState < 2 || video?.paused || !video?.videoWidth) {
        engine.reset(); ripples = [];
      } else {
        const samples = samplesRef.current.sample(now);
        const sticks = Object.fromEntries(['left', 'right'].map(side => [side,
          projectStick(samples[side], video.videoWidth, video.videoHeight, layout)]));
        engine.update(layout, sticks, hit => {
          callbackRef.current(hit);
          ripples.push({zone: layout.zones[hit.side], start: now});
        });
        for (const stick of Object.values(sticks)) {
          if (!stick?.grip.grabbed || stick.stale) continue;
          drawFigmaStick(context, artwork[stick.side], images[stick.side], stick, width, height);
        }
        ripples = ripples.filter(ripple => now - ripple.start < 420);
        for (const {zone, start} of ripples) {
          const progress = (now - start) / 420;
          context.strokeStyle = `rgba(255,51,100,${1 - progress})`;
          context.lineWidth = 4 * (1 - progress);
          context.beginPath();
          context.ellipse(zone.x * width, zone.y * height, zone.radiusX * width * (1 + progress), zone.radiusY * height * (1 + progress), 0, 0, Math.PI * 2);
          context.stroke();
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); engine.reset(); };
  }, [instrument.id, layout, samplesRef, videoRef, enabled]);
  return <>
    <img className="camera-play-instrument" src={`/assets/figma/play-instruments/${instrument.id}.svg`} alt={instrument.name}
      style={{left: layout.left, top: layout.top, width: layout.width, height: layout.height}} draggable="false" />
    <canvas ref={canvasRef} className="camera-play-sticks" aria-label="손 움직임을 따라 움직이는 채" />
  </>;
}
