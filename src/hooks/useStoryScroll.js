import {useEffect} from 'react';

export default function useStoryScroll(ref) {
  useEffect(() => {
    const root=ref.current, reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,target=root.scrollTop,previous=0;
    const cancel=()=>{cancelAnimationFrame(frame);frame=0;previous=0;target=root.scrollTop;};
    const tick=now=>{
      const dt=Math.min(50,now-(previous||now-16)); previous=now;
      target=Math.max(0,Math.min(root.scrollHeight-root.clientHeight,target));
      const difference=target-root.scrollTop;
      root.scrollTop+=difference*(1-Math.exp(-dt/100));
      if(Math.abs(difference)<1){root.scrollTop=target;frame=0;previous=0;}
      else frame=requestAnimationFrame(tick);
    };
    const wheel=event=>{
      if(reduced.matches || event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      if(event.target.closest('input,textarea,select,[contenteditable=true]'))return;
      event.preventDefault();
      if(!frame)target=root.scrollTop;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?root.clientHeight:1);
      target=Math.max(0,Math.min(root.scrollHeight-root.clientHeight,target+delta));
      if(!frame)frame=requestAnimationFrame(tick);
    };
    root.addEventListener('wheel',wheel,{passive:false});
    root.addEventListener('pointerdown',cancel);
    root.addEventListener('keydown',cancel);
    window.addEventListener('resize',cancel);
    reduced.addEventListener('change',cancel);
    return()=>{cancel();root.removeEventListener('wheel',wheel);root.removeEventListener('pointerdown',cancel);root.removeEventListener('keydown',cancel);window.removeEventListener('resize',cancel);reduced.removeEventListener('change',cancel);};
  },[ref]);
}
