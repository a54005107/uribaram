export const isHandheld = id => ['kkwaenggwari','sogo','jing'].includes(id);

// Grip positions in the cropped instrument artwork, not the drumhead center.
// The gongs have exposed loops on opposite sides; sogo's handle slopes left.
export const INSTRUMENT_GRIPS = {
  kkwaenggwari: {x:.075,y:.29},
  jing: {x:.94,y:.30},
  sogo: {x:.17,y:.86},
};

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
        const anchor=INSTRUMENT_GRIPS[id] || {x:.5,y:.5};
        const gripX=layout.mirrorX ? 1-anchor.x : anchor.x;
        const targetX=hand.gripX*layout.viewportWidth-(layout.left+layout.width*gripX);
        const targetY=hand.gripY*layout.viewportHeight-(layout.top+layout.height*anchor.y);
        const blend=now<settleUntil ? 1-Math.exp(-Math.min(50,now-(previous||now))/35) : 1;
        x+=(targetX-x)*blend; y+=(targetY-y)*blend;
      } else attached=false;
      previous=now;
      return {layout:translateInstrument(layout,x,y),x,y,playable:valid && now>=settleUntil};
    },
  };
}
