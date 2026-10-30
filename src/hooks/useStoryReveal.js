import {useLayoutEffect} from 'react';

// Reveal artwork independently of scrolling/layout; existing rotations and
// horizontal centering are preserved when composing transform animations.
export default function useStoryReveal(ref) {
  useLayoutEffect(() => {
    const root=ref.current, artwork=root.querySelector('.story-oct28-0');
    if(!artwork)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'), animations=new Map();
    const candidates=[...artwork.children].flatMap(el=>getComputedStyle(el).display==='contents'?[...el.children]:[el])
      .filter(el=>el.offsetHeight>0);
    const reveal=el=>{
      if(el.dataset.revealed==='true')return;
      el.dataset.revealed='true';
      if(reduced.matches){el.style.opacity='';return;}
      const baseTransform=getComputedStyle(el).transform;
      const base=baseTransform==='none'?'':baseTransform;
      const scale=parseFloat(getComputedStyle(root).getPropertyValue('--story-scale'))||1;
      const distance=80/scale;
      const motion=el.animate([{transform:`translateY(${distance}px) ${base}`},{transform:base||'none'}],
        {duration:950,easing:'cubic-bezier(.16,1,.3,1)'});
      const fade=el.animate([{opacity:0},{opacity:1}],{duration:750,easing:'ease-out'});
      el.style.opacity='1';animations.set(el,[motion,fade]);
      motion.onfinish=()=>animations.delete(el);
    };
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting)reveal(entry.target);
        else if(entry.boundingClientRect.top>(entry.rootBounds?.bottom||innerHeight)){
          animations.get(entry.target)?.forEach(a=>a.cancel());animations.delete(entry.target);
          entry.target.dataset.revealed='false';entry.target.style.opacity=reduced.matches?'':'0';
        }
      }
    // Begin at the visible edge, not 200px below it where the animation could
    // finish before the user sees the component.
    },{root,rootMargin:'0px',threshold:0});
    const reset=()=>{
      animations.forEach(list=>list.forEach(a=>a.cancel()));animations.clear();
      const bottom=root.getBoundingClientRect().bottom;
      for(const el of candidates){const visible=reduced.matches||el.getBoundingClientRect().top<bottom;
        el.dataset.revealed=String(visible);el.style.opacity=visible?'':'0';}
    };
    reset();candidates.forEach(el=>observer.observe(el));reduced.addEventListener('change',reset);
    // Old WebKit can clip IntersectionObserver's expanded root to the viewport.
    // Read upcoming bounds once per frame, then start the same reveal animation.
    let frame=0;
    const revealUpcoming=()=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        const bounds=root.getBoundingClientRect();
        const upcoming=candidates.filter(el=>{
          if(el.dataset.revealed==='true')return false;
          const rect=el.getBoundingClientRect();
          return rect.top<bounds.bottom&&rect.bottom>bounds.top;
        });
        upcoming.forEach(reveal);
      });
    };
    root.addEventListener('scroll',revealUpcoming,{passive:true});
    const focus=event=>{const el=candidates.find(el=>el.contains(event.target));if(el)reveal(el);};
    root.addEventListener('focusin',focus);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);reduced.removeEventListener('change',reset);root.removeEventListener('focusin',focus);root.removeEventListener('scroll',revealUpcoming);
      animations.forEach(list=>list.forEach(a=>a.cancel()));candidates.forEach(el=>{el.style.opacity='';delete el.dataset.revealed;});};
  },[ref]);
}
