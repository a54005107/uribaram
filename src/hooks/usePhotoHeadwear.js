import {useEffect, useRef, useState} from 'react';
import {createSangmoMotion} from '../motion/sangmoMotion';
import {FilesetResolver, PoseLandmarker} from '@mediapipe/tasks-vision';

export default function usePhotoHeadwear(videoRef, canvasRef, enabled, kind) {
  const kindRef = useRef(kind); kindRef.current = kind;
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    if (!enabled) return;
    setStatus('loading');
    let disposed = false, model, frame, lastVideo = -1, lastInference = 0, previous = 0;
    const motion = createSangmoMotion();
    const hat = new Image(), sangmo = new Image();
    hat.src = '/assets/figma/feedback/gokkal.svg';
    sangmo.src = '/assets/figma/feedback/sangmo.svg';
    const canvas = canvasRef.current, context = canvas.getContext('2d');
    const input = document.createElement('canvas'), inputContext = input.getContext('2d');
    const loop = now => {
      if (disposed) return;
      const video = videoRef.current;
      const dt = Math.min(.05, (now - (previous || now)) / 1000); previous = now;
      if (video.readyState >= 2 && video.videoWidth) {
        const width = 960, height = Math.round(width * video.videoHeight / video.videoWidth);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        if (model && video.currentTime !== lastVideo && now - lastInference >= 30 && !document.hidden) {
          lastVideo = video.currentTime; lastInference = now;
          if (input.width !== 480 || input.height !== Math.round(480 * height / width)) { input.width = 480; input.height = Math.round(480 * height / width); }
          inputContext.drawImage(video, 0, 0, input.width, input.height);
          try {
            const points = model.detectForVideo(input, now).landmarks[0];
            const earsVisible = points?.[7]?.visibility > .5 && points?.[8]?.visibility > .5;
            const a = points?.[earsVisible ? 7 : 2], b = points?.[earsVisible ? 8 : 5];
            if (a && b && a.visibility > .5 && b.visibility > .5) {
              const w = Math.max(70, Math.hypot((a.x - b.x) * width, (a.y - b.y) * height) * (earsVisible ? 1.6 : 3.6));
              const x = (1 - (a.x + b.x) / 2) * width, y = (a.y + b.y) / 2 * height + (earsVisible ? 0 : w * .18);
              let angle = Math.atan2((b.y - a.y) * height, (a.x - b.x) * width);
              if (angle > Math.PI/2) angle -= Math.PI;
              if (angle < -Math.PI/2) angle += Math.PI;
              motion.observe({x,y,w,angle},now);
            }
          } catch { model.close(); model = null; setStatus('error'); }
        }
        context.save(); context.translate(width, 0); context.scale(-1, 1);
        context.drawImage(video, 0, 0, width, height); context.restore();
        const head = motion.step(now,dt);
        if (head && head.opacity > 0) {
          context.save(); context.globalAlpha = head.opacity; context.translate(head.x, head.y - head.w * .4); context.rotate(head.angle);
          const image = kindRef.current === 'gokkal' ? hat : sangmo;
          if (image.complete && image.naturalWidth) {
            const w = head.w * 1.2, h = w * image.naturalHeight / image.naturalWidth;
            context.drawImage(image, -w / 2, -h * .85, w, h);
            if (kindRef.current === 'sangmo') {
              context.save(); context.translate(0, -h * .85);
              context.beginPath(); context.moveTo(0, 0);
              for (let i=1;i<head.ribbon.length-1;i++) {
                const p=head.ribbon[i], next=head.ribbon[i+1];
                context.quadraticCurveTo(p.x*head.w,p.y*head.w,(p.x+next.x)*head.w/2,(p.y+next.y)*head.w/2);
              }
              context.strokeStyle = '#fff'; context.lineWidth = head.w * .035; context.lineCap = 'round'; context.lineJoin = 'round';
              context.shadowColor = '#0003'; context.shadowBlur = 2; context.stroke(); context.restore();
            }
          }
          context.restore();
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        if (disposed) return;
        const options = {baseOptions: {modelAssetPath: '/mediapipe/pose_landmarker_lite.task', delegate: 'GPU'}, runningMode: 'VIDEO', numPoses: 1};
        try { model = await PoseLandmarker.createFromOptions(vision, options); }
        catch { if (disposed) return; model = await PoseLandmarker.createFromOptions(vision, {...options, baseOptions: {...options.baseOptions, delegate: 'CPU'}}); }
        if (disposed) model.close(); else setStatus('ready');
      } catch { if (!disposed) setStatus('error'); }
    })();
    return () => { disposed = true; cancelAnimationFrame(frame); model?.close(); };
  }, [enabled, videoRef, canvasRef]);
  return status;
}
