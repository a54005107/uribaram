import test from 'node:test';
import assert from 'node:assert/strict';
import {createStickSelection} from './stickSelection.js';

const left = {side: 'left', grip: {grabbed: true}, stale: false};
const right = {side: 'right', grip: {grabbed: true}, stale: false};
test('single beater retains its first hand and transfers on release or tracking loss', () => {
  const selector = createStickSelection(false);
  assert.deepEqual(selector.select({left, right: null}), {left, right: null});
  assert.deepEqual(selector.select({left, right}), {left, right: null});
  assert.deepEqual(selector.select({left: {...left, grip: {grabbed: false}}, right}), {left: null, right});
  const coasted = {...right, stale: true};
  assert.deepEqual(selector.select({left, right: coasted}), {left: null, right: coasted});
  assert.deepEqual(selector.select({left, right: null}), {left, right: null});
  assert.deepEqual(selector.select({left: null, right: null}), {left: null, right: null});
  selector.reset();
  assert.deepEqual(selector.select({left, right}), {left: null, right});
});
test('janggu keeps both beaters', () => {
  assert.deepEqual(createStickSelection(true).select({left, right}), {left, right});
});
