import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPlayLayout, JANGGU} from './figmaPlayLayout.js';
import {createStickHitEngine} from './stickHitEngine.js';

const geometry = JSON.parse(readFileSync(new URL('../config/playInstrumentGeometry.json', import.meta.url), 'utf8'));

test('Figma drumhead centers and hit regions share the artwork rotation and responsive scale', () => {
  for (const [width, height] of [[2240, 1260], [1440, 810], [390, 844]]) {
    const layout = createPlayLayout('janggu', geometry.janggu, width, height);
    const angle = -24.28 * Math.PI / 180;
    for (const [side, x, y] of [['left', .29295, .2355], ['right', .70705, .7645]]) {
      const dx = (x - .5) * JANGGU.width, dy = (y - .5) * JANGGU.height;
      const expectedX = layout.left + (JANGGU.cx + dx * Math.cos(angle) - dy * Math.sin(angle)) * layout.scale;
      const expectedY = layout.top + (JANGGU.cy + dx * Math.sin(angle) + dy * Math.cos(angle)) * layout.scale;
      assert.ok(Math.abs(layout.zones[side].x * width - expectedX) < .01);
      assert.ok(Math.abs(layout.zones[side].y * height - expectedY) < .01);
    }
  }
});

test('all five resized instruments accept a crossing strike and reject stale tracking', () => {
  for (const [id, art] of Object.entries(geometry)) {
    for (const [width, height] of [[1440, 810], [390, 844]]) {
      const layout = createPlayLayout(id, art, width, height);
      for (const [side, zone] of Object.entries(layout.zones)) {
        assert.ok(zone.x > 0 && zone.x < 1 && zone.y > 0 && zone.y < 1);
        const engine = createStickHitEngine(), hits = [];
        const sample = (y, timestamp, stale = false) => ({tipX: zone.x, tipY: y, timestamp, stale, grip: {grabbed: true}});
        engine.update(layout, {left: sample(zone.y - zone.radiusY * 1.5, 0)}, hit => hits.push(hit));
        engine.update(layout, {left: sample(zone.y, 40)}, hit => hits.push(hit));
        assert.equal(hits.length, 1, `${id}/${side}/${width}`);
        assert.equal(hits[0].side, side);
        engine.update(layout, {left: sample(zone.y - zone.radiusY * 1.5, 700, true)}, hit => hits.push(hit));
        engine.update(layout, {left: sample(zone.y, 740)}, hit => hits.push(hit));
        assert.equal(hits.length, 1);
      }
    }
  }
});
