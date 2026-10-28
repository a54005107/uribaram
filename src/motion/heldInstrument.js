export const isHandheld = id => ['kkwaenggwari','sogo','jing'].includes(id);

export function translateInstrument(layout, dx, dy) {
  return {...layout, left:layout.left+dx, top:layout.top+dy,
    zones:Object.fromEntries(Object.entries(layout.zones).map(([key,zone])=>[key,{...zone,
      x:zone.x+dx/layout.viewportWidth,y:zone.y+dy/layout.viewportHeight}]))};
}

export function createInstrumentHold(id) {
  let x=0,y=0,previous=0,attached=false,settleUntil=0;
  return {
    update(layout, hand, now) {
      const valid=Boolean(hand?.grip.grabbed && !hand.stale);
      if(valid) {
        if(!attached) { attached=true; settleUntil=now+100; }
        // Sogo is held at the handle; gongs hang from their upper loop.
        const anchorY=id==='sogo' ? .9 : .12;
        const targetX=hand.gripX*layout.viewportWidth-(layout.left+layout.width*.5);
        const targetY=hand.gripY*layout.viewportHeight-(layout.top+layout.height*anchorY);
        const blend=now<settleUntil ? 1-Math.exp(-Math.min(50,now-(previous||now))/35) : 1;
        x+=(targetX-x)*blend; y+=(targetY-y)*blend;
      } else attached=false;
      previous=now;
      return {layout:translateInstrument(layout,x,y),x,y,playable:valid && now>=settleUntil};
    },
  };
}
