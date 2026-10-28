import {useEffect} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';

export const IDLE_RETURN_MS=20000;
export function watchIdle(target,onIdle,{delay=IDLE_RETURN_MS,now=()=>Date.now(),schedule=setTimeout,cancel=clearTimeout}={}) {
 let last=now(),timer,stopped=false;
 const check=()=>{if(stopped)return;const remaining=delay-(now()-last);
  if(remaining<=0){stopped=true;onIdle();}else timer=schedule(check,remaining);};
 const activity=()=>{last=now();};
 const events=['pointermove','pointerdown','keydown','wheel','touchstart','touchmove'];
 events.forEach(type=>target.addEventListener(type,activity,{passive:true}));
 timer=schedule(check,delay);
 return()=>{stopped=true;cancel(timer);events.forEach(type=>target.removeEventListener(type,activity));};
}
export default function useIdleReturn(){
 const {pathname}=useLocation(),navigate=useNavigate();
 useEffect(()=>{
  // The receiving phone must keep its downloaded photo, independently of the kiosk.
  if(pathname==='/'||pathname==='/receive-photo')return;
  return watchIdle(window,()=>navigate('/',{replace:true}));
 },[pathname,navigate]);
}
