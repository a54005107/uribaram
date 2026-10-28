import {ringWave} from './ringWave.js';

// Only ring layers move. Each receives a delayed impulse; repeat strikes add
// energy to the current spring instead of cancelling and snapping to rest.
export function createRingWaveAnimator(items, size, pixelScale = 1) {
  let frame = 0, previous = 0;
  const states = items.map(item => ({...item, expansion:0, velocity:0, dx:0,dy:0,pulses:[]}));
  const reset = () => {
    cancelAnimationFrame(frame); frame=0; previous=0;
    states.forEach(s=>{s.expansion=0;s.velocity=0;s.pulses=[];if(s.element)s.element.style.transform='';});
  };
  const tick = now => {
    const dt=Math.min(.032,(now-(previous||now-16))/1000); previous=now;
    let active=false;
    for(const state of states) {
      const due=state.pulses.filter(p=>p.at<=now);
      state.pulses=state.pulses.filter(p=>p.at>now);
      for(const pulse of due){state.velocity=Math.min(11,state.velocity+pulse.energy);state.dx=pulse.dx;state.dy=pulse.dy;}
      const steps=Math.ceil(dt/.008),step=dt/steps;
      for(let i=0;i<steps;i++) {
        state.velocity+=(-145*state.expansion-15*state.velocity)*step;
        state.expansion+=state.velocity*step;
        state.expansion=Math.max(-.12,Math.min(.7,state.expansion));
      }
      if(Math.abs(state.expansion)<.0005 && Math.abs(state.velocity)<.005 && !state.pulses.length){state.expansion=0;state.velocity=0;}
      else active=true;
      if(state.element)state.element.style.transform=state.expansion===0 ? '' : `translate(${state.dx*state.expansion*pixelScale}px,${state.dy*state.expansion*pixelScale}px) scale(${1+state.expansion})`;
    }
    if(active)frame=requestAnimationFrame(tick);else{frame=0;previous=0;}
  };
  return {
    strike(point,strength) {
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const now=performance.now();
      for(const state of states){
        const wave=ringWave(state.bounds,point,size,strength);
        if(state.pulses.length>=3)state.pulses.shift();
        state.pulses.push({at:now+wave.delay,energy:(wave.scale-1)*24,dx:wave.x*1.8,dy:wave.y*1.8});
      }
      if(!frame)frame=requestAnimationFrame(tick);
    },
    dispose:reset,
  };
}
