import {useEffect, useRef} from 'react';
import './ExperienceCursor.css';

export default function ExperienceCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const updateHover = target => {
      const control = target instanceof Element && target.closest('button, a[href], input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"], [data-cursor="pointer"]');
      element.classList.toggle('is-interactive', Boolean(control && !control.matches(':disabled') && !control.closest('[inert], [aria-disabled="true"]')));
    };
    const move = event => {
      if (!media.matches || event.pointerType === 'touch') return;
      document.documentElement.classList.add('experience-cursor-active');
      element.hidden = false;
      updateHover(event.target);
      element.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    };
    const over = event => updateHover(event.target);
    const hide = () => { element.classList.remove('is-interactive'); element.hidden = true; document.documentElement.classList.remove('experience-cursor-active'); };
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerover',over);
    window.addEventListener('pointercancel',hide);
    window.addEventListener('blur',hide);
    document.documentElement.addEventListener('pointerleave',hide);
    media.addEventListener('change',hide);
    return () => {
      window.removeEventListener('pointermove',move); window.removeEventListener('pointerover',over); window.removeEventListener('pointercancel',hide);
      window.removeEventListener('blur',hide); document.documentElement.removeEventListener('pointerleave',hide);
      media.removeEventListener('change',hide); hide();
    };
  },[]);
  return <div ref={ref} className="experience-cursor" hidden aria-hidden="true"><i/></div>;
}
