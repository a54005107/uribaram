import {useEffect} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {MOTION_ACTIVITY} from '../motion/idleActivity';

export const IDLE_RETURN_MS=20000;
export function watchIdle(target,onIdle,{delay=IDLE_RETURN_MS,now=()=>Date.now(),schedule=setTimeout,cancel=clearTimeout,motionSource}={}) {
 let last=now(),timer,stopped=false;
 const check=()=>{if(stopped)return;const remaining=delay-(now()-last);
  if(remaining<=0){stopped=true;onIdle();}else timer=schedule(check,remaining);};
 const activity=()=>{last=now();};
 const motion=event=>{if(event.detail===motionSource)activity();};
 const events=['pointermove','pointerdown','keydown','wheel','touchstart','touchmove'];
 events.forEach(type=>target.addEventListener(type,activity,{passive:true}));
 if(motionSource)target.addEventListener(MOTION_ACTIVITY,motion);
 timer=schedule(check,delay);
 return()=>{stopped=true;cancel(timer);events.forEach(type=>target.removeEventListener(type,activity));target.removeEventListener(MOTION_ACTIVITY,motion);};
}
export default function useIdleReturn(){
 const {pathname}=useLocation(),navigate=useNavigate();
 useEffect(()=>{
  // The receiving phone must keep its downloaded photo, independently of the kiosk.
  if(pathname==='/'||pathname==='/receive-photo')return;
  return watchIdle(window,()=>navigate('/',{replace:true}),{motionSource:pathname==='/experience'?'hands':pathname==='/photo'?'head':undefined});
 },[pathname,navigate]);
}
