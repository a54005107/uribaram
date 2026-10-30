import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStickDisplay} from './stickDisplay.js';
const pose = (timestamp, x, rotation = 0) => ({timestamp, gripX:x, gripY:.5, rotation, side:'right', grip:{grabbed:true}, tipX:x+.2});
test('janggu display keeps moving between slower two-hand measurements without changing hits', () => {
  const display = createStickDisplay({maxDuration:64});
  display.sample(pose(0,.2),0);
  const measured = Object.freeze(pose(64,.6));
  display.sample(measured,64);
  assert.ok(display.sample(measured,96).gripX < display.sample(measured,112).gripX);
  assert.equal(display.sample(measured,128).gripX,.6);
  assert.equal(measured.gripX,.6);
  assert.equal(measured.tipX,.8);
});
test('display fills measurement gaps without mutating collision coordinates', () => {
  const display = createStickDisplay();
  display.sample(pose(0, .2), 0);
  const next = Object.freeze(pose(40, .6));
  assert.equal(display.sample(next,40).gripX,.2);
  assert.ok(Math.abs(display.sample(next,56).gripX-.4)<1e-9);
  assert.equal(display.sample(next,72).gripX,.6);
  assert.equal(next.gripX,.6);
  assert.equal(next.tipX,.8);
});
test('rotation crosses the short arc and loss resets interpolation', () => {
  const display = createStickDisplay();
  display.sample(pose(0,.2,Math.PI-.1),0);
  const next=pose(32,.4,-Math.PI+.1);
  display.sample(next,32);
  assert.ok(Math.abs(display.sample(next,48).rotation-Math.PI)<1e-9);
  const stale={...next,stale:true};
  assert.equal(display.sample(stale,60),stale);
  const recovered=pose(80,.8);
  assert.equal(display.sample(recovered,80),recovered);
  assert.equal(display.sample(null,90),null);
});
