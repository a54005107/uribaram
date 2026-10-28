export const MOTION_ACTIVITY='uribaram-motion-activity';
export function createMotionActivity(source,emit=()=>window.dispatchEvent(new CustomEvent(MOTION_ACTIVITY,{detail:source}))) {
 const anchors=new Map();let lastEmit=-Infinity;
 return (key,point,now)=>{
  if(!point||![point.x,point.y].every(Number.isFinite))return;
  const previous=anchors.get(key);
  if(!previous||now-previous.time>1000){anchors.set(key,{...point,time:now});if(now-lastEmit>250){emit();lastEmit=now;}return;}
  const moved=Math.hypot(point.x-previous.x,point.y-previous.y)>.012
    ||Math.abs(Math.atan2(Math.sin((point.angle||0)-(previous.angle||0)),Math.cos((point.angle||0)-(previous.angle||0))))>.08;
  if(moved){anchors.set(key,{...point,time:now});if(now-lastEmit>250){emit();lastEmit=now;}}
  else previous.time=now;
 };
}
