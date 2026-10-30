import {useLayoutEffect} from 'react';

// Reveal artwork independently of scrolling/layout; existing rotations and
// horizontal centering are preserved by additive transform animations.
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
      const motion=el.animate([{transform:`${base} translateY(100px)`},{transform:base||'none'}],
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
    },{root,rootMargin:'0px 0px -4% 0px',threshold:0});
    const reset=()=>{
      animations.forEach(list=>list.forEach(a=>a.cancel()));animations.clear();
      const bottom=root.getBoundingClientRect().bottom;
      for(const el of candidates){const visible=reduced.matches||el.getBoundingClientRect().top<bottom;
        el.dataset.revealed=String(visible);el.style.opacity=visible?'':'0';}
    };
    reset();candidates.forEach(el=>observer.observe(el));reduced.addEventListener('change',reset);
    // At the end of the page, the observer's inset must not hide the footer.
    // Use the same reveal animation, including its existing timing and easing.
    const revealFooter=()=>{
      if(root.scrollTop+root.clientHeight<root.scrollHeight-2)return;
      const bounds=root.getBoundingClientRect();
      for(const el of candidates){const rect=el.getBoundingClientRect();
        if(rect.top<bounds.bottom&&rect.bottom>bounds.top)reveal(el);}
    };
    root.addEventListener('scroll',revealFooter,{passive:true});
    const focus=event=>{const el=candidates.find(el=>el.contains(event.target));if(el)reveal(el);};
    root.addEventListener('focusin',focus);
    return()=>{observer.disconnect();reduced.removeEventListener('change',reset);root.removeEventListener('focusin',focus);root.removeEventListener('scroll',revealFooter);
      animations.forEach(list=>list.forEach(a=>a.cancel()));candidates.forEach(el=>{el.style.opacity='';delete el.dataset.revealed;});};
  },[ref]);
}
