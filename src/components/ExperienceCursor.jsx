import {useEffect, useRef} from 'react';
import './ExperienceCursor.css';

export default function ExperienceCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const move = event => {
      if (!media.matches || event.pointerType === 'touch') return;
      document.documentElement.classList.add('experience-cursor-active');
      element.hidden = false;
      element.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    };
    const down = event => { move(event); element.classList.add('is-pressed'); };
    const up = () => element.classList.remove('is-pressed');
    const hide = () => { up(); element.hidden = true; document.documentElement.classList.remove('experience-cursor-active'); };
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerdown',down);
    window.addEventListener('pointerup',up);
    window.addEventListener('pointercancel',hide);
    window.addEventListener('blur',hide);
    document.documentElement.addEventListener('pointerleave',hide);
    media.addEventListener('change',hide);
    return () => {
      window.removeEventListener('pointermove',move); window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',hide);
      window.removeEventListener('blur',hide); document.documentElement.removeEventListener('pointerleave',hide);
      media.removeEventListener('change',hide); hide();
    };
  },[]);
  return <div ref={ref} className="experience-cursor" hidden aria-hidden="true"><i/></div>;
}
