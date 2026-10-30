import React, {memo, useEffect, useRef} from 'react';
import {projectStick} from '../../motion/stickTracker';
import {createStickHitEngine} from '../../motion/stickHitEngine';
import {figmaSticks, drawFigmaStick} from '../../motion/figmaSticks';
import {createStickSelection} from '../../motion/stickSelection';
import InstrumentRings from './InstrumentRings';
import FigmaJanggu from './FigmaJanggu';
import {createInstrumentHold, isHandheld} from '../../motion/heldInstrument';
import {createStickDisplay} from '../../motion/stickDisplay';

function CameraInstrumentStage({instrument, layout, videoRef, samplesRef, enabled, onHit, debug = false, diagnosticsRef}) {
  const canvasRef = useRef(null);
  const instrumentRef = useRef(null);
  const holderRef = useRef(null);
  const callbackRef = useRef(onHit);
  callbackRef.current = onHit;
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas.getContext('2d');
    const engine = createStickHitEngine();
    // Two-hand tracking can deliver poses farther apart. Fill that interval
    // visually without changing the measurements passed to the hit engine.
    const displayOptions = {maxDuration: instrument.id === 'janggu' ? 64 : 32};
    const display = {left: createStickDisplay(displayOptions), right: createStickDisplay(displayOptions)};
    const selection = createStickSelection(instrument.id === 'janggu');
    const handheld = isHandheld(instrument.id);
    const hold = createInstrumentHold(instrument.id);
    holderRef.current.style.transform = '';
    const artwork = figmaSticks[instrument.id];
    const images = Object.fromEntries(Object.entries(artwork).map(([side, item]) => [side,
      item.urls.map(url => { const image = new Image(); image.src = url; return image; })]));
    const {viewportWidth: width, viewportHeight: height} = layout;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    let frame, ripples = [], renderWindow = performance.now(), renderFrames = 0;
    const loop = now => {
      if (debug) {
        renderFrames++;
        if (now - renderWindow >= 500) {
          diagnosticsRef.current.renderFps = renderFrames * 1000 / (now - renderWindow);
          renderFrames = 0; renderWindow = now;
        }
      }
      context.clearRect(0, 0, width, height);
      const video = videoRef.current;
      if (!enabled || document.hidden || video?.readyState < 2 || video?.paused || !video?.videoWidth) {
        engine.reset(); selection.reset(); ripples = [];
        display.left.reset(); display.right.reset();
      } else {
        const samples = samplesRef.current.sample(now);
        const projected = Object.fromEntries(['left', 'right'].map(side => [side,
          projectStick(samples[side], video.videoWidth, video.videoHeight, layout, instrument.id)]));
        const held = handheld ? hold.update(layout,projected.left,now) : null;
        if (held) holderRef.current.style.transform = `translate3d(${held.x}px,${held.y}px,0)`;
        const sticks = handheld ? {left:null,right:projected.right} : selection.select(projected);
        // Drawing interpolates between frames; collision still consumes each accepted
        // measurement once, not the interpolation frames or recovery movement.
        const hitSamples = samplesRef.current.sampleForHit(now);
        const hitSticks = Object.fromEntries(['left', 'right'].map(side => [side, sticks[side]
          ? projectStick(hitSamples[side], video.videoWidth, video.videoHeight, layout, instrument.id) : null]));
        if (held && !held.playable) engine.reset();
        else engine.update(held?.layout || layout, hitSticks, hit => {
          callbackRef.current(hit);
          instrumentRef.current?.strike(held ? {...hit,point:{x:hit.point.x-held.x/width,y:hit.point.y-held.y/height}} : hit);
          ripples.push({point: hit.point, start: now});
        });
        for (const side of ['left', 'right']) {
          const stick = display[side].sample(sticks[side]?.stale ? sticks[side] : hitSticks[side], now);
          if (debug && stick) {
            const raw = stick.debugPoints.rawGrip;
            context.strokeStyle = '#ff5ff7'; context.lineWidth = 1;
            context.beginPath(); context.moveTo(raw.x * width, raw.y * height); context.lineTo(stick.gripX * width, stick.gripY * height); context.stroke();
            for (const [x, y, color] of [[raw.x, raw.y, '#ff5ff7'], [stick.gripX, stick.gripY, '#fff']]) {
              context.strokeStyle = color; context.beginPath(); context.arc(x * width, y * height, 5, 0, Math.PI * 2); context.stroke();
            }
          }
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
  }, [instrument.id, layout, samplesRef, videoRef, enabled, debug, diagnosticsRef]);
  return <>
    <div ref={holderRef} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    {instrument.id === 'janggu' ? <FigmaJanggu ref={instrumentRef} layout={layout}/>
      : <InstrumentRings ref={instrumentRef} instrument={instrument} layout={layout}/>}
    </div>
    <canvas ref={canvasRef} className="camera-play-sticks" aria-label="손 움직임을 따라 움직이는 채" />
  </>;
}

export default memo(CameraInstrumentStage);
