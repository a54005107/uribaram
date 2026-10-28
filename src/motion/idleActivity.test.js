import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionActivity} from './idleActivity.js';
test('stationary noise does not keep the kiosk awake, real movement does',()=>{
 let count=0;const report=createMotionActivity('hands',()=>count++);
 report('left',{x:.5,y:.5},0);
 for(let now=100;now<21000;now+=100)report('left',{x:.5+Math.sin(now)*.001,y:.5},now);
 assert.equal(count,1);
 report('left',{x:.55,y:.5},21100);assert.equal(count,2);
 report('left',{x:.55,y:.5,angle:.2},21500);assert.equal(count,3);
});
