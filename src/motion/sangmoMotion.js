const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(a-b), Math.cos(a-b));

// Measurements arrive at camera cadence; render and ribbon integration use seconds.
export function createSangmoMotion() {
  let target, head, seen = -Infinity, previous, velocity, spin = 0, phase = 0;
  let orbitPhase = null, turnRate = 0;
  const ribbon = [];
  return {
    observe(value, now) {
      if (![value.x,value.y,value.w,value.angle,now].every(Number.isFinite)) return;
      if (!target || now-seen > 400) {
        target = {...value}; head = {...value}; previous = {...value};
        velocity = null; spin = 0; phase = 0; orbitPhase = null; turnRate = 0;
        ribbon.length = 0; seen = now; return;
      }
      const dt = clamp((now-seen)/1000, .016, .2);
      const distance = Math.hypot(value.x-target.x,value.y-target.y)/target.w;
      if (distance > 1.2 && dt < .15) return;
      const smooth = 1-Math.exp(-dt/.055);
      const rawX = (value.x-previous.x)/value.w/dt, rawY = (value.y-previous.y)/value.w/dt;
      const vx = velocity ? velocity.x+(rawX-velocity.x)*smooth : rawX;
      const vy = velocity ? velocity.y+(rawY-velocity.y)*smooth : rawY;
      const movement = Math.hypot(vx,vy);
      // Signed curvature distinguishes circular head movement from plain translation.
      const delta = velocity ? Math.atan2(velocity.x*vy-velocity.y*vx,velocity.x*vx+velocity.y*vy) : 0;
      // Reject a straight-line reversal (near 180 degrees), rather than spinning
      // the ribbon when the user only shakes their head left and right.
      const turn = velocity && movement > .2 && Math.hypot(velocity.x,velocity.y) > .2 && Math.abs(delta)<1.2
        ? clamp(delta/dt,-12,12) : 0;
      turnRate += (turn-turnRate)*(1-Math.exp(-dt/.12));
      const circling = movement > .2 && Math.abs(turnRate) > .5;
      const drive = circling ? turnRate*Math.min(1,movement/.5) : 0;
      spin += (drive-spin)*(1-Math.exp(-dt/.14));
      // The tangent of circular head travel determines its radial phase.
      // Lock to that measured phase instead of running an unrelated spin timer.
      orbitPhase = circling ? Math.atan2(vy,vx)-Math.sign(turnRate)*Math.PI/2 : null;
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
      if (orbitPhase !== null && age < 150) phase += angleDelta(orbitPhase,phase)*(1-Math.exp(-dt/.18));
      const energy = Math.min(1,Math.abs(spin)/2.5);
      for(let i=0;i<=28;i++) {
        const t=i/28, lag=t*t*1.6;
        // Drawing applies head roll, so cancel it for a screen-space orbit.
        const theta=phase-head.angle-Math.sign(spin || 1)*lag;
        const reach=4.2*t;
        const x=Math.cos(theta)*reach*energy + Math.sin(t*3+phase)*.12*t*(1-energy);
        const y=Math.sin(theta)*reach*energy + reach*(1-energy);
        if(!ribbon[i]) ribbon[i]={x,y};
        const follow=1-Math.exp(-dt/(.025+t*.045));
        ribbon[i].x+=(x-ribbon[i].x)*follow; ribbon[i].y+=(y-ribbon[i].y)*follow;
      }
      return {...head, ribbon, spin, opacity:clamp(1-(age-250)/200,0,1), tracked:age<250};
    },
  };
}
