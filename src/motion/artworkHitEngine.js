import {HIT_CONFIG} from '../config/stickInteractionConfig.js';

function endpoints(stick,layout) {
  const length=stick.width*layout.viewportWidth;
  return [{x:stick.gripX-Math.cos(stick.rotation)*length*stick.gripOffset/layout.viewportWidth,
    y:stick.gripY-Math.sin(stick.rotation)*length*stick.gripOffset/layout.viewportHeight},
    {x:stick.tipX,y:stick.tipY}];
}
export function artworkContact(stick,layout,contains) {
  const [a,b]=endpoints(stick,layout);
  const steps=Math.ceil(Math.hypot((b.x-a.x)*layout.viewportWidth,(b.y-a.y)*layout.viewportHeight)/3);
  for(let i=0;i<=steps;i++) {
    const t=steps?i/steps:0,point={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
    if(contains(point,layout))return point;
  }
  return null;
}
export function createArtworkHitEngine() {
  let hands={};
  return {reset(){hands={};},update(layout,sticks,contains,onHit){
    if(!contains||layout.stale){hands={};return;}
    for(const side of ['left','right']) {
      const stick=sticks[side];
      if(!stick?.grip.grabbed||stick.stale){delete hands[side];continue;}
      const state=hands[side];
      if(!state){hands[side]={stick,layout,lastHit:-Infinity,travel:0,struck:false,direction:null};continue;}
      if(stick.timestamp<=state.stick.timestamp)continue;
      if(layout.viewportWidth!==state.layout.viewportWidth||layout.viewportHeight!==state.layout.viewportHeight){delete hands[side];continue;}
      const previous=state.stick,dt=(stick.timestamp-previous.timestamp)/1000;
      // Account for the held instrument moving with the other hand.
      const dx=stick.tipX-previous.tipX-(layout.left-state.layout.left)/layout.viewportWidth;
      const dy=stick.tipY-previous.tipY-(layout.top-state.layout.top)/layout.viewportHeight;
      const distance=Math.hypot(dx,dy),speed=Math.hypot(stick.tipX-previous.tipX,stick.tipY-previous.tipY)/dt;
      if(distance>.001){
        const direction={x:dx/distance,y:dy/distance};
        if(state.direction&&direction.x*state.direction.x+direction.y*state.direction.y<-.25){state.travel=0;state.struck=false;}
        state.direction=direction;state.travel+=distance;
      }
      let point=artworkContact(stick,layout,contains);
      // Swept tip catches a fast strike that crosses a thin ring between frames.
      if(!point){
        const steps=Math.min(512,Math.ceil(Math.hypot(dx*layout.viewportWidth,dy*layout.viewportHeight)/3));
        for(let i=0;i<=steps;i++){
          const t=steps?i/steps:0,p={x:stick.tipX-dx*(1-t),y:stick.tipY-dy*(1-t)};
          if(contains(p,layout)){point=p;break;}
        }
      }
      if(!point){state.struck=false;state.travel=0;}
      if(point&&!state.struck&&distance>.001&&speed>=HIT_CONFIG.impactVelocity&&stick.timestamp-state.lastHit>=HIT_CONFIG.cooldownMs){
        state.struck=true;state.lastHit=stick.timestamp;
        const target=Object.entries(layout.zones).sort((a,b)=>Math.hypot(point.x-a[1].x,point.y-a[1].y)-Math.hypot(point.x-b[1].x,point.y-b[1].y))[0][0];
        onHit({side:target,hand:side,point,velocity:speed,downwardVelocity:(stick.tipY-previous.tipY)/dt,
          strength:speed>=HIT_CONFIG.strength.strong?'strong':speed>=HIT_CONFIG.strength.normal?'normal':'weak'});
      }
      state.stick=stick;state.layout=layout;
    }
  }};
}
