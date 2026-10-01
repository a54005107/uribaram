import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import '../../public/assets/figma/styles/tokens.css';
import './WaitingPage.css';

export default function Home() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  const pageRef = useRef(null);
  const flagRef = useRef(null);
  const [layout, setLayout] = useState({scale: 0, top: 0});
  useEffect(() => { stop(); }, [stop]);
  useEffect(() => {
    const page = pageRef.current;
    const flag = flagRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, lastTime = 0, previousPointer = null;
    let wind = 0, angle = 0, velocity = 0, flutter = 0, phase = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousPointer = null;
      wind = angle = velocity = flutter = phase = 0;
      flag.style.transform = '';
    };
    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.032);
      lastTime = time;
      wind *= Math.exp(-2.5 * dt);
      flutter *= Math.exp(-1.8 * dt);
      // A damped spring keeps momentum when the cursor changes direction.
      velocity += (wind * 90 - angle * 28 - velocity * 6) * dt;
      angle += velocity * dt;
      phase += dt * 11;
      const ripple = Math.sin(phase) * flutter;
      flag.style.transform = `rotate(${angle}deg) skewX(${ripple * 2.8}deg) scaleX(${1 - Math.abs(ripple) * 0.025})`;
      if (Math.abs(wind) + Math.abs(angle) + Math.abs(velocity) + flutter < 0.008) {
        reset();
        return;
      }
      frame = requestAnimationFrame(animate);
    };
    const move = (event) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      const now = performance.now();
      if (previousPointer && now - previousPointer.time < 150) {
        const dx = event.clientX - previousPointer.x;
        const speed = dx / Math.max(8, now - previousPointer.time);
        const impulse = Math.max(-1.5, Math.min(1.5, speed / 2));
        wind = Math.max(-3, Math.min(3, wind + impulse * 0.6));
        flutter = Math.min(1, flutter + Math.abs(impulse) * 0.2);
        if (!frame && Math.abs(dx) > 0) {
          lastTime = now;
          frame = requestAnimationFrame(animate);
        }
      }
      previousPointer = {x: event.clientX, time: now};
    };
    const leave = () => { previousPointer = null; };
    const visibility = () => { if (document.hidden) reset(); };
    page.addEventListener('pointermove', move);
    page.addEventListener('pointerleave', leave);
    reducedMotion.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      reset();
      page.removeEventListener('pointermove', move);
      page.removeEventListener('pointerleave', leave);
      reducedMotion.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      // Scale the original artwork as one unit; leave room for it on narrow screens.
      const scale = Math.min(height / 1260, width / 760);
      setLayout({scale, top: height - 1260 * scale});
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  return <main ref={pageRef} className="waiting-page">
    <h1 className="waiting-sr-only">우리바람</h1>
    <p className="waiting-instruction">마우스를 움직여 바람을 일으켜 보세요</p>
    <div className="waiting-artwork" style={{top: layout.top, transform: `translateX(-50%) scale(${layout.scale})`}}>
      <img className="waiting-pole" src="/assets/figma/flag/pole/waiting-screen/original.svg" width="390" height="1768" alt="" draggable="false"/>
      <button className="waiting-flag" aria-label="우리바람 제목 화면으로 이동" title="깃발을 눌러 시작하기" onClick={() => navigate('/title')}>
        <img ref={flagRef} src="/assets/figma/flag/logo/screen/original.svg" width="615" height="1226" alt="" draggable="false"/>
      </button>
    </div>
  </main>;
}
