import test from 'node:test';
import assert from 'node:assert/strict';
import {createHeadwearTracks} from './headwearTracks.js';
import {createInstrumentHold,translateInstrument} from './heldInstrument.js';
import {createRingWaveAnimator} from './ringWaveAnimator.js';
import jangguParts from '../config/figmaPlayJanggu.json' with {type:'json'};

test('janggu animates its 30 rings while retaining all 12 cords and fasteners',()=>{
 assert.equal(jangguParts.filter(p=>p.ring).length,30);
 assert.equal(jangguParts.filter(p=>!p.ring).length,12);
 assert.ok(jangguParts.filter(p=>p.transform).every(p=>!p.ring));
});

test('four heads retain separate identities when detector order changes, then expire',()=>{
 const tracks=createHeadwearTracks();
 const heads=[100,300,500,700].map(x=>({x,y:200,w:90,angle:0}));
 tracks.observe(heads,0);
 const first=tracks.step(0,.016).sort((a,b)=>a.x-b.x);
 assert.equal(first.length,4);
 tracks.observe([...heads].reverse().map(h=>({...h,x:h.x+3})),33);
 const next=tracks.step(50,.017).sort((a,b)=>a.x-b.x);
 assert.deepEqual(next.map(h=>h.id),first.map(h=>h.id));
 tracks.observe([heads[0]],400);
 assert.equal(tracks.step(800,.016).length,1);
 assert.equal(tracks.step(1200,.016).length,0);
 tracks.observe(heads,1210);
 assert.ok(tracks.step(1210,.016).every(h=>!first.some(f=>f.id===h.id)));
});

test('held instrument preserves hit geometry, blocks acquisition and loss hits',()=>{
 const layout={left:200,top:200,width:300,height:400,viewportWidth:1000,viewportHeight:800,zones:{center:{x:.35,y:.4,radiusX:.1,radiusY:.15}}};
 const hold=createInstrumentHold('jing'),hand={gripX:.55,gripY:.3,grip:{grabbed:true},stale:false};
 assert.equal(hold.update(layout,hand,10).playable,false);
 const held=hold.update(layout,hand,150);
 assert.equal(held.playable,true);
 assert.equal(held.layout.zones.center.radiusX,layout.zones.center.radiusX);
 assert.equal(held.layout.zones.center.x,layout.zones.center.x+held.x/1000);
 const lost=hold.update(layout,{...hand,stale:true},170);
 assert.equal(lost.playable,false);assert.equal(lost.x,held.x);
 assert.equal(hold.update(layout,hand,190).playable,false);
 assert.equal(translateInstrument(layout,100,80).zones.center.y,.5);
});

test('ring wave staggers independent layers, accumulates strikes without a reset, and settles',()=>{
 const originals={raf:globalThis.requestAnimationFrame,caf:globalThis.cancelAnimationFrame,media:globalThis.matchMedia};
 let queued,now=performance.now();
 globalThis.requestAnimationFrame=fn=>{queued=fn;return 1;};
 globalThis.cancelAnimationFrame=()=>{queued=null;};
 globalThis.matchMedia=()=>({matches:false});
 try{
  const elements=[{style:{}},{style:{}}];
  const animator=createRingWaveAnimator(elements.map((element,i)=>({element,bounds:{x:i*250,y:0,width:100,height:100}})),500);
  animator.strike({x:0,y:50},'strong');
  const advance=dt=>{now+=dt;const fn=queued;queued=null;fn?.(now);};
  advance(16);advance(16);
  assert.ok(elements[0].style.transform);assert.equal(elements[1].style.transform,'');
  const before=elements[0].style.transform;
  animator.strike({x:0,y:50},'normal');
  assert.equal(elements[0].style.transform,before);
  for(let i=0;i<220;i++)advance(16);
  assert.ok(elements.every(e=>e.style.transform===''));assert.equal(queued,null);
  animator.dispose();
 }finally{globalThis.requestAnimationFrame=originals.raf;globalThis.cancelAnimationFrame=originals.caf;globalThis.matchMedia=originals.media;}
});
