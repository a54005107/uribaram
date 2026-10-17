const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(a-b), Math.cos(a-b));

// Measurements arrive at camera cadence; render and ribbon integration use seconds.
export function createSangmoMotion() {
  let target, head, seen = -Infinity, previous, velocity, spin = 0, phase = 0;
  const ribbon = [];
  return {
    observe(value, now) {
      if (![value.x,value.y,value.w,value.angle,now].every(Number.isFinite)) return;
      if (!target || now-seen > 400) {
        target = {...value}; head = {...value}; previous = {...value};
        velocity = null; spin = 0; ribbon.length = 0; seen = now; return;
      }
      const dt = clamp((now-seen)/1000, .016, .2);
      const distance = Math.hypot(value.x-target.x,value.y-target.y)/target.w;
      if (distance > 1.2 && dt < .15) return;
      const vx = (value.x-previous.x)/value.w/dt, vy = (value.y-previous.y)/value.w/dt;
      const movement = Math.hypot(vx,vy);
      const roll = angleDelta(value.angle,previous.angle)/dt;
      // Signed curvature distinguishes circular head movement from plain translation.
      const turn = velocity && movement > .15 && Math.hypot(velocity.x,velocity.y) > .15
        ? clamp(Math.atan2(velocity.x*vy-velocity.y*vx,velocity.x*vx+velocity.y*vy)/dt,-10,10) : 0;
      const drive = clamp(turn * Math.min(1,movement/.8) + roll * 1.8,-12,12);
      spin += (drive-spin)*(1-Math.exp(-dt*4));
      velocity = {x:vx,y:vy}; previous = {...value};
      target = {...value,w:target.w+clamp(value.w-target.w,-target.w*.12,target.w*.12)};
      seen = now;
    },
    step(now, dt) {
      if (!head) return null;
      dt = clamp(dt,0,.05);
      const age = now-seen;
      const motionSpeed = velocity ? Math.hypot(velocity.x,velocity.y) : 0;
      const blend = 1-Math.exp(-dt/ (motionSpeed > .4 ? .018 : .04));
      head.x += (target.x-head.x)*blend; head.y += (target.y-head.y)*blend;
      head.w += (target.w-head.w)*(1-Math.exp(-dt/.12));
      head.angle += angleDelta(target.angle,head.angle)*blend;
      // Inertia carries the ribbon briefly; no perpetual idle rotation.
      spin *= Math.exp(-dt*(age>150 ? 2.4 : .7)); phase += spin*dt;
      const energy = Math.min(1,Math.abs(spin)/5);
      for(let i=0;i<=28;i++) {
        const t=i/28, lag=t*.9;
        const theta=phase-Math.sign(spin || 1)*lag;
        const reach=4.2*t;
        const x=Math.cos(theta)*reach*energy + Math.sin(t*3+phase)*.12*t*(1-energy);
        const y=Math.sin(theta)*reach*energy*.65 + reach*(1-energy);
        if(!ribbon[i]) ribbon[i]={x,y};
        const follow=1-Math.exp(-dt/(.035+t*.1));
        ribbon[i].x+=(x-ribbon[i].x)*follow; ribbon[i].y+=(y-ribbon[i].y)*follow;
      }
      return {...head, ribbon, spin, opacity:clamp(1-(age-250)/200,0,1), tracked:age<250};
    },
  };
}
