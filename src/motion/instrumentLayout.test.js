import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createInstrumentLayout} from './instrumentLayout.js';
import {createStickHitEngine} from './stickHitEngine.js';
const geometry = JSON.parse(readFileSync(new URL('../config/playInstrumentGeometry.json', import.meta.url), 'utf8'));

for (const [id, art] of Object.entries(geometry)) {
  test(`${id}: hits match the displayed surface at desktop and portrait sizes`, () => {
    for (const [width, height] of [[1440, 810], [390, 844]]) {
      const layout = createInstrumentLayout(art, width, height);
      assert.ok(layout.left >= 0 && layout.top >= 0);
      assert.ok(layout.left + layout.width <= width && layout.top + layout.height <= height);
      for (const [name, zone] of Object.entries(layout.zones)) {
        const source = art.zones[name];
        assert.ok(Math.abs(zone.x * width - (layout.left + source.x * layout.width)) < 1e-8);
        const engine = createStickHitEngine(), hits = [];
        const sample = (y, timestamp, extra = {}) => ({tipX: zone.x, tipY: y, timestamp, grip: {grabbed: true}, ...extra});
        engine.update(layout, {left: sample(zone.y - zone.radiusY * 1.5, 0)}, hit => hits.push(hit));
        engine.update(layout, {left: sample(zone.y, 80)}, hit => hits.push(hit));
        assert.equal(hits.length, 1);
        assert.equal(hits[0].side, name);
        // Remaining inside the surface must not repeat a strike.
        for (let t = 100; t < 600; t += 20) engine.update(layout, {left: sample(zone.y, t)}, hit => hits.push(hit));
        assert.equal(hits.length, 1);
        engine.update(layout, {left: sample(zone.y - zone.radiusY * 1.5, 650)}, hit => hits.push(hit));
        engine.update(layout, {left: sample(zone.y, 730)}, hit => hits.push(hit));
        assert.equal(hits.length, 2);
        // Lost tracking discards the previous tip, so reacquisition cannot hit.
        engine.update(layout, {}, hit => hits.push(hit));
        engine.update(layout, {left: sample(zone.y, 900)}, hit => hits.push(hit));
        assert.equal(hits.length, 2);
      }
    }
  });
}
