import test from 'node:test';
import assert from 'node:assert/strict';
import {createSangmoMotion} from './sangmoMotion.js';

function simulate(direction, fps=60) {
 const motion=createSangmoMotion();let state;
 for(let i=0;i<fps*3;i++) {
  const t=i/fps,angle=direction*t*5;
  if(i%Math.round(fps/25)===0)motion.observe({x:480+35*Math.cos(angle),y:300+35*Math.sin(angle),w:150,angle:.15*Math.sin(angle)},t*1000);
  state=motion.step(t*1000,1/fps);
 }
 return {motion,state};
}
test('still head does not spin, position remains fixed',()=>{
 const motion=createSangmoMotion();let s;
 for(let i=0;i<150;i++){motion.observe({x:480,y:300,w:150,angle:0},i*40);s=motion.step(i*40,.04);}
 assert.equal(s.spin,0);assert.equal(s.x,480);assert.equal(s.y,300);
});
test('circular motion drives both directions and decays after stopping',()=>{
 for(const direction of [-1,1]) {
  const {motion,state}=simulate(direction);
  assert.ok(state.spin*direction>1);
  let rest;
  for(let i=0;i<200;i++){const now=3000+i*16;motion.observe({x:state.x,y:state.y,w:150,angle:state.angle},now);rest=motion.step(now,.016);}
  assert.ok(Math.abs(rest.spin)<.05);
  assert.ok(rest.ribbon.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
 }
});
test('loss fades and reacquisition discards old rotation',()=>{
 const {motion}=simulate(1);assert.equal(motion.step(3600,.016).opacity,0);
 motion.observe({x:200,y:300,w:150,angle:0},3700);
 const s=motion.step(3700,.016);assert.equal(s.spin,0);assert.equal(s.x,200);
});
test('render cadence does not change direction or cause unstable ribbon values',()=>{
 const a=simulate(1,30).state,b=simulate(1,120).state;
 assert.ok(a.spin>1&&b.spin>1);assert.ok(Math.abs(a.spin-b.spin)<1.5);
});
