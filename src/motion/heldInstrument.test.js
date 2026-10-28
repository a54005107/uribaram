import test from 'node:test';
import assert from 'node:assert/strict';
import {createInstrumentHold,INSTRUMENT_GRIPS} from './heldInstrument.js';
import {createPlayLayout} from './figmaPlayLayout.js';
import geometry from '../config/playInstrumentGeometry.json' with {type:'json'};
test('jing handle stays at left hand and the striking surface is toward the body',()=>{
 const layout=createPlayLayout('jing',geometry.jing,1280,720);
 const hand={gripX:.3,gripY:.4,grip:{grabbed:true},stale:false},hold=createInstrumentHold('jing');
 hold.update(layout,hand,0);const held=hold.update(layout,hand,150);
 assert.equal(layout.mirrorX,true);
 assert.ok(Math.abs((held.layout.left+layout.width*(1-INSTRUMENT_GRIPS.jing.x))/1280-hand.gripX)<1e-8);
 assert.ok(held.layout.zones.center.x>hand.gripX);
});
for(const id of Object.keys(INSTRUMENT_GRIPS))test(`${id}: left hand aligns with handle at different viewport sizes`,()=>{
 for(const [width,height] of [[2560,1440],[1366,768]]){
  const layout={left:width*.3,top:height*.2,width:width*.4,height:height*.6,viewportWidth:width,viewportHeight:height,zones:{center:{x:.5,y:.5}}};
  const hand={gripX:.38,gripY:.6,grip:{grabbed:true},stale:false},hold=createInstrumentHold(id);
  hold.update(layout,hand,10);const held=hold.update(layout,hand,150),anchor=INSTRUMENT_GRIPS[id];
  assert.ok(Math.abs(held.layout.left+layout.width*anchor.x-hand.gripX*width)<1e-8);
  assert.ok(Math.abs(held.layout.top+layout.height*anchor.y-hand.gripY*height)<1e-8);
 }
});
