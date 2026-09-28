import React, {useEffect, useRef} from 'react';
import StickOverlay from './StickOverlay';
import {projectStick} from '../../motion/stickTracker';
import useStickHitDetection from '../../hooks/useStickHitDetection';
import {forgivingHitZone} from '../../motion/stickHitEngine';

export default function LiveSticks({samplesRef, videoRef, layout: viewport, torsoTracker, transformRef, enabled, debug, onHit}) {
  const leftRef = useRef(null), rightRef = useRef(null), canvasRef = useRef(null), textRef = useRef(null);
  const processHits = useStickHitDetection(onHit);
  useEffect(() => {
    let frame, lastText = -Infinity;
    const loop = (now) => {
      const video = videoRef.current;
      const active = enabled && !document.hidden && video?.readyState >= 2 && !video.paused;
      const bodyLayout = active ? torsoTracker.layout(now, video.videoWidth, video.videoHeight, viewport.viewportWidth, viewport.viewportHeight) : null;
      transformRef.current = bodyLayout;
      const layout = bodyLayout || viewport;
      const samples = active ? samplesRef.current.sample(now) : {};
      const sticks = Object.fromEntries(['left', 'right'].map((side) => [side, samples[side] ? projectStick(samples[side], video.videoWidth, video.videoHeight, layout) : null]));
      for (const [side, ref] of [['left', leftRef], ['right', rightRef]]) {
        const stick = sticks[side], element = ref.current;
        if (!stick?.grip.grabbed) { element.style.display = 'none'; continue; }
        // The local handle pivot is exactly at the projected anchor; no independent tip smoothing or 3D CSS transform.
        Object.assign(element.style, {display: 'block', left: `${stick.gripX * 100}%`, top: `${stick.gripY * 100}%`,
          width: `${stick.width * layout.viewportWidth}px`, height: `${stick.height * layout.viewportHeight}px`,
          transformOrigin: `${stick.gripOffset * 100}% 50%`,
          transform: `translate(${-stick.gripOffset * 100}%, -50%) rotate(${stick.rotation}rad)`,
          opacity: stick.stale ? '.75' : '1'});
        element.style.setProperty('--grip-offset', `${stick.gripOffset * 100}%`);
      }
      processHits(bodyLayout, sticks);
      if (debug && canvasRef.current) {
        const canvas = canvasRef.current, w = layout.viewportWidth, h = layout.viewportHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)) { canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio); }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, w, h);
        ctx.font = '12px monospace';
        const dot = (p, label, color, radius = 4) => {
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, radius, 0, Math.PI * 2); ctx.fill(); ctx.fillText(label, p.x * w + 8, p.y * h - 8);
        };
        ctx.strokeStyle = '#ffcb69'; ctx.lineWidth = 2;
        for (const [side, zone] of Object.entries(bodyLayout?.zones || {})) {
          const generous = forgivingHitZone(zone);
          ctx.setLineDash([5, 4]);
          ctx.beginPath(); ctx.ellipse(zone.x * w, zone.y * h, generous.radiusX * w, generous.radiusY * h, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.ellipse(zone.x * w, zone.y * h, zone.radiusX * w, zone.radiusY * h, 0, 0, Math.PI * 2); ctx.stroke();
          dot(zone, `${side} HIT`, '#ffcb69', 2);
        }
        if (bodyLayout) dot(layout, `JANGGU ${layout.x.toFixed(2)}, ${layout.y.toFixed(2)}`, '#fff');
        const line = (a, b, color) => {
          if (!a || !b) return;
          ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
        };
        if (bodyLayout?.debug) {
          const d = bodyLayout.debug;
          for (const [name, point] of Object.entries(d)) if (point) dot(point, name, '#ffbd78');
          line(d.shoulder, d.hip || d.torso, '#ffbd78'); line(d.torso, d.target, '#ffbd78'); line(d.target, bodyLayout, '#fff');
        }
        for (const stick of Object.values(sticks)) if (stick) {
          dot(stick.debugPoints.wrist, 'wrist', '#8ebcff'); dot(stick.debugPoints.palmCenter, 'palm', '#a7ff95');
          dot(stick.debugPoints.rawGrip, 'GRIP', '#ff6fb5', 6);
          ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(stick.gripX * w, stick.gripY * h, 10, 0, Math.PI * 2); ctx.stroke();
          line(stick.debugPoints.palmCenter, stick.debugPoints.rawGrip, '#a7ff95');
          line({x: stick.gripX, y: stick.gripY}, {x: stick.tipX, y: stick.tipY}, '#fff');
          const axis = stick.orientation;
          line(stick.debugPoints.palmCenter, {x: stick.debugPoints.palmCenter.x + axis.x * .06, y: stick.debugPoints.palmCenter.y + axis.y * .06 * w / h}, '#53e6ff');
          ctx.fillText(`rotation ${(stick.rotation * 180 / Math.PI).toFixed(0)} / tilt ${(stick.palmTilt * 180 / Math.PI).toFixed(0)}`, stick.gripX * w, stick.gripY * h + 24);
          if (stick.grip.grabbed) dot({x: stick.tipX, y: stick.tipY}, 'tip', '#fff', 3);
        }
        if (now - lastText > 100) {
          lastText = now;
          textRef.current.textContent = ['GRIP: 분홍 점 · Anchor: 흰 원', ...['left', 'right'].map((side) => {
            const stick = sticks[side];
            return stick ? `${side}: ${stick.grip.state} · grab ${stick.grip.grabbed}\nscore ${stick.grip.score.toFixed(2)} · ${stick.stale ? 'GRACE' : 'TRACKING'}\nanchor ${stick.gripX.toFixed(3)}, ${stick.gripY.toFixed(3)}` : `${side}: LOST`;
          })].join('\n\n');
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); transformRef.current = null; };
  }, [samplesRef, videoRef, viewport, torsoTracker, transformRef, enabled, debug, processHits]);
  return <><StickOverlay ref={leftRef} side="left"/><StickOverlay ref={rightRef} side="right"/>{debug && <><canvas className="grip-debug-canvas" ref={canvasRef}/><pre className="grip-debug-panel" ref={textRef}/></>}</>;
}
