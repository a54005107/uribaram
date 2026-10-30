import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadImage} from './preloadImage.js';

test('shares pending requests, waits for decoding, and retries failed images', async () => {
  const original = globalThis.Image;
  const images = [];
  let decoded;
  globalThis.Image = class {
    constructor() { images.push(this); }
    decode() { return new Promise(resolve => { decoded = resolve; }); }
  };
  try {
    const ready = preloadImage('/test-logo.svg');
    assert.equal(preloadImage('/test-logo.svg'), ready);
    assert.equal(images.length, 1);
    let finished = false;
    ready.then(() => { finished = true; });
    const load = images[0].onload();
    await Promise.resolve();
    assert.equal(finished, false);
    decoded(); await load;
    assert.equal(await ready, true);
    const failed = preloadImage('/test-failed.svg');
    images[1].onerror();
    assert.equal(await failed, false);
    const retry = preloadImage('/test-failed.svg');
    assert.equal(images.length, 3);
    images[2].onerror(); await retry;
  } finally {
    if (original === undefined) delete globalThis.Image;
    else globalThis.Image = original;
  }
});
