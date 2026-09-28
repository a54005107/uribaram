import React, {useEffect, useRef} from 'react';
import {displayPoint} from './geometry.js';
import {fingerJoints} from './fingerAnalyzer.js';
import {motionConfig} from './motionConfig.js';

const handEdges = Object.values(fingerJoints).flatMap((ids) => [[0, ids[0]], ...ids.slice(1).map((id, i) => [ids[i], id])]);
const poseEdges = [[0, 2], [0, 5], [2, 7], [5, 8], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];
export default function MotionDebug({engine, videoRef, enabled, handStatus, poseStatus}) {
  const canvasRef = useRef(null), textRef = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    let frame, lastText = -Infinity;
    const draw = (now) => {
      const canvas = canvasRef.current, video = videoRef.current, ctx = canvas?.getContext('2d');
      if (!ctx || !video) return;
      const {width, height} = canvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
      const state = engine.snapshot(now);
      const project = (p) => displayPoint(p, width, height, video.videoWidth || 1, video.videoHeight || 1, true);
      const line = (a, b) => {
        if (!a || !b) return;
        const p = project(a), q = project(b);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      };
      const skeleton = (points, edges, color) => {
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
        edges.forEach(([a, b]) => line(points[a], points[b]));
        points.forEach((p) => { if (!p) return; const q = project(p); ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, Math.PI * 2); ctx.fill(); });
      };
      if (!document.hidden && !video.paused && video.readyState >= 2) {
        if (state.pose) skeleton(state.pose.landmarks, poseEdges, '#ffe197');
        for (const [key, color] of [['leftHand', '#68f5c6'], ['rightHand', '#80cfff']]) {
          const hand = state[key]; if (!hand) continue;
          skeleton(hand.landmarks, handEdges, color);
          ctx.globalAlpha = .5;
          hand.history.slice(1).forEach((p, i) => line(hand.history[i], p));
          ctx.globalAlpha = 1;
          const wrist = project(hand.wrist);
          ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 7, 0, Math.PI * 2); ctx.stroke();
          line(hand.wrist, {x: hand.wrist.x + hand.velocity.x * .15, y: hand.wrist.y + hand.velocity.y * .15});
          ctx.font = '12px monospace'; ctx.fillText(`${hand.hand} ${hand.direction} ${hand.speed.toFixed(2)}`, wrist.x + 10, wrist.y - 10);
        }
      }
      if (now - lastText >= motionConfig.uiIntervalMs) {
        lastText = now;
        textRef.current.textContent = ['분석 방향: 원본 영상 기준 (화면 좌우 반전)', ...['leftHand', 'rightHand'].map((key) => {
          const hand = state[key];
          return hand ? `${hand.hand} HAND · ${hand.direction}\nspeed ${hand.speed.toFixed(3)} /s · distance ${hand.distance.toFixed(3)}\nmoving ${hand.moving} · ${hand.started ? 'START' : hand.stopped ? 'STOP' : '—'}\n${Object.entries(hand.fingers).map(([name, value]) => `${name}: ${value}`).join('\n')}` : `${key}: 미감지`;
        }), `HEAD: ${state.pose?.head?.state || '미감지'} (근사)\nHEAD motion: ${state.pose?.head?.direction || '—'}`].join('\n\n');
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [enabled, engine, videoRef]);
  if (!enabled) return null;
  return <><canvas ref={canvasRef} className="motion-debug-canvas" aria-hidden="true"/><aside className="motion-debug-panel"><b>모션 분석</b><div>손: {handStatus} · Pose: {poseStatus}</div><pre ref={textRef}/></aside></>;
}
