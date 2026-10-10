import React, {useEffect, useRef} from 'react';
import {projectStick} from '../../motion/stickTracker';
import {createStickHitEngine} from '../../motion/stickHitEngine';
import {figmaSticks, drawFigmaStick} from '../../motion/figmaSticks';
import {createStickSelection} from '../../motion/stickSelection';
import InstrumentRings from './InstrumentRings';

export default function CameraInstrumentStage({instrument, layout, videoRef, samplesRef, enabled, onHit}) {
  const canvasRef = useRef(null);
  const instrumentRef = useRef(null);
  const callbackRef = useRef(onHit);
  callbackRef.current = onHit;
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas.getContext('2d');
    const engine = createStickHitEngine();
    const selection = createStickSelection(instrument.id === 'janggu');
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
        engine.reset(); selection.reset(); ripples = [];
      } else {
        const samples = samplesRef.current.sample(now);
        const sticks = selection.select(Object.fromEntries(['left', 'right'].map(side => [side,
          projectStick(samples[side], video.videoWidth, video.videoHeight, layout, instrument.id)])));
        engine.update(layout, sticks, hit => {
          callbackRef.current(hit);
          instrumentRef.current?.strike(hit);
          ripples.push({point: hit.point, start: now});
        });
        for (const stick of Object.values(sticks)) {
          if (!stick?.grip.grabbed) continue;
          context.globalAlpha = stick.opacity ?? 1;
          drawFigmaStick(context, artwork[stick.side], images[stick.side], stick, width, height);
          context.globalAlpha = 1;
        }
        ripples = ripples.filter(ripple => now - ripple.start < 420);
        for (const {point, start} of ripples) {
          const progress = (now - start) / 420;
          context.strokeStyle = `rgba(255,51,100,${1 - progress})`;
          context.lineWidth = 4 * (1 - progress);
          context.beginPath();
          context.arc(point.x * width, point.y * height, (6 + progress * 60) * Math.min(width / 1280, height / 720), 0, Math.PI * 2);
          context.stroke();
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); engine.reset(); };
  }, [instrument.id, layout, samplesRef, videoRef, enabled]);
  return <>
    <InstrumentRings ref={instrumentRef} instrument={instrument} layout={layout}/>
    <canvas ref={canvasRef} className="camera-play-sticks" aria-label="손 움직임을 따라 움직이는 채" />
  </>;
}
